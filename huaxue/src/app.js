/* ============================================================
   初中化学学习小程序 - 应用逻辑
   ============================================================ */
(function(){
'use strict';

var C = window.CHEM_CHAPTERS, E = window.CHEM_ELEMENTS,
    Q = window.CHEM_EQUATIONS, K = window.CHEM_CHEATS,
    QUIZ = window.CHEM_QUIZ, EQC = window.CHEM_EQ_CATS;
var TOTAL_KP = C.reduce(function(n,c){return n+c.points.length},0);
var KEY = 'chemMini.v1';

var raw = {};
try{ raw = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }catch(e){ raw = {}; }

var S = {
  tab:'home', view:'home', chapter:null,
  toolTab:'ptable', eqCat:'全部', eqQuery:'', kpQuery:'',
  quizTab:'practice', quizMode:'全部题目',
  learned:new Set(raw.learned||[]), favKp:new Set(raw.favKp||[]), favEq:new Set(raw.favEq||[]),
  wrong:(raw.wrong||[]).slice(), stats:raw.stats||{total:0,correct:0},
  q:{order:[],idx:0,picked:null,sessionCorrect:0,sessionTotal:0},
  pending:null
};

function save(){
  try{ localStorage.setItem(KEY, JSON.stringify({
    learned:[...S.learned], favKp:[...S.favKp], favEq:[...S.favEq],
    wrong:S.wrong, stats:S.stats
  })); }catch(e){}
}
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function kpKey(ci,pi){ return C[ci].id+':'+pi; }
function chByName(n){ for(var i=0;i<C.length;i++){ if(C[i].t===n) return i; } return -1; }
function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }

/* ---------------- 图标 ---------------- */
var ICONS={
home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
book:'<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20"/>',
flask:'<path d="M9 2h6"/><path d="M10 2v6.5L4.6 18a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3L14 8.5V2"/><path d="M7.5 15h9"/>',
edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/><path d="M14 6l3 3"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
right:'<path d="M9 5l7 7-7 7"/>',
left:'<path d="M15 5l-7 7 7 7"/>',
star:'<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/>',
check:'<path d="M4 12.5l5 5L20 6.5"/>',
trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>',
info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7.5h.01"/>',
grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
bulb:'<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5.9 1.2.9 2.1h5.2c0-.9.3-1.6.9-2.1A6 6 0 0 0 12 3z"/>',
refresh:'<path d="M20 11a8 8 0 1 0-2.3 6.3"/><path d="M20 4v7h-7"/>',
play:'<path d="M8 5l11 7-11 7z"/>',
target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
atom:'<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="9" ry="4"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)"/>',
layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 16.5l9 5 9-5"/>',
close:'<path d="M6 6l12 12M18 6L6 18"/>'
};
function ic(n){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'+(ICONS[n]||'')+'</svg>'; }

/* ---------------- 化学方程式渲染 ---------------- */
/* 正文里的化学式自动下标：CO2 → CO<sub>2</sub>，系数与独立数字不受影响 */
function rich(s){ return esc(s).replace(/([A-Za-z\)\]])(\d{1,3})/g,'$1<sub>$2</sub>'); }
function fmtNum(s){ return esc(s).replace(/([A-Za-z\)])(\d+)/g,'$1<sub>$2</sub>'); }
function fmt(e,cond){
  var s = esc(e).replace(/→/g,'\u0001');
  s = s.replace(/([A-Za-z\)\]])(\d+)/g,'$1<sub>$2</sub>');
  var ar = '<span class="ar">'+(cond?'<em>'+fmtNum(cond)+'</em>':'')+'<i>⟶</i></span>';
  return s.split('\u0001').join(ar);
}

/* ---------------- DOM ---------------- */
var $page,$navTitle,$navBack,$mask,$sheet,$sheetTitle,$sheetBody,$toast,$tabbar,$homeInd;
var toastTimer=null;
function toast(msg){
  $toast.textContent=msg; $toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(function(){$toast.classList.remove('show');},1700);
}
function openSheet(title,html){
  $sheetTitle.textContent=title; $sheetBody.innerHTML=html; $sheetBody.scrollTop=0;
  $mask.classList.add('show'); $sheet.classList.add('show');
}
function closeSheet(){ $mask.classList.remove('show'); $sheet.classList.remove('show'); }
function confirmDo(title,text,fn){
  S.pending=fn;
  openSheet(title,'<p style="font-size:13px;line-height:1.8;color:var(--sub);margin:4px 0 18px">'+esc(text)+'</p>'+
    '<div style="display:flex;gap:9px"><button class="btn gray block" data-act="close-sheet">取消</button>'+
    '<button class="btn block" data-act="confirm-ok">确定</button></div>');
}

/* ---------------- 页面标题 / TabBar ---------------- */
var TITLES={home:'初中化学 · 随身学',knowledge:'知识课堂',tools:'化学工具箱',quiz:'闯关练习',mine:'我的学习'};
var TABS=[['home','home','首页'],['knowledge','book','知识'],['tools','flask','工具'],['quiz','edit','练习'],['mine','user','我的']];
function renderChrome(){
  $navTitle.textContent = S.view==='chapter' ? C[S.chapter].t : (TITLES[S.view]||'初中化学');
  $navBack.classList.toggle('show',S.view==='chapter');
  var wc=S.wrong.length;
  $tabbar.innerHTML = TABS.map(function(t){
    return '<button class="tab '+(S.tab===t[0]?'on':'')+'" data-act="tab" data-tab="'+t[0]+'">'+
      '<span class="ic">'+ic(t[1])+(t[0]==='quiz'&&wc?'<span class="badge-dot">'+(wc>99?'99+':wc)+'</span>':'')+'</span>'+
      '<span>'+t[2]+'</span></button>';
  }).join('');
}
function go(tab,view){
  S.tab=tab; S.view=view||tab;
  render(); $page.scrollTop=0;
}

/* ---------------- 首页 ---------------- */
function dailyIndex(){
  var d=new Date(), n=Math.floor((d.getFullYear()*372+d.getMonth()*31+d.getDate())%QUIZ.length);
  return n;
}
function renderHome(){
  var learned=S.learned.size, pct=TOTAL_KP?Math.round(learned/TOTAL_KP*100):0;
  var dash=2*Math.PI*26, off=dash*(1-pct/100);
  var dq=QUIZ[dailyIndex()];
  var quick=[['knowledge','book','知识点','var(--brand)','var(--brand-soft)'],
             ['tools','atom','周期表','var(--blue)','var(--blue-soft)'],
             ['toolseq','layers','方程式','#8B6DF0','#F0EBFF'],
             ['quiz','edit','去刷题','#F08A3C','#FFF0E3']];
  var h='';
  h+='<div class="hero"><h2>化学，其实很有趣</h2><p>人教版九年级上下册 · 12 个单元 · 知识点 / 方程式 / 刷题一站式复习</p>'+
     '<div class="hero-row"><div class="ring"><svg width="64" height="64">'+
     '<circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,.25)" stroke-width="6" fill="none"/>'+
     '<circle cx="32" cy="32" r="26" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="'+dash+'" stroke-dashoffset="'+off+'"/>'+
     '</svg><div class="num">'+pct+'<small>%</small></div></div>'+
     '<div class="hero-stats"><div class="hero-stat"><b>'+learned+'</b><span>已掌握知识点</span></div>'+
     '<div class="hero-stat"><b>'+S.stats.total+'</b><span>累计答题</span></div>'+
     '<div class="hero-stat"><b>'+C.length+'</b><span>课程单元</span></div></div></div></div>';
  h+='<div class="quick">'+quick.map(function(q){
    return '<button class="quick-item" data-act="quick" data-to="'+q[0]+'"><span class="quick-ico" style="background:'+q[4]+';color:'+q[3]+'">'+ic(q[1])+'</span><span>'+q[2]+'</span></button>';
  }).join('')+'</div>';
  h+='<div class="sec-head"><h3>每日一题</h3><span class="more">'+(new Date().getMonth()+1)+' 月 '+new Date().getDate()+' 日</span></div>';
  h+='<div class="daily"><h4><span class="tag">'+esc(dq.ch)+'</span><span class="tag gray">'+dq.lv+'</span></h4>'+
     '<p class="q">'+rich(dq.q)+'</p><div class="row"><span>坚持每天一题，化学不再难</span>'+
     '<button class="btn sm" data-act="daily">去作答 '+ic('right')+'</button></div></div>';
  h+='<div class="sec-head"><h3>课程单元</h3><button class="more" data-act="tab" data-tab="knowledge">全部 '+C.length+' 单元 '+ic('right')+'</button></div>';
  h+='<div class="ch-list">'+C.map(function(c,i){return chItem(c,i);}).join('')+'</div>';
  h+='<p style="text-align:center;color:var(--muted);font-size:11px;margin:18px 0 4px">结构决定性质 · 性质决定用途</p>';
  return h;
}
function chItem(c,i){
  var done=c.points.reduce(function(n,p,j){return n+(S.learned.has(kpKey(i,j))?1:0)},0);
  return '<button class="ch-item" data-act="open-ch" data-i="'+i+'">'+
    '<span class="ch-badge hue-'+c.hue+'" style="background:var(--h)"><b>'+c.no+'</b><small>'+esc(c.badge)+'</small></span>'+
    '<span class="ch-info"><h4>'+esc(c.t)+'</h4><p>'+esc(c.v)+' · '+c.points.length+' 个知识点</p></span>'+
    '<span class="ch-prog">'+done+'/'+c.points.length+'</span><span class="ch-arrow">'+ic('right')+'</span></button>';
}

/* ---------------- 知识页 ---------------- */
function renderKnowledge(){
  var h='<div class="search">'+ic('search')+'<input id="kpSearch" data-search="kp" placeholder="搜索知识点、口诀、易错点…" value="'+esc(S.kpQuery)+'">'+
        (S.kpQuery?'<span class="clear" data-act="clear-kp">×</span>':'')+'</div>'+
        '<div style="display:flex;gap:7px;margin-bottom:12px"><span class="tag">12 个单元</span><span class="tag blue">'+TOTAL_KP+' 个知识点</span><span class="tag ok">已学 '+S.learned.size+'</span></div>'+
        '<div id="kpResults">'+kpResultsHtml()+'</div>';
  return h;
}
function allPoints(){
  var a=[]; C.forEach(function(c,i){ c.points.forEach(function(p,j){ a.push({ci:i,pi:j,c:c,p:p,key:kpKey(i,j)}); }); }); return a;
}
function kpResultsHtml(){
  var q=S.kpQuery.trim().toLowerCase();
  if(!q) return '<div class="ch-list">'+C.map(function(c,i){return chItem(c,i);}).join('')+'</div>';
  var list=allPoints().filter(function(o){
    return (o.p.t+o.p.s+o.p.d.join('')+o.p.tip+o.c.t).toLowerCase().indexOf(q)>=0;
  });
  if(!list.length) return '<div class="empty"><div class="ico">'+ic('search')+'</div><p>没有找到相关知识点，换个关键词试试</p></div>';
  return '<p style="font-size:11px;color:var(--muted);margin:0 2px 9px">找到 '+list.length+' 条结果</p>'+
    list.map(function(o){
      return '<button class="kp" style="display:block;width:100%;text-align:left" data-act="open-kp" data-ci="'+o.ci+'" data-pi="'+o.pi+'">'+
        '<div style="display:flex;align-items:center;gap:7px;margin-bottom:5px"><span class="tag gray">'+esc(o.c.t)+'</span>'+(S.learned.has(o.key)?'<span class="tag ok">已学</span>':'')+'</div>'+
        '<h4 style="margin:0 0 5px;font-size:13.5px">'+rich(o.p.t)+'</h4>'+
        '<p style="margin:0;font-size:11.5px;color:var(--sub);line-height:1.6">'+rich(o.p.s)+'</p></button>';
    }).join('');
}
function renderChapter(ci){
  var c=C[ci], done=c.points.reduce(function(n,p,j){return n+(S.learned.has(kpKey(ci,j))?1:0)},0);
  var h='<div class="detail-hero hue-'+c.hue+'"><h3>'+esc(c.t)+'</h3><p>'+esc(c.intro)+'</p>'+
    '<div class="meta"><span>'+esc(c.v)+'</span><span>'+c.points.length+' 个知识点</span><span>已掌握 '+done+'</span></div></div>';
  c.points.forEach(function(p,j){
    var key=kpKey(ci,j), learned=S.learned.has(key), faved=S.favKp.has(key);
    h+='<div class="kp hue-'+c.hue+' '+(learned?'learned':'')+'"><div class="kp-head"><span class="kp-no">'+(j+1)+'</span><h4>'+esc(p.t)+'</h4></div>'+
      '<div class="kp-sum">'+rich(p.s)+'</div><ul>'+p.d.map(function(d){return '<li>'+rich(d)+'</li>';}).join('')+'</ul>'+
      '<div class="tip"><b>易错提醒</b><span>'+rich(p.tip)+'</span></div>'+
      '<div class="kp-foot"><button class="'+(learned?'on':'')+'" data-act="learn" data-key="'+key+'">'+ic('check')+(learned?'已掌握':'标记已学')+'</button>'+
      '<button class="'+(faved?'on':'')+'" data-act="fav-kp" data-key="'+key+'">'+ic('star')+(faved?'已收藏':'收藏')+'</button></div></div>';
  });
  h+='<button class="btn block" data-act="quiz-ch" data-ch="'+esc(c.t)+'">'+ic('play')+' 开始本章练习</button>';
  return h;
}

/* ---------------- 工具页 ---------------- */
function renderTools(){
  var tabs=[['ptable','元素周期表'],['equation','化学方程式'],['cheat','必背口诀']];
  var h='<div class="chips" style="margin-bottom:12px">'+tabs.map(function(t){
    return '<button class="chip '+(S.toolTab===t[0]?'on':'')+'" data-act="tool-tab" data-t="'+t[0]+'">'+t[1]+'</button>';
  }).join('')+'</div>';
  if(S.toolTab==='ptable') h+=ptableHtml();
  else if(S.toolTab==='equation') h+=equationHtml();
  else h+=cheatHtml();
  return h;
}
function elClass(e){
  return e.cat==='金属'?'metal':e.cat==='稀有气体'?'noble':e.cat==='类金属'?'metalloid':'nonmetal';
}
/* 18 列标准表 → 8 列初中短式表（前 20 号均为主族元素） */
function shortCol(g){ return g===18?8:(g>=13?g-10:g); }
function outerElectrons(e){ return (e.p===1&&e.g===18)?2:shortCol(e.g); }
function elBtn(e,extra){
  return '<button class="el '+elClass(e)+'" data-act="el" data-z="'+e.z+'"'+
    (e.p?' style="grid-row:'+e.p+';grid-column:'+shortCol(e.g)+'"':'')+'>'+
    '<span class="z">'+e.z+'</span><span class="s">'+e.sym+'</span><span class="n">'+e.name+'</span></button>';
}
function ptableHtml(){
  var main=E.filter(function(e){return e.p;}), extra=E.filter(function(e){return !e.p;});
  var h='<div class="card" style="padding:12px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">元素周期表 · 前 20 号（点击查看）</div>'+
    '<div class="ptable">';
  main.forEach(function(e){ h+=elBtn(e); });
  h+='</div><div class="legend"><span><i style="background:#48B4D8"></i>非金属</span><span><i style="background:#F0A24A"></i>金属</span>'+
     '<span><i style="background:#9B7BE8"></i>稀有气体</span><span><i style="background:#63B98A"></i>类金属</span></div></div>';
  h+='<div class="sec-head"><h3>常考补充元素</h3><span class="more">共 '+extra.length+' 种</span></div>';
  h+='<div class="card" style="padding:12px"><div class="extra-grid">'+extra.map(function(e){return elBtn(e,true);}).join('')+'</div></div>';
  h+='<div class="card" style="background:var(--brand-soft);box-shadow:none"><p style="margin:0;font-size:11.5px;color:var(--brand-d);line-height:1.75">'+
     '<b>记忆提示</b>：短式表按最外层电子数排成 8 列，周期数 = 电子层数（He 最外层 2 个电子，属稳定结构）。元素符号首字母大写、第二个字母必须小写（Co 是钴，CO 是一氧化碳）。</p></div>';
  return h;
}
function eqFiltered(){
  var q=S.eqQuery.trim().toLowerCase();
  return Q.map(function(e,i){return {e:e,i:i};}).filter(function(o){
    var catOk = S.eqCat==='全部'||o.e.c===S.eqCat;
    var qOk = !q || (o.e.n+o.e.e+o.e.ph+o.e.tip+o.e.c).toLowerCase().indexOf(q)>=0;
    return catOk&&qOk;
  });
}
function equationHtml(){
  var h='<div class="search">'+ic('search')+'<input id="eqSearch" data-search="eq" placeholder="搜索方程式、物质或现象…" value="'+esc(S.eqQuery)+'">'+
        (S.eqQuery?'<span class="clear" data-act="clear-eq">×</span>':'')+'</div>';
  h+='<div class="chips">'+['全部'].concat(EQC).map(function(c){
    return '<button class="chip '+(S.eqCat===c?'on':'')+'" data-act="eq-cat" data-c="'+esc(c)+'">'+esc(c)+'</button>';
  }).join('')+'</div>';
  h+='<div id="eqList">'+eqListHtml()+'</div>';
  return h;
}
function eqListHtml(){
  var list=eqFiltered();
  if(!list.length) return '<div class="empty"><div class="ico">'+ic('flask')+'</div><p>没有匹配的化学方程式</p></div>';
  return '<p style="font-size:11px;color:var(--muted);margin:2px 2px 9px">共 '+list.length+' 条 · ↑ 气体 ↓ 沉淀</p>'+
    list.map(function(o){
      var e=o.e,f=S.favEq.has(o.i);
      return '<div class="eq"><div class="eq-top"><h4>'+rich(e.n)+'</h4>'+
        '<button class="fav '+(f?'on':'')+'" data-act="fav-eq" data-i="'+o.i+'">'+ic('star')+'</button></div>'+
        '<div class="formula">'+fmt(e.e,e.cond)+'</div>'+
        '<div class="eq-line"><b>现象</b><span>'+rich(e.ph)+'</span></div>'+
        '<div class="eq-line"><b>考点</b><span>'+rich(e.tip)+'</span></div>'+
        '<div style="margin-top:8px"><span class="tag gray">'+esc(e.c)+'</span></div></div>';
    }).join('');
}
function cheatHtml(){
  return '<p style="font-size:11px;color:var(--muted);margin:0 2px 10px">考前速记 · 共 '+K.length+' 张卡片</p>'+
    K.map(function(k){
      return '<div class="cheat hue-'+k.hue+'"><h4>'+esc(k.t)+'<span class="tag gray">'+esc(k.tag)+'</span></h4>'+
        k.lines.map(function(l){return '<div class="line">'+rich(l)+'</div>';}).join('')+
        '<div class="note">'+rich(k.note)+'</div></div>';
    }).join('');
}

/* ---------------- 练习页 ---------------- */
var MODES=['全部题目','上册','下册','错题重练'].concat(C.map(function(c){return c.t;}));
function buildOrder(mode){
  var idx=QUIZ.map(function(_,i){return i;});
  if(mode==='全部题目') return idx;
  if(mode==='错题重练') return S.wrong.slice();
  var up=['走进化学世界','我们周围的空气','物质构成的奥秘','自然界的水','化学方程式','碳和碳的氧化物','燃料及其利用'];
  return idx.filter(function(i){
    var n=QUIZ[i].ch;
    if(mode==='上册') return up.indexOf(n)>=0;
    if(mode==='下册') return up.indexOf(n)<0 && n!=='综合提升';
    return n===mode;
  });
}
function startQuiz(mode){
  S.quizMode=mode||S.quizMode;
  S.q={order:buildOrder(S.quizMode),idx:0,picked:null,sessionCorrect:0,sessionTotal:0};
  if(!S.q.order.length){ toast('这里还没有题目，先去刷题吧'); return false; }
  return true;
}
function renderQuiz(){
  var tabs=[['practice','顺序练习'],['wrong','错题本'],['fav','我的收藏']];
  var h='<div class="quiz-tabs">'+tabs.map(function(t){
    return '<button class="'+(S.quizTab===t[0]?'on':'')+'" data-act="quiz-tab" data-t="'+t[0]+'">'+t[1]+
      (t[0]==='wrong'&&S.wrong.length?' ('+S.wrong.length+')':'')+'</button>';
  }).join('')+'</div>';
  if(!S.q.order.length) startQuiz(S.quizMode);
  if(S.quizTab==='practice'){
    h+='<div id="quizStat">'+statHtml()+'</div>';
    h+='<div class="chips">'+MODES.map(function(m){
      return '<button class="chip '+(S.quizMode===m?'on':'')+'" data-act="quiz-mode" data-m="'+esc(m)+'">'+esc(m)+'</button>';
    }).join('')+'</div>';
    h+='<div id="quizArea">'+quizAreaHtml()+'</div>';
  }else if(S.quizTab==='wrong') h+=wrongHtml();
  else h+=favHtml();
  return h;
}
function statHtml(){
  var rate=S.stats.total?Math.round(S.stats.correct/S.stats.total*100):0;
  return '<div class="stat-grid"><div class="stat-box"><b>'+S.stats.total+'</b><span>累计答题</span></div>'+
    '<div class="stat-box"><b>'+rate+'%</b><span>正确率</span></div>'+
    '<div class="stat-box"><b>'+S.wrong.length+'</b><span>待攻克错题</span></div></div>';
}
function quizAreaHtml(){
  if(!S.q.order.length) return '<div class="empty"><div class="ico">'+ic('edit')+'</div><p>当前筛选下没有题目</p><button class="btn sm" data-act="quiz-mode" data-m="全部题目" style="margin-top:12px">切换到全部题目</button></div>';
  if(S.q.idx>=S.q.order.length){
    var r=S.q.sessionTotal?Math.round(S.q.sessionCorrect/S.q.sessionTotal*100):0;
    return '<div class="qcard" style="text-align:center;padding:26px 18px"><div style="width:56px;height:56px;border-radius:18px;background:var(--brand-soft);color:var(--brand);display:flex;align-items:center;justify-content:center;margin:0 auto 12px">'+ic('target')+'</div>'+
      '<h3 style="margin:0 0 6px;font-size:17px">本轮完成！</h3><p style="margin:0 0 16px;font-size:12.5px;color:var(--sub)">共 '+S.q.sessionTotal+' 题，答对 '+S.q.sessionCorrect+' 题，正确率 '+r+'%</p>'+
      '<div style="display:flex;gap:8px"><button class="btn ghost block" data-act="quiz-tab" data-t="wrong">看错题</button>'+
      '<button class="btn block" data-act="restart">再来一轮</button></div></div>';
  }
  var qi=S.q.order[S.q.idx], q=QUIZ[qi], picked=S.q.picked;
  var labs=['A','B','C','D'];
  var h='<div class="progress-line"><i style="width:'+Math.round(S.q.idx/S.q.order.length*100)+'%"></i></div>';
  h+='<div class="qcard"><div class="qmeta"><span class="tag">'+esc(q.ch)+'</span><span class="tag gray">'+q.lv+'</span>'+
     '<span style="margin-left:auto">第 '+(S.q.idx+1)+' / '+S.q.order.length+' 题</span></div>';
  h+='<p class="qtext">'+rich(q.q)+'</p><div class="opts">';
  q.o.forEach(function(o,i){
    var cls='opt';
    if(picked!==null){
      if(i===q.a) cls+=' correct';
      else if(i===picked) cls+=' wrong';
      else cls+=' disabled';
    }
    h+='<button class="'+cls+'" data-act="opt" data-i="'+i+'"><span class="lab">'+labs[i]+'</span><span>'+rich(o)+'</span></button>';
  });
  h+='</div>';
  if(picked!==null){
    var ok=picked===q.a;
    h+='<div class="explain"><div class="head '+(ok?'ok':'no')+'">'+ic(ok?'check':'info')+(ok?'回答正确！':('正确答案：'+labs[q.a]))+'</div>'+rich(q.ex)+'</div>';
    h+='<div class="qactions"><button class="btn ghost" data-act="fav-quiz" data-i="'+qi+'">'+ic('star')+(S.favKp.has('q:'+qi)?'已收藏':'收藏本题')+'</button>'+
       '<button class="btn" data-act="next-q">'+(S.q.idx+1>=S.q.order.length?'查看结果':'下一题')+' '+ic('right')+'</button></div>';
  }
  h+='</div>';
  return h;
}
function refreshQuiz(){
  var a=document.getElementById('quizArea'),s=document.getElementById('quizStat');
  if(a) a.innerHTML=quizAreaHtml();
  if(s) s.innerHTML=statHtml();
}
function wrongHtml(){
  if(!S.wrong.length) return '<div class="empty"><div class="ico">'+ic('check')+'</div><p>错题本是空的，继续保持！</p>'+
    '<button class="btn sm" data-act="quiz-tab" data-t="practice" style="margin-top:12px">去刷题</button></div>';
  return '<div style="display:flex;gap:8px;margin-bottom:12px"><button class="btn block" data-act="retry-wrong">'+ic('refresh')+' 重练全部错题</button></div>'+
    S.wrong.map(function(qi,i){
      var q=QUIZ[qi]; if(!q) return '';
      return '<div class="wrong-item"><span class="tag gray">'+esc(q.ch)+'</span><p class="t" style="margin-top:7px">'+rich(q.q)+'</p>'+
        '<div class="a">正确答案：'+['A','B','C','D'][q.a]+'. '+rich(q.o[q.a])+'</div>'+
        '<div class="e">'+rich(q.ex)+'</div><div class="foot"><span>错第 '+(i+1)+' 题</span>'+
        '<button data-act="wrong-remove" data-i="'+qi+'" style="color:var(--brand);font-size:11px">已掌握，移出错题本</button></div></div>';
    }).join('');
}
function favHtml(){
  var kps=allPoints().filter(function(o){return S.favKp.has(o.key);});
  var eqs=Q.map(function(e,i){return {e:e,i:i};}).filter(function(o){return S.favEq.has(o.i);});
  var qs=QUIZ.map(function(q,i){return {q:q,i:i};}).filter(function(o){return S.favKp.has('q:'+o.i);});
  var h='';
  if(!kps.length&&!eqs.length&&!qs.length) return '<div class="empty"><div class="ico">'+ic('star')+'</div><p>还没有收藏内容<br>在知识点、方程式或答题页点星星即可收藏</p></div>';
  if(kps.length){
    h+='<div class="sec-head"><h3>收藏的知识点</h3><span class="more">'+kps.length+' 条</span></div>';
    h+=kps.map(function(o){return '<button class="kp" style="display:block;width:100%;text-align:left" data-act="open-kp" data-ci="'+o.ci+'" data-pi="'+o.pi+'">'+
      '<div style="font-size:11px;color:var(--muted);margin-bottom:4px">'+esc(o.c.t)+'</div><h4 style="margin:0 0 5px;font-size:13.5px">'+rich(o.p.t)+'</h4>'+
      '<p style="margin:0;font-size:11.5px;color:var(--sub)">'+rich(o.p.s)+'</p></button>';}).join('');
  }
  if(eqs.length){
    h+='<div class="sec-head"><h3>收藏的方程式</h3><span class="more">'+eqs.length+' 条</span></div>';
    h+=eqs.map(function(o){return '<div class="eq"><div class="eq-top"><h4>'+esc(o.e.n)+'</h4></div><div class="formula">'+fmt(o.e.e,o.e.cond)+'</div>'+
      '<div class="eq-line"><b>考点</b><span>'+esc(o.e.tip)+'</span></div></div>';}).join('');
  }
  if(qs.length){
    h+='<div class="sec-head"><h3>收藏的题目</h3><span class="more">'+qs.length+' 题</span></div>';
    h+=qs.map(function(o){return '<div class="wrong-item"><p class="t">'+rich(o.q.q)+'</p><div class="a">答案：'+['A','B','C','D'][o.q.a]+'</div>'+
      '<div class="e">'+rich(o.q.ex)+'</div></div>';}).join('');
  }
  return h;
}

/* ---------------- 我的 ---------------- */
function renderMine(){
  var pct=TOTAL_KP?Math.round(S.learned.size/TOTAL_KP*100):0;
  var rate=S.stats.total?Math.round(S.stats.correct/S.stats.total*100):0;
  var h='<div class="profile"><div class="avatar">化</div><div><h3>化学学习助手</h3><p>人教版九年级 · 已坚持学习 '+Math.max(1,Math.ceil(S.stats.total/5))+' 天</p></div></div>';
  h+='<div class="card"><div class="sec-head" style="margin:0 0 10px"><h3>知识点掌握进度</h3><span class="more">'+S.learned.size+' / '+TOTAL_KP+'</span></div>'+
     '<div class="bar-row"><div class="l"><span>总体进度</span><b>'+pct+'%</b></div><div class="bar-track"><i style="width:'+pct+'%"></i></div></div>';
  h+=C.map(function(c,i){
    var d=c.points.reduce(function(n,p,j){return n+(S.learned.has(kpKey(i,j))?1:0)},0);
    var v=Math.round(d/c.points.length*100);
    return '<div class="bar-row hue-'+c.hue+'"><div class="l"><span>'+esc(c.t)+'</span><b>'+d+'/'+c.points.length+'</b></div><div class="bar-track"><i style="width:'+v+'%"></i></div></div>';
  }).join('')+'</div>';
  h+='<div class="stat-grid"><div class="stat-box"><b>'+S.stats.total+'</b><span>累计答题</span></div>'+
     '<div class="stat-box"><b>'+rate+'%</b><span>正确率</span></div>'+
     '<div class="stat-box"><b>'+(S.favKp.size+S.favEq.size)+'</b><span>收藏内容</span></div></div>';
  h+='<div class="menu">'+
     '<button class="menu-item" data-act="quiz-tab" data-t="wrong"><span class="mi">'+ic('info')+'</span>错题本<span class="v">'+S.wrong.length+' 题待复习</span><span class="arrow">'+ic('right')+'</span></button>'+
     '<button class="menu-item" data-act="quiz-tab" data-t="fav"><span class="mi">'+ic('star')+'</span>我的收藏<span class="v">'+(S.favKp.size+S.favEq.size)+' 条</span><span class="arrow">'+ic('right')+'</span></button>'+
     '<button class="menu-item" data-act="about"><span class="mi">'+ic('bulb')+'</span>关于本应用<span class="arrow">'+ic('right')+'</span></button>'+
     '<button class="menu-item" data-act="clear-wrong"><span class="mi" style="background:var(--warn-soft)">'+ic('trash')+'</span>清空错题本<span class="arrow">'+ic('right')+'</span></button>'+
     '<button class="menu-item" data-act="reset"><span class="mi" style="background:var(--err-soft)">'+ic('refresh')+'</span>重置全部学习记录<span class="arrow">'+ic('right')+'</span></button>'+
     '</div>';
  h+='<p style="text-align:center;color:var(--muted);font-size:10.5px;margin:14px 0 0">数据仅保存在本机浏览器，不会上传 · v1.0</p>';
  return h;
}

/* ---------------- 弹层内容 ---------------- */
function openKp(ci,pi){
  var c=C[ci],p=c.points[pi],key=kpKey(ci,pi);
  openSheet(p.t,'<div class="hue-'+c.hue+'"><div style="display:flex;gap:6px;margin-bottom:10px"><span class="tag gray">'+esc(c.t)+'</span>'+
    '<span class="tag gray">第 '+(pi+1)+' 个知识点</span></div>'+
    '<div class="kp-sum" style="background:var(--hs);color:var(--h);border-radius:9px;padding:9px 11px;font-size:12.5px;font-weight:600;margin-bottom:12px">'+rich(p.s)+'</div>'+
    '<ul style="margin-bottom:12px">'+p.d.map(function(d){return '<li style="position:relative;padding-left:14px;font-size:12.5px;line-height:1.8;color:var(--sub);margin-bottom:6px"><span style="position:absolute;left:2px;top:9px;width:5px;height:5px;border-radius:50%;background:var(--h);opacity:.6"></span>'+rich(d)+'</li>';}).join('')+'</ul>'+
    '<div class="tip" style="background:var(--warn-soft);border-radius:9px;padding:10px 11px;font-size:12px;color:#9A6518"><b>易错提醒</b><span>'+rich(p.tip)+'</span></div>'+
    '<div style="display:flex;gap:9px;margin-top:16px"><button class="btn ghost block" data-act="fav-kp" data-key="'+key+'">'+ic('star')+(S.favKp.has(key)?'取消收藏':'收藏')+'</button>'+
    '<button class="btn block" data-act="learn" data-key="'+key+'">'+ic('check')+(S.learned.has(key)?'取消已学':'标记已学')+'</button></div></div>');
}
function openEl(z){
  var e=null; E.forEach(function(x){if(x.z===z)e=x;}); if(!e)return;
  var color=e.cat==='金属'?'#F0A24A':e.cat==='稀有气体'?'#9B7BE8':e.cat==='类金属'?'#63B98A':'#48B4D8';
  var rows=[['原子序数',e.z],['元素符号',e.sym],['相对原子质量',e.mass],['元素类别',e.cat],['常见化合价',e.val],['周期 / 最外层电子',e.p?('第 '+e.p+' 周期 · '+outerElectrons(e)+' 个电子'):'常考补充元素']];
  openSheet(e.name+' · '+e.sym,'<div class="el-detail"><div class="big" style="--h:'+color+';--hs:#F4F8FA">'+
    '<div class="box" style="background:'+color+'"><b>'+e.sym+'</b><span>'+e.z+'</span></div>'+
    '<div><h3>'+esc(e.name)+'</h3><p>'+esc(e.cat)+' · 相对原子质量 '+e.mass+'</p></div></div>'+
    rows.map(function(r){return '<div class="info-row"><span>'+r[0]+'</span><b>'+esc(r[1])+'</b></div>';}).join('')+
    '<div class="tip" style="background:var(--brand-soft);color:var(--brand-d);border-radius:10px;padding:11px;margin-top:14px;font-size:12px;line-height:1.7"><b>考点</b><span>'+rich(e.note)+'</span></div></div>');
}
function aboutHtml(){
  return '<div style="font-size:12.5px;line-height:1.85;color:var(--sub)">'+
    '<p><b style="color:var(--text)">初中化学学习小程序</b> v1.0</p>'+
    '<p>依据人教版《化学》九年级上册、下册整理，覆盖 '+C.length+' 个单元、'+TOTAL_KP+' 个知识点、'+E.length+' 种元素、'+Q.length+' 条化学方程式、'+K.length+' 张速查口诀、'+QUIZ.length+' 道带解析的练习题。</p>'+
    '<p>功能：知识课堂、元素周期表、方程式速查、必背口诀、闯关练习、错题本、收藏夹、学习进度统计。</p>'+
    '<p>所有学习数据保存在本机浏览器（localStorage），不上传、不联网，清除浏览器数据会一并清空。</p>'+
    '<p style="color:var(--muted);font-size:11px">题目与知识点仅供复习参考，请以教材和课堂讲授为准。</p></div>';
}

/* ---------------- 主渲染 ---------------- */
function render(){
  renderChrome();
  var h;
  switch(S.view){
    case 'home': h=renderHome();break;
    case 'knowledge': h=renderKnowledge();break;
    case 'chapter': h=renderChapter(S.chapter);break;
    case 'tools': h=renderTools();break;
    case 'quiz': h=renderQuiz();break;
    case 'mine': h=renderMine();break;
    default: h=renderHome();
  }
  $page.className='page'; void $page.offsetWidth;
  $page.className='page active'; $page.innerHTML=h;
}

/* ---------------- 事件 ---------------- */
function onAct(act,el,e){
  var d=el.dataset;
  switch(act){
    case 'tab': go(d.tab); break;
    case 'back': go('knowledge','knowledge'); break;
    case 'quick':
      if(d.to==='toolseq'){ S.toolTab='equation'; go('tools'); }
      else go(d.to);
      break;
    case 'open-ch': S.chapter=+d.i; go('knowledge','chapter'); break;
    case 'open-kp': openKp(+d.ci,+d.pi); break;
    case 'learn': {
      var k=d.key;
      if(S.learned.has(k)){S.learned.delete(k);toast('已取消掌握标记');}
      else{S.learned.add(k);toast('已标记为掌握');}
      save(); closeSheet(); render(); break;
    }
    case 'fav-kp': {
      var k2=d.key;
      if(S.favKp.has(k2)){S.favKp.delete(k2);toast('已取消收藏');}
      else{S.favKp.add(k2);toast('已加入收藏');}
      save(); closeSheet(); render(); break;
    }
    case 'fav-quiz': {
      var qk='q:'+d.i;
      if(S.favKp.has(qk)){S.favKp.delete(qk);toast('已取消收藏');}
      else{S.favKp.add(qk);toast('本题已收藏');}
      save(); refreshQuiz(); renderChrome(); break;
    }
    case 'tool-tab': S.toolTab=d.t; render(); $page.scrollTop=0; break;
    case 'eq-cat': S.eqCat=d.c; render(); $page.scrollTop=0; break;
    case 'fav-eq': {
      var i=+d.i;
      if(S.favEq.has(i)){S.favEq.delete(i);toast('已取消收藏');}else{S.favEq.add(i);toast('方程式已收藏');}
      save(); var l=document.getElementById('eqList'); if(l)l.innerHTML=eqListHtml(); break;
    }
    case 'clear-eq': S.eqQuery=''; render(); break;
    case 'clear-kp': S.kpQuery=''; render(); break;
    case 'el': openEl(+d.z); break;
    case 'daily':
      S.quizTab='practice'; S.q={order:[dailyIndex()],idx:0,picked:null,sessionCorrect:0,sessionTotal:0};
      S.quizMode='全部题目'; go('quiz'); break;
    case 'quiz-ch':
      S.quizTab='practice'; if(startQuiz(d.ch)) go('quiz'); break;
    case 'quiz-tab': S.quizTab=d.t; if(S.tab!=='quiz'){go('quiz');}else{render();$page.scrollTop=0;} break;
    case 'quiz-mode':
      S.quizTab='practice'; if(startQuiz(d.m)){ render(); $page.scrollTop=0; } break;
    case 'opt': {
      if(S.q.picked!==null)return;
      var pick=+d.i, qi=S.q.order[S.q.idx], qq=QUIZ[qi];
      S.q.picked=pick; S.q.sessionTotal++; S.stats.total++;
      if(pick===qq.a){ S.q.sessionCorrect++; S.stats.correct++; }
      else if(S.wrong.indexOf(qi)<0) S.wrong.push(qi);
      save(); refreshQuiz(); renderChrome(); break;
    }
    case 'next-q': S.q.idx++; S.q.picked=null; refreshQuiz(); break;
    case 'restart': startQuiz(S.quizMode); render(); $page.scrollTop=0; break;
    case 'retry-wrong':
      S.quizTab='practice'; if(startQuiz('错题重练')){ render(); $page.scrollTop=0; } break;
    case 'wrong-remove': {
      var qi2=+d.i, p=S.wrong.indexOf(qi2);
      if(p>=0)S.wrong.splice(p,1); save(); render(); toast('已移出错题本'); break;
    }
    case 'clear-wrong': confirmDo('清空错题本','将移除全部 '+S.wrong.length+' 道错题，此操作不可撤销。',function(){
      S.wrong=[];save();render();toast('错题本已清空'); }); break;
    case 'reset': confirmDo('重置学习记录','将清空已学标记、收藏、错题和答题统计，且不可恢复。',function(){
      S.learned.clear();S.favKp.clear();S.favEq.clear();S.wrong=[];S.stats={total:0,correct:0};
      save();startQuiz('全部题目');render();toast('已重置全部记录'); }); break;
    case 'about': openSheet('关于本应用',aboutHtml()); break;
    case 'close-sheet': closeSheet(); break;
    case 'confirm-ok': { var fn=S.pending; S.pending=null; closeSheet(); if(fn)fn(); break; }
  }
}

function init(){
  $page=document.getElementById('page');
  $navTitle=document.getElementById('navTitle');
  $navBack=document.getElementById('navBack');
  $mask=document.getElementById('mask');
  $sheet=document.getElementById('sheet');
  $sheetTitle=document.getElementById('sheetTitle');
  $sheetBody=document.getElementById('sheetBody');
  $toast=document.getElementById('toast');
  $tabbar=document.getElementById('tabbar');

  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-act]');
    if(t){ e.preventDefault(); onAct(t.dataset.act,t,e); return; }
    if(e.target.id==='mask'){ closeSheet(); }
  });
  document.addEventListener('input',function(e){
    var type=e.target.dataset.search;
    if(type==='kp'){
      S.kpQuery=e.target.value;
      var r=document.getElementById('kpResults'); if(r)r.innerHTML=kpResultsHtml();
      var c=document.querySelector('[data-act="clear-kp"]');
      if(S.kpQuery&&!c){ e.target.insertAdjacentHTML('afterend','<span class="clear" data-act="clear-kp">×</span>'); }
      else if(!S.kpQuery&&c){ c.remove(); }
    }else if(type==='eq'){
      S.eqQuery=e.target.value;
      var l=document.getElementById('eqList'); if(l)l.innerHTML=eqListHtml();
      var c2=document.querySelector('[data-act="clear-eq"]');
      if(S.eqQuery&&!c2){ e.target.insertAdjacentHTML('afterend','<span class="clear" data-act="clear-eq">×</span>'); }
      else if(!S.eqQuery&&c2){ c2.remove(); }
    }
  });
  // 状态栏时间
  function tick(){
    var d=new Date(), hh=('0'+d.getHours()).slice(-2), mm=('0'+d.getMinutes()).slice(-2);
    var el=document.getElementById('clock'); if(el)el.textContent=hh+':'+mm;
  }
  tick(); setInterval(tick,30000);

  startQuiz('全部题目');
  render();
}
init();
})();
