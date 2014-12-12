<?php

class Pages extends RESTObject {
  public static $single = "page";
  public static $plural = "pages";

  protected $createFields = array("name", "config");
  protected $updateFields = array("name", "config");

  public function getIndexFields() {
    return "id, name";
  }

  public function getTableName() {
    return "pages";
  }
}

array_push($restObjects, 'Pages');

?>
