<?php

array_push($restObjects, Pages);

class Pages extends RESTObject {
  public static $single = "page";
  public static $plural = "pages";

  protected $createFields = array("title", "config");

  public function getTableName() {
    return "pages";
  }
}

?>
