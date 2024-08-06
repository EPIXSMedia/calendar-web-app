<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "calendar_app";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$meeting_id = isset($_POST['meeting_id']) ? $_POST['meeting_id'] : null;
$meeting_date = $_POST['meeting_date'];
$person_name = $_POST['person_name'];
$meeting_time = $_POST['meeting_time'];
$purpose = $_POST['purpose'];
$status = $_POST['status'];
$notes = $_POST['notes'];
$assigned_to = $_POST['assigned_to'];

if ($meeting_id) {
    $stmt = $conn->prepare("UPDATE meetings SET meeting_date=?, person_name=?, meeting_time=?, purpose=?, status=?, notes=?, assigned_to=? WHERE id=?");
    $stmt->bind_param("sssssssi", $meeting_date, $person_name, $meeting_time, $purpose, $status, $notes, $assigned_to, $meeting_id);
} else {
    $stmt = $conn->prepare("INSERT INTO meetings (meeting_date, person_name, meeting_time, purpose, status, notes, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssss", $meeting_date, $person_name, $meeting_time, $purpose, $status, $notes, $assigned_to);
}

$response = [];
if ($stmt->execute()) {
    $response['success'] = true;
} else {
    $response['success'] = false;
    $response['error'] = $stmt->error;
}

$stmt->close();
$conn->close();

echo json_encode($response);
?>