// ===== NAVIGATION =====
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });
  document.getElementById('mobileMenu').classList.remove('open');
  window.scrollTo(0, 0);
  if (page === 'progress') initCharts();
  if (page === 'quiz') initQuiz();
}

function toggleMobile() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
});

// ===== TESTIMONIALS =====
let activeTestimonial = 0;
function setTestimonial(idx) {
  activeTestimonial = idx;
  document.querySelectorAll('.testimonial-card').forEach((c, i) => {
    c.classList.toggle('active', i === idx);
  });
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
    d.style.width = i === idx ? '24px' : '8px';
  });
}
setInterval(() => setTestimonial((activeTestimonial + 1) % 3), 5000);

// ===== ANIMATED COUNTERS =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const decimal = el.dataset.decimal === 'true';
      const duration = 2000;
      const start = performance.now();
      const animate = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const val = target * progress;
        el.textContent = decimal ? val.toFixed(1) : Math.floor(val).toLocaleString();
        if (progress < 1) requestAnimationFrame(animate);
        else el.textContent = decimal ? target.toFixed(1) + '/5' : target.toLocaleString() + '+';
      };
      requestAnimationFrame(animate);
      observer.unobserve(el);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-value').forEach(el => observer.observe(el));

// ===== FILE UPLOAD =====
const uploadedFiles = [];
const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragging'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
dropZone.addEventListener('drop', e => {
  e.preventDefault(); dropZone.classList.remove('dragging');
  if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
});

function handleFileSelect(e) { if (e.target.files.length) addFiles(e.target.files); }

function addFiles(fileList) {
  Array.from(fileList).forEach(f => {
    uploadedFiles.push({ id: Date.now() + Math.random(), name: f.name, size: f.size });
  });
  renderFiles();
}

function removeFile(id) {
  const idx = uploadedFiles.findIndex(f => f.id === id);
  if (idx > -1) uploadedFiles.splice(idx, 1);
  renderFiles();
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function renderFiles() {
  const list = document.getElementById('fileList');
  if (!uploadedFiles.length) { list.innerHTML = ''; return; }
  list.innerHTML = uploadedFiles.map(f => `
    <div class="file-item">
      <span style="color:var(--primary)">📄</span>
      <div class="file-info">
        <p class="file-name">${f.name}</p>
        <p class="file-size">${formatSize(f.size)}</p>
      </div>
      <button class="remove-btn" onclick="removeFile(${f.id})">✕</button>
    </div>
  `).join('') + `<button class="btn btn-primary btn-full" style="margin-top:1rem" onclick="showPage('quiz')">✨ Analyze & Generate Questions</button>`;
}

function setCategory(el, cat) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

// ===== QUIZ =====
const questions = [
  { id:1, question:"What is the time complexity of binary search?", options:["O(n)","O(log n)","O(n²)","O(1)"], correct:1, explanation:"Binary search divides the search space in half at each step, resulting in O(log n) time complexity.", topic:"Algorithms" },
  { id:2, question:"Which data structure uses FIFO ordering?", options:["Stack","Queue","Tree","Graph"], correct:1, explanation:"A Queue follows First-In-First-Out (FIFO) ordering where elements are removed in the same order they were added.", topic:"Data Structures" },
  { id:3, question:"What does SQL stand for?", options:["Structured Query Language","Simple Query Language","Standard Query Logic","Sequential Query Language"], correct:0, explanation:"SQL stands for Structured Query Language, used for managing and querying relational databases.", topic:"Databases" },
  { id:4, question:"Which sorting algorithm has the best average-case time complexity?", options:["Bubble Sort","Merge Sort","Selection Sort","Insertion Sort"], correct:1, explanation:"Merge Sort has O(n log n) average-case complexity, which is optimal for comparison-based sorting.", topic:"Algorithms" },
  { id:5, question:"What is the purpose of an index in a database?", options:["Store data","Speed up queries","Encrypt data","Compress data"], correct:1, explanation:"Database indexes create a data structure that allows faster lookups, significantly speeding up query performance.", topic:"Databases" },
];

let currentQ = 0, score = 0, answered = false;

function initQuiz() {
  currentQ = 0; score = 0; answered = false;
  renderQuiz();
}

function renderQuiz() {
  const c = document.getElementById('quizContainer');
  const q = questions[currentQ];
  c.innerHTML = `
    <div class="animate-in">
      <div class="quiz-progress">
        <span>Question ${currentQ + 1} of ${questions.length}</span>
        <span class="topic-badge">${q.topic}</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${((currentQ+1)/questions.length)*100}%"></div></div>
      <div class="quiz-card">
        <h2>${q.question}</h2>
        <div id="options">
          ${q.options.map((opt, i) => `
            <button class="option-btn" onclick="selectAnswer(${i})" id="opt-${i}">
              <span class="letter">${String.fromCharCode(65+i)}</span>
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>
        <div id="explanation"></div>
        <div id="nextBtn"></div>
      </div>
    </div>
  `;
  answered = false;
}

function selectAnswer(idx) {
  if (answered) return;
  answered = true;
  const q = questions[currentQ];
  if (idx === q.correct) score++;

  q.options.forEach((_, i) => {
    const btn = document.getElementById('opt-' + i);
    btn.disabled = true;
    if (i === q.correct) btn.classList.add('correct');
    else if (i === idx && i !== q.correct) btn.classList.add('wrong');
    else btn.classList.add('dimmed');

    if (i === q.correct) btn.innerHTML += '<span class="result-icon" style="margin-left:auto;color:var(--accent)">✓</span>';
    if (i === idx && i !== q.correct) btn.innerHTML += '<span class="result-icon" style="margin-left:auto;color:var(--destructive)">✕</span>';
  });

  document.getElementById('explanation').innerHTML = `
    <div class="explanation-box">
      <p class="label">Explanation</p>
      <p>${q.explanation}</p>
    </div>
  `;
  const isLast = currentQ + 1 >= questions.length;
  document.getElementById('nextBtn').innerHTML = `
    <button class="btn btn-primary btn-full" style="margin-top:1.5rem" onclick="${isLast ? 'showResults()' : 'nextQuestion()'}">
      ${isLast ? 'View Results' : 'Next Question'} →
    </button>
  `;
}

function nextQuestion() { currentQ++; renderQuiz(); }

function showResults() {
  const c = document.getElementById('quizContainer');
  const pct = Math.round((score / questions.length) * 100);
  c.innerHTML = `
    <div class="quiz-card result-card animate-in" style="text-align:center;padding:3rem">
      <h2>Quiz Complete!</h2>
      <p class="score">${score}/${questions.length}</p>
      <p style="color:var(--muted-fg);margin-bottom:2rem">You scored ${pct}%</p>
      <button class="btn btn-primary" onclick="initQuiz()">🔄 Try Again</button>
    </div>
  `;
}

// ===== CHARTS (Progress Page) =====
let chartsInit = false;
function initCharts() {
  if (chartsInit) return;
  chartsInit = true;

  // Line Chart
  new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [{ label: 'Score', data: [65,72,68,80,85,78,90], borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.1)', borderWidth: 2.5, pointBackgroundColor: '#1a3a6b', pointRadius: 4, fill: true, tension: 0.3 }]
    },
    options: { responsive: true, scales: { y: { min: 0, max: 100 } }, plugins: { legend: { display: false } } }
  });

  // Pie Chart
  new Chart(document.getElementById('pieChart'), {
    type: 'doughnut',
    data: {
      labels: ['Algorithms','Data Structures','Databases','Networking','OS'],
      datasets: [{ data: [35,25,20,12,8], backgroundColor: ['#1a3a6b','#0ea5e9','#6cb4d9','#4a7aaa','#a0b8cc'], borderWidth: 0 }]
    },
    options: { responsive: true, cutout: '55%' }
  });

  // Bar Chart
  new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: ['Algorithms','Data Structures','Databases','Networking','OS'],
      datasets: [
        { label: 'Correct', data: [28,22,18,10,8], backgroundColor: '#0ea5e9', borderRadius: 4 },
        { label: 'Incorrect', data: [7,8,5,6,4], backgroundColor: '#e04040', borderRadius: 4 }
      ]
    },
    options: { responsive: true }
  });
}

// Init quiz on load
initQuiz();
