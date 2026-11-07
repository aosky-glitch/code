/* 初中数学学习小程序 —— 交互逻辑 */
(function () {
  const D = window.MATH_DATA;
  const K = D.knowledge, B = D.bank.concat(window.MATH_EXTRA_BANK || []), F = D.formulas, CATS = D.cats;
  const KM = {}; K.forEach(k => KM[k.id] = k);
  const QM = {}; B.forEach(q => QM[q.id] = q);
  const LS_KEY = 'math_mini_app_v1';
  const LETTERS = ['A', 'B', 'C', 'D', 'E'];

  /* ---------------- 状态 ---------------- */
  const DEFAULT = {
    mastered: [], wrong: {}, stats: { total: 0, correct: 0, days: {} },
    sessions: [], lastActive: '', streak: 0, theme: 'light'
  };
  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return Object.assign({}, DEFAULT);
      const o = JSON.parse(raw);
      return Object.assign({}, DEFAULT, o, {
        stats: Object.assign({}, DEFAULT.stats, o.stats || {})
      });
    } catch (e) { return Object.assign({}, DEFAULT); }
  }
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) {} }
  let S = load();

  const UI = {
    tab: 'home', view: { name: 'home' }, history: [],
    grade: 7, openCh: {}, kpQuery: '', fQuery: '', fCat: '全部',
    quiz: null, result: null, timerId: null, toastId: null
  };

  /* ---------------- 工具 ---------------- */
  const $ = id => document.getElementById(id);
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dstr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function today() { return dstr(new Date()); }
  function yesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return dstr(d); }
  function shuffle(a) {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = r[i]; r[i] = r[j]; r[j] = t; }
    return r;
  }
  function normalize(s) {
    return String(s == null ? '' : s)
      .replace(/[\uFF01-\uFF5E]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
      .replace(/\s+/g, '').replace(/^[xX]=/, '')
      .replace(/(cm|m|M|米|元|°|度)$/, '');
  }
  function catColor(c) { const x = CATS.find(v => v.n === c); return x ? x.color : '#5B6BF0'; }
  function catIcon(c) { const x = CATS.find(v => v.n === c); return x ? x.icon : '◆'; }
  function gradeName(g) { return g === 7 ? '七年级' : g === 8 ? '八年级' : '九年级'; }
  function fmtSec(s) { return pad(Math.floor(s / 60)) + ':' + pad(s % 60); }
  function toast(msg) {
    const t = $('toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(UI.toastId);
    UI.toastId = setTimeout(() => t.classList.remove('show'), 1800);
  }
  function touchActive() {
    const t = today();
    if (S.lastActive === t) return;
    S.streak = (S.lastActive === yesterday()) ? (S.streak || 0) + 1 : 1;
    S.lastActive = t; save();
  }
  function recordAnswer(q, ok) {
    S.stats.total++;
    if (ok) S.stats.correct++;
    const t = today();
    if (!S.stats.days[t]) S.stats.days[t] = { n: 0, c: 0 };
    S.stats.days[t].n++;
    if (ok) S.stats.days[t].c++;
    if (ok) { if (S.wrong[q.id]) delete S.wrong[q.id]; }
    else { const w = S.wrong[q.id] || { n: 0 }; S.wrong[q.id] = { n: w.n + 1, ts: Date.now() }; }
    touchActive(); save();
  }
  function accuracy() { return S.stats.total ? Math.round(S.stats.correct / S.stats.total * 100) : 0; }
  function masteryPct() { return Math.round(S.mastered.length / K.length * 100); }
  function wrongList() {
    return Object.keys(S.wrong)
      .map(id => ({ q: QM[id], w: S.wrong[id] }))
      .filter(x => x.q).sort((a, b) => b.w.ts - a.w.ts);
  }
  function ringSVG(pct, size, stroke, color) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r;
    const off = c * (1 - pct / 100);
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="' + stroke + '"/>' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + stroke + '" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg>';
  }
  function greet() {
    const h = new Date().getHours();
    return h < 6 ? '夜深了，注意休息' : h < 11 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好';
  }

  /* ---------------- 导航 ---------------- */
  function switchTab(t) { UI.tab = t; UI.view = { name: t }; UI.history = []; stopTimer(); render(); }
  function go(name, p) { UI.history.push(UI.view); UI.view = { name: name, p: p }; render(); }
  function back() { UI.view = UI.history.pop() || { name: UI.tab }; stopTimer(); render(); }
  function render(keepScroll) {
    const v = UI.view, n = v.name;
    document.body.dataset.theme = S.theme;
    const sub = n !== UI.tab || UI.history.length > 0;
    const titles = { home: '初中数学 · 学习助手', learn: '知识体系', practice: '练习与测验', profile: '我的',
      kp: '知识点详情', quiz: '答题中', result: '本次成绩', formula: '公式速查', wrong: '错题本', catlist: '分类练习' };
    $('nav-title').textContent = titles[n] || '初中数学';
    $('nav-left').innerHTML = UI.history.length
      ? '<button class="nav-btn" data-act="back" aria-label="返回">‹</button>'
      : '<div style="width:32px;height:32px;border-radius:10px;background:var(--grad);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;">√</div>';
    $('nav-right').innerHTML = '<button class="nav-btn" data-act="theme" aria-label="切换主题">' +
      (S.theme === 'dark' ? '☀' : '☾') + '</button>';
    $('status-time').textContent = pad(new Date().getHours()) + ':' + pad(new Date().getMinutes());

    let html = '';
    switch (n) {
      case 'home': html = viewHome(); break;
      case 'learn': html = viewLearn(); break;
      case 'practice': html = viewPractice(); break;
      case 'profile': html = viewProfile(); break;
      case 'kp': html = viewKp(v.p); break;
      case 'quiz': html = viewQuiz(); break;
      case 'result': html = viewResult(); break;
      case 'formula': html = viewFormula(); break;
      case 'wrong': html = viewWrong(); break;
      case 'catlist': html = viewCatlist(v.p); break;
      default: html = viewHome();
    }
    $('scroll').innerHTML = '<div class="view">' + html + '</div>';
    $('scroll').className = 'scroll' + (n === 'profile' ? '' : '');
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), el => {
      el.classList.toggle('active', el.dataset.t === UI.tab);
    });
    if (!keepScroll) $('scroll').scrollTop = 0;
    if (n === 'quiz') startTimer();
  }

  /* ---------------- 首页 ---------------- */
  function viewHome() {
    const pct = masteryPct(), wl = wrongList().length;
    let h = '';
    h += '<div class="hero">' +
      '<div class="hero-ring"><div class="ring-wrap">' + ringSVG(pct, 72, 7, '#fff') +
      '<div class="ring-txt">' + pct + '%<small>掌握度</small></div></div></div>' +
      '<h2>' + greet() + '，同学</h2>' +
      '<p>每天进步一点点，数学其实很有趣</p>' +
      '<div class="hero-stats">' +
        '<div><b>' + S.streak + '</b><span>连续学习（天）</span></div>' +
        '<div><b>' + S.stats.total + '</b><span>累计做题</span></div>' +
        '<div><b>' + S.mastered.length + '</b><span>掌握知识点</span></div>' +
      '</div></div>';

    h += '<div class="quick-grid">' +
      quick('✦', '随机练习', '#5B6BF0', 'start', 'data-mode="random"') +
      quick('∑', '公式速查', '#8C6BF6', 'go', 'data-to="formula"') +
      quick('✕', '错题本', '#F0687A', 'go', 'data-to="wrong"') +
      quick('◷', '限时测验', '#FF9E45', 'start', 'data-mode="exam"') +
      '</div>';

    h += '<div class="section-title">今日任务 <span class="more">坚持打卡，养成习惯</span></div>';
    h += '<div class="card tight task-card" data-act="start" data-mode="daily" style="cursor:pointer">' +
      '<div class="task-ic" style="background:rgba(91,107,240,.12);color:var(--primary)">✧</div>' +
      '<div style="flex:1"><b>每日一练 · 10 道题</b><p>优先推荐你还没掌握的知识点</p></div>' +
      '<span class="chip on">去完成 ›</span></div>';
    if (wl > 0) {
      h += '<div class="card tight task-card" data-act="go" data-to="wrong" style="cursor:pointer;margin-top:-4px">' +
        '<div class="task-ic" style="background:rgba(240,92,99,.12);color:var(--bad)">↻</div>' +
        '<div style="flex:1"><b>还有 ' + wl + ' 道错题待攻克</b><p>错题重做是提分最快的方式</p></div>' +
        '<span class="chip warn">去复习 ›</span></div>';
    }

    h += '<div class="section-title">按专题学习 <span class="more">题库共 ' + B.length + ' 道</span></div><div class="cat-grid">';
    CATS.forEach(c => {
      const total = K.filter(k => k.cat === c.n).length;
      h += '<div class="cat-box" data-act="cat" data-c="' + c.n + '" style="background:' + c.color + '">' +
        '<i>' + c.icon + '</i>' + c.n + '<small>' + total + ' 个知识点</small></div>';
    });
    h += '</div>';

    const rec = K.filter(k => S.mastered.indexOf(k.id) < 0).slice(0, 3);
    if (rec.length) {
      h += '<div class="section-title">推荐学习 <span class="more" data-act="tab" data-t="learn">全部 ›</span></div><div class="card tight">';
      rec.forEach(k => {
        h += '<div class="kp-mini" data-act="kp" data-k="' + k.id + '" style="cursor:pointer">' +
          '<div class="km-ic" style="background:' + catColor(k.cat) + '">' + catIcon(k.cat) + '</div>' +
          '<div class="km-body"><b>' + esc(k.t) + '</b><small>' + gradeName(k.g) + ' · ' + esc(k.c) + '</small></div>' +
          '<span class="arrow">›</span></div>';
      });
      h += '</div>';
    }
    if (S.sessions.length) {
      const s = S.sessions[0];
      h += '<div class="section-title">最近一次成绩</div><div class="card tight spread">' +
        '<div><b style="font-size:14px">' + esc(s.mode) + '</b><p class="muted tiny" style="margin:4px 0 0">答对 ' + s.correct + '/' + s.total + ' 题 · 用时 ' + fmtSec(s.sec) + '</p></div>' +
        '<div style="font-size:22px;font-weight:800;color:var(--primary)">' + s.score + '<small class="muted" style="font-size:11px"> 分</small></div></div>';
    }
    return h;
  }
  function quick(icon, label, color, act, extra) {
    return '<div class="quick" data-act="' + act + '" ' + extra + '>' +
      '<div class="qi" style="background:' + color + '">' + icon + '</div><span>' + label + '</span></div>';
  }

  /* ---------------- 知识体系 ---------------- */
  function chapterHTML(list, query, direct) {
    const groups = {};
    list.forEach(k => { (groups[k.c] = groups[k.c] || []).push(k); });
    const keys = Object.keys(groups);
    if (!keys.length) return '<div class="empty"><span class="ei">▤</span><b>没有找到相关知识点</b><p>换个关键词试试吧</p></div>';
    let h = '';
    keys.forEach((c, i) => {
      const key = 'ch' + i;
      const open = query ? true : !!UI.openCh[key];
      const done = groups[c].filter(k => S.mastered.indexOf(k.id) >= 0).length;
      h += '<div class="chapter' + (open ? ' open' : '') + '">' +
        '<div class="ch-head" data-act="chapter" data-i="' + key + '">' +
          '<div class="ch-num">' + (i + 1) + '</div><b>' + esc(c) + '</b>' +
          '<span class="ch-count">' + done + '/' + groups[c].length + ' 已掌握</span>' +
          '<span class="ch-arrow">›</span></div>' +
        '<div class="ch-body">';
      groups[c].forEach(k => {
        h += '<div class="kp-row" data-act="' + (direct ? 'start" data-mode="kp' : 'kp') + '" data-k="' + k.id + '" style="cursor:pointer">' +
          '<span class="dot' + (S.mastered.indexOf(k.id) >= 0 ? ' done' : '') + '"></span>' +
          '<span>' + esc(k.t) + '</span>' +
          '<span class="chip" style="font-size:9px;padding:2px 6px">' + k.cat + '</span>' +
          '<span class="go">›</span></div>';
      });
      h += '</div></div>';
    });
    return h;
  }
  function viewLearn() {
    let h = '<div class="search"><span class="si">⌕</span><input id="search-kp" placeholder="搜索知识点或章节，如「勾股」" value="' + esc(UI.kpQuery) + '"></div>';
    h += '<div class="seg">' + [7, 8, 9].map(g =>
      '<button data-act="grade" data-g="' + g + '" class="' + (UI.grade === g ? 'on' : '') + '">' + gradeName(g) + '</button>').join('') + '</div>';
    h += '<div class="spread" style="margin:0 2px 10px"><span class="muted tiny">共 ' + K.filter(k => k.g === UI.grade).length + ' 个知识点 · 点击展开章节</span>' +
      '<span class="chip ok">已掌握 ' + K.filter(k => k.g === UI.grade && S.mastered.indexOf(k.id) >= 0).length + '</span></div>';
    h += '<div id="kp-list">' + filteredChapterHTML(false) + '</div>';
    return h;
  }
  function filteredChapterHTML(direct) {
    let list = K.filter(k => k.g === UI.grade);
    if (UI.kpQuery.trim()) {
      const q = UI.kpQuery.trim();
      list = K.filter(k => (k.t + k.c + k.cat + k.s).indexOf(q) >= 0);
    }
    return chapterHTML(list, UI.kpQuery.trim(), direct);
  }
  function viewCatlist(p) {
    const cat = p.cat;
    const list = K.filter(k => k.cat === cat);
    let h = '<div class="card tight" style="background:linear-gradient(135deg,' + catColor(cat) + '22,' + catColor(cat) + '08)">' +
      '<div class="spread"><div><b style="font-size:15px">' + catIcon(cat) + ' ' + cat + '专题</b>' +
      '<p class="muted tiny" style="margin:5px 0 0">共 ' + list.length + ' 个知识点、' + B.filter(q => list.some(k => k.id === q.k)).length + ' 道配套习题</p></div>' +
      '<button class="btn btn-primary btn-sm" data-act="start" data-mode="cat" data-cat="' + cat + '">综合练习</button></div></div>';
    h += '<div class="section-title">知识点清单</div>';
    [7, 8, 9].forEach(g => {
      const sub = list.filter(k => k.g === g);
      if (!sub.length) return;
      h += '<div class="formula-cat">' + gradeName(g) + '</div>';
      sub.forEach(k => {
        h += '<div class="chapter" style="margin-bottom:8px"><div class="ch-head" data-act="kp" data-k="' + k.id + '" style="cursor:pointer">' +
          '<div class="ch-num">' + (S.mastered.indexOf(k.id) >= 0 ? '✓' : catIcon(cat)) + '</div>' +
          '<b>' + esc(k.t) + '</b><span class="ch-count">' + esc(k.c) + '</span><span class="ch-arrow">›</span></div></div>';
      });
    });
    return h;
  }

  /* ---------------- 知识点详情 ---------------- */
  function viewKp(kid) {
    const k = KM[kid]; if (!k) return '<div class="empty">知识点不存在</div>';
    const done = S.mastered.indexOf(kid) >= 0;
    let h = '<div class="kp-hero"><div class="chips">' +
      '<span>' + gradeName(k.g) + '</span><span>' + esc(k.c) + '</span><span>' + k.cat + '</span></div>' +
      '<h2>' + esc(k.t) + '</h2><p>' + esc(k.s) + '</p></div>';

    h += '<div class="card"><div class="block-title"><i></i>核心要点</div>';
    k.p.forEach((p, i) => { h += '<div class="point"><span class="pn">' + (i + 1) + '</span><span>' + esc(p) + '</span></div>'; });
    h += '</div>';

    h += '<div class="card"><div class="block-title"><i></i>公式与定理</div>';
    k.f.forEach(f => { h += '<div class="formula-line">' + esc(f) + '</div>'; });
    h += '</div>';

    h += '<div class="card"><div class="block-title"><i></i>典型例题</div>' +
      '<div class="example-q">' + esc(k.e.q) + '</div>';
    k.e.st.forEach((s, i) => { h += '<div class="step"><span class="sn">' + (i + 1) + '</span><span>' + esc(s) + '</span></div>'; });
    h += '<div class="answer-box">答案：' + esc(k.e.a) + '</div></div>';

    const n = B.filter(q => q.k === kid).length;
    h += '<div class="action-bar">' +
      '<button class="btn ' + (done ? 'btn-ghost' : 'btn-primary') + '" data-act="master" data-k="' + kid + '">' +
      (done ? '✓ 已掌握 · 点击取消' : '标记已学会') + '</button>' +
      '<button class="btn btn-ghost" data-act="start" data-mode="kp" data-k="' + kid + '">练 ' + n + ' 题 ›</button></div>';
    h += '<p class="muted tiny" style="text-align:center;margin-top:14px">配套习题 ' + n + ' 道 · 答对可自动清除错题记录</p>';
    return h;
  }

  /* ---------------- 练习首页 ---------------- */
  function viewPractice() {
    const wl = wrongList().length;
    const lvCount = [1, 2, 3].map(l => B.filter(q => q.lv === l).length);
    const chipStyle = 'background:rgba(255,255,255,.2);color:#fff;border-color:transparent';
    let h = '<div class="card" style="background:var(--grad);color:#fff;border:0">' +
      '<div class="spread"><div><b style="font-size:16px">今天想练点什么？</b>' +
      '<p style="margin:5px 0 0;font-size:11.5px;opacity:.85">选择合适的模式，边练边记，错题自动收录</p></div>' +
      '<div style="font-size:30px;font-weight:800;opacity:.35">✎</div></div>' +
      '<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:13px">' +
        '<span class="chip" style="' + chipStyle + '">题库 ' + B.length + ' 道</span>' +
        '<span class="chip" style="' + chipStyle + '">基础 ' + lvCount[0] + '</span>' +
        '<span class="chip" style="' + chipStyle + '">进阶 ' + lvCount[1] + '</span>' +
        '<span class="chip" style="' + chipStyle + '">挑战 ' + lvCount[2] + '</span>' +
      '</div></div>';
    h += '<div class="section-title">练习模式</div>';
    h += modeCard('✦', '#5B6BF0', '随机综合练习', '从全部 ' + B.length + ' 道题中随机抽 10 题', 'random');
    h += modeCard('✧', '#2FAE8B', '每日一练', '优先推送未掌握知识点的 10 道题', 'daily');
    h += modeCard('↻', '#F0687A', '错题重做', wl ? '共 ' + wl + ' 道错题，逐个击破' : '暂时没有错题，继续保持', 'wrong');
    h += modeCard('◷', '#FF9E45', '限时测验', '15 题 · 10 分钟 · 模拟考场节奏', 'exam');

    h += '<div class="section-title">难度进阶 <span class="more">按水平循序渐进</span></div>';
    h += modeCard('●', '#5B6BF0', '基础巩固', '基础题 ' + lvCount[0] + ' 道 · 抽 10 题练手感', 'level', 1);
    h += modeCard('◆', '#8C6BF6', '进阶提升', '进阶题 ' + lvCount[1] + ' 道 · 抽 10 题练方法', 'level', 2);
    h += modeCard('★', '#F0687A', '挑战冲刺', '挑战题 ' + lvCount[2] + ' 道 · 抽 10 题练思维', 'level', 3);

    h += '<div class="section-title">知识点专项 <span class="more">点知识点直接开练</span></div>';
    h += '<div class="seg">' + [7, 8, 9].map(g =>
      '<button data-act="grade" data-g="' + g + '" class="' + (UI.grade === g ? 'on' : '') + '">' + gradeName(g) + '</button>').join('') + '</div>';
    h += '<div id="kp-list">' + filteredChapterHTML(true) + '</div>';
    return h;
  }
  function modeCard(icon, color, title, desc, mode, lv) {
    const disabled = mode === 'wrong' && !wrongList().length;
    const act = 'data-act="start" data-mode="' + mode + '"' + (lv ? ' data-lv="' + lv + '"' : '');
    return '<div class="mode-card" ' + (disabled ? '' : act) + ' style="cursor:' + (disabled ? 'default' : 'pointer') + ';opacity:' + (disabled ? '.55' : '1') + '">' +
      '<div class="mode-ic" style="background:' + color + '">' + icon + '</div>' +
      '<div style="flex:1"><b>' + title + '</b><p>' + desc + '</p></div><span class="arrow">›</span></div>';
  }

  /* ---------------- 组卷 ---------------- */
  function buildQuiz(mode, p) {
    let list = [], label = '', limit = 0;
    p = p || {};
    if (mode === 'random') { list = shuffle(B).slice(0, 10); label = '随机综合'; }
    else if (mode === 'daily') {
      const weak = B.filter(q => S.mastered.indexOf(q.k) < 0);
      list = shuffle(weak).slice(0, 10);
      if (list.length < 10) list = list.concat(shuffle(B.filter(q => list.indexOf(q) < 0)).slice(0, 10 - list.length));
      label = '每日一练';
    }
    else if (mode === 'wrong') {
      list = wrongList().map(x => x.q).slice(0, 12); label = '错题重做';
    }
    else if (mode === 'exam') { list = shuffle(B).slice(0, 15); label = '限时测验'; limit = 600; }
    else if (mode === 'kp') {
      const own = B.filter(q => q.k === p.k);
      const k = KM[p.k];
      const extra = shuffle(B.filter(q => q.k !== p.k && KM[q.k].cat === k.cat)).slice(0, Math.max(0, 6 - own.length));
      list = shuffle(own.concat(extra)); label = k ? k.t : '专项练习';
    }
    else if (mode === 'cat') {
      const ids = K.filter(x => x.cat === p.cat).map(x => x.id);
      list = shuffle(B.filter(q => ids.indexOf(q.k) >= 0)).slice(0, 10); label = p.cat + '专题';
    }
    else if (mode === 'level') {
      const n = +p.lv || 1;
      list = shuffle(B.filter(q => q.lv === n)).slice(0, 10);
      label = n === 1 ? '基础巩固' : n === 2 ? '进阶提升' : '挑战冲刺';
    }
    return { list: list, label: label, limit: limit, mode: mode, p: p };
  }
  function startQuiz(mode, p) {
    const cfg = buildQuiz(mode, p);
    if (!cfg.list.length) { toast('暂时没有可练习的题目'); return; }
    stopTimer();
    UI.quiz = {
      list: cfg.list, label: cfg.label, limit: cfg.limit, mode: mode, p: cfg.p,
      idx: 0, sel: null, fill: '', checked: false, answers: [],
      startTs: Date.now(), elapsed: 0
    };
    go('quiz');
  }
  function stopTimer() { if (UI.timerId) { clearInterval(UI.timerId); UI.timerId = null; } }
  function startTimer() {
    stopTimer();
    const z = UI.quiz; if (!z) return;
    UI.timerId = setInterval(() => {
      if (UI.view.name !== 'quiz' || !UI.quiz) { stopTimer(); return; }
      const q = UI.quiz;
      q.elapsed = Math.floor((Date.now() - q.startTs) / 1000);
      const el = $('timer'); if (!el) return;
      const left = q.limit ? q.limit - q.elapsed : q.elapsed;
      el.textContent = (q.limit ? '剩余 ' : '用时 ') + fmtSec(Math.max(0, left));
      if (q.limit && q.elapsed >= q.limit) { stopTimer(); finishQuiz(); toast('时间到，已自动交卷'); }
    }, 1000);
  }

  /* ---------------- 答题 ---------------- */
  function curQ() { return UI.quiz ? UI.quiz.list[UI.quiz.idx] : null; }
  function viewQuiz() {
    const z = UI.quiz;
    if (!z) return '<div class="empty">练习已结束</div>';
    const q = curQ(); if (!q) return '<div class="empty">练习已结束</div>';
    const k = KM[q.k];
    const streak = (function () { let n = 0; for (let i = z.answers.length - 1; i >= 0; i--) { if (z.answers[i].ok) n++; else break; } return n; })();
    let h = '<div class="quiz-top"><span>第 <b>' + (z.idx + 1) + '</b> / ' + z.list.length + ' 题 · ' + esc(z.label) + '</span>' +
      '<span id="timer">' + (z.limit ? '剩余 ' + fmtSec(z.limit - z.elapsed) : '用时 ' + fmtSec(z.elapsed)) + '</span></div>';
    h += '<div class="progress"><i style="width:' + Math.round((z.idx + 1) / z.list.length * 100) + '%"></i></div>';
    h += '<div class="q-meta"><span class="chip">' + (k ? esc(k.c) : '综合') + '</span>' +
      '<span class="chip">' + (q.ty === 'c' ? '选择题' : '填空题') + '</span>' +
      '<span class="chip' + (q.lv === 3 ? ' warn' : q.lv === 1 ? ' ok' : '') + '">' +
        (q.lv === 3 ? '挑战' : q.lv === 2 ? '进阶' : '基础') + '</span>' +
      (streak >= 2 ? '<span class="chip ok">连对 ' + streak + '</span>' : '') + '</div>';
    h += '<div class="q-text">' + esc(q.q) + '</div>';

    if (q.ty === 'c') {
      q.o.forEach((o, i) => {
        let cls = 'opt';
        if (z.checked) {
          if (i === q.a) cls += ' right';
          else if (i === z.sel) cls += ' wrong';
        } else if (i === z.sel) cls += ' sel';
        h += '<button class="' + cls + '" data-act="opt" data-i="' + i + '" ' + (z.checked ? 'disabled' : '') + '>' +
          '<span class="ol">' + LETTERS[i] + '</span><span>' + esc(o) + '</span></button>';
      });
    } else {
      let cls = 'fill-input';
      if (z.checked) cls += (z.answers[z.answers.length - 1].ok ? ' right' : ' wrong');
      h += '<input class="' + cls + '" id="fill-input" placeholder="在此输入答案" value="' + esc(z.fill) + '" ' + (z.checked ? 'disabled' : '') + '>';
      h += '<p class="muted tiny" style="margin:8px 2px 0">提示：只填最终结果，如 4、x=2、-2、10√3</p>';
    }

    if (z.checked) {
      const last = z.answers[z.answers.length - 1];
      const right = q.ty === 'c' ? LETTERS[q.a] + '．' + q.o[q.a] : q.a;
      h += '<div class="feedback ' + (last.ok ? 'ok' : 'no') + '">' +
        '<b>' + (last.ok ? '✓ 回答正确' : '✗ 答错了') + '</b>' +
        (last.ok ? '' : '<div>正确答案：<strong>' + esc(right) + '</strong></div>') +
        '<div class="sol">' + esc(q.sol) + '</div></div>';
    }
    const isLast = z.idx === z.list.length - 1;
    h += '<div class="quiz-foot"><button class="btn btn-primary btn-block btn-lg" data-act="' +
      (z.checked ? 'next' : 'submit') + '">' +
      (z.checked ? (isLast ? '查看成绩 ›' : '下一题 ›') : '提交答案') + '</button></div>';
    if (z.limit) h += '<p class="muted tiny" style="text-align:center;margin-top:10px">限时测验结束后未作答的题目按错计分</p>';
    return h;
  }
  function submitAnswer() {
    const z = UI.quiz, q = curQ(); if (!z || !q || z.checked) return;
    let ok = false;
    if (q.ty === 'c') {
      if (z.sel === null) { toast('请先选择一个答案'); return; }
      ok = z.sel === q.a;
    } else {
      const el = $('fill-input'); z.fill = el ? el.value : z.fill;
      if (!normalize(z.fill)) { toast('请先填写答案'); return; }
      ok = (q.acc || [q.a]).some(a => normalize(a) === normalize(z.fill));
    }
    z.checked = true;
    z.answers.push({ qid: q.id, ok: ok });
    recordAnswer(q, ok);
    render(true);
  }
  function nextQuestion() {
    const z = UI.quiz; if (!z || !z.checked) return;
    if (z.idx >= z.list.length - 1) { finishQuiz(); return; }
    z.idx++; z.sel = null; z.fill = ''; z.checked = false;
    render(false);
  }
  function finishQuiz() {
    const z = UI.quiz; if (!z) return;
    stopTimer();
    const sec = Math.floor((Date.now() - z.startTs) / 1000);
    const correct = z.answers.filter(a => a.ok).length;
    const total = z.list.length;
    const score = Math.round(correct / total * 100);
    const wrongIds = z.answers.filter(a => !a.ok).map(a => a.qid);
    // 限时交卷时未作答的题目同样收进错题本（不计入做题统计）
    const answeredIds = z.answers.map(a => a.qid);
    const missedIds = z.list.map(q => q.id).filter(id => answeredIds.indexOf(id) < 0);
    missedIds.forEach(id => { const w = S.wrong[id] || { n: 0 }; S.wrong[id] = { n: w.n + 1, ts: Date.now() }; });
    wrongIds.push.apply(wrongIds, missedIds);
    S.sessions.unshift({ mode: z.label, score: score, correct: correct, total: total, sec: sec, ts: Date.now() });
    S.sessions = S.sessions.slice(0, 10); save();
    UI.result = { mode: z.label, score: score, correct: correct, total: total, sec: sec, wrongIds: wrongIds, modeKey: z.mode, p: z.p };
    UI.quiz = null;
    // 替换当前页，避免返回时回到空答题页
    UI.view = { name: 'result' };
    render();
  }

  /* ---------------- 成绩页 ---------------- */
  function viewResult() {
    const r = UI.result; if (!r) return '<div class="empty">暂无成绩</div>';
    const msg = r.score >= 90 ? '太棒了，几乎全对！' : r.score >= 70 ? '不错，继续保持！' : r.score >= 50 ? '还有提升空间，加油' : '别灰心，把错题弄懂就是进步';
    let h = '<div class="result-head"><div class="big">' + r.score + '<small> 分</small></div>' +
      '<p>' + esc(msg) + '</p></div>';
    h += '<div class="card"><div class="result-grid">' +
      '<div><b>' + r.correct + '/' + r.total + '</b><span>答对题数</span></div>' +
      '<div><b>' + Math.round(r.correct / r.total * 100) + '%</b><span>正确率</span></div>' +
      '<div><b>' + fmtSec(r.sec) + '</b><span>用时</span></div></div>' +
      '<p class="muted tiny" style="text-align:center;margin:0">练习模式：' + esc(r.mode) + ' · 错题已自动收录到错题本</p></div>';
    if (r.wrongIds.length) {
      h += '<div class="section-title">本次错题 <span class="more">' + r.wrongIds.length + ' 道</span></div><div class="card tight">';
      r.wrongIds.forEach(id => {
        const q = QM[id]; if (!q) return;
        const right = q.ty === 'c' ? LETTERS[q.a] + '．' + q.o[q.a] : q.a;
        h += '<div class="wrong-review"><b>' + esc(q.q) + '</b><div style="color:var(--ok);margin-top:5px">正确答案：' + esc(right) + '</div>' +
          '<div class="muted" style="margin-top:4px">' + esc(q.sol) + '</div></div>';
      });
      h += '</div>';
    }
    h += '<div class="action-bar" style="margin-top:18px">' +
      '<button class="btn btn-ghost" data-act="tab" data-t="practice">返回练习</button>' +
      '<button class="btn btn-primary" data-act="again">再来一组 ›</button></div>';
    if (r.wrongIds.length) h += '<button class="btn btn-block" style="margin-top:9px" data-act="go" data-to="wrong">去错题本复习</button>';
    return h;
  }

  /* ---------------- 公式速查 ---------------- */
  function viewFormula() {
    let h = '<div class="search"><span class="si">⌕</span><input id="search-f" placeholder="搜索公式名称或内容" value="' + esc(UI.fQuery) + '"></div>';
    const cats = ['全部'].concat(F.map(f => f.cat).filter((v, i, a) => a.indexOf(v) === i));
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">' + cats.map(c =>
      '<button class="chip' + (UI.fCat === c ? ' on' : '') + '" data-act="fcat" data-c="' + c + '">' + c + '</button>').join('') + '</div>';
    h += '<div id="f-list">' + formulaListHTML() + '</div>';
    return h;
  }
  function formulaListHTML() {
    const q = UI.fQuery.trim();
    const list = F.filter(f => (UI.fCat === '全部' || f.cat === UI.fCat) && (!q || (f.n + f.e + f.d + f.cat).indexOf(q) >= 0));
    if (!list.length) return '<div class="empty"><span class="ei">∑</span><b>没有找到相关公式</b><p>换个关键词试试</p></div>';
    let h = '', last = '';
    list.forEach(f => {
      if (f.cat !== last) { h += '<div class="formula-cat">' + f.cat + '</div>'; last = f.cat; }
      h += '<div class="f-item"><div class="fn">' + esc(f.n) + '</div>' +
        '<div class="fe mono">' + esc(f.e) + '</div><div class="fd">' + esc(f.d) + '</div></div>';
    });
    return h;
  }

  /* ---------------- 错题本 ---------------- */
  function viewWrong() {
    const wl = wrongList();
    if (!wl.length) return '<div class="empty"><span class="ei">✓</span><b>错题本是空的</b>' +
      '<p>做错的题会自动收录到这里，答对后自动移除</p>' +
      '<button class="btn btn-primary btn-sm" data-act="start" data-mode="random">去做几道题</button></div>';
    let h = '<div class="card tight spread"><div><b style="font-size:14px">共 ' + wl.length + ' 道错题</b>' +
      '<p class="muted tiny" style="margin:4px 0 0">答对一次即可自动移出错题本</p></div>' +
      '<button class="btn btn-primary btn-sm" data-act="start" data-mode="wrong">全部重做 ›</button></div>';
    wl.forEach(x => {
      const q = x.q;
      const right = q.ty === 'c' ? LETTERS[q.a] + '．' + q.o[q.a] : q.a;
      h += '<div class="wrong-item"><div class="spread" style="margin-bottom:6px">' +
        '<span class="chip warn">错 ' + x.w.n + ' 次</span><span class="muted tiny">' + esc(KM[q.k].t) + '</span></div>' +
        '<div class="wq">' + esc(q.q) + '</div>' +
        (q.ty === 'c' ? '<div class="muted tiny" style="margin-top:6px">' + q.o.map((o, i) => LETTERS[i] + '．' + esc(o)).join('　') + '</div>' : '') +
        '<div class="wa">正确答案：' + esc(right) + '</div><div class="ws">' + esc(q.sol) + '</div></div>';
    });
    h += '<button class="btn btn-block btn-danger" data-act="wrong-clear" style="margin-top:14px">清空错题本</button>';
    return h;
  }

  /* ---------------- 我的 ---------------- */
  function viewProfile() {
    const total = S.stats.total, acc = accuracy();
    let h = '<div class="profile-head"><div class="avatar">√</div><div>' +
      '<b>数学探索者</b><span>已连续学习 ' + S.streak + ' 天 · 累计做题 ' + total + ' 道</span></div></div>';
    h += '<div class="card"><div class="spread" style="margin-bottom:14px"><b style="font-size:14px">学习数据</b>' +
      '<span class="chip ok">掌握度 ' + masteryPct() + '%</span></div><div class="stat-4">' +
      '<div><b>' + total + '</b><span>累计做题</span></div>' +
      '<div><b>' + acc + '%</b><span>正确率</span></div>' +
      '<div><b>' + S.mastered.length + '</b><span>掌握知识点</span></div>' +
      '<div><b>' + wrongList().length + '</b><span>待复习错题</span></div></div></div>';

    // 近 7 天柱状图
    const days = [], maxv = Math.max(1, ...[0, 1, 2, 3, 4, 5, 6].map(i => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return (S.stats.days[dstr(d)] || {}).n || 0;
    }));
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const rec = S.stats.days[dstr(d)] || { n: 0, c: 0 };
      days.push({ label: (d.getMonth() + 1) + '/' + d.getDate(), n: rec.n, c: rec.c });
    }
    h += '<div class="card"><div class="spread"><b style="font-size:14px">近 7 天做题量</b><span class="muted tiny">柱状高度代表题量</span></div><div class="chart">';
    days.forEach(d => {
      const pct = Math.round(d.n / maxv * 100);
      h += '<div class="bar-col"><span class="tiny muted" style="font-size:9px">' + (d.n || '') + '</span>' +
        '<div class="bar' + (d.n ? '' : ' zero') + '" style="height:' + (d.n ? Math.max(6, pct * .72) : 3) + '%"></div>' +
        '<span class="bl">' + d.label + '</span></div>';
    });
    h += '</div></div>';

    h += '<div class="card"><div class="block-title"><i></i>各专题掌握度</div>';
    CATS.forEach(c => {
      const ks = K.filter(k => k.cat === c.n);
      const done = ks.filter(k => S.mastered.indexOf(k.id) >= 0).length;
      const pct = Math.round(done / ks.length * 100);
      h += '<div style="margin-bottom:11px"><div class="spread" style="margin-bottom:5px">' +
        '<span style="font-size:12px">' + c.icon + ' ' + c.n + '</span>' +
        '<span class="muted tiny">' + done + '/' + ks.length + '</span></div>' +
        '<div class="progress" style="margin:0;height:5px"><i style="width:' + pct + '%;background:' + c.color + '"></i></div></div>';
    });
    h += '</div>';

    h += '<div class="section-title">学习工具</div><div class="card tight">';
    h += menu('✕', '错题本', wrongList().length + ' 道', 'go', 'data-to="wrong"');
    h += menu('∑', '公式速查', F.length + ' 条', 'go', 'data-to="formula"');
    h += menu('◷', '历史成绩', S.sessions.length + ' 次', 'history', '');
    h += '<div class="menu-item"><div class="mi">☾</div><b style="flex:1">深色模式</b>' +
      '<div class="switch' + (S.theme === 'dark' ? ' on' : '') + '" data-act="toggle-dark"><i></i></div></div>';
    h += menu('↻', '重置学习数据', '', 'reset', '');
    h += menu('◆', '关于本小程序', '', 'about', '');
    h += '</div>';
    if (S.sessions.length) {
      h += '<div id="history-box" style="display:none"><div class="section-title">最近测验记录</div><div class="card tight">';
      S.sessions.slice(0, 5).forEach(s => {
        h += '<div class="spread" style="padding:9px 0;border-bottom:1px solid var(--line)">' +
          '<div><b style="font-size:12.5px">' + esc(s.mode) + '</b><p class="muted tiny" style="margin:3px 0 0">' +
          new Date(s.ts).toLocaleDateString('zh-CN') + ' · ' + s.correct + '/' + s.total + ' 题 · ' + fmtSec(s.sec) + '</p></div>' +
          '<b style="color:var(--primary);font-size:16px">' + s.score + '</b></div>';
      });
      h += '</div></div>';
    }
    h += '<p class="muted tiny" style="text-align:center;margin:18px 0 4px">数据保存在本机浏览器，不会上传</p>';
    return h;
  }
  function menu(icon, title, val, act, extra) {
    return '<div class="menu-item" data-act="' + act + '" ' + extra + ' style="cursor:pointer">' +
      '<div class="mi">' + icon + '</div><b>' + title + '</b>' +
      (val ? '<span class="mv">' + val + '</span>' : '') + '<span class="arrow">›</span></div>';
  }

  /* ---------------- 弹窗 ---------------- */
  function modal(title, text, okText, okAct, danger) {
    $('modal-host').innerHTML = '<div class="mask" data-act="mask"><div class="modal" data-stop="1">' +
      '<h3>' + esc(title) + '</h3><p>' + text + '</p><div class="mbtns">' +
      '<button class="btn" data-act="modal-close">取消</button>' +
      '<button class="btn ' + (danger ? 'btn-danger' : 'btn-primary') + '" data-act="' + okAct + '">' + okText + '</button>' +
      '</div></div></div>';
  }
  function closeModal() { $('modal-host').innerHTML = ''; }

  /* ---------------- 事件 ---------------- */
  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const a = el.dataset.act, d = el.dataset;
    switch (a) {
      case 'tab': switchTab(d.t); break;
      case 'back': back(); break;
      case 'go': go(d.to); break;
      case 'theme': S.theme = (S.theme === 'dark' ? 'light' : 'dark'); save(); render(true); break;
      case 'toggle-dark': S.theme = (S.theme === 'dark' ? 'light' : 'dark'); save(); render(true); break;
      case 'grade': UI.grade = +d.g; UI.openCh = {}; render(true); break;
      case 'chapter': UI.openCh[d.i] = !UI.openCh[d.i]; render(true); break;
      case 'kp': go('kp', d.k); break;
      case 'cat': go('catlist', { cat: d.c }); break;
      case 'master': {
        const i = S.mastered.indexOf(d.k);
        if (i >= 0) { S.mastered.splice(i, 1); toast('已取消掌握标记'); }
        else { S.mastered.push(d.k); touchActive(); toast('已标记掌握，继续保持！'); }
        save(); render(true); break;
      }
      case 'start': startQuiz(d.mode, { k: d.k, cat: d.cat, lv: d.lv ? +d.lv : undefined }); break;
      case 'again': startQuiz(UI.result.modeKey, UI.result.p); break;
      case 'opt': {
        if (!UI.quiz || UI.quiz.checked) break;
        UI.quiz.sel = +d.i;
        Array.prototype.forEach.call(document.querySelectorAll('.opt'), (o, i) => o.classList.toggle('sel', i === UI.quiz.sel));
        break;
      }
      case 'submit': submitAnswer(); break;
      case 'next': nextQuestion(); break;
      case 'fcat': UI.fCat = d.c; render(true); break;
      case 'wrong-clear': modal('清空错题本', '将删除全部错题记录，此操作不可撤销。已掌握的知识点和做题统计会保留。', '确认清空', 'wrong-clear-yes', true); break;
      case 'wrong-clear-yes': S.wrong = {}; save(); closeModal(); render(); toast('错题本已清空'); break;
      case 'reset': modal('重置学习数据', '将清空掌握标记、错题本、做题统计和测验记录，恢复初始状态。', '确认重置', 'reset-yes', true); break;
      case 'reset-yes': S = Object.assign({}, DEFAULT, { stats: { total: 0, correct: 0, days: {} } }); save(); closeModal(); UI.history = []; UI.view = { name: 'home' }; UI.tab = 'home'; render(); toast('已重置，重新开始吧'); break;
      case 'about': modal('关于本小程序', '覆盖七 / 八 / 九年级 ' + K.length + ' 个核心知识点、' + B.length + ' 道配套习题与 ' + F.length + ' 条常用公式。所有学习数据仅保存在本机浏览器。', '知道了', 'modal-close'); break;
      case 'history': {
        const box = $('history-box');
        if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
        break;
      }
      case 'modal-close': case 'mask': closeModal(); break;
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target.id === 'search-kp') {
      UI.kpQuery = e.target.value;
      const box = $('kp-list'); if (box) box.innerHTML = filteredChapterHTML(UI.view.name === 'practice');
    } else if (e.target.id === 'search-f') {
      UI.fQuery = e.target.value;
      const box = $('f-list'); if (box) box.innerHTML = formulaListHTML();
    } else if (e.target.id === 'fill-input' && UI.quiz) {
      UI.quiz.fill = e.target.value;
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.id === 'fill-input' && UI.quiz && !UI.quiz.checked) submitAnswer();
  });

  /* ---------------- 启动 ---------------- */
  touchActive();
  UI.openCh['ch0'] = true;
  render();
  window.__MATH_APP__ = { get state() { return S; }, get ui() { return UI; }, get bank() { return B; } };
})();
