const STORAGE_KEY = 'revelation-memory-progress-v1';
const data = window.SCRIPTURE_DATA;
let progress = loadProgress();
let currentIndex = Math.max(0, data.findIndex(item => item.id === progress.lastId));
let blankRate = 0.3;
let revealed = false;
let revealedBlanks = new Set();
let typingDrafts = {};
let typingResults = {};
let typingAnswerVisible = new Set();
let selectedCalendarDate = localDateKey(new Date());
let calendarCursor = monthStart(new Date());

const $ = (id) => document.getElementById(id);
const passageList = $('passageList');
const verseArea = $('verseArea');
const modeSelect = $('modeSelect');

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function monthStart(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function parseLocalDate(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}
function normalizeProgress(raw = {}) {
  return {
    mastered: {},
    review: {},
    activity: {},
    lastId: data?.[0]?.id || '',
    ...raw,
    mastered: raw.mastered || {},
    review: raw.review || {},
    activity: raw.activity || {}
  };
}
function loadProgress() {
  try { return normalizeProgress(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); }
  catch { return normalizeProgress(); }
}
function persistProgress() { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
function saveProgress() {
  persistProgress();
  updateDashboard();
  renderList();
  renderCalendar();
}
function current() { return data[currentIndex]; }
function masteredCount() { return data.filter(item => progress.mastered[item.id]).length; }
function getActivity(dateKey) {
  return progress.activity[dateKey] || { mastered: [], typingPassed: [] };
}
function ensureActivity(dateKey) {
  if (!progress.activity[dateKey]) progress.activity[dateKey] = { mastered: [], typingPassed: [] };
  if (!Array.isArray(progress.activity[dateKey].mastered)) progress.activity[dateKey].mastered = [];
  if (!Array.isArray(progress.activity[dateKey].typingPassed)) progress.activity[dateKey].typingPassed = [];
  return progress.activity[dateKey];
}
function recordActivity(type, id) {
  const activity = ensureActivity(localDateKey());
  if (!activity[type].includes(id)) activity[type].push(id);
  saveProgress();
}
function updateDashboard() {
  const count = masteredCount();
  const percent = Math.round(count / data.length * 100);
  const today = getActivity(localDateKey());
  $('progressTitle').textContent = `${count}/${data.length}개 암기 완료`;
  $('progressText').textContent = percent === 100
    ? `전체 진도 100% · 오늘 암기 ${today.mastered.length}개 · 토씨 통과 ${today.typingPassed.length}개`
    : `전체 진도 ${percent}% · 복습 필요 ${Object.values(progress.review).filter(Boolean).length}개 · 오늘 토씨 통과 ${today.typingPassed.length}개`;
  $('progressBar').style.width = `${percent}%`;
  $('passageCount').textContent = `${data.length}개 범위`;
}
function badge(item) {
  if (progress.mastered[item.id]) return '<span class="mini-badge mastered">암기 완료</span>';
  if (progress.review[item.id]) return '<span class="mini-badge review">복습 필요</span>';
  return '<span class="mini-badge">학습 전</span>';
}
function renderList() {
  passageList.innerHTML = data.map((item, index) => `
    <button class="passage-item" data-index="${index}">
      <h3>${escapeHtml(item.ref)}</h3>
      <div class="passage-meta"><span>${escapeHtml(item.category)} · ${item.verses.length}절</span>${badge(item)}</div>
    </button>`).join('');
  document.querySelectorAll('.passage-item').forEach(btn => btn.addEventListener('click', () => openStudy(Number(btn.dataset.index))));
}
function setActiveView(view) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.view === view));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $(`${view}View`).classList.add('active');
  if (view === 'calendar') renderCalendar();
}
function openStudy(index, keepMode = false) {
  currentIndex = (index + data.length) % data.length;
  const item = current();
  progress.lastId = item.id;
  persistProgress();
  if (!keepMode) modeSelect.value = item.preferredMode || 'read';
  revealed = false;
  revealedBlanks.clear();
  $('studyRef').textContent = item.ref;
  $('studyCategory').textContent = item.category;
  renderVerses();
  setActiveView('study');
}
function hashWord(word, idx) {
  let h = idx + currentIndex * 17;
  for (const ch of word) h = ((h << 5) - h) + ch.charCodeAt(0);
  return Math.abs(h % 1000) / 1000;
}
function blankify(text, verseNum) {
  let idx = 0;
  return text.split(/(\s+)/).map(token => {
    if (/^\s+$/.test(token) || token.length < 2) return token;
    const tokenIndex = idx++;
    const shouldBlank = hashWord(token, tokenIndex) < blankRate;
    if (!shouldBlank) return token;
    const key = `${verseNum}-${tokenIndex}`;
    const isRevealed = revealed || revealedBlanks.has(key);
    return `<span class="blank${isRevealed ? ' revealed' : ''}" data-blank-key="${key}" role="button" tabindex="0" aria-label="빈칸 정답 보기">${escapeHtml(token)}</span>`;
  }).join('');
}
function initials(text) {
  const initialMap = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  return [...text].map(ch => {
    const code = ch.charCodeAt(0) - 0xAC00;
    if (code >= 0 && code <= 11171) return initialMap[Math.floor(code / 588)];
    return ch;
  }).join('');
}
function typingKey(verseNum) { return `${current().id}-${verseNum}`; }
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[ch]));
}
function normalizeForCheck(value) {
  return String(value || '')
    .normalize('NFC')
    .replace(/[\s.,!?，。！？·'“”"‘’():;()\[\]{}]/g, '');
}
function typingPassedForCurrent() {
  return current().verses.every(([num]) => typingResults[typingKey(num)] === true);
}
function typingCorrectCount() {
  return current().verses.filter(([num]) => typingResults[typingKey(num)] === true).length;
}
function recordTypingPassIfComplete() {
  if (!typingPassedForCurrent()) return;
  const today = ensureActivity(localDateKey());
  if (!today.typingPassed.includes(current().id)) {
    today.typingPassed.push(current().id);
    saveProgress();
  }
}
function renderTypingStatus() {
  const correct = typingCorrectCount();
  const total = current().verses.length;
  const passedToday = getActivity(localDateKey()).typingPassed.includes(current().id);
  if (passedToday || correct === total) return `<div class="typing-progress passed">토씨 시험 통과 · 오늘 기록됨</div>`;
  return `<div class="typing-progress">토씨 시험 진행 ${correct}/${total}절</div>`;
}
function renderTypingVerse(num, text) {
  const key = typingKey(num);
  const draft = typingDrafts[key] || '';
  const result = typingResults[key];
  const showAnswer = revealed || typingAnswerVisible.has(key);
  const resultHtml = result === true
    ? '<span class="typing-result correct">정답입니다.</span>'
    : result === false
      ? '<span class="typing-result wrong">일치하지 않습니다. 토씨를 다시 확인해 보세요.</span>'
      : '';
  return `<div class="typing-verse" data-typing-key="${key}" data-answer="${escapeHtml(text)}">
    <div class="typing-label">${num}절 직접 입력</div>
    <textarea class="typing-input" rows="3" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="말씀을 토씨까지 적어 보세요">${escapeHtml(draft)}</textarea>
    <div class="typing-controls">
      <button class="typing-check" type="button">정답 확인</button>
      <button class="typing-show" type="button">${showAnswer ? '정답 숨기기' : '정답 보기'}</button>
      ${resultHtml}
    </div>
    <div class="typing-answer${showAnswer ? '' : ' hidden'}"><strong>정답</strong><br>${escapeHtml(text)}</div>
  </div>`;
}
function renderVerses() {
  const item = current();
  if (!item) return;
  const mode = modeSelect.value;
  $('difficultyArea').classList.toggle('hidden', mode !== 'blank');
  $('typingGuide').classList.toggle('hidden', mode !== 'typing');
  $('revealBtn').textContent = revealed ? '정답 숨기기' : (mode === 'typing' ? '전체 정답 보기' : '정답 보기');
  $('revealBtn').style.display = mode === 'read' ? 'none' : '';
  verseArea.classList.remove('empty-state');
  if (mode === 'typing') {
    verseArea.innerHTML = renderTypingStatus() + item.verses.map(([num, text]) => renderTypingVerse(num, text)).join('');
    return;
  }
  verseArea.innerHTML = item.verses.map(([num, text]) => {
    let body = escapeHtml(text);
    if (mode === 'blank') body = blankify(text, num);
    if (mode === 'initial') body = `<span class="initial-text">${escapeHtml(initials(text))}</span>${revealed ? `<div class="muted" style="margin-top:7px">${escapeHtml(text)}</div>` : ''}`;
    return `<div class="verse-row"><span class="verse-num">${num}</span>${body}</div>`;
  }).join('');
}
function mark(type) {
  const id = current().id;
  if (type === 'mastered') {
    progress.mastered[id] = true;
    delete progress.review[id];
    recordActivity('mastered', id);
  } else {
    progress.review[id] = true;
    delete progress.mastered[id];
    saveProgress();
  }
  renderVerses();
}
function updateOnlineStatus() {
  const online = navigator.onLine;
  $('offlineBadge').textContent = online ? '온라인' : '오프라인 사용 중';
  $('offlineBadge').classList.toggle('offline', !online);
}
function dataItem(id) { return data.find(item => item.id === id); }
function formatDateLabel(key) {
  const date = parseLocalDate(key);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${weekdays[date.getDay()]})`;
}
function renderActivityList(ids, emptyMessage) {
  if (!ids.length) return `<p class="daily-empty">${emptyMessage}</p>`;
  return `<ul>${ids.map(id => `<li>${escapeHtml(dataItem(id)?.ref || id)}</li>`).join('')}</ul>`;
}
function renderDailySummary() {
  const activity = getActivity(selectedCalendarDate);
  $('selectedDateLabel').textContent = formatDateLabel(selectedCalendarDate);
  $('dailySummary').innerHTML = `
    <section class="daily-block">
      <div class="daily-block-title"><strong>암기 완료</strong><span>${activity.mastered.length}개</span></div>
      ${renderActivityList(activity.mastered, '암기 완료로 기록한 성구가 없습니다.')}
    </section>
    <section class="daily-block">
      <div class="daily-block-title"><strong>토씨 시험 통과</strong><span>${activity.typingPassed.length}개</span></div>
      ${renderActivityList(activity.typingPassed, '토씨 시험을 통과한 성구가 없습니다.')}
    </section>`;
}
function renderCalendar() {
  if (!$('calendarGrid')) return;
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  $('calendarTitle').textContent = `${year}년 ${month + 1}월`;
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const todayKey = localDateKey();
  let html = '';
  for (let i = 0; i < firstDay; i++) html += '<span class="calendar-cell empty" aria-hidden="true"></span>';
  for (let day = 1; day <= lastDate; day++) {
    const key = localDateKey(new Date(year, month, day));
    const activity = getActivity(key);
    const mastered = activity.mastered.length;
    const typingPassed = activity.typingPassed.length;
    const selected = key === selectedCalendarDate ? ' selected' : '';
    const today = key === todayKey ? ' today' : '';
    html += `<button class="calendar-cell${selected}${today}" type="button" data-date="${key}">
      <span class="calendar-day">${day}</span>
      <span class="calendar-marks">
        ${mastered ? `<small class="calendar-mark mastered-mark">암기 ${mastered}</small>` : ''}
        ${typingPassed ? `<small class="calendar-mark typing-mark">토씨 ${typingPassed}</small>` : ''}
      </span>
    </button>`;
  }
  $('calendarGrid').innerHTML = html;
  $('calendarGrid').querySelectorAll('[data-date]').forEach(btn => btn.addEventListener('click', () => {
    selectedCalendarDate = btn.dataset.date;
    renderCalendar();
  }));
  renderDailySummary();
}

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => setActiveView(tab.dataset.view)));
document.querySelectorAll('.difficulty-btn').forEach(btn => btn.addEventListener('click', () => {
  blankRate = Number(btn.dataset.rate);
  document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.toggle('active', b === btn));
  revealed = false; revealedBlanks.clear(); renderVerses();
}));
modeSelect.addEventListener('change', () => { revealed = false; revealedBlanks.clear(); renderVerses(); });
$('revealBtn').addEventListener('click', () => { revealed = !revealed; if (!revealed) revealedBlanks.clear(); renderVerses(); });
verseArea.addEventListener('input', (event) => {
  const input = event.target.closest('.typing-input');
  if (!input) return;
  const row = input.closest('.typing-verse');
  typingDrafts[row.dataset.typingKey] = input.value;
});
verseArea.addEventListener('click', (event) => {
  const blank = event.target.closest('.blank');
  if (blank && modeSelect.value === 'blank') {
    const key = blank.dataset.blankKey;
    if (revealedBlanks.has(key)) revealedBlanks.delete(key);
    else revealedBlanks.add(key);
    blank.classList.toggle('revealed');
    return;
  }
  const row = event.target.closest('.typing-verse');
  if (!row || modeSelect.value !== 'typing') return;
  const key = row.dataset.typingKey;
  if (event.target.closest('.typing-check')) {
    const input = row.querySelector('.typing-input').value;
    typingDrafts[key] = input;
    typingResults[key] = normalizeForCheck(input) === normalizeForCheck(row.dataset.answer);
    if (!typingResults[key]) typingAnswerVisible.add(key);
    recordTypingPassIfComplete();
    renderVerses();
  }
  if (event.target.closest('.typing-show')) {
    if (typingAnswerVisible.has(key)) typingAnswerVisible.delete(key);
    else typingAnswerVisible.add(key);
    renderVerses();
  }
});
verseArea.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const blank = event.target.closest('.blank');
  if (!blank) return;
  event.preventDefault();
  blank.click();
});
$('masterBtn').addEventListener('click', () => mark('mastered'));
$('reviewBtn').addEventListener('click', () => mark('review'));
$('prevBtn').addEventListener('click', () => openStudy(currentIndex - 1, true));
$('nextBtn').addEventListener('click', () => openStudy(currentIndex + 1, true));
$('continueBtn').addEventListener('click', () => openStudy(currentIndex));
$('randomBtn').addEventListener('click', () => {
  const reviews = data.map((x,i)=>[x,i]).filter(([x]) => progress.review[x.id]);
  const pool = reviews.length ? reviews : data.map((x,i)=>[x,i]);
  openStudy(pool[Math.floor(Math.random() * pool.length)][1]);
});
$('calendarPrevBtn').addEventListener('click', () => { calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1); renderCalendar(); });
$('calendarNextBtn').addEventListener('click', () => { calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1); renderCalendar(); });
$('calendarTodayBtn').addEventListener('click', () => { const today = new Date(); selectedCalendarDate = localDateKey(today); calendarCursor = monthStart(today); renderCalendar(); });
$('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = '성구암기-기록백업.json'; a.click(); URL.revokeObjectURL(url);
});
$('importInput').addEventListener('change', async (event) => {
  const file = event.target.files[0]; if (!file) return;
  try { progress = normalizeProgress(JSON.parse(await file.text())); saveProgress(); alert('기록을 불러왔습니다.'); }
  catch { alert('올바른 백업 파일이 아닙니다.'); }
  event.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (!confirm('암기 기록과 달력 기록을 모두 초기화할까요?')) return;
  progress = normalizeProgress();
  saveProgress();
  openStudy(0);
});
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));

renderList(); updateDashboard(); updateOnlineStatus(); renderCalendar();
