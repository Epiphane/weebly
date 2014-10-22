<?php
include("db.php");

include("weebly_page.php");

$request = array_slice(explode("/", $_SERVER[REQUEST_URI]), 2);
$method = $_SERVER[REQUEST_METHOD];

handleRequest($connect, $request, $method);

function handleRequest($mysqli, $request, $method) {
  var_dump($request);
  var_dump($method);

  die();

  if($method == "POST") {
    echo $_POST["method"];
  }

  //header('HTTP/1.0 404 Not Found');
  //die();
  //send404AndDie();

  // Base stuff
  if(count($request) == 1) {
    switch($method) {
      case "GET":
        listApps(null);
        break;
      default:
        echo "Not recognized, sorry bud";
    }
  }

  // Not base list - pass it on.
  // Better have a hash!
  else {
    // Is it a hash?
    if(strlen($request[1]) > 0) {
      // Found app! Pass on the request
      $app = new App($mysqli, $request[1], null);
      $request = array_slice($request, 2);

      // Pass on request!
      $app->request($mysqli, $request, $method);
    }
    else {
      echo("Error: App Hash not found");
    }
  }
}

function send404AndDie() {
  header('HTTP/1.0 404 Not Found');
  die();
}

?>
