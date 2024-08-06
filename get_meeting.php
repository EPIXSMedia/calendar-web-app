<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "calendar_app";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$id = $_GET['id'];
$stmt = $conn->prepare("SELECT * FROM meetings WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

$meeting = null;
if ($row = $result->fetch_assoc()) {
    $meeting = $row;
}

$stmt->close();
$conn->close();

echo json_encode($meeting);
?>
