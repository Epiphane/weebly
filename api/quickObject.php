<?php

class AppObject {
  public $objectInfo, $objectName, $objectTable;
  public $objectData;

  public function AppObject($mysqli, $app_id, $table) {
    $this->objectName = $table;
    $this->objectTable = $app_id . "_" . $table;

    $objQuery = $mysqli->prepare("SELECT * FROM " . $this->objectTable . " WHERE 1");

    $objQuery->execute();

    $this->objectInfo = $objQuery->get_result()->fetch_fields();
  }

  public function request($mysqli, $request, $method) {
    if(sizeof($request) == 0) { // IT'S ME!!
      switch($method) {
        case "GET":
          $this->index();
          break;
        case "POST":
          // Add new object
          $this->create($mysqli, $_POST);
          break;
        case "PUT":
          send404AndDie();
          break;
      }
    }
    else { // IT'S MY CHILD!!
      switch($method) {
        case "GET":
          $this->show($mysqli, $request, $method);
          break;
        case "POST":
          // Add new object
          $this->create($mysqli, $_POST);
          break;
        case "PUT":
          send404AndDie();
          break;
      }
    }
  }

  public function index() { ?>
    {
      "fields": [
<? $i = 0;
        foreach($this->objectInfo as $field) {
          if ($i++ > 0) echo ", \n"; ?>
        {
          "name": "<?= $field->name ?>"
        }<? } ?>

      ]
    }
  <? }

  public function update($mysqli, $params) {
    
  }

  public function create($mysqli, $params) {
    $fieldList = "";
    $qMarkList = NULL;
    $fieldData = array("");
    foreach($this->objectInfo as $field) {
      // Param in the object
      if($params[$field->name] != NULL) {
        array_push($fieldData, $params[$field->name]);
        $fieldData[0] .= "s";

        if($qMarkList) {
          $qMarkList .= ", ?";
          $fieldList .= ", `" . $field->name . "`";
        }
        else {
          $qMarkList = "?";
          $fieldList .= "`" . $field->name . "`";
        }
      }
    }
    $createQuery = $mysqli->prepare("INSERT INTO " . $this->objectTable . " (" . $fieldList . ") VALUES (" . $qMarkList . ")");
    call_user_func_array(array($createQuery, 'bind_param'), refValues($fieldData));

    $createQuery->execute();

    header('HTTP/1.0 201 Created');
    header('Location: /api');
  }

  public function show($mysqli, $request, $method) {
    $dataQuery = $mysqli->prepare("SELECT * FROM " . $this->objectTable . " WHERE id = ?");

    $dataQuery->bind_param("s", $request[0]);
    $dataQuery->execute();

    $objectData = $dataQuery->get_result()->fetch_assoc();

    if($objectData) { ?>
{
<? $i = 0;
      foreach($this->objectInfo as $field) {
        if ($i++ > 0) echo ", \n";
        echo "\t\"" . $field->name . "\": " . $objectData[$field->name] . "\"";
      } ?>

}
  <? }
    else {
      send404AndDie();
    }
  }
}

?>
