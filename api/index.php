<?php
error_reporting(E_ALL); ini_set('display_errors', 'On');
include("db.php");

include("auth.php");
include("rest_object.php");
include("rest_page.php");

$baseURI = "/api/";
$request = array_slice(explode("/", $_SERVER['REDIRECT_URL']), 2);
$method = $_SERVER['REQUEST_METHOD'];

$status = 200;
handleRequest($request, $method);

function handleRequest($request, $method) {
  global $status;

  if(strpos($request[0], "close") !== false) {
    $body = "<html>
              <body>
              <script type='text/javascript'>this.close()</script>
              </body>
            </html>";
    sendResponse(200, $body);
  }
  else if(strpos($request[0], "oauth") !== false) {
    google_loginUser($_GET['code']);
  }
  else if(strpos($request[0], "token") !== false) {
    header('Cache-Control: no-cache');
    header('Content-Type: text/event-stream');

    // function sendMsg($msg) {
    //   ob_flush();
    //   flush();
    // }

    // $serverTime = time();

    // sendMsg($serverTime, 'server time: ' . date("h:i:s", time()));
    // die();

    $response = google_authUser();
    // sendResponse($status, $response, 'text/event-stream');
    echo "data: " . $response . PHP_EOL;
    echo PHP_EOL;
    // ob_flush();
    flush();
  }
  else {
    header('Content-Type: application/json');
    if(strpos($request[0], "logout") !== false) {
      google_logoutUser();
      sendResponse(200);
    }
    // else if(isset($_SESSION['display_object']) && $_SESSION['display_object']) {
    //   $obj = $_SESSION['display_object'];
    //   unset($_SESSION['display_object']);
    //   sendResponse(200, $obj);
    // }
    else {
      $response = auth();
      if($response !== true) {
        sendResponse(401, $response);
        return;
      }

      $object = getObject(count($request) > 0 ? $request[0] : null, 
                          count($request) > 1 ? $request[1] : null);
      if($object == null) {
        sendResponse(404);
      }
      else {
        $response = $object->handleRequest($request, $method);

        sendResponse($status, $response);
      }
    }
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
