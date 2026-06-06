const STORAGE_KEY = 'revelation-memory-progress-v1';
const data = window.SCRIPTURE_DATA;
let progress = loadProgress();
let currentIndex = Math.max(0, data.findIndex(item => item.id === progress.lastId));
let blankRate = 0.3;
let revealed = false;

const $ = (id) => document.getElementById(id);
const passageList = $('passageList');
const verseArea = $('verseArea');
const modeSelect = $('modeSelect');

function loadProgress() {
  try {
    return { mastered: {}, review: {}, lastId: data?.[0]?.id || '', ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return { mastered: {}, review: {}, lastId: data?.[0]?.id || '' };
  }
}
function saveProgress() { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); updateDashboard(); renderList(); }
function current() { return data[currentIndex]; }
function masteredCount() { return data.filter(item => progress.mastered[item.id]).length; }
function updateDashboard() {
  const count = masteredCount();
  const percent = Math.round(count / data.length * 100);
  $('progressTitle').textContent = `${count}/${data.length}개 암기 완료`;
  $('progressText').textContent = percent === 100 ? '모든 범위를 완료했습니다. 랜덤 복습으로 유지해 보세요.' : `전체 진도 ${percent}% · 복습 필요 ${Object.values(progress.review).filter(Boolean).length}개`;
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
      <h3>${item.ref}</h3>
      <div class="passage-meta"><span>${item.category} · ${item.verses.length}절</span>${badge(item)}</div>
    </button>`).join('');
  document.querySelectorAll('.passage-item').forEach(btn => btn.addEventListener('click', () => openStudy(Number(btn.dataset.index))));
}
function setActiveView(view) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.view === view));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $(`${view}View`).classList.add('active');
}
function openStudy(index, keepMode = false) {
  currentIndex = (index + data.length) % data.length;
  const item = current();
  progress.lastId = item.id;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  if (!keepMode) modeSelect.value = item.preferredMode || 'read';
  revealed = false;
  $('studyRef').textContent = item.ref;
  $('studyCategory').textContent = item.category;
  $('difficultyArea').classList.toggle('hidden', modeSelect.value !== 'blank');
  renderVerses();
  setActiveView('study');
}
function hashWord(word, idx) {
  let h = idx + currentIndex * 17;
  for (const ch of word) h = ((h << 5) - h) + ch.charCodeAt(0);
  return Math.abs(h % 1000) / 1000;
}
function blankify(text) {
  let idx = 0;
  return text.split(/(\s+)/).map(token => {
    if (/^\s+$/.test(token) || token.length < 2) return token;
    const shouldBlank = hashWord(token, idx++) < blankRate;
    if (!shouldBlank) return token;
    return `<span class="blank${revealed ? ' revealed' : ''}">${token}</span>`;
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
function renderVerses() {
  const item = current();
  if (!item) return;
  const mode = modeSelect.value;
  $('difficultyArea').classList.toggle('hidden', mode !== 'blank');
  $('revealBtn').textContent = revealed ? '정답 숨기기' : '정답 보기';
  $('revealBtn').style.display = mode === 'read' ? 'none' : '';
  verseArea.classList.remove('empty-state');
  verseArea.innerHTML = item.verses.map(([num, text]) => {
    let body = text;
    if (mode === 'blank') body = blankify(text);
    if (mode === 'initial') body = `<span class="initial-text">${initials(text)}</span>${revealed ? `<div class="muted" style="margin-top:7px">${text}</div>` : ''}`;
    return `<div class="verse-row"><span class="verse-num">${num}</span>${body}</div>`;
  }).join('');
}
function mark(type) {
  const id = current().id;
  if (type === 'mastered') { progress.mastered[id] = true; delete progress.review[id]; }
  else { progress.review[id] = true; delete progress.mastered[id]; }
  saveProgress();
  renderVerses();
}
function updateOnlineStatus() {
  const online = navigator.onLine;
  $('offlineBadge').textContent = online ? '온라인' : '오프라인 사용 중';
  $('offlineBadge').classList.toggle('offline', !online);
}

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => setActiveView(tab.dataset.view)));
document.querySelectorAll('.difficulty-btn').forEach(btn => btn.addEventListener('click', () => {
  blankRate = Number(btn.dataset.rate);
  document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.toggle('active', b === btn));
  revealed = false; renderVerses();
}));
modeSelect.addEventListener('change', () => { revealed = false; renderVerses(); });
$('revealBtn').addEventListener('click', () => { revealed = !revealed; renderVerses(); });
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
$('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = '성구암기-기록백업.json'; a.click(); URL.revokeObjectURL(url);
});
$('importInput').addEventListener('change', async (event) => {
  const file = event.target.files[0]; if (!file) return;
  try { progress = { mastered: {}, review: {}, ...JSON.parse(await file.text()) }; saveProgress(); alert('기록을 불러왔습니다.'); }
  catch { alert('올바른 백업 파일이 아닙니다.'); }
  event.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (!confirm('암기 기록을 모두 초기화할까요?')) return;
  progress = { mastered: {}, review: {}, lastId: data[0].id }; saveProgress(); openStudy(0);
});
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));

renderList(); updateDashboard(); updateOnlineStatus();
