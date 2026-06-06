:root {
  --bg: #fffaf0;
  --card: #ffffff;
  --text: #2f2a20;
  --muted: #756e61;
  --line: #eee4cf;
  --accent: #e2ad32;
  --accent-soft: #fff0b9;
  --green: #4d8b68;
  --green-soft: #e8f4ec;
  --red: #b8554f;
  --red-soft: #fbe9e6;
  --shadow: 0 10px 30px rgba(84, 68, 38, .08);
  font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); }
button, select, label { font: inherit; }
button, .file-label { cursor: pointer; border: 0; border-radius: 14px; padding: 12px 15px; font-weight: 700; transition: transform .15s ease, opacity .15s ease; }
button:active, .file-label:active { transform: scale(.98); }
.topbar, main, footer { width: min(920px, calc(100% - 28px)); margin: 0 auto; }
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 24px 0 16px; gap: 10px; }
h1, h2, p { margin: 0; }
h1 { font-size: clamp(23px, 5vw, 34px); letter-spacing: -.04em; }
h2 { font-size: clamp(20px, 4vw, 27px); letter-spacing: -.035em; }
.eyebrow { color: #9b751c; font-size: 12px; font-weight: 800; letter-spacing: .04em; margin-bottom: 5px; }
.muted { color: var(--muted); line-height: 1.65; }
.card { background: var(--card); border: 1px solid var(--line); border-radius: 22px; box-shadow: var(--shadow); }
.hero { padding: 20px; }
.progress-shell { height: 10px; background: #f4ead5; border-radius: 999px; overflow: hidden; margin: 18px 0; }
.progress-bar { width: 0; height: 100%; background: var(--accent); border-radius: inherit; transition: width .25s ease; }
.hero-actions, .study-actions, .nav-actions, .settings-actions { display: flex; gap: 9px; flex-wrap: wrap; }
.primary { background: var(--accent); color: #33260b; }
.secondary { background: #f8efd9; color: #5b481c; }
.ghost { background: transparent; color: #78632d; padding: 10px 5px; }
.danger { background: var(--red-soft); color: var(--red); }
.status-badge, .count-pill, .mini-badge { border-radius: 999px; padding: 7px 10px; font-size: 12px; font-weight: 800; white-space: nowrap; }
.status-badge { background: var(--green-soft); color: var(--green); }
.status-badge.offline { background: var(--accent-soft); color: #7b5b0e; }
.tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin: 18px 0; background: #f2e8d4; border-radius: 16px; padding: 5px; }
.tab { padding: 11px 6px; background: transparent; color: #7a705d; }
.tab.active { background: #fff; color: var(--text); box-shadow: 0 4px 14px rgba(84,68,38,.08); }
.view { display: none; }
.view.active { display: block; }
.section-title { display: flex; justify-content: space-between; align-items: end; margin: 10px 2px 12px; }
.count-pill { background: var(--accent-soft); color: #76570e; }
.passage-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; }
.passage-item { text-align: left; padding: 15px; background: #fff; border: 1px solid var(--line); border-radius: 17px; box-shadow: 0 5px 18px rgba(84,68,38,.05); }
.passage-item h3 { margin: 0 0 7px; font-size: 17px; }
.passage-meta { display: flex; justify-content: space-between; align-items: center; gap: 8px; color: var(--muted); font-size: 13px; }
.mini-badge { padding: 5px 8px; background: #f6efdf; color: #7d6d4b; }
.mini-badge.mastered { background: var(--green-soft); color: var(--green); }
.mini-badge.review { background: var(--red-soft); color: var(--red); }
.study-card, .settings-card, .install-card { padding: 19px; }
.study-head { display: flex; justify-content: space-between; gap: 10px; align-items: start; }
select { max-width: 142px; border: 1px solid var(--line); border-radius: 12px; padding: 10px; background: #fffdf7; color: var(--text); font-weight: 700; }
.difficulty { display: flex; gap: 7px; align-items: center; margin-top: 15px; flex-wrap: wrap; color: var(--muted); font-size: 13px; }
.difficulty-btn { background: #f8efd9; color: #7a642d; padding: 7px 10px; border-radius: 999px; font-size: 13px; }
.difficulty-btn.active { background: var(--accent); color: #392a07; }
.hidden { display: none; }
.verse-area { margin: 19px 0; min-height: 230px; padding: 18px; background: #fffcf6; border: 1px solid var(--line); border-radius: 16px; font-size: 18px; line-height: 1.95; word-break: keep-all; }
.empty-state { display: grid; place-items: center; color: var(--muted); text-align: center; }
.verse-row { margin-bottom: 13px; }
.verse-num { display: inline-block; margin-right: 7px; color: #a47a1b; font-size: 13px; font-weight: 900; vertical-align: top; }
.blank { display: inline-block; cursor: pointer; touch-action: manipulation; min-width: 2.2em; padding: 0 4px; margin: 0 1px; color: transparent; background: #f4e3a7; border-radius: 5px; border-bottom: 2px solid #c99a25; user-select: none; }
.blank.revealed { color: inherit; background: #fff0b9; }
.blank:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.initial-text { color: #735b20; font-weight: 700; letter-spacing: .08em; }
.study-actions { margin-bottom: 9px; }
.nav-actions { justify-content: space-between; }
.settings-card, .install-card { margin-bottom: 12px; }
.settings-actions { margin-top: 17px; }
.file-label { display: inline-flex; align-items: center; background: #f8efd9; color: #5b481c; }
.file-label input { display: none; }
footer { padding: 26px 0 35px; color: #978d7a; font-size: 12px; line-height: 1.7; text-align: center; }
@media (max-width: 500px) {
  .topbar { padding-top: calc(18px + env(safe-area-inset-top)); }
  .hero-actions > *, .study-actions > * { flex: 1; }
  .verse-area { min-height: 270px; font-size: 17px; padding: 15px; }
  .study-head { display: block; }
  select { margin-top: 10px; width: 100%; max-width: none; }
}

.typing-guide { margin-top: 15px; padding: 11px 13px; border-radius: 12px; background: #fff7dc; color: #6f5923; font-size: 13px; line-height: 1.6; }
.typing-verse { padding: 14px 0; border-bottom: 1px solid var(--line); }
.typing-verse:last-child { border-bottom: 0; }
.typing-label { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; color: #8d6817; font-size: 13px; font-weight: 900; }
.typing-input { width: 100%; min-height: 96px; resize: vertical; border: 1px solid #e3d5b6; border-radius: 12px; padding: 12px; background: #fff; color: var(--text); font: inherit; font-size: 16px; line-height: 1.65; outline: none; }
.typing-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(226,173,50,.16); }
.typing-controls { display: flex; gap: 7px; align-items: center; flex-wrap: wrap; margin-top: 8px; }
.typing-check, .typing-show { padding: 8px 11px; border-radius: 10px; font-size: 13px; }
.typing-check { background: var(--accent); color: #392a07; }
.typing-show { background: #f8efd9; color: #6a5423; }
.typing-result { font-size: 13px; font-weight: 800; }
.typing-result.correct { color: var(--green); }
.typing-result.wrong { color: var(--red); }
.typing-answer { margin-top: 9px; padding: 10px 11px; border-radius: 10px; background: #f8f2e5; color: #5f5647; font-size: 14px; line-height: 1.65; }

/* 학습 달력 */
.calendar-card, .daily-card { padding: 19px; margin-bottom: 12px; }
.calendar-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 15px; }
.calendar-nav { display: flex; align-items: center; gap: 4px; }
.compact { padding: 8px 10px; border-radius: 10px; font-size: 13px; }
.calendar-weekdays, .calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; }
.calendar-weekdays { margin-bottom: 5px; color: var(--muted); font-size: 12px; font-weight: 800; text-align: center; }
.calendar-cell { min-height: 76px; padding: 7px 5px; border: 1px solid var(--line); border-radius: 11px; background: #fffdf8; color: var(--text); text-align: left; display: flex; flex-direction: column; gap: 5px; }
.calendar-cell.empty { border-color: transparent; background: transparent; }
.calendar-cell.today { border-color: var(--accent); }
.calendar-cell.today .calendar-day { color: #8d6817; font-weight: 900; }
.calendar-cell.selected { background: #fff6d5; box-shadow: inset 0 0 0 2px var(--accent); }
.calendar-day { font-size: 13px; }
.calendar-marks { display: flex; flex-direction: column; gap: 3px; }
.calendar-mark { display: block; width: fit-content; max-width: 100%; padding: 2px 4px; border-radius: 5px; font-size: 10px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mastered-mark { background: var(--green-soft); color: var(--green); }
.typing-mark { background: var(--accent-soft); color: #7b5b0e; }
.daily-summary { margin-top: 14px; display: grid; gap: 10px; }
.daily-block { padding: 13px; border: 1px solid var(--line); border-radius: 13px; background: #fffcf6; }
.daily-block-title { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.daily-block-title span { color: var(--muted); font-size: 13px; font-weight: 800; }
.daily-block ul { margin: 9px 0 0; padding-left: 19px; color: #574d3c; line-height: 1.75; }
.daily-empty { margin-top: 9px; color: var(--muted); font-size: 13px; line-height: 1.6; }
.typing-progress { margin-bottom: 8px; padding: 9px 11px; border-radius: 10px; background: #f8f2e5; color: #796b50; font-size: 13px; font-weight: 800; }
.typing-progress.passed { background: var(--green-soft); color: var(--green); }
@media (max-width: 500px) {
  .tabs { grid-template-columns: repeat(4, 1fr); }
  .tab { padding: 10px 2px; font-size: 13px; }
  .calendar-card, .daily-card { padding: 14px; }
  .calendar-cell { min-height: 62px; padding: 5px 3px; border-radius: 9px; }
  .calendar-mark { font-size: 9px; padding: 2px 3px; }
}
