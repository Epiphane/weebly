<?php

class Pages extends RESTObject {
  public static $single = "page";
  public static $plural = "pages";

  protected $createFields = array("name", "config");
  protected $updateFields = array("name", "config");

  public function serialize($object) {
    //   var_dump($object->config);
    // if(isset($object->config)) {
    //   $object->config = json_decode($object->config);
    // }

    return $object;
  }

  public function getIndexFields() {
    return "id, name";
  }

  public function getTableName() {
    return "pages";
  }

  public function update($id) {
    global $mysqli, $status, $baseURI, $_PUT;

    $query = "UPDATE " . $this->getTableName() . " SET config='";

    $config = str_replace("'", "\'", json_encode($_PUT['config']));
    $query .= str_replace("\\\"", "\\\\\\\"", $config);

    $objQuery = $mysqli->prepare($query . "' WHERE id = ?");

    $objQuery->bind_param("s", $id);
    $objQuery->execute();
    
    return $this->show($id);
  }
}

array_push($restObjects, 'Pages');

?>
