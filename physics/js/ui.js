/* ============================================================
   物理小课 · 图形层：图标 / 示意图 / 交互实验绘图
   ============================================================ */

/* ---------------- 线性图标 ---------------- */
const ICONS = {
  home:'<path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  book:'<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 17.5h16"/><path d="M8 7h8M8 11h6"/>',
  flask:'<path d="M9 2h6M10 2v6L4.5 18a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 8V2"/><path d="M7.5 14h9"/><circle cx="11" cy="17" r=".7" fill="currentColor" stroke="none"/><circle cx="14" cy="18" r=".5" fill="currentColor" stroke="none"/>',
  quiz:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 3.5V2h6v1.5M8 9h8M8 13h8M8 17h5"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',
  arrow:'<path d="M9 5l7 7-7 7"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
  star:'<path d="m12 2.8 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.4l6.2-.9z"/>',
  check:'<path d="m4 12.5 5.2 5.2L20 7"/>',
  refresh:'<path d="M20 11a8 8 0 1 0-2.3 6.4"/><path d="M20 4v7h-7"/>',
  fire:'<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-9-1 2-2 2.5-3 3 0-3-2-5-3-6 0 4-4 6-4 12a7 7 0 0 0 7 7z"/>',
  wrong:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>',
  formula:'<path d="M6 3h12l-6 8 6 10H6"/><path d="M4 12h5"/>',
  chart:'<path d="M4 20V4M4 20h16"/><rect x="7" y="12" width="3" height="5"/><rect x="12" y="8" width="3" height="9"/><rect x="17" y="5" width="3" height="12"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.5"/>',
  play:'<path d="M7 4.5 19 12 7 19.5z"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
  bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5.9 1.2.9 1.9V16h5.2v-.2c0-.7.3-1.4.9-1.9A6 6 0 0 0 12 3z"/>',
  sound:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a7.5 7.5 0 0 1 0 11"/>',
  light:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  thermal:'<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/><path d="M12 10v6"/>',
  mechanics:'<path d="M3 18h18M12 18v-3M6 15h12"/><path d="M6 15 4 8h4zM18 15l-2-7h4z"/>',
  electricity:'<path d="M13 2 5 13h6l-1 9 8-12h-6z"/>',
  magnetism:'<path d="M6 4v8a6 6 0 0 0 12 0V4h-4v8a2 2 0 0 1-4 0V4z"/><path d="M6 7h4M14 7h4"/>',
  close:'<path d="M6 6l12 12M18 6 6 18"/>'
};
function icon(name){
  return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
}
function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ---------------- SVG 公共片段 ---------------- */
const SVG_DEF = '<defs>' +
  '<marker id="arwP" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="#4F46E5"/></marker>' +
  '<marker id="arwO" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="#F59E0B"/></marker>' +
  '<marker id="arwG" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="#10B981"/></marker>' +
  '<marker id="arwR" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="#EF4444"/></marker>' +
  '<marker id="arwS" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="#94A3B8"/></marker>' +
  '</defs>';
function svgBox(inner, h){
  h = h || 170;
  return '<svg viewBox="0 0 320 ' + h + '" xmlns="http://www.w3.org/2000/svg" style="font-family:-apple-system,PingFang SC,Microsoft YaHei,sans-serif">' + SVG_DEF + inner + '</svg>';
}
function txt(x, y, s, opt){
  opt = opt || {};
  return '<text x="' + x + '" y="' + y + '" font-size="' + (opt.size || 11) + '" fill="' + (opt.fill || '#64748B') + '"' +
    (opt.anchor ? ' text-anchor="' + opt.anchor + '"' : '') +
    (opt.bold ? ' font-weight="700"' : '') + '>' + s + '</text>';
}
function line(x1, y1, x2, y2, opt){
  opt = opt || {};
  return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (opt.c || '#475569') +
    '" stroke-width="' + (opt.w || 1.6) + '"' +
    (opt.opacity ? ' opacity="' + opt.opacity + '"' : '') +
    (opt.dash ? ' stroke-dasharray="' + opt.dash + '"' : '') +
    (opt.marker ? ' marker-end="url(#' + opt.marker + ')"' : '') + '/>';
}

/* ---------------- 知识点示意图 ---------------- */
const DIAGRAMS = {
  sound_wave: () => svgBox(
    // 音叉
    '<path d="M46 40 v55 M64 40 v55 M55 95 v28" stroke="#4F46E5" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    '<path d="M40 34 q15 -9 30 0" stroke="#4F46E5" stroke-width="3" fill="none"/>' +
    txt(55, 145, '音叉振动发声', {anchor:'middle', size:10}) +
    // 疏密相间的空气分子
    (function(){
      let s = '';
      const groups = [[112,4],[128,7],[146,11],[168,11],[190,7],[208,4],[228,9],[250,9]];
      groups.forEach(g => {
        for(let i=0;i<g[1];i++){
          const y = 36 + i * (100 / Math.max(g[1]-1,1));
          s += '<circle cx="' + g[0] + '" cy="' + y.toFixed(1) + '" r="2.6" fill="#7C9CC4" opacity=".8"/>';
        }
      });
      return s;
    })() +
    line(100, 26, 285, 26, {c:'#F59E0B', w:2, marker:'arwO'}) +
    txt(192, 20, '声波向远处传播', {anchor:'middle', fill:'#D97706', size:10}) +
    txt(192, 158, '真空不能传声 · 传播需要介质', {anchor:'middle', size:10, fill:'#94A3B8'})
  ),

  pinhole: () => svgBox(
    // 屏障
    '<rect x="154" y="18" width="8" height="60" fill="#CBD5E1"/>' +
    '<rect x="154" y="98" width="8" height="58" fill="#CBD5E1"/>' +
    txt(158, 14, '小孔', {anchor:'middle', size:10}) +
    // 左侧物体（向上箭头）
    line(65, 120, 65, 45, {c:'#EF4444', w:3, marker:'arwR'}) +
    txt(65, 136, '物体', {anchor:'middle', size:10, fill:'#EF4444'}) +
    // 光线：物体顶端的光穿过小孔后到达光屏下部，底端的光到达上部
    line(65, 45, 158, 88, {c:'#F59E0B', w:1.5}) +
    line(158, 88, 280, 144, {c:'#F59E0B', w:1.5}) +
    line(65, 120, 158, 88, {c:'#F59E0B', w:1.5, dash:'5 4'}) +
    line(158, 88, 280, 46, {c:'#F59E0B', w:1.5, dash:'5 4'}) +
    // 右侧倒立像
    '<rect x="278" y="20" width="4" height="140" fill="#CBD5E1"/>' +
    line(268, 46, 268, 144, {c:'#4F46E5', w:3, marker:'arwP'}) +
    txt(268, 160, '倒立实像', {anchor:'middle', size:10, fill:'#4F46E5'}) +
    txt(160, 165, '像的形状与孔的形状无关', {anchor:'middle', size:9.5, fill:'#94A3B8'})
  ),

  reflection: () => svgBox(
    // 镜面
    line(20, 128, 300, 128, {c:'#475569', w:2.5}) +
    (function(){let s='';for(let x=25;x<300;x+=12)s+=line(x,128,x-7,138,{c:'#CBD5E1',w:1.2});return s;})() +
    // 法线
    line(160, 18, 160, 150, {c:'#94A3B8', w:1.4, dash:'5 5'}) +
    txt(165, 26, '法线', {size:10}) +
    // 入射与反射
    line(72, 28, 160, 128, {c:'#F59E0B', w:2.2, marker:'arwO'}) +
    line(160, 128, 248, 28, {c:'#4F46E5', w:2.2, marker:'arwP'}) +
    // 角弧
    '<path d="M160 96 A32 32 0 0 0 141 104" stroke="#F59E0B" stroke-width="1.5" fill="none"/>' +
    '<path d="M160 96 A32 32 0 0 1 179 104" stroke="#4F46E5" stroke-width="1.5" fill="none"/>' +
    txt(140, 92, 'i', {size:12, fill:'#D97706', bold:true}) +
    txt(178, 92, 'r', {size:12, fill:'#4F46E5', bold:true}) +
    txt(60, 22, '入射光线', {size:10, fill:'#D97706'}) +
    txt(238, 22, '反射光线', {size:10, fill:'#4F46E5'}) +
    txt(160, 160, '反射角 = 入射角（都是与法线的夹角）', {anchor:'middle', size:10.5, fill:'#334155', bold:true})
  ),

  refraction: () => svgBox(
    '<rect x="20" y="90" width="280" height="70" fill="#DBF0FB" opacity=".75"/>' +
    line(20, 90, 300, 90, {c:'#0284C7', w:2}) +
    txt(30, 40, '空气', {size:11, fill:'#64748B'}) +
    txt(30, 150, '水', {size:11, fill:'#0284C7', bold:true}) +
    line(160, 12, 160, 160, {c:'#94A3B8', w:1.4, dash:'5 5'}) +
    line(88, 20, 160, 90, {c:'#F59E0B', w:2.2, marker:'arwO'}) +
    line(160, 90, 210, 158, {c:'#4F46E5', w:2.2, marker:'arwP'}) +
    line(160, 90, 232, 20, {c:'#CBD5E1', w:1.5, dash:'5 4'}) +
    txt(238, 20, '原方向', {size:9, fill:'#94A3B8'}) +
    txt(196, 106, 'r', {size:12, fill:'#4F46E5', bold:true}) +
    txt(146, 76, 'i', {size:12, fill:'#D97706', bold:true}) +
    txt(160, 12, '法线', {anchor:'middle', size:10}) +
    txt(160, 168, '空气 → 水：折射角 r < 入射角 i（向法线偏折）', {anchor:'middle', size:10, fill:'#334155', bold:true})
  ),

  lens: () => svgBox(
    // 主轴
    line(20, 100, 300, 100, {c:'#94A3B8', w:1.3, dash:'6 4'}) +
    // 凸透镜
    '<path d="M158 34 Q172 100 158 166 Q144 100 158 34 Z" fill="#C7D7FE" stroke="#4F46E5" stroke-width="1.8" opacity=".9"/>' +
    // 焦点标注
    '<path d="M110 95 v10 M206 95 v10 M62 95 v10 M254 95 v10" stroke="#94A3B8" stroke-width="1.5"/>' +
    txt(110, 117, 'F', {anchor:'middle', size:10}) +
    txt(206, 117, 'F', {anchor:'middle', size:10}) +
    txt(62, 117, '2F', {anchor:'middle', size:10}) +
    txt(254, 117, '2F', {anchor:'middle', size:10}) +
    // 物体（2F 之外）
    line(42, 100, 42, 52, {c:'#EF4444', w:3, marker:'arwR'}) +
    txt(42, 44, '物体', {anchor:'middle', size:10, fill:'#EF4444'}) +
    // 两条典型光线
    line(42, 52, 158, 52, {c:'#F59E0B', w:1.4}) +
    line(158, 52, 240, 134, {c:'#F59E0B', w:1.4}) +
    line(42, 52, 240, 134, {c:'#10B981', w:1.4, dash:'5 4'}) +
    // 像（倒立缩小，位于 F 与 2F 之间）
    line(240, 100, 240, 134, {c:'#4F46E5', w:3, marker:'arwP'}) +
    txt(240, 150, '倒立缩小实像', {anchor:'middle', size:10, fill:'#4F46E5', bold:true}) +
    txt(160, 168, 'u > 2f：照相机原理 · 物近像远像变大', {anchor:'middle', size:10, fill:'#334155'})
  ),

  melting: () => svgBox(
    // 坐标轴
    line(40, 145, 300, 145, {c:'#475569', w:1.6, marker:'arwS'}) +
    line(40, 145, 40, 18, {c:'#475569', w:1.6, marker:'arwS'}) +
    txt(300, 160, '时间', {anchor:'end', size:10}) +
    txt(12, 24, '温度', {size:10}) +
    // 水平熔点线
    line(40, 88, 285, 88, {c:'#CBD5E1', w:1.2, dash:'4 4'}) +
    txt(38, 84, '熔点', {anchor:'end', size:10, fill:'#EF4444'}) +
    // 折线
    '<polyline points="45,132 90,88 190,88 250,42" fill="none" stroke="#4F46E5" stroke-width="2.8" stroke-linejoin="round"/>' +
    txt(62, 122, '固态升温', {size:9.5, fill:'#64748B'}) +
    txt(112, 80, '熔化：吸热但温度不变', {size:9.5, fill:'#D97706', bold:true}) +
    txt(212, 38, '液态升温', {size:9.5, fill:'#64748B'}) +
    txt(140, 106, '固液共存 · 内能持续增大', {anchor:'middle', size:9.5, fill:'#4F46E5'}) +
    txt(160, 174, '晶体有固定熔点，非晶体没有水平段', {anchor:'middle', size:10, fill:'#334155'})
  , 182),

  heat: () => svgBox(
    line(40, 145, 300, 145, {c:'#475569', w:1.6, marker:'arwS'}) +
    line(40, 145, 40, 20, {c:'#475569', w:1.6, marker:'arwS'}) +
    txt(302, 160, '加热时间', {anchor:'end', size:10}) +
    txt(12, 26, '温度', {size:10}) +
    // 两条升温曲线
    '<polyline points="45,132 120,112 195,94 270,76" fill="none" stroke="#4F46E5" stroke-width="2.6"/>' +
    '<polyline points="45,132 120,92 195,54 270,26" fill="none" stroke="#EF6A5B" stroke-width="2.6"/>' +
    txt(232, 88, '水（c 大）', {size:10, fill:'#4F46E5', bold:true}) +
    txt(228, 34, '油（c 小）', {size:10, fill:'#EF6A5B', bold:true}) +
    txt(160, 174, '等质量、吸收相同热量：c 越大，升温越慢', {anchor:'middle', size:10, fill:'#334155'})
  , 182),

  pressure: () => svgBox(
    // 容器与水
    '<path d="M80 22 h150 v132 h-150 Z" fill="#E8F5FD" stroke="#475569" stroke-width="2"/>' +
    '<rect x="81" y="45" width="148" height="108" fill="#BFE4F8"/>' +
    line(81,45,229,45,{c:'#0284C7',w:1.6}) +
    txt(120, 38, '水面', {anchor:'middle', size:10, fill:'#0284C7'}) +
    // 三个小孔与水柱
    '<circle cx="230" cy="70" r="3" fill="#0284C7"/><circle cx="230" cy="105" r="3" fill="#0284C7"/><circle cx="230" cy="140" r="3" fill="#0284C7"/>' +
    // 越深处压强越大，水喷得越远
    '<path d="M233 70 Q248 84 262 154" fill="none" stroke="#38BDF8" stroke-width="2.4"/>' +
    '<path d="M233 105 Q266 114 286 154" fill="none" stroke="#38BDF8" stroke-width="2.4"/>' +
    '<path d="M233 140 Q278 144 306 154" fill="none" stroke="#38BDF8" stroke-width="2.4" marker-end="url(#arwP)"/>' +
    txt(242, 62, 'h₁', {size:9.5}) + txt(242, 98, 'h₂', {size:9.5}) + txt(242, 133, 'h₃', {size:9.5}) +
    txt(160, 174, '深度越大，p = ρgh 越大，水喷得越远', {anchor:'middle', size:10, fill:'#334155'})
  , 182),

  buoyancy: () => svgBox(
    '<path d="M70 30 h180 v120 h-180" fill="#DBF0FB" stroke="#475569" stroke-width="2"/>' +
    '<rect x="71" y="45" width="178" height="104" fill="#BFE4F8" opacity=".8"/>' +
    '<rect x="130" y="72" width="60" height="52" fill="#C7D7FE" stroke="#4F46E5" stroke-width="2" rx="3"/>' +
    txt(160, 104, '物体', {anchor:'middle', size:11, fill:'#4F46E5', bold:true}) +
    line(160, 72, 160, 22, {c:'#10B981', w:2.6, marker:'arwG'}) +
    txt(166, 20, 'F浮', {size:11, fill:'#059669', bold:true}) +
    line(160, 124, 160, 168, {c:'#EF4444', w:2.6, marker:'arwR'}) +
    txt(166, 166, 'G', {size:11, fill:'#DC2626', bold:true}) +
    txt(160, 182, 'F浮 = ρ液 g V排　·　浸没时浮力与深度无关', {anchor:'middle', size:10.5, fill:'#334155'})
  , 190),

  lever: () => svgBox(
    // 杠杆
    '<rect x="35" y="92" width="250" height="9" rx="4" fill="#CBD5E1" stroke="#94A3B8"/>' +
    // 支点
    '<path d="M150 101 L138 126 L162 126 Z" fill="#94A3B8"/>' +
    line(120, 132, 180, 132, {c:'#475569', w:1.5}) +
    txt(150, 146, '支点 O', {anchor:'middle', size:10}) +
    // 力
    line(60, 30, 60, 90, {c:'#EF4444', w:2.6, marker:'arwR'}) +
    txt(60, 24, 'F₁', {anchor:'middle', size:12, fill:'#DC2626', bold:true}) +
    line(260, 30, 260, 90, {c:'#4F46E5', w:2.6, marker:'arwP'}) +
    txt(260, 24, 'F₂', {anchor:'middle', size:12, fill:'#4F46E5', bold:true}) +
    // 力臂
    line(60, 60, 150, 60, {c:'#F59E0B', w:1.5, dash:'4 3'}) +
    line(150, 60, 260, 60, {c:'#F59E0B', w:1.5, dash:'4 3'}) +
    txt(105, 55, 'l₁', {anchor:'middle', size:11, fill:'#D97706', bold:true}) +
    txt(205, 55, 'l₂', {anchor:'middle', size:11, fill:'#D97706', bold:true}) +
    txt(160, 166, '杠杆平衡：F₁l₁ = F₂l₂　力臂是到作用线的垂直距离', {anchor:'middle', size:10, fill:'#334155'})
  ),

  circuit_series: () => svgBox(
    // 回路
    '<path d="M50 45 H270 V140 H50 V105" fill="none" stroke="#475569" stroke-width="2.2"/>' +
    // 电源（左竖线）
    line(50, 108, 50, 88, {c:'#475569', w:2.2}) +
    line(38, 84, 62, 84, {c:'#EF4444', w:2.6}) +
    line(42, 96, 58, 96, {c:'#475569', w:2.6}) +
    txt(26, 88, '电源', {size:10}) +
    // 开关
    line(92, 45, 112, 45, {c:'#475569', w:2.2}) +
    line(112, 45, 132, 32, {c:'#4F46E5', w:2.2}) +
    '<circle cx="112" cy="45" r="2.6" fill="#4F46E5"/><circle cx="136" cy="45" r="2.6" fill="#4F46E5"/>' +
    txt(112, 24, '开关', {anchor:'middle', size:10}) +
    // 电阻 R1 R2
    '<rect x="152" y="36" width="40" height="18" fill="#EEF0FF" stroke="#4F46E5" stroke-width="1.8"/>' +
    '<rect x="212" y="36" width="40" height="18" fill="#EEF0FF" stroke="#4F46E5" stroke-width="1.8"/>' +
    txt(172, 32, 'R₁', {anchor:'middle', size:10}) + txt(232, 32, 'R₂', {anchor:'middle', size:10}) +
    // 电流表
    '<circle cx="160" cy="140" r="15" fill="#FFF6E5" stroke="#F59E0B" stroke-width="2"/>' +
    txt(160, 145, 'A', {anchor:'middle', size:13, fill:'#D97706', bold:true}) +
    // 电流方向
    line(70, 60, 100, 60, {c:'#10B981', w:2, marker:'arwG'}) +
    txt(85, 54, 'I', {anchor:'middle', size:11, fill:'#059669', bold:true}) +
    txt(160, 166, '串联：I = I₁ = I₂　U = U₁ + U₂', {anchor:'middle', size:10.5, fill:'#334155', bold:true})
  ),

  ohm_graph: () => svgBox(
    line(42, 145, 300, 145, {c:'#475569', w:1.6, marker:'arwS'}) +
    line(42, 145, 42, 18, {c:'#475569', w:1.6, marker:'arwS'}) +
    txt(304, 158, 'U / V', {anchor:'end', size:10}) +
    txt(16, 24, 'I / A', {size:10}) +
    line(42, 145, 268, 28, {c:'#4F46E5', w:2.5}) +
    line(42, 145, 268, 86, {c:'#94A3B8', w:1.8, dash:'5 4'}) +
    txt(250, 30, 'R 小', {size:10, fill:'#4F46E5', bold:true}) +
    txt(250, 84, 'R 大', {size:10, fill:'#94A3B8'}) +
    txt(160, 166, 'R 一定时，I 与 U 成正比（过原点的直线）', {anchor:'middle', size:10, fill:'#334155'})
  ),

  magnet: () => svgBox(
    // 条形磁铁
    '<rect x="110" y="72" width="100" height="36" rx="3" fill="#FCA5A5" stroke="#475569" stroke-width="1.5"/>' +
    '<rect x="160" y="72" width="50" height="36" fill="#93C5FD"/>' +
    txt(135, 95, 'N', {anchor:'middle', size:16, fill:'#7F1D1D', bold:true}) +
    txt(185, 95, 'S', {anchor:'middle', size:16, fill:'#1E3A8A', bold:true}) +
    // 外部磁感线：从 N 极出发绕到 S 极（内部由 S 回到 N，构成闭合曲线）
    '<path d="M110 72 Q160 -30 210 72" fill="none" stroke="#4F46E5" stroke-width="1.5"/>' +
    '<path d="M110 72 Q160 2 210 72" fill="none" stroke="#4F46E5" stroke-width="1.5" marker-end="url(#arwP)"/>' +
    '<path d="M110 72 Q160 42 210 72" fill="none" stroke="#7C3AED" stroke-width="1.5"/>' +
    '<path d="M110 108 Q160 146 210 108" fill="none" stroke="#7C3AED" stroke-width="1.5"/>' +
    '<path d="M110 108 Q160 170 210 108" fill="none" stroke="#4F46E5" stroke-width="1.5"/>' +
    '<rect x="16" y="8" width="82" height="17" rx="4" fill="#FBFCFF" opacity=".92"/>' +
    txt(22, 20, '外部 N → S', {size:10, fill:'#4F46E5', bold:true}) +
    txt(160, 152, '磁感线是假想的闭合曲线（内部 S → N），疏密表示强弱', {anchor:'middle', size:9.5, fill:'#334155'}) +
    txt(160, 166, '地理北极附近是地磁南极', {anchor:'middle', size:9.5, fill:'#94A3B8'})
  , 176),

  induction: () => svgBox(
    // 磁极
    '<rect x="40" y="25" width="90" height="20" fill="#FCA5A5" stroke="#475569"/>' +
    '<rect x="40" y="140" width="90" height="20" fill="#93C5FD" stroke="#475569"/>' +
    txt(85, 39, 'N', {anchor:'middle', size:12, fill:'#7F1D1D', bold:true}) +
    txt(85, 155, 'S', {anchor:'middle', size:12, fill:'#1E3A8A', bold:true}) +
    // 磁感线
    line(58, 48, 58, 136, {c:'#CBD5E1', w:1.4, dash:'4 4', marker:'arwS'}) +
    line(78, 48, 78, 136, {c:'#CBD5E1', w:1.4, dash:'4 4', marker:'arwS'}) +
    line(98, 48, 98, 136, {c:'#CBD5E1', w:1.4, dash:'4 4', marker:'arwS'}) +
    line(118, 48, 118, 136, {c:'#CBD5E1', w:1.4, dash:'4 4', marker:'arwS'}) +
    // 导体棒 ab
    line(52, 90, 190, 90, {c:'#EF4444', w:5}) +
    txt(48, 86, 'a', {size:11, fill:'#DC2626', bold:true}) +
    txt(192, 86, 'b', {size:11, fill:'#DC2626', bold:true}) +
    line(140, 70, 200, 70, {c:'#10B981', w:2.2, marker:'arwG'}) +
    txt(168, 64, '切割磁感线运动 v', {anchor:'middle', size:10, fill:'#059669'}) +
    // 电流表
    '<circle cx="262" cy="90" r="21" fill="#FFF6E5" stroke="#F59E0B" stroke-width="2"/>' +
    txt(262, 96, 'G', {anchor:'middle', size:15, fill:'#D97706', bold:true}) +
    line(190, 90, 241, 90, {c:'#475569', w:2}) +
    '<path d="M262 111 V140 H150" fill="none" stroke="#475569" stroke-width="2"/>' +
    line(150, 140, 150, 90, {c:'#475569', w:2}) +
    txt(160, 168, '闭合电路的一部分导体切割磁感线 → 产生感应电流', {anchor:'middle', size:9.5, fill:'#334155'})
  , 180)
};

function diagram(key){
  const f = DIAGRAMS[key];
  return f ? f() : '';
}

/* ============================================================
   交互实验
   ============================================================ */
const LAB_META = {
  refraction: { name:'光的反射与折射', icon:'light', desc:'拖动入射角，观察反射角与折射角如何变化，验证折射规律与全反射。' },
  lens:       { name:'凸透镜成像', icon:'light', desc:'改变物距，实时观察像的位置、大小与倒正，理解照相机、投影仪、放大镜的原理。' },
  ohm:        { name:'欧姆定律 I-U 图像', icon:'electricity', desc:'调节电压与电阻，观察 I 与 U 的正比关系及电阻对图线斜率的影响。' }
};

const LAB_STATE = {
  refraction: { i:35, medium:'air_water' },
  lens:       { u:25, f:10 },
  ohm:        { U:6, R:20 }
};

const MEDIUMS = {
  air_water:  { label:'空气 → 水',   n1:1,    n2:1.33 },
  air_glass:  { label:'空气 → 玻璃', n1:1,    n2:1.5  },
  water_air:  { label:'水 → 空气',   n1:1.33, n2:1    }
};

function labCompute(key){
  const s = LAB_STATE[key];
  if(key === 'refraction'){
    const med = MEDIUMS[s.medium];
    const rad = s.i * Math.PI / 180;
    const sinR = med.n1 * Math.sin(rad) / med.n2;
    const total = sinR > 1;
    const r = total ? null : Math.asin(sinR) * 180 / Math.PI;
    const critical = med.n1 > med.n2 ? Math.asin(med.n2/med.n1) * 180 / Math.PI : null;
    return { s, med, r, total, critical, i:s.i };
  }
  if(key === 'lens'){
    const { u, f } = s;
    const near = Math.abs(u - f) < 0.01;
    const v = near ? Infinity : f*u/(u-f);
    const real = u > f;
    const m = near ? Infinity : Math.abs(v/u);
    let kind, use;
    if(near){ kind = '不成像（光线平行射出）'; use = 'u = f 是成实像与虚像的分界点'; }
    else if(u > 2*f){ kind = '倒立、缩小的实像'; use = '照相机 / 摄像头'; }
    else if(Math.abs(u-2*f) < 0.01){ kind = '倒立、等大的实像'; use = '可用来测量焦距'; }
    else if(real){ kind = '倒立、放大的实像'; use = '投影仪 / 幻灯机'; }
    else { kind = '正立、放大的虚像'; use = '放大镜'; }
    return { s, u, f, v, real, m, near, kind, use };
  }
  // ohm
  const I = s.U / s.R;
  return { s, U:s.U, R:s.R, I };
}

function labSVG(key){
  const c = labCompute(key);
  if(key === 'refraction'){
    const { i, r, total, med } = c;
    const O = {x:160, y:100};
    const rad = i*Math.PI/180;
    const inX = O.x - 88*Math.sin(rad), inY = O.y - 88*Math.cos(rad);
    const rfX = O.x + 88*Math.sin(rad), rfY = O.y - 88*Math.cos(rad);
    let s = '';
    s += '<rect x="16" y="100" width="288" height="86" fill="#DBF0FB" opacity=".8"/>';
    s += line(16,100,304,100,{c:'#0284C7',w:2});
    s += txt(24,24,'介质1：' + med.label.split(' → ')[0],{size:10,fill:'#64748B'});
    s += txt(24,178,'介质2：' + med.label.split(' → ')[1],{size:10,fill:'#0284C7',bold:true});
    s += line(160,10,160,186,{c:'#94A3B8',w:1.3,dash:'5 5'});
    s += txt(165,18,'法线',{size:9.5});
    s += line(inX,inY,O.x,O.y,{c:'#F59E0B',w:2.4,marker:'arwO'});
    s += line(O.x,O.y,rfX,rfY,{c:'#4F46E5',w:2.4,marker:'arwP'});
    if(!total){
      const rr = r*Math.PI/180;
      s += line(O.x,O.y,O.x + 105*Math.sin(rr),O.y + 105*Math.cos(rr),{c:'#10B981',w:2.4,marker:'arwG'});
      s += txt(O.x + 44, O.y + 40, 'r = ' + r.toFixed(1) + '°', {size:10.5,fill:'#059669',bold:true});
    } else {
      s += txt(196,140,'全反射！',{size:12,fill:'#DC2626',bold:true});
      s += txt(196,156,'无折射光线',{size:10,fill:'#DC2626'});
    }
    s += txt(104,O.y-46,'i = ' + i + '°',{size:10.5,fill:'#D97706',bold:true});
    s += txt(210,O.y-46,'反射 ' + i + '°',{size:10,fill:'#4F46E5'});
    s += '<circle cx="160" cy="100" r="3" fill="#334155"/>';
    return svgBox(s, 192);
  }

  if(key === 'lens'){
    const { u, f, v, real, m, near } = c;
    const PX = x => 132 + x*2.35;
    const AXIS = 108, oh = 40;
    let s = '';
    s += '<defs><clipPath id="lensClip"><rect x="16" y="6" width="290" height="188"/></clipPath></defs>';
    s += line(16,AXIS,306,AXIS,{c:'#94A3B8',w:1.2,dash:'6 4'});
    // 焦点与 2F
    [-2*f,-f,f,2*f].forEach(d=>{
      const x = PX(d);
      if(x>18 && x<304){
        s += line(x,AXIS-5,x,AXIS+5,{c:'#94A3B8',w:1.4});
        s += txt(x,AXIS-9,Math.abs(d)===f?'F':'2F',{anchor:'middle',size:9.5});
      }
    });
    // 透镜
    s += '<path d="M132 34 Q152 108 132 182 Q112 108 132 34 Z" fill="#C7D7FE" stroke="#4F46E5" stroke-width="1.8" opacity=".92"/>';
    s += txt(132,196,'凸透镜',{anchor:'middle',size:9.5,fill:'#4F46E5'});
    // 物体
    const ox = PX(-u);
    s += line(ox,AXIS,ox,AXIS-oh,{c:'#EF4444',w:3,marker:'arwR'});
    s += txt(ox,AXIS-oh-8,'物体',{anchor:'middle',size:10,fill:'#DC2626'});
    s += txt(ox,AXIS+18,'u=' + u.toFixed(1),{anchor:'middle',size:9.5});
    s += '<g clip-path="url(#lensClip)">';
    // 光线1：平行主轴入射 → 折射后过焦点方向
    s += line(ox,AXIS-oh,132,AXIS-oh,{c:'#F59E0B',w:1.3,opacity:'.85'});
    s += line(132,AXIS-oh,306,AXIS-oh+(306-132)*oh/(f*2.35),{c:'#F59E0B',w:1.3,opacity:'.85'});
    // 光线2：过光心方向不变
    s += line(ox,AXIS-oh,306,AXIS+(306-132)*oh/(u*2.35),{c:'#10B981',w:1.3,opacity:'.85'});
    // 虚像：折射光线的反向延长线
    if(!near && !real){
      const ix = PX(v), iy = AXIS - oh*m;
      s += line(132,AXIS-oh,ix,iy,{c:'#94A3B8',w:1.2,dash:'4 4'});
      s += line(132,AXIS,ix,iy,{c:'#94A3B8',w:1.2,dash:'4 4'});
    }
    // 像
    if(!near){
      const ix = PX(v), ih = oh*m;
      const out = ix < 20 || ix > 300 || Math.abs(ih) > 88;
      if(out){
        s += '</g>';
        s += txt(real?258:66, AXIS-60, '像在视野外', {anchor:'middle',size:10,fill:'#D97706',bold:true});
        s += txt(real?258:66, AXIS-45, real?'（像距很大）':'（虚像很远且很大）', {anchor:'middle',size:9,fill:'#D97706'});
      } else {
        const y2 = real ? AXIS + ih : AXIS - ih;
        s += line(ix,AXIS,ix,y2,{c:'#4F46E5',w:3,marker:'arwP',dash:real?'':'5 4'});
        s += '</g>';
        const ly = real ? AXIS+ih+16 : AXIS-ih-8;
        s += '<rect x="' + (ix-34) + '" y="' + (ly-11) + '" width="68" height="15" rx="4" fill="#FAFBFF" opacity=".92"/>';
        s += txt(ix, ly, real?'倒立实像':'正立虚像', {anchor:'middle',size:9.5,fill:'#4F46E5',bold:true});
      }
    } else {
      s += '</g>';
      s += txt(220,44,'平行光射出，不成像',{anchor:'middle',size:10,fill:'#D97706',bold:true});
    }
    return svgBox(s, 216);
  }

  // ohm 图
  const { U, R, I } = c;
  const X = u => 46 + u*21;          // U 0~12 -> 46~298
  const Y = i => 158 - i*54;         // I 0~2.5 -> 158~23
  let s = '';
  // 网格
  for(let u=0;u<=12;u+=2) s += line(X(u),158,X(u),23,{c:'#EEF1F8',w:1}) + txt(X(u),172,String(u),{anchor:'middle',size:9,fill:'#94A3B8'});
  for(let i=0;i<=2.5;i+=0.5) s += line(46,Y(i),298,Y(i),{c:'#EEF1F8',w:1}) + txt(40,Y(i)+3,i.toFixed(1),{anchor:'end',size:9,fill:'#94A3B8'});
  s += line(46,158,304,158,{c:'#475569',w:1.6,marker:'arwS'});
  s += line(46,158,46,18,{c:'#475569',w:1.6,marker:'arwS'});
  s += txt(302,182,'U / V',{anchor:'end',size:10});
  s += txt(46,14,'I / A',{size:9.5});
  // 参考线
  [10,40].forEach(r=>{
    const imax = 12/r;
    s += line(X(0),Y(0),X(12),Y(imax),{c:'#CBD5E1',w:1.4,dash:'4 4'});
    s += txt(X(12)-4,Y(imax)-6,r+' Ω',{anchor:'end',size:9,fill:'#94A3B8'});
  });
  // 当前 R 的直线
  const icap = 12/R;
  s += line(X(0),Y(0),X(12),Y(icap),{c:'#4F46E5',w:2.6});
  // 当前点
  s += line(X(U),Y(0),X(U),Y(I),{c:'#F59E0B',w:1.3,dash:'4 3'});
  s += line(X(0),Y(I),X(U),Y(I),{c:'#F59E0B',w:1.3,dash:'4 3'});
  s += '<circle cx="' + X(U) + '" cy="' + Y(I) + '" r="5" fill="#F59E0B" stroke="#fff" stroke-width="2"/>';
  s += txt(170,192,'当前 R = ' + R + ' Ω，斜率 1/R 决定图线倾斜程度',{anchor:'middle',size:9.5,fill:'#334155'});
  return svgBox(s, 200);
}

function labReadout(key){
  const c = labCompute(key);
  if(key === 'refraction'){
    return '<div><b>' + c.i + '°</b><span>入射角 i</span></div>' +
           '<div><b>' + c.i + '°</b><span>反射角</span></div>' +
           '<div><b>' + (c.total ? '全反射' : c.r.toFixed(1) + '°') + '</b><span>折射角 r</span></div>';
  }
  if(key === 'lens'){
    const v = c.near ? '∞' : (c.real ? c.v.toFixed(1) : '−' + Math.abs(c.v).toFixed(1));
    return '<div><b>' + c.u.toFixed(1) + ' cm</b><span>物距 u</span></div>' +
           '<div><b>' + v + '</b><span>' + (c.real?'实像像距':'虚像像距') + '</span></div>' +
           '<div><b>' + (c.near ? '—' : c.m.toFixed(2) + '×') + '</b><span>放大率</span></div>';
  }
  return '<div><b>' + c.U.toFixed(1) + ' V</b><span>电压 U</span></div>' +
         '<div><b>' + c.R + ' Ω</b><span>电阻 R</span></div>' +
         '<div><b>' + c.I.toFixed(3) + ' A</b><span>电流 I = U/R</span></div>';
}

function labNote(key){
  const c = labCompute(key);
  if(key === 'refraction'){
    let t = '<b>规律：</b>反射角始终等于入射角；光从光疏介质斜射入光密介质时折射角小于入射角，反之大于入射角。';
    if(c.total) t += ' 当前入射角超过临界角 ' + c.critical.toFixed(1) + '°，发生<b>全反射</b>，折射光线消失（光纤通信的原理）。';
    else if(c.med.n1 > c.med.n2) t += ' 当前从水射向空气，折射角大于入射角；继续增大入射角到 ' + c.critical.toFixed(1) + '° 以上就会发生全反射。';
    else t += ' 试试切换到「水 → 空气」并增大入射角，观察全反射现象。';
    return t;
  }
  if(key === 'lens'){
    return '<b>' + c.kind + '</b>　·　应用：' + c.use + '。<br>' +
      '口诀：一倍焦距分虚实，二倍焦距分大小；成实像时「物近像远像变大」。';
  }
  return '<b>结论：</b>电阻 R 一定时，电流 I 与电压 U 成正比（图线是过原点的直线）；电压一定时，I 与 R 成反比。<br>' +
    '图线斜率 = 1/R，电阻越大直线越平缓。当前 I = ' + c.U.toFixed(1) + ' V / ' + c.R + ' Ω = ' + c.I.toFixed(3) + ' A。';
}

/* 实验参数控件定义 */
const LAB_CONTROLS = {
  refraction: [
    { k:'i', label:'入射角 i', min:5, max:85, step:1, fmt:v => v + '°' }
  ],
  lens: [
    { k:'u', label:'物距 u', min:6, max:40, step:0.5, fmt:v => Number(v).toFixed(1) + ' cm' }
  ],
  ohm: [
    { k:'U', label:'电压 U', min:0, max:12, step:0.5, fmt:v => Number(v).toFixed(1) + ' V' },
    { k:'R', label:'电阻 R', min:5, max:50, step:1, fmt:v => v + ' Ω' }
  ]
};
