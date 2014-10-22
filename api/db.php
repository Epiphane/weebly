<?php
$host = "thomassteinke.db";
$username = "thomassteink";
$password = "2bORNOT2b";
$database = "quick";

$connect = mysqli_connect($host, $username, $password, $database);

if (mysqli_connect_errno()) {
  die("Failed to connect to MySQL: " . mysqli_connect_error());
}

?>
