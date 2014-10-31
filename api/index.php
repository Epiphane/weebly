<?php
include("db.php");

include("google_auth.php");
include("rest_object.php");
include("rest_page.php");

$baseURI = "/api/";
$request = array_slice(explode("/", $_SERVER[REQUEST_URI]), 2);
$method = $_SERVER[REQUEST_METHOD];

$status = 200;
handleRequest($request, $method);

function handleRequest($request, $method) {
  global $status;

  if(strpos($request[0], "oauth") !== false) {
    google_loginUser($_GET['code']);
  }

  $response = google_authUser();
  if($response !== true) {
    $response = "{
      \"error\": {
        \"message\": \"Please sign in with Google +\",
        \"url\": \"" . $response . "\"
      }
    }";
    sendResponse(401, $response);
    return;
  }

  $object = getObject($request[0], $request[1]);
  if($object == null) {
    sendResponse(404);
  }
  else {
    $response = $object->handleRequest($request, $method);

    sendResponse($status, $response);
  }
}

function getObject($name, $id) {
  global $restObjects;

  foreach($restObjects as $restObject) {
    // Plural
    if($name == $restObject::$plural) {
      return new $restObject(false);
    }
    // Singular
    else if($name == $restObject::$single && !is_null($id)) {
      return new $restObject($id);
    }
    else {
      return null;
    }
  }
}

// Helper method to send a HTTP response code/message
function sendResponse($status = 200, $body = '', $content_type = 'text/html')
{
  $status_header = 'HTTP/1.1 ' . $status . ' ' . getStatusCodeMessage($status);
  header($status_header);
  header('Content-type: ' . $content_type);
  echo $body;
}

// Helper method to get a string description for an HTTP status code
// From http://www.gen-x-design.com/archives/create-a-rest-api-with-php/ 
$codes = parse_ini_file("codes.ini");
function getStatusCodeMessage($status)
{
  return (isset($codes[$status])) ? $codes[$status] : '';
}

?>
