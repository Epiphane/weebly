<?php

session_start();

include("google-api-php-client/autoload.php");

$google_api_config = [
  'client-id' => '899388878734-i7a9sr8mtt98hsedqc2dokgs4l2ic9d1.apps.googleusercontent.com',
  'secret' => 'Uzi5bqZSjP8NNwth0LNfrco9',
  'redirect-uri' => 'http://weebly.thomassteinke.com/api/oauth'
];

$client = new Google_Client();
$client->setApplicationName("Weebly");
$client->setClientId($google_api_config['client-id']);
$client->setClientSecret($google_api_config['secret']);
$client->setRedirectUri($google_api_config['redirect-uri']);
$client->addScope("email");

function auth() {
  global $client, $mysqli;

  if(isset($_REQUEST['token']) && $_REQUEST['token']) {
    $query = $mysqli->prepare("SELECT * FROM users WHERE token = ?");

    $query->bind_param("s", $_REQUEST['token']);
    $query->execute();
    $result = $query->get_result();

    if($result->num_rows > 0) {
      return true;
    }
    else {
      return "{
        \"error\": {
          \"type\": 2,
          \"message\": \"Token is not valid\",
          \"url\": \"http://weebly.thomassteinke.com/api/token\"
        }
      }";
    }
  }

  // No valid token provided - return a login link
  return "{
    \"error\": {
      \"type\": 1,
      \"message\": \"Please sign in with Google Plus\",
      \"url\": \"" . $client->createAuthUrl() . "\"
    }
  }";
}

function google_authUser() {
  global $client, $mysqli, $status;

  if(isset($_SESSION['access_token']) && $_SESSION['access_token']) {
    $client->setAccessToken($_SESSION['access_token']);
    if($client->isAccessTokenExpired()) {
      if(isset($_SESSION['refresh_token']) && $_SESSION['refresh_token']) {
        $client->refreshToken($_SESSION['refresh_token']);
      }
      else {
        // $status = 401;
        return "{"
          . "\"error\": {"
            . "\"type\": 1,"
            . "\"message\": \"Please sign in with Google Plus\","
            . "\"url\": \"" . $client->createAuthUrl() . "\""
          . "}"
        . "}";
      }
    }

    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, "https://www.googleapis.com/plus/v1/people/me?access_token=" . json_decode($_SESSION['access_token'])->access_token);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 0);
    $userInfo = json_decode(curl_exec($curl));
    curl_close($curl);

    $email = $userInfo->emails[0]->value;
    $query = $mysqli->prepare("SELECT * FROM users WHERE email = ?");

    $query->bind_param("s", $email);
    $query->execute();
    $result = $query->get_result();

    if($result->num_rows == 0) {
      return $client->createAuthUrl();
    }

    $token = $result->fetch_object()->token;

    return json_encode(array("token" => $token));
    // $redirect = 'http://' . $_SERVER['HTTP_HOST'] . "/api/";
    // header('Location: ' . filter_var($redirect, FILTER_SANITIZE_URL));
  }
  else {
    // $status = 401;
    return "{"
      . "\"error\": {"
        . "\"type\": 1,"
        . "\"message\": \"Please sign in with Google Plus\","
        . "\"url\": \"" . $client->createAuthUrl() . "\""
      . "}"
    . "}";
  }
}

function google_logoutUser() {
  unset($_SESSION['access_token']);
  unset($_SESSION['refresh_token']);
}

function google_loginUser($code) {
  global $client, $mysqli;

  $client->authenticate($code);
  $_SESSION['access_token'] = $client->getAccessToken();
  $_SESSION['refresh_token'] = $client->getRefreshToken();

  // Put user in DB if they havent been put in before
  $curl = curl_init();
  curl_setopt($curl, CURLOPT_URL, "https://www.googleapis.com/plus/v1/people/me?access_token=" . json_decode($_SESSION['access_token'])->access_token);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 0);
  $userInfo = json_decode(curl_exec($curl));
  curl_close($curl);

  $email = $userInfo->emails[0]->value;
  $query = $mysqli->prepare("SELECT * FROM users WHERE email = ?");

  $query->bind_param("s", $email);
  $query->execute();
  $result = $query->get_result();

  // Add them to the database!
  if($result->num_rows == 0) {
    $token = uniqid();

    $insert = $mysqli->prepare("INSERT INTO users (email, info, token) VALUES (?, ?, ?)");
    $insert->bind_param("sss", $email, 
      json_encode($userInfo), 
      $token);
    $insert->execute();
  }
  else {
    $token = $result->fetch_object()->token;
  }

  $_SESSION['display_object'] = json_encode(array("token" => $token));
  $redirect = 'http://' . $_SERVER['HTTP_HOST'] . "/api/close";
  header('Location: ' . filter_var($redirect, FILTER_SANITIZE_URL));
}

?>