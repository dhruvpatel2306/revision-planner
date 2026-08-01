// Store all subjects here: { name, examDate }
let subjects = [];

// Spaced repetition intervals: days BEFORE the exam to revise
const REVISION_INTERVALS = [14, 7, 3, 1];

const form = document.getElementById('subject-form');
const subjectNameInput = document.getElementById('subject-name');
const examDateInput = document.getElementById('exam-date');
const subjectListEl = document.getElementById('subject-list');
const scheduleOutputEl = document.getElementById('schedule-output');
const errorEl = document.getElementById('form-error');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = subjectNameInput.value.trim();
  const examDate = examDateInput.value;

  errorEl.textContent = '';

  if (!name || !examDate) return;

  // Validation: exam date can't be in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const chosenDate = new Date(examDate);

  if (chosenDate < today) {
    errorEl.textContent = 'Exam date cannot be in the past. Please pick a future date.';
    return;
  }

  // Validation: no duplicate subject names
  const isDuplicate = subjects.some(s => s.name.toLowerCase() === name.toLowerCase());
  if (isDuplicate) {
    errorEl.textContent = 'This subject is already added.';
    return;
  }

  subjects.push({ name, examDate });

  subjectNameInput.value = '';
  examDateInput.value = '';
  subjectNameInput.focus();

  renderSubjects();
  renderSchedule();
});

function renderSubjects() {
  subjectListEl.innerHTML = '';
  subjects.forEach((subject, index) => {
    const li = document.createElement('li');

    const textSpan = document.createElement('span');
    textSpan.textContent = `${subject.name} — Exam on ${formatDate(subject.examDate)}`;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      subjects.splice(index, 1);
      renderSubjects();
      renderSchedule();
    });

    li.appendChild(textSpan);
    li.appendChild(removeBtn);
    subjectListEl.appendChild(li);
  });
}

function renderSchedule() {
  let allEvents = [];

  subjects.forEach(subject => {
    const examDateObj = new Date(subject.examDate);

    REVISION_INTERVALS.forEach(daysBefore => {
      const revisionDate = new Date(examDateObj);
      revisionDate.setDate(revisionDate.getDate() - daysBefore);

      allEvents.push({
        subject: subject.name,
        examDate: subject.examDate,
        revisionDate: revisionDate,
        daysBefore: daysBefore
      });
    });
  });

  allEvents.sort((a, b) => a.revisionDate - b.revisionDate);

  scheduleOutputEl.innerHTML = '';

  if (allEvents.length === 0) {
    scheduleOutputEl.textContent = 'Add a subject to generate your schedule.';
    return;
  }

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Revise On</th>
        <th>Subject</th>
        <th>Days Before Exam</th>
        <th>Exam Date</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody');

  allEvents.forEach(event => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(event.revisionDate)}</td>
      <td>${event.subject}</td>
      <td>${event.daysBefore} day(s) before</td>
      <td>${formatDate(event.examDate)}</td>
    `;
    tbody.appendChild(row);
  });

  scheduleOutputEl.appendChild(table);
}

function formatDate(dateInput) {
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}