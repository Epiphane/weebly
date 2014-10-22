<?php
include("db.php");

include("quick.php");

$request = array_slice(explode("/", $_SERVER[REQUEST_URI]), 2);
$method = $_SERVER[REQUEST_METHOD];

switch($request[0]) {
  case "quick":
    quickAndEasy($connect, $request, $method);
    break;
  default:
    echo "Welcome to my secret hideout!";
}

function refValues($arr){
    if (strnatcmp(phpversion(),'5.3') >= 0) //Reference is required for PHP 5.3+
    {
        $refs = array();
        foreach($arr as $key => $value)
            $refs[$key] = &$arr[$key];
        return $refs;
    }
    return $arr;
}

function send404AndDie() {
  header('HTTP/1.0 404 Not Found');
  die();
}

?>
