<?php

$restObjects = array();

class RESTObject {
  public static $plural;
  public static $single;
  protected $createFields = array();
  protected $updateFields = array();

  public function handleRequest($request, $method) {
    global $status;

    $body = "";

    // Plural objects can GET and POST
    if($this->isPlural) {
      switch($method) {
        case "GET":
          $body = $this->index();
          break;
        case "POST":
          $body = $this->create();
          break;
        default:
          $status = 404;
          break;
      }
    }
    // Singular objects can GET, PUT, and DELETE
    else {
      switch($method) {
        case "GET":
          $body = $this->show($this->id);
          break;
        case "PUT":
          $body = $this->update($this->id);
          break;
        case "DELETE":
          $body = $this->delete($this->id);
          break;
        default:
          $status = 404;
          break;
      }
    }

    return $body;
  }

  private $isPlural = true;
  public function RESTObject($id) {
    $this->isPlural = true;

    if($id != false) {
      $this->isPlural = false;
      $this->id = $id;
    }
  }

	public function getTableName() {
		sendResponse(500, "getTableName() not implemented");
	}

  public function getIndexFields() {
    return "*";
  }

  public function getShowFields() {
    return "*";
  }

  public function serialize($object) {
    return $object;
  }

  public function index() {
    global $mysqli;

    $objQuery = $mysqli->prepare("SELECT " . $this->getIndexFields()
      . " FROM " . $this->getTableName() . " WHERE 1");

    $objQuery->execute();
    $objects = $this->fetch_object_array($objQuery->get_result());

    $serialized = array();
    for($ndx = 0; $ndx < count($objects); $ndx ++) {
      array_push($serialized, $this->serialize($objects[$ndx]));
    }
    return json_encode($serialized);
  }

  public function show($id) {
    global $mysqli, $status;

    $objQuery = $mysqli->prepare("SELECT " . $this->getShowFields()
      . " FROM " . $this->getTableName() . " WHERE id = ?");

    $objQuery->bind_param("s", $id);
    $objQuery->execute();
    
    $obj = $objQuery->get_result()->fetch_object();
    if(is_null($obj)) {
      $status = 404;
    }
    else {
      return json_encode($this->serialize($obj));  
    }
  }

  /* Must be overridden */
  public function create() {
    global $mysqli, $status, $baseURI;

    $columns = array();
    $values = array();
    for($ndx = 0; $ndx < count($this->createFields); $ndx ++) {
      if(isset($_POST[$this->createFields[$ndx]]) && 
        !is_null($_POST[$this->createFields[$ndx]])) {
        array_push($columns, $this->createFields[$ndx]);
        array_push($values, "'" . $_POST[$this->createFields[$ndx]] . "'");
      }
    }

    $objQuery = $mysqli->prepare("INSERT INTO " . $this->getTableName() . " (" . join(",", $columns) . ") VALUES (" . join(",", $values) . ")");

    $objQuery->execute();

    $status = 201;
    return "{ \"url\": \"" . $baseURI . $this::$single . "/" . $mysqli->insert_id . "\" }";
  }

  public function update($id) {
    global $mysqli, $status, $baseURI, $_PUT;

    $query = "UPDATE " . $this->getTableName() . " SET ";

    $params = array();
    for($ndx = 0; $ndx < count($this->updateFields); $ndx ++) {
      if(isset($_PUT[$this->updateFields[$ndx]]) && 
        !is_null($_PUT[$this->updateFields[$ndx]])) {
        array_push($params, $this->updateFields[$ndx] . " = '" . $_PUT[$this->updateFields[$ndx]] . "'");
      }
    }
    $query .= join(",",$params);

    $objQuery = $mysqli->prepare($query . "WHERE id = ?");

    $objQuery->bind_param("s", $id);
    $objQuery->execute();
    
    return $this->show($id);
  }

  public function delete($id) {
    global $mysqli;

    $objQuery = $mysqli->prepare("DELETE FROM " . $this->getTableName() . " WHERE id = ?");

    $objQuery->bind_param("s", $id);
    $objQuery->execute();
  }

  public function fetch_object_array($mysqli_result) {
    while($obj = $mysqli_result->fetch_object()) {
      $objects[] = $this->serialize($obj);
    }

    return $objects;
  }
}

?>