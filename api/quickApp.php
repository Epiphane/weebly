<?php

class App {
  public $appInfo, $appObjects;

  public function App($mysqli, $hash, $key) {
    $appQuery = $mysqli->prepare("SELECT * FROM apps WHERE hash = ?");

    $appQuery->bind_param("s", $hash);
    $appQuery->execute();
    $this->appInfo = $appQuery->get_result()->fetch_assoc();

    $objQuery = $mysqli->prepare("SELECT name FROM objects WHERE app_id = ?");

    $objQuery->bind_param("i", $this->appInfo["id"]);
    $objQuery->execute();
    $this->appObjects = $objQuery->get_result()->fetch_assoc();
  }

  public function request($mysqli, $request, $method) {
    // IT'S ME!!
    if(sizeof($request) == 0) {
      switch($method) {
        case "GET":
          $this->index();
          break;
        case "POST":
          echo "New object";
          // Baddd
          //send404AndDie();
          break;
        case "PUT":
          break;
      }
    }
    // Pass it on!
    else {
      $this->show($mysqli, $request, $method);
    }
  }

  // This is weirdly formatted so that the JSON looks good
  public function index() { ?>
    {
      "name": "<?= $this->appInfo["name"] ?>",
      "objects": [
<? $i = 0;
        foreach($this->appObjects as $obj) {
          if ($i++ > 0) echo ", \n"; ?>
        {
          "name": "<?= $obj ?>",
          "uri": "<?= $_SERVER[REQUEST_URI] . "/" . $obj ?>"
        }<? } ?>

      ]
    }
  <? }

  public function show($mysqli, $request, $method) {
    // Is it an object?
    if(array_search($request[0], $this->appObjects) != null) {
      // Found object! Pass on the request
      $object = new AppObject($mysqli, $this->appInfo["id"], $request[0]);
      $request = array_slice($request, 1);

      // Pass on request!
      $object->request($mysqli, $request, $method);
    }
    else {
      send404AndDie();
    }
  }
}

?>
