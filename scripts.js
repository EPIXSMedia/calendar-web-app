document.addEventListener('DOMContentLoaded', function() {
    initializeControls();
    generateCalendar();

    document.getElementById('meetingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveMeeting();
    });
});

function initializeControls() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    months.forEach((month, index) => {
        let option = document.createElement('option');
        option.value = index;
        option.text = month;
        monthSelect.add(option);
    });

    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
        let option = document.createElement('option');
        option.value = year;
        option.text = year;
        yearSelect.add(option);
    }

    monthSelect.value = new Date().getMonth();
    yearSelect.value = new Date().getFullYear();

    monthSelect.addEventListener('change', generateCalendar);
    yearSelect.addEventListener('change', generateCalendar);
}

function generateCalendar() {
    const calendar = document.getElementById('calendar');
    const selectedMonth = parseInt(document.getElementById('monthSelect').value);
    const selectedYear = parseInt(document.getElementById('yearSelect').value);

    calendar.innerHTML = '';

    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'day';
        calendar.appendChild(emptyDiv);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(Date.UTC(selectedYear, selectedMonth, day));
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.innerText = day;
        dayDiv.onclick = function() {
            openMeetingsList(date.toISOString().split('T')[0]);
        };
        fetchMeetingCountForDay(date.toISOString().split('T')[0], dayDiv);
        calendar.appendChild(dayDiv);
    }
}

function fetchMeetingCountForDay(date, dayDiv) {
    fetch(`get_meetings.php?date=${date}`)
    .then(response => response.json())
    .then(data => {
        if (data.length > 0) {
            const dot = document.createElement('span');
            dot.className = 'dot';
            dayDiv.appendChild(dot);
        }
    });
}

function addMeeting() {
    const selectedMonth = parseInt(document.getElementById('monthSelect').value);
    const selectedYear = parseInt(document.getElementById('yearSelect').value);
    const today = new Date(Date.UTC(selectedYear, selectedMonth, new Date().getUTCDate()));
    openPopup(today.toISOString().split('T')[0]);
}

function openPopup(date) {
    document.getElementById('meetingForm').reset();
    document.getElementById('meetingId').value = '';
    document.getElementById('meetingDate').value = date; // Set meeting date hidden field
    document.getElementById('popup').style.display = 'block';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

function openMeetingsList(date) {
    fetch(`get_meetings.php?date=${date}`)
    .then(response => response.json())
    .then(data => {
        const meetingsList = document.getElementById('meetings-list');
        meetingsList.innerHTML = `<h3>Meetings on ${date}</h3><ul>${data.map(meeting => `
            <li>
                ${meeting.meeting_time} - ${meeting.person_name} (${meeting.status})<br/>
                ${meeting.purpose}<br/>
                Assigned to: ${meeting.assigned_to}<br/>
                Notes: ${meeting.notes}<br/>
                <button onclick="editMeeting(${meeting.id})">Edit</button>
                <button onclick="deleteMeeting(${meeting.id})">Delete</button>
            </li>`).join('')}
        </ul>`;
        meetingsList.style.display = 'block';
    });
}

function saveMeeting() {
    const formData = new FormData(document.getElementById('meetingForm'));
    formData.append('meeting_date', document.getElementById('meetingDate').value); // Append meeting date

    fetch('save_meeting.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Meeting saved successfully!');
            closePopup();
            generateCalendar(); // Refresh the calendar to show updated meetings
            openMeetingsList(document.getElementById('meetingDate').value); // Refresh the meeting list
        } else {
            alert('Error saving meeting.');
        }
    })
    .catch(error => console.error('Error:', error));
}

function editMeeting(meetingId) {
    fetch(`get_meeting.php?id=${meetingId}`)
    .then(response => response.json())
    .then(meeting => {
        document.getElementById('meetingId').value = meeting.id;
        document.getElementById('meetingDate').value = meeting.meeting_date;
        document.getElementById('personName').value = meeting.person_name;
        document.getElementById('meetingTime').value = meeting.meeting_time;
        document.getElementById('purpose').value = meeting.purpose;
        document.getElementById('status').value = meeting.status;
        document.getElementById('notes').value = meeting.notes;
        document.getElementById('assignedTo').value = meeting.assigned_to;
        document.getElementById('popup').style.display = 'block';
    });
}

function deleteMeeting(meetingId) {
    if (confirm('Are you sure you want to delete this meeting?')) {
        fetch(`delete_meeting.php?id=${meetingId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Meeting deleted successfully!');
                generateCalendar(); // Refresh the calendar to show updated meetings
            } else {
                alert('Error deleting meeting.');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}