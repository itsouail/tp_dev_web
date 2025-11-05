document.addEventListener("DOMContentLoaded", () => {
  const table = document.querySelector("#attendanceTable");

  // Function to calculate everything for one row
  function updateRow(row) {
    const cells = row.querySelectorAll("td");
    const attendanceCells = Array.from(cells).slice(3, 9);   // S1–S6
    const participationCells = Array.from(cells).slice(9, 15); // P1–P6
    const messageCell = cells[15];

    const absences = attendanceCells.filter(c => {
      const checkbox = c.querySelector("input[type='checkbox']");
      return !checkbox || !checkbox.checked;
    }).length;

    const participations = participationCells.filter(c => {
      const checkbox = c.querySelector("input[type='checkbox']");
      return checkbox && checkbox.checked;
    }).length;

    row.classList.remove("green", "yellow", "red");
    if (absences < 3) row.classList.add("green");
    else if (absences >= 3 && absences <= 4) row.classList.add("yellow");
    else row.classList.add("red");

    let message = "";
    if (absences < 3 && participations >= 4)
      message = "Good attendance – Excellent participation";
    else if (absences >= 3 && absences <= 4)
      message = "Warning – attendance low – You need to participate more";
    else
      message = "Excluded – too many absences – You need to participate more";

    messageCell.textContent = `${absences} Abs, ${participations} Par — ${message}`;
  }

  function updateAllRows() {
    table.querySelectorAll("tbody tr").forEach(updateRow);
  }

  updateAllRows();

  function attachCheckboxListeners() {
    table.querySelectorAll("input[type='checkbox']").forEach(box => {
      box.removeEventListener("change", updateAllRows);
      box.addEventListener("change", updateAllRows);
    });
  }

  attachCheckboxListeners();

  // Handle new student form
  document.querySelector("#studentForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const studentID = document.getElementById("studentID").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const firstName = document.getElementById("firstName").value.trim();

    const existingIDs = Array.from(document.querySelectorAll("tbody tr td:first-child"))
      .map(td => td.textContent.trim());

    if (existingIDs.includes(studentID)) {
      alert("This student already exists in the attendance list.");
      return;
    }

    const tbody = document.querySelector("tbody");
    const newRow = document.createElement("tr");

    let rowHTML = `
      <td>${studentID}</td>
      <td>${lastName}</td>
      <td>${firstName}</td>`;
    
    // Add 6 attendance checkboxes
    for (let i = 1; i <= 6; i++) {
      rowHTML += `<td class="center"><input type="checkbox" aria-label="Present for student ${studentID}"></td>`;
    }
    // Add 6 participation checkboxes
    for (let i = 1; i <= 6; i++) {
      rowHTML += `<td class="center"><input type="checkbox" aria-label="Participated for student ${studentID}"></td>`;
    }

    // Add empty message cell
    rowHTML += `<td></td>`;
    newRow.innerHTML = rowHTML;

    tbody.appendChild(newRow);

    attachCheckboxListeners();
    updateRow(newRow);

    event.target.reset();
  });
});


// ======= REPORT FEATURE =======
document.getElementById("showReportBtn").addEventListener("click", () => {
  const rows = document.querySelectorAll("#attendanceTable tbody tr");
  const totalStudents = rows.length;

  let totalPresent = 0;
  let totalParticipation = 0;

  rows.forEach(row => {
    const attendanceBoxes = Array.from(row.querySelectorAll("td input[type='checkbox']")).slice(0, 6);
    const participationBoxes = Array.from(row.querySelectorAll("td input[type='checkbox']")).slice(6, 12);

    // Count checked boxes
    totalPresent += attendanceBoxes.filter(b => b.checked).length;
    totalParticipation += participationBoxes.filter(b => b.checked).length;
  });

  // Show report section
  document.getElementById("reportSection").style.display = "block";

  // Create chart
  const ctx = document.getElementById("reportChart").getContext("2d");

  // If chart exists, destroy it to refresh
  if (window.attendanceChart) {
    window.attendanceChart.destroy();
  }

  window.attendanceChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Total Students', 'Present Marks', 'Participation Marks'],
      datasets: [{
        label: 'Report Summary',
        data: [totalStudents, totalPresent, totalParticipation],
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107']
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
});

