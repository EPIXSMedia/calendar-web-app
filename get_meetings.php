<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "calendar_app";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$date = $_GET['date'];
$stmt = $conn->prepare("SELECT * FROM meetings WHERE meeting_date = ?");
$stmt->bind_param("s", $date);
$stmt->execute();
$result = $stmt->get_result();

$meetings = [];
while ($row = $result->fetch_assoc()) {
    $meetings[] = $row;
}

$stmt->close();
$conn->close();

echo json_encode($meetings);
?>