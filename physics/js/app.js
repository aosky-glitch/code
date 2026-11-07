/* ============================================================
   物理小课 · 应用逻辑：状态 / 路由 / 页面 / 交互
   ============================================================ */

const STORE_KEY = 'physix_mini_v1';
const DEFAULT_PAGE = { home:'main', learn:'list', lab:'main', quiz:'setup', me:'main' };

function defaultData(){
  return { done:[], fav:[], wrong:[], answered:0, correct:0, sessions:0, days:[], moduleStat:{} };
}
function loadData(){
  try { return Object.assign(defaultData(), JSON.parse(localStorage.getItem(STORE_KEY)) || {}); }
  catch(e){ return defaultData(); }
}
function saveData(){
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state.data)); } catch(e){}
}

function pad(n){ return n < 10 ? '0' + n : '' + n; }
function fmtDate(d){ return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()); }
function today(){ return fmtDate(new Date()); }

const state = {
  tab:'home', page:'main', params:{}, stack:[],
  learnTab:'topics', learnModule:'all', search:'',
  labKey:'refraction',
  quizCfg:{ m:'all', lv:'all', num:10 },
  quiz:null,
  daily:{ picked:null },
  data: loadData()
};

/* ---------------- 通用工具 ---------------- */
function checkIn(){
  if(!state.data.days.includes(today())){ state.data.days.push(today()); saveData(); }
}
function streakDays(){
  const set = new Set(state.data.days);
  let n = 0, d = new Date();
  while(set.has(fmtDate(d))){ n++; d.setDate(d.getDate()-1); }
  return n;
}
function accuracy(){
  return state.data.answered ? Math.round(state.data.correct / state.data.answered * 100) : 0;
}
function greet(){
  const h = new Date().getHours();
  if(h < 6) return '夜深了，注意休息';
  if(h < 11) return '早上好，开始今天的探索';
  if(h < 14) return '中午好，来充充电';
  if(h < 18) return '下午好，继续加油';
  return '晚上好，复盘一下今天';
}
function dailyQuestion(){
  const seed = today().split('').reduce((a,c) => a + c.charCodeAt(0), 0);
  return QUESTIONS[seed % QUESTIONS.length];
}
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function toast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 1800);
}
function stripTags(s){ return String(s).replace(/<[^>]+>/g,''); }
function ringSVG(pct, r, stroke){
  const c = 2 * Math.PI * r, size = (r + 7) * 2, cc = r + 7;
  return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '">' +
    '<circle cx="' + cc + '" cy="' + cc + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,.24)" stroke-width="6"/>' +
    '<circle cx="' + cc + '" cy="' + cc + '" r="' + r + '" fill="none" stroke="' + (stroke||'#fff') +
    '" stroke-width="6" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) +
    '" stroke-dashoffset="' + (c*(1-pct)).toFixed(1) + '"/></svg>';
}
function modOf(id){ return MODULE_MAP[id] || MODULES[0]; }
function modTag(id){ const m = modOf(id); return '<span class="tag" style="background:' + m.soft + ';color:' + m.color + '">' + m.name + '</span>'; }

/* ---------------- 路由 ---------------- */
function go(tab, page, params){
  state.stack.push({ tab:state.tab, page:state.page, params:state.params });
  state.tab = tab; state.page = page; state.params = params || {};
  document.getElementById('view').scrollTop = 0;
  render();
}
function back(){
  if(!state.stack.length) return;
  const p = state.stack.pop();
  state.tab = p.tab; state.page = p.page; state.params = p.params;
  document.getElementById('view').scrollTop = 0;
  render();
}
function switchTab(tab){
  state.stack = [];
  state.tab = tab; state.page = DEFAULT_PAGE[tab]; state.params = {};
  document.getElementById('view').scrollTop = 0;
  render();
}
function titleFor(){
  const p = state.page, t = state.tab;
  if(t === 'home') return '物理小课';
  if(t === 'learn') return p === 'detail' ? '知识点详情' : '知识地图';
  if(t === 'lab') return '互动实验';
  if(t === 'quiz'){
    if(p === 'running') return '第 ' + (state.quiz ? state.quiz.idx+1 : 1) + ' 题';
    if(p === 'result') return '练习报告';
    return '刷题练习';
  }
  if(t === 'me'){
    return { main:'我的', wrong:'错题本', fav:'我的收藏', stats:'学习统计' }[p] || '我的';
  }
  return '物理小课';
}

/* ---------------- 渲染入口 ---------------- */
function render(){
  document.getElementById('appTitle').textContent = titleFor();
  document.getElementById('backBtn').innerHTML = state.stack.length ? icon('back') : '';
  document.getElementById('tabbar').innerHTML = [
    ['home','home','首页'],['learn','book','知识'],['lab','flask','实验'],['quiz','quiz','练习'],['me','user','我的']
  ].map(t => '<button class="tab' + (state.tab===t[0]?' active':'') + '" data-act="tab" data-tab="' + t[0] + '">' + icon(t[1]) + '<span>' + t[2] + '</span></button>').join('');

  const map = { home:renderHome, learn:renderLearn, lab:renderLab, quiz:renderQuiz, me:renderMe };
  document.getElementById('view').innerHTML = map[state.tab]();
  initSliders();
}

/* ============================================================
   首页
   ============================================================ */
function renderHome(){
  const pct = state.data.done.length / TOPICS.length;
  const dq = dailyQuestion();
  const picked = state.daily.picked;
  const answered = picked !== null;
  let h = '';

  h += '<div class="hero"><div class="hero-in"><div class="hero-txt">' +
    '<div class="hero-hi">' + greet() + '</div>' +
    '<h1 class="hero-title">把物理，学明白</h1>' +
    '<div class="hero-sub">声 · 光 · 热 · 力 · 电 · 磁　六大模块随时查</div>' +
    '</div><div class="ring">' + ringSVG(pct, 31) +
    '<div class="ring-txt">' + Math.round(pct*100) + '%<small>知识进度</small></div></div></div>' +
    '<div class="hero-stats">' +
      '<div><b>' + state.data.done.length + '</b><span>已学知识点</span></div>' +
      '<div><b>' + state.data.answered + '</b><span>累计做题</span></div>' +
      '<div><b>' + streakDays() + '</b><span>连续打卡(天)</span></div>' +
    '</div></div>';

  h += '<div class="section-title"><div class="st-left"><span>知识模块</span></div>' +
       '<span class="section-more" data-act="tab" data-tab="learn">全部' + icon('arrow') + '</span></div>';
  h += '<div class="module-grid">' + MODULES.map(m => {
    const cnt = TOPICS.filter(t => t.m === m.id).length;
    return '<button class="module-card" data-act="module" data-m="' + m.id + '">' +
      '<div class="module-icon" style="background:' + m.soft + ';color:' + m.color + '">' + icon(m.icon) + '</div>' +
      '<div class="module-name">' + m.name + '</div><div class="module-count">' + cnt + ' 个知识点</div></button>';
  }).join('') + '</div>';

  h += '<div class="section-title"><div class="st-left"><span>快捷入口</span></div></div>';
  const quick = [
    ['formula','公式速查','38 条公式','formula','#EEF0FF','#4F46E5'],
    ['quiz','开始刷题','56 道精选题','quiz','#FFF4DF','#D97706'],
    ['lab','互动实验','3 个模拟实验','flask','#E4F8F0','#059669'],
    ['wrong','错题本','查漏补缺','wrong','#FEECEC','#DC2626']
  ];
  h += '<div class="quick-grid">' + quick.map(q =>
    '<button class="quick-item" data-act="quick" data-to="' + q[0] + '">' +
      '<div class="quick-ic" style="background:' + q[4] + ';color:' + q[5] + '">' + icon(q[3]) + '</div>' +
      '<div class="quick-t"><b>' + q[1] + '</b><span>' + q[2] + '</span></div></button>'
  ).join('') + '</div>';

  h += '<div class="section-title"><div class="st-left"><span>每日一题</span></div>' +
       '<span class="badge gray">' + modOf(dq.m).name + '</span></div>';
  h += '<div class="daily"><div class="row"><span class="badge" style="background:#FDECC9;color:#B45309">今日推荐</span>' +
       '<span class="badge gray">' + ['','基础','进阶','提高'][dq.lv] + '</span></div>' +
       '<div class="q-stem">' + dq.stem + '</div><div class="daily-opts">' +
       dq.opts.map((o,i) => {
         let cls = 'daily-opt';
         if(answered){ if(i === dq.ans) cls += ' ok'; else if(i === picked) cls += ' no'; }
         return '<button class="' + cls + '" data-act="dailyOpt" data-i="' + i + '"><span class="k">' + 'ABCD'[i] + '</span><span>' + o + '</span></button>';
       }).join('') + '</div>' +
       '<div class="daily-exp' + (answered?' show':'') + '">' + (answered ? '<b>正确答案 ' + 'ABCD'[dq.ans] + '　</b>' + dq.exp : '') + '</div>' +
       (answered ? '' : '<button class="btn block sm" data-act="dailyHint" style="height:34px">点击查看答案与解析</button>') +
       '</div>';

  h += '<div class="foot-tip">物理小课 · 初中物理同步学习<br>知识要点 · 公式速查 · 互动实验 · 智能刷题</div>';
  return h;
}

function answerDaily(i){
  if(state.daily.picked !== null) return;
  const q = dailyQuestion();
  state.daily.picked = i;
  if(i >= 0){
    state.data.answered++;
    if(i === q.ans) state.data.correct++;
    else if(!state.data.wrong.includes(q.id)) state.data.wrong.push(q.id);
    saveData();
    toast(i === q.ans ? '回答正确，真棒！' : '答错了，已加入错题本');
  }
  render();
}

/* ============================================================
   知识 / 公式
   ============================================================ */
function renderLearn(){
  if(state.page === 'detail') return renderTopicDetail();
  let h = '';
  h += '<div class="segmented"><button class="' + (state.learnTab==='topics'?'on':'') + '" data-act="seg" data-v="topics">知识点</button>' +
       '<button class="' + (state.learnTab==='formulas'?'on':'') + '" data-act="seg" data-v="formulas">公式速查</button></div>';
  h += '<div class="search-box">' + icon('search') +
       '<input id="searchInput" type="search" placeholder="搜索知识点、公式或关键词" value="' + esc(state.search) + '">' +
       '<button class="search-clear" id="searchClear" data-act="searchClear" style="display:' + (state.search?'block':'none') + '">' + icon('close') + '</button></div>';
  h += '<div class="chips" id="moduleChips">' + moduleChipsHTML() + '</div>';
  h += '<div id="listArea">' + learnListHTML() + '</div>';
  return h;
}
function moduleChipsHTML(){
  return '<button class="chip' + (state.learnModule==='all'?' on':'') + '" data-act="chip" data-m="all">全部</button>' +
    MODULES.map(m => '<button class="chip' + (state.learnModule===m.id?' on':'') + '" data-act="chip" data-m="' + m.id + '">' + m.name + '</button>').join('');
}
function learnListHTML(){
  const kw = state.search.trim().toLowerCase();
  if(state.learnTab === 'formulas'){
    const list = FORMULAS.map((f,i) => ({f,i})).filter(o =>
      (state.learnModule==='all' || o.f.m===state.learnModule) &&
      (!kw || (o.f.n + o.f.e + o.f.v + o.f.note).toLowerCase().includes(kw))
    );
    if(!list.length) return emptyHTML('没有找到相关公式', '换个关键词或模块试试');
    return list.map(o => {
      const f = o.f;
      return '<div class="formula-card" id="fc' + o.i + '" data-act="formula" data-i="' + o.i + '">' +
        '<div class="fc-top"><div class="fc-name">' + f.n + '</div>' + modTag(f.m) + '</div>' +
        '<div class="fc-expr">' + f.e + '</div>' +
        '<div class="fc-meta">' + f.v + '　·　单位：<span class="fc-unit">' + f.u + '</span></div>' +
        '<div class="fc-note">' + f.note + '</div></div>';
    }).join('') + '<div class="foot-tip">点击公式卡片可展开说明 · 共 ' + list.length + ' 条</div>';
  }
  const list = TOPICS.filter(t =>
    (state.learnModule==='all' || t.m===state.learnModule) &&
    (!kw || (t.title + t.sum + t.points.join('') + (t.pitfall||[]).join('')).toLowerCase().includes(kw))
  );
  if(!list.length) return emptyHTML('没有找到相关知识点', '换个关键词或模块试试');
  return list.map((t,i) => {
    const done = state.data.done.includes(t.id);
    return '<button class="topic-item' + (done?' done':'') + '" data-act="topic" data-id="' + t.id + '">' +
      '<div class="topic-idx">' + (done ? '✓' : String(i+1).padStart(2,'0')) + '</div>' +
      '<div class="grow"><div class="topic-tt">' + t.title + '</div><div class="topic-ss">' + t.sum + '</div></div>' +
      '<div class="topic-arrow">' + icon('arrow') + '</div></button>';
  }).join('') + '<div class="foot-tip">共 ' + list.length + ' 个知识点 · 已学 ' + list.filter(t=>state.data.done.includes(t.id)).length + ' 个</div>';
}
function emptyHTML(title, sub){
  return '<div class="empty">' + icon('search') + '<p><b>' + title + '</b><br>' + sub + '</p></div>';
}
function refreshLearnList(){
  const area = document.getElementById('listArea');
  if(area) area.innerHTML = learnListHTML();
  const chips = document.getElementById('moduleChips');
  if(chips) chips.innerHTML = moduleChipsHTML();
  const clr = document.getElementById('searchClear');
  if(clr) clr.style.display = state.search ? 'block' : 'none';
}

function renderTopicDetail(){
  const id = state.params.id;
  const t = TOPICS.find(x => x.id === id) || TOPICS[0];
  const m = modOf(t.m);
  if(!state.data.done.includes(t.id)){ state.data.done.push(t.id); saveData(); }
  const fav = state.data.fav.includes(t.id);
  const idx = TOPICS.findIndex(x => x.id === t.id);
  const same = TOPICS.filter(x => x.m === t.m);
  const pos = same.findIndex(x => x.id === t.id);

  let h = '';
  h += '<div class="detail-head"><span class="dh-tag">' + m.name + ' · 知识点 ' + (pos+1) + '/' + same.length + '</span>' +
       '<h2 class="dh-title">' + t.title + '</h2><div class="dh-sum">' + t.sum + '</div>' +
       '<div class="dh-actions">' +
         '<button class="' + (fav?'on':'') + '" data-act="fav" data-id="' + t.id + '">' + icon('star') + (fav?'已收藏':'收藏') + '</button>' +
         '<button class="' + (state.data.done.includes(t.id)?'on':'') + '" data-act="toggleDone" data-id="' + t.id + '">' + icon('check') + (state.data.done.includes(t.id)?'已学完':'标记已学') + '</button>' +
       '</div></div>';

  h += '<div class="d-sec"><div class="d-h"><i class="dot"></i>核心要点</div><ul class="point-list">' +
       t.points.map(p => '<li>' + p + '</li>').join('') + '</ul></div>';

  if(t.formulas && t.formulas.length){
    h += '<div class="d-sec"><div class="d-h"><i class="dot orange"></i>相关公式</div>' +
      t.formulas.map(f => '<div class="expr-line">' + f.e + '</div><div class="expr-note">' + f.n + '</div>').join('') + '</div>';
  }
  if(t.diagram){
    h += '<div class="d-sec"><div class="d-h"><i class="dot green"></i>图解示意</div>' +
      '<div class="diagram-box">' + diagram(t.diagram) + '<div class="diagram-cap">示意图 · 帮助理解关键规律</div></div></div>';
  }
  if(t.pitfall && t.pitfall.length){
    h += '<div class="d-sec"><div class="d-h"><i class="dot orange"></i>易错提醒</div>' +
      '<div class="callout warn">' + t.pitfall.map((p,i) => (i+1) + '. ' + p).join('<br><br>') + '</div></div>';
  }
  if(t.example){
    h += '<div class="d-sec"><div class="d-h"><i class="dot"></i>典型例题</div><div class="example">' + t.example + '</div></div>';
  }
  h += '<div class="callout info">' + icon('bulb') + ' 学完就练一练：本模块共有 ' +
       QUESTIONS.filter(q => q.m === t.m).length + ' 道配套练习，趁热打铁记得更牢。</div>';
  h += '<div class="nav-bottom">' +
    '<button class="btn gray" data-act="topicNav" data-id="' + (pos>0?same[pos-1].id:'') + '" ' + (pos>0?'':'disabled') + '>上一个</button>' +
    '<button class="btn ghost" data-act="quizModule" data-m="' + t.m + '">练本模块</button>' +
    '<button class="btn gray" data-act="topicNav" data-id="' + (pos<same.length-1?same[pos+1].id:'') + '" ' + (pos<same.length-1?'':'disabled') + '>下一个</button>' +
    '</div>';
  h += '<div class="foot-tip">知识点 ' + (idx+1) + ' / ' + TOPICS.length + '</div>';
  return h;
}

/* ============================================================
   互动实验
   ============================================================ */
function renderLab(){
  const key = state.labKey;
  const meta = LAB_META[key];
  let h = '';
  h += '<div class="lab-intro">' + icon('bulb') + ' 拖动下方滑块，观察图形与数据如何实时变化。这些实验对应课本重点规律，边玩边记最有效。</div>';
  h += '<div class="chips">' + Object.keys(LAB_META).map(k =>
    '<button class="chip' + (k===key?' on':'') + '" data-act="labTab" data-k="' + k + '">' + LAB_META[k].name + '</button>'
  ).join('') + '</div>';

  let opts = '';
  if(key === 'refraction'){
    opts = '<div class="seg-mini">' + Object.keys(MEDIUMS).map(k =>
      '<button class="' + (LAB_STATE.refraction.medium===k?'on':'') + '" data-act="labOpt" data-key="medium" data-val="' + k + '">' + MEDIUMS[k].label + '</button>'
    ).join('') + '</div>';
  } else if(key === 'lens'){
    opts = '<div class="seg-mini">' + [10,15].map(f =>
      '<button class="' + (LAB_STATE.lens.f===f?'on':'') + '" data-act="labOpt" data-key="f" data-val="' + f + '">焦距 f = ' + f + ' cm</button>'
    ).join('') + '</div>';
  }

  const controls = LAB_CONTROLS[key].map(c => {
    const v = LAB_STATE[key][c.k];
    return '<div class="slider-row"><label>' + c.label + '<b data-labval="' + c.k + '">' + c.fmt(v) + '</b></label>' +
      '<input type="range" data-labkey="' + key + '" data-k="' + c.k + '" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + v + '"></div>';
  }).join('');

  h += '<div class="lab-card">' +
    '<div class="lab-h"><div class="lab-ic">' + icon(meta.icon) + '</div>' + meta.name + '</div>' +
    '<div class="lab-desc">' + meta.desc + '</div>' +
    '<div class="lab-stage" id="labStage">' + labSVG(key) + '</div>' +
    opts + controls +
    '<div class="readout" id="labReadout">' + labReadout(key) + '</div>' +
    '<div class="lab-note" id="labNote">' + labNote(key) + '</div>' +
    '</div>';
  h += '<div class="callout tip"><b>小提示：</b>实验中的规律都能在「知识 → 对应模块」里找到完整讲解，配合题目练习效果更好。</div>';
  h += '<div class="foot-tip">图形与数值均根据物理公式实时计算</div>';
  return h;
}
function initSliders(){
  document.querySelectorAll('input[type=range][data-labkey]').forEach(el => {
    const min = +el.min, max = +el.max, val = +el.value;
    el.style.setProperty('--p', ((val-min)/(max-min)*100) + '%');
  });
}
function updateLabView(){
  const stage = document.getElementById('labStage');
  if(!stage) return;
  const key = state.labKey;
  stage.innerHTML = labSVG(key);
  const ro = document.getElementById('labReadout'); if(ro) ro.innerHTML = labReadout(key);
  const nt = document.getElementById('labNote'); if(nt) nt.innerHTML = labNote(key);
  document.querySelectorAll('[data-labval]').forEach(el => {
    const k = el.getAttribute('data-labval');
    const def = LAB_CONTROLS[key].find(c => c.k === k);
    if(def) el.textContent = def.fmt(LAB_STATE[key][k]);
  });
}

/* ============================================================
   刷题练习
   ============================================================ */
function renderQuiz(){
  if(state.page === 'running') return renderQuizRunning();
  if(state.page === 'result') return renderQuizResult();
  return renderQuizSetup();
}
function renderQuizSetup(){
  const cfg = state.quizCfg;
  let h = '';
  h += '<div class="qs-info">' +
    '<div><b>' + QUESTIONS.length + '</b><span>题库总量</span></div>' +
    '<div><b>' + accuracy() + '%</b><span>我的正确率</span></div>' +
    '<div><b>' + state.data.sessions + '</b><span>完成练习组数</span></div></div>';

  h += '<div class="quiz-setup"><div class="qs-card"><div class="qs-title">① 选择模块</div><div class="chips" style="margin:0;padding:0">' +
    '<button class="chip' + (cfg.m==='all'?' on':'') + '" data-act="cfg" data-k="m" data-v="all">全部</button>' +
    MODULES.map(m => '<button class="chip' + (cfg.m===m.id?' on':'') + '" data-act="cfg" data-k="m" data-v="' + m.id + '">' + m.name + '</button>').join('') +
    '</div></div>';
  h += '<div class="qs-card"><div class="qs-title">② 难度与题量</div>' +
    '<div class="small muted" style="margin-bottom:7px">难度</div><div class="qs-num">' +
    [['all','全部'],['1','基础'],['2','进阶'],['3','提高']].map(o =>
      '<button class="' + (String(cfg.lv)===o[0]?'on':'') + '" data-act="cfg" data-k="lv" data-v="' + o[0] + '">' + o[1] + '</button>').join('') + '</div>' +
    '<div class="small muted" style="margin:14px 0 7px">题量</div><div class="qs-num">' +
    [5,10,20,50].map(n => '<button class="' + (cfg.num===n?'on':'') + '" data-act="cfg" data-k="num" data-v="' + n + '">' + n + ' 题</button>').join('') + '</div></div></div>';

  const cnt = QUESTIONS.filter(q => (cfg.m==='all'||q.m===cfg.m) && (cfg.lv==='all'||q.lv===+cfg.lv)).length;
  h += '<div class="callout info" style="margin-bottom:14px">当前条件下可用 <b>' + cnt + '</b> 道题，将随机抽取 ' + Math.min(cfg.num,cnt) + ' 道。</div>';
  h += '<button class="btn block" data-act="quizStart"' + (cnt?'':' disabled') + '>' + icon('play') + '开始练习</button>';

  h += '<div class="section-title"><div class="st-left"><span>更多练习</span></div></div>';
  h += '<div class="menu-list">' +
    '<button class="menu-item" data-act="quizWrong"><div class="mi-ic" style="background:#FEECEC;color:#DC2626">' + icon('wrong') + '</div><div class="mi-t">错题重练</div><div class="mi-v">' + state.data.wrong.length + ' 题</div><div class="mi-arrow">' + icon('arrow') + '</div></button>' +
    '<button class="menu-item" data-act="quizDaily"><div class="mi-ic" style="background:#FFF4DF;color:#D97706">' + icon('fire') + '</div><div class="mi-t">每日 5 题速练</div><div class="mi-v">随机组卷</div><div class="mi-arrow">' + icon('arrow') + '</div></button>' +
    '</div>';
  return h;
}
function startQuiz(list){
  if(!list.length){ toast('暂无可用题目'); return; }
  state.quiz = { list, idx:0, picked:null, checked:false, right:0, wrongIds:[] };
  state.stack = [];
  state.tab = 'quiz'; state.page = 'running'; state.params = {};
  render();
}
function quizStart(){
  const cfg = state.quizCfg;
  let list = QUESTIONS.filter(q => (cfg.m==='all'||q.m===cfg.m) && (cfg.lv==='all'||q.lv===+cfg.lv));
  list = shuffle(list).slice(0, cfg.num);
  startQuiz(list);
}
function renderQuizRunning(){
  const qz = state.quiz;
  if(!qz){ state.page='setup'; return renderQuizSetup(); }
  const q = qz.list[qz.idx];
  const letters = ['A','B','C','D'];
  const opts = q.opts.map((o,i) => {
    let cls = 'option';
    if(qz.checked){
      if(i === q.ans) cls += ' correct';
      else if(i === qz.picked) cls += ' wrong';
      else cls += ' dim';
    } else if(i === qz.picked) cls += ' selected';
    return '<button class="' + cls + '" data-act="quizOpt" data-i="' + i + '"><span class="k">' + letters[i] + '</span><span>' + o + '</span></button>';
  }).join('');
  const ok = qz.picked === q.ans;

  let h = '<div class="quiz-head"><span>第 ' + (qz.idx+1) + ' / ' + qz.list.length + ' 题</span>' +
    '<span>' + modOf(q.m).name + ' · ' + ['','基础','进阶','提高'][q.lv] + '</span></div>' +
    '<div class="quiz-bar"><i style="width:' + ((qz.idx+1)/qz.list.length*100) + '%"></i></div>' +
    '<div class="q-card"><div class="q-meta">' + modTag(q.m) + '<span class="badge gray">单选题</span></div>' +
    '<div class="q-stem">' + q.stem + '</div><div class="options">' + opts + '</div>' +
    '<div class="explain-box ' + (qz.checked ? (ok?'ok':'no') : '') + (qz.checked?' show':'') + '">' +
      (qz.checked ? '<div class="eh">' + (ok ? '✓ 回答正确' : '✗ 回答错误') + '</div>' +
        '<div>正确答案：<span class="ans">' + letters[q.ans] + '. ' + q.opts[q.ans] + '</span></div>' +
        '<div style="margin-top:6px">' + q.exp + '</div>' : '') +
    '</div></div>';

  h += '<div class="quiz-foot">';
  if(!qz.checked){
    h += '<button class="btn block" data-act="quizConfirm"' + (qz.picked===null?' disabled':'') + '>确认答案</button>';
  } else {
    h += '<button class="btn ghost" style="flex:0 0 34%" data-act="quizFav" data-id="' + q.id + '">' + icon('star') + '收藏题</button>';
    h += '<button class="btn block" data-act="quizNext">' + (qz.idx+1===qz.list.length?'查看报告':'下一题') + '</button>';
  }
  h += '</div>';
  h += '<div class="foot-tip">答错的题目会自动进入错题本，方便集中复盘</div>';
  return h;
}
function quizConfirm(){
  const qz = state.quiz; if(!qz || qz.checked || qz.picked===null) return;
  const q = qz.list[qz.idx];
  const ok = qz.picked === q.ans;
  qz.checked = true;
  state.data.answered++;
  if(ok){ qz.right++; state.data.correct++; }
  else {
    qz.wrongIds.push(q.id);
    if(!state.data.wrong.includes(q.id)) state.data.wrong.push(q.id);
  }
  const st = state.data.moduleStat[q.m] || {a:0,c:0};
  st.a++; if(ok) st.c++;
  state.data.moduleStat[q.m] = st;
  saveData();
  render();
}
function quizNext(){
  const qz = state.quiz; if(!qz) return;
  if(qz.idx + 1 >= qz.list.length){
    state.data.sessions++;
    saveData();
    state.page = 'result';
  } else {
    qz.idx++; qz.picked = null; qz.checked = false;
  }
  render();
}
function renderQuizResult(){
  const qz = state.quiz;
  if(!qz){ state.page='setup'; return renderQuizSetup(); }
  const total = qz.list.length, pct = qz.right/total;
  const title = pct === 1 ? '满分！太厉害了' : pct >= 0.8 ? '掌握得很不错' : pct >= 0.6 ? '继续加油，快到手了' : '别灰心，回头看看知识点';
  let h = '<div class="result-hero"><div class="result-ring">' + ringSVG(pct, 48) +
    '<div class="rr"><b>' + Math.round(pct*100) + '</b><small>分</small></div></div>' +
    '<div class="result-title">' + title + '</div><div class="result-sub">共 ' + total + ' 题，答对 ' + qz.right + ' 题</div></div>';
  h += '<div class="result-stats"><div><b style="color:#10B981">' + qz.right + '</b><span>答对</span></div>' +
       '<div><b style="color:#EF4444">' + (total-qz.right) + '</b><span>答错</span></div>' +
       '<div><b>' + Math.round(pct*100) + '%</b><span>正确率</span></div>' +
       '<div><b>' + state.data.sessions + '</b><span>累计组数</span></div></div>';

  if(qz.wrongIds.length){
    h += '<div class="section-title"><div class="st-left"><span>本组错题</span></div><span class="badge gray">' + qz.wrongIds.length + ' 题</span></div>';
    h += qz.wrongIds.map(id => {
      const q = QUESTIONS.find(x=>x.id===id);
      return q ? '<div class="wrong-item open"><div class="wi-stem">' + q.stem + '</div>' +
        '<div class="wi-ans">正确答案：' + 'ABCD'[q.ans] + '. ' + q.opts[q.ans] + '</div>' +
        '<div class="wi-exp">' + q.exp + '</div></div>' : '';
    }).join('');
  } else {
    h += '<div class="callout tip">本组全部答对，没有错题。可以换个模块或提高难度继续挑战。</div>';
  }
  h += '<div class="nav-bottom" style="margin-top:16px">' +
    '<button class="btn gray" data-act="quizAgain">再来一组</button>' +
    '<button class="btn primary grow" data-act="quizWrong"' + (state.data.wrong.length?'':' disabled') + '>错题重练</button></div>';
  h += '<button class="btn outline block" style="margin-top:10px" data-act="tab" data-tab="home">返回首页</button>';
  return h;
}

/* ============================================================
   我的
   ============================================================ */
function renderMe(){
  if(state.page !== 'main') return renderMeSub();
  const lvl = state.data.answered >= 100 ? '物理达人' : state.data.answered >= 40 ? '进阶探索者' : state.data.answered >= 10 ? '入门学徒' : '新手上路';
  let h = '<div class="profile"><div class="avatar">⚛️</div><div class="grow">' +
    '<b>物理探索者</b><span>每天进步一点点</span><div class="lv">' + lvl + ' · 连续打卡 ' + streakDays() + ' 天</div></div></div>';
  h += '<div class="stat-grid">' +
    '<div><b>' + state.data.done.length + '</b><span>已学知识点</span></div>' +
    '<div><b>' + state.data.answered + '</b><span>累计做题</span></div>' +
    '<div><b>' + accuracy() + '%</b><span>正确率</span></div>' +
    '<div><b>' + state.data.wrong.length + '</b><span>错题</span></div></div>';

  h += '<div class="card"><div class="d-h" style="margin-bottom:4px"><i class="dot"></i>最近 7 天打卡</div>' +
    '<div class="heat">' + (function(){
      const set = new Set(state.data.days); let s = '';
      for(let i=6;i>=0;i--){
        const d = new Date(); d.setDate(d.getDate()-i);
        const key = fmtDate(d);
        s += '<i class="' + (set.has(key)?'on':'') + '">' + (d.getMonth()+1) + '/' + d.getDate() + '</i>';
      }
      return s;
    })() + '</div></div>';

  const menu = [
    ['wrong','错题本','#FEECEC','#DC2626', state.data.wrong.length + ' 题'],
    ['fav','我的收藏','#FFF4DF','#D97706', state.data.fav.length + ' 个'],
    ['stats','学习统计','#EEF0FF','#4F46E5','查看报告'],
    ['clear','清空学习数据','#F1F3F9','#7A8198','']
  ];
  h += '<div class="menu-list">' + menu.map(m =>
    '<button class="menu-item" data-act="mePage" data-p="' + m[0] + '"><div class="mi-ic" style="background:' + m[2] + ';color:' + m[3] + '">' +
    icon(m[0]==='clear'?'trash':m[0]==='stats'?'chart':m[0]==='fav'?'star':'wrong') + '</div>' +
    '<div class="mi-t">' + m[1] + '</div><div class="mi-v">' + m[4] + '</div><div class="mi-arrow">' + icon('arrow') + '</div></button>'
  ).join('') + '</div>';
  h += '<div class="foot-tip">学习数据保存在本机浏览器，不会上传<br>物理小课 v1.0 · 初中物理同步</div>';
  return h;
}
function renderMeSub(){
  const p = state.page;
  if(p === 'wrong'){
    const list = state.data.wrong.map(id => QUESTIONS.find(q=>q.id===id)).filter(Boolean);
    if(!list.length) return emptyHTML('错题本是空的', '保持得不错，继续刷题吧') +
      '<button class="btn block" data-act="tab" data-tab="quiz">去练习</button>';
    return '<div class="callout info" style="margin-bottom:14px">共 ' + list.length + ' 道错题。点击卡片展开解析，也可以集中重练一遍。</div>' +
      list.map(q => '<div class="wrong-item" id="wi' + q.id + '"><div class="row" style="margin-bottom:8px">' + modTag(q.m) + '<span class="badge gray">' + q.id.toUpperCase() + '</span></div>' +
        '<div class="wi-stem" data-act="wrongToggle" data-id="' + q.id + '">' + q.stem + '</div>' +
        '<div class="wi-ans">正确答案：' + 'ABCD'[q.ans] + '. ' + q.opts[q.ans] + '</div>' +
        '<div class="wi-exp">' + q.exp + '</div>' +
        '<div class="wi-foot"><button class="btn gray sm" data-act="wrongRemove" data-id="' + q.id + '">已掌握，移除</button>' +
        '<button class="btn ghost sm" data-act="wrongToggle" data-id="' + q.id + '">查看解析</button></div></div>').join('') +
      '<button class="btn block" style="margin-top:6px" data-act="quizWrong">重练全部错题</button>';
  }
  if(p === 'fav'){
    const items = state.data.fav.map(fid => {
      const t = TOPICS.find(x => x.id === fid); if(t) return { type:'topic', t };
      const q = QUESTIONS.find(x => x.id === fid); if(q) return { type:'quiz', q };
      return null;
    }).filter(Boolean);
    if(!items.length) return emptyHTML('还没有收藏', '在知识点详情页或练习解析里点击「收藏」即可加入') +
      '<button class="btn block" data-act="tab" data-tab="learn">去看知识点</button>';
    return '<div class="callout info" style="margin-bottom:14px">共 ' + items.length + ' 条收藏。点击知识点可查看详情，点击题目可单独重做。</div>' +
      items.map(o => {
        if(o.type === 'topic'){
          return '<button class="topic-item" data-act="topic" data-id="' + o.t.id + '">' +
            '<div class="topic-idx" style="background:#FFF4DF;color:#D97706">★</div>' +
            '<div class="grow"><div class="topic-tt">' + o.t.title + '</div><div class="topic-ss">' + o.t.sum + '</div></div>' +
            '<div class="topic-arrow">' + icon('arrow') + '</div></button>';
        }
        return '<button class="topic-item" data-act="favQuiz" data-id="' + o.q.id + '">' +
          '<div class="topic-idx" style="background:#EEF0FF;color:#4F46E5">题</div>' +
          '<div class="grow"><div class="topic-tt">' + o.q.stem + '</div><div class="topic-ss">' + modOf(o.q.m).name + ' · 点击单独重做</div></div>' +
          '<div class="topic-arrow">' + icon('arrow') + '</div></button>';
      }).join('');
  }
  // stats
  const donePct = Math.round(state.data.done.length/TOPICS.length*100);
  const weak = MODULES.map(m => {
    const st = state.data.moduleStat[m.id] || {a:0,c:0};
    return { m, rate: st.a ? Math.round(st.c/st.a*100) : null, n:st.a };
  }).sort((a,b) => (a.rate===null?101:a.rate) - (b.rate===null?101:b.rate));
  let h = '<div class="card"><div class="d-h"><i class="dot"></i>知识点掌握进度</div>' +
    '<div class="spread small"><span>已学 ' + state.data.done.length + ' / ' + TOPICS.length + ' 个</span><b>' + donePct + '%</b></div>' +
    '<div class="quiz-bar" style="margin-top:8px"><i style="width:' + donePct + '%"></i></div>' +
    MODULES.map(m => {
      const total = TOPICS.filter(t=>t.m===m.id).length;
      const got = TOPICS.filter(t=>t.m===m.id && state.data.done.includes(t.id)).length;
      return '<div style="margin-top:12px"><div class="spread small"><span>' + m.name + '</span><span class="muted">' + got + '/' + total + '</span></div>' +
        '<div class="quiz-bar" style="height:5px;margin-top:5px;margin-bottom:0"><i style="width:' + (got/total*100) + '%;background:' + m.color + '"></i></div></div>';
    }).join('') + '</div>';
  h += '<div class="card"><div class="d-h"><i class="dot orange"></i>各模块答题表现</div>' +
    MODULES.map(m => {
      const st = state.data.moduleStat[m.id] || {a:0,c:0};
      const r = st.a ? Math.round(st.c/st.a*100) : 0;
      return '<div class="spread" style="padding:7px 0;border-bottom:1px solid var(--line)">' +
        '<span class="small">' + m.name + '</span><span class="small"><b>' + st.a + '</b> 题 · 正确率 <b style="color:' + (r>=80?'#10B981':r>=60?'#D97706':'#EF4444') + '">' + (st.a?r+'%':'—') + '</b></span></div>';
    }).join('') + '</div>';
  const w = weak.find(x => x.rate !== null && x.rate < 80);
  h += '<div class="callout ' + (w?'warn':'tip') + '">' +
    (w ? '<b>学习建议：</b>「' + w.m.name + '」正确率约 ' + w.rate + '%，建议回到知识地图重看该模块要点，再做几道配套练习。'
       : '<b>学习建议：</b>各模块表现稳定，可以试试「提高」难度的题目挑战一下。') + '</div>';
  return h;
}

/* ============================================================
   事件
   ============================================================ */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if(!el) return;
  const a = el.getAttribute('data-act');
  const id = el.getAttribute('data-id');
  const m = el.getAttribute('data-m');
  switch(a){
    case 'tab': switchTab(el.getAttribute('data-tab')); break;
    case 'back': back(); break;
    case 'module':
      state.learnModule = m; state.learnTab = 'topics'; state.search = '';
      switchTab('learn'); break;
    case 'quick': {
      const to = el.getAttribute('data-to');
      if(to === 'formula'){ state.learnTab='formulas'; state.learnModule='all'; state.search=''; switchTab('learn'); }
      else if(to === 'quiz') switchTab('quiz');
      else if(to === 'lab') switchTab('lab');
      else if(to === 'wrong'){ go('me','wrong',{}); }
      break;
    }
    case 'dailyOpt': answerDaily(+el.getAttribute('data-i')); break;
    case 'dailyHint': answerDaily(-1); break;

    case 'seg': state.learnTab = el.getAttribute('data-v'); state.search=''; render(); break;
    case 'chip': state.learnModule = m; refreshLearnList(); break;
    case 'searchClear':
      state.search = '';
      document.getElementById('searchInput').value = '';
      refreshLearnList(); break;
    case 'formula': {
      const fc = document.getElementById('fc' + el.getAttribute('data-i'));
      if(fc) fc.classList.toggle('open');
      break;
    }
    case 'topic': go('learn','detail',{id:id}); break;
    case 'topicNav': if(id) { state.params = {id:id}; render(); } break;
    case 'fav': {
      const i = state.data.fav.indexOf(id);
      if(i >= 0){ state.data.fav.splice(i,1); toast('已取消收藏'); }
      else { state.data.fav.push(id); toast('已加入收藏'); }
      saveData(); render(); break;
    }
    case 'toggleDone': {
      const i = state.data.done.indexOf(id);
      if(i >= 0){ state.data.done.splice(i,1); toast('已标记为未学'); }
      else { state.data.done.push(id); toast('已标记为学完'); }
      saveData(); render(); break;
    }
    case 'quizModule': {
      state.quizCfg.m = m; state.quizCfg.lv = 'all'; state.quizCfg.num = 10;
      switchTab('quiz'); toast('已切换到「' + modOf(m).name + '」练习'); break;
    }

    case 'labTab': state.labKey = el.getAttribute('data-k'); render(); break;
    case 'labOpt': {
      const k = el.getAttribute('data-key'), v = el.getAttribute('data-val');
      LAB_STATE[state.labKey][k] = (k === 'f') ? +v : v;
      render(); break;
    }

    case 'cfg': {
      const k = el.getAttribute('data-k'), v = el.getAttribute('data-v');
      state.quizCfg[k] = (k === 'num') ? +v : v;
      render(); break;
    }
    case 'quizStart': quizStart(); break;
    case 'quizWrong': {
      const list = shuffle(state.data.wrong.map(qid => QUESTIONS.find(q=>q.id===qid)).filter(Boolean));
      startQuiz(list); break;
    }
    case 'quizDaily': startQuiz(shuffle(QUESTIONS).slice(0,5)); break;
    case 'favQuiz': {
      const q = QUESTIONS.find(x => x.id === id);
      if(q) startQuiz([q]);
      break;
    }
    case 'quizOpt': {
      if(!state.quiz || state.quiz.checked) return;
      state.quiz.picked = +el.getAttribute('data-i');
      render(); break;
    }
    case 'quizConfirm': quizConfirm(); break;
    case 'quizNext': quizNext(); break;
    case 'quizFav': {
      const qi = state.data.fav.indexOf(id);
      if(qi >= 0){ state.data.fav.splice(qi,1); toast('已取消收藏'); }
      else { state.data.fav.push(id); toast('已收藏（可在「我的」查看）'); }
      saveData(); break;
    }
    case 'quizAgain': state.page='setup'; state.quiz=null; render(); break;

    case 'mePage': {
      const p = el.getAttribute('data-p');
      if(p === 'clear'){
        if(confirm('确定要清空全部学习数据吗？已学记录、收藏、错题和做题统计都会被删除，且无法恢复。')){
          state.data = defaultData();
          saveData();
          toast('学习数据已清空');
          render();
        }
      } else { state.stack.push({tab:state.tab,page:state.page,params:state.params}); state.page = p; render(); }
      break;
    }
    case 'wrongToggle': {
      const wi = document.getElementById('wi' + id);
      if(wi) wi.classList.toggle('open');
      break;
    }
    case 'wrongRemove': {
      const i = state.data.wrong.indexOf(id);
      if(i >= 0){ state.data.wrong.splice(i,1); saveData(); toast('已移出错题本'); render(); }
      break;
    }
  }
});

/* 输入事件：搜索 / 实验滑块 */
document.addEventListener('input', e => {
  const t = e.target;
  if(t.matches && t.matches('input[type=range][data-labkey]')){
    const key = t.getAttribute('data-labkey'), k = t.getAttribute('data-k');
    LAB_STATE[key][k] = Number(t.value);
    const min = +t.min, max = +t.max;
    t.style.setProperty('--p', ((+t.value-min)/(max-min)*100) + '%');
    updateLabView();
    return;
  }
  if(t.id === 'searchInput'){
    state.search = t.value;
    refreshLearnList();
  }
});

/* 返回按钮 & 初始化 */
document.getElementById('backBtn').addEventListener('click', back);
(function init(){
  checkIn();
  const now = new Date();
  document.getElementById('sbTime').textContent = now.getHours() + ':' + pad(now.getMinutes());
  render();
})();
