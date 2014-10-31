<?php

session_start();

include("google-api-php-client/autoload.php");

$google_api_config = [
  'application-id' => '899388878734-1co24876earn6sc2kjotum1le1de4tgi.apps.googleusercontent.com',
  'service-account-name' => '899388878734-1co24876earn6sc2kjotum1le1de4tgi@developer.gserviceaccount.com',
  'client-id' => '899388878734-i7a9sr8mtt98hsedqc2dokgs4l2ic9d1.apps.googleusercontent.com',
  'private-key' => file_get_contents('./Weebly-529e6e85d757.p12'),
  'dataset-id' => 'encouraging-art-743',
  'secret' => 'Uzi5bqZSjP8NNwth0LNfrco9',
  'redirect-uri' => 'http://weebly.thomassteinke.com/api/oauth'
];

$dataClient = new Google_Client();
$dataClient->setApplicationName("Weebly");//$google_api_config['application-id']);
$dataClient->setAssertionCredentials(new Google_Auth_AssertionCredentials(
  $google_api_config['service-account-name'],
  [
    "https://www.googleapis.com/auth/datastore",
    "https://www.googleapis.com/auth/userinfo.email"
  ],
  $google_api_config['private-key'])
);

$client = new Google_Client();
$client->setApplicationName("Weebly");
$client->setClientId($google_api_config['client-id']);
$client->setClientSecret($google_api_config['secret']);
$client->setRedirectUri($google_api_config['redirect-uri']);
$client->addScope("email");

$datastore = new Google_Service_Datastore($dataClient);
$datasets = $datastore->datasets;

function google_logoutUser() {
  unset($_SESSION['access_token']);
  unset($_SESSION['refresh_token']);
}

function google_loginUser($code) {
  global $client;

  $client->authenticate($code);
  $_SESSION['access_token'] = $client->getAccessToken();
  $_SESSION['refresh_token'] = $client->getRefreshToken();
  $redirect = 'http://' . $_SERVER['HTTP_HOST'] . "/api";
  header('Location: ' . filter_var($redirect, FILTER_SANITIZE_URL));
}

function google_authUser() {
  global $client, $google_api_config, $datastore, $datasets;

  if (isset($_SESSION['access_token']) && $_SESSION['access_token']) {
    $client->setAccessToken($_SESSION['access_token']);
    if($client->isAccessTokenExpired()) {
      if(isset($_SESSION['refresh_token'])) {
        $client->refreshToken();
      }
      else {
        $authUrl = $client->createAuthUrl();
        return $authUrl;
      }
    }

    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, "https://www.googleapis.com/plus/v1/people/me?access_token=" . json_decode($_SESSION['access_token'])->access_token);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 0);
    $userInfo = json_decode(curl_exec($curl));
    curl_close($curl);

    $partition = new Google_Service_Datastore_PartitionId();
    $partition->setNamespace("Weebly");

    $path = new Google_Service_Datastore_KeyPathElement();
    $path->setKind("Person");
    $path->setName($userInfo->id);

    $key = new Google_Service_Datastore_Key();
    $key->setPartitionId($partition);
    $key->setPath([$path]);

    /*$request = new Google_Service_Datastore_RunQueryRequest();
    $request->setPartitionId($partition);

    $query = new Google_Service_Datastore_Query();
    $projection = new Google_Service_Datastore_PropertyExpression();
    $displayName = new Google_Service_Datastore_PropertyReference();
    $displayName->setName("displayName");
    $projection->setProperty($displayName);

    $filter = new Google_Service_Datastore_Filter();
    $refreshFilter = new Google_Service_Datastore_PropertyFilter();
    $refreshFilter->setOperator("EQUAL");
    $refreshToken = new Google_Service_Datastore_PropertyReference();
    $refreshToken->setName("refresh_token");
    $refreshFilter->setProperty($refreshToken);

    $refreshValue = new Google_Service_Datastore_Value();
    $refreshValue->setKeyValue($key);
    $refreshValue->setStringValue($_SESSION["refresh_token"]);
    $refreshFilter->setValue($refreshValue);
    $filter->setPropertyFilter($refreshFilter);
    $query->setFilter($filter);
    $request->setQuery($query);
    var_dump($datasets->runQuery($google_api_config['dataset-id'], $request));*/


    $entity = new Google_Service_Datastore_Entity();

    $req = new Google_Service_Datastore_CommitRequest();
    $req->setMode('NON_TRANSACTIONAL');

    $entity = new Google_Service_Datastore_Entity();
    $entity->setKey($key);

    $property_map = [];
    foreach($userInfo as $key => $value) {
      $property = new Google_Service_Datastore_Property();
      $property->setStringValue(json_encode($value));
      $property->setIndexed(false);
      $property_map[$key] = $property;
    }

    $refresh = new Google_Service_Datastore_Property();
    $refresh->setStringValue($_SESSION['refresh_token']);
    $refresh->setIndexed(true);
    $property_map["refresh_token"] = $refresh;

    $entity->setProperties($property_map);

    $mutation = new Google_Service_Datastore_Mutation();
    $mutation->setUpsert([$entity]);

    $req->setMutation($mutation);
    $datasets->commit($google_api_config['dataset-id'], $req);

    return true;
  } else {
    $authUrl = $client->createAuthUrl();
    return $authUrl;
  }

}

?>