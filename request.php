<?php
$servername = "localhost";
$username = "root";
$password = "";

// Create connection
$conn = new mysqli($servername, $username, $password);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 


$date = date('Y-m-d H:i:s');
$trackingNumber = $_POST['tracking_number'];


$sql = "INSERT INTO  packages (Sender, Recipient, TrackingNumber, DateTime)
VALUES (null, null, $trackingNumber, $date)";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["message " => "New record created successfully"]);
} else {
    echo json_encode(["message" => "Error: " . $sql . "<br>" . $conn->error]);
}

 $conn->close();

// 
?>