/* Kettlebell Coach — alle logica in één bestand, zonder frameworks. */
(function () {
'use strict';

/* ================= Hulpfuncties ================= */
var DAY_MS = 86400000;
var STORAGE_KEY = 'kettlebell-coach.state.v1';
var DAGEN = ['maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag','zondag'];
var DAG_KORT = ['Ma','Di','Wo','Do','Vr','Za','Zo'];
var MAANDEN = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
var MND_KORT = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];

function pad(n){ return String(n).padStart(2,'0'); }
function iso(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function validISO(s){ return typeof s==='string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(parseISO(s).getTime()); }
function parseISO(s){ var p=s.split('-').map(Number); return new Date(p[0],p[1]-1,p[2]); }
function addDays(d,n){ return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n); }
function mondayOf(d){ var x=new Date(d.getFullYear(),d.getMonth(),d.getDate()); x.setDate(x.getDate()-((x.getDay()+6)%7)); return x; }
function wdIdx(d){ return (d.getDay()+6)%7; }
function weeksBetween(a,b){ return Math.round((mondayOf(b)-mondayOf(a))/(7*DAY_MS)); }
function todayISO(){ return iso(new Date()); }
function fmtShort(d){ return DAG_KORT[wdIdx(d)].toLowerCase()+' '+d.getDate()+' '+MND_KORT[d.getMonth()]; }
function fmtLong(d){ return DAGEN[wdIdx(d)]+' '+d.getDate()+' '+MAANDEN[d.getMonth()]; }
function fmtDay(s){ return fmtShort(parseISO(s)); }
function mmss(ms){ var s=Math.max(0,Math.ceil(ms/1000)); return pad(Math.floor(s/60))+':'+pad(s%60); }
function minutesText(sec){ var m=Math.round(sec/60); return m<1?'< 1 min':m+' min'; }
function esc(s){ return String(s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function clamp(n,a,b){ return Math.min(b,Math.max(a,n)); }
function $(s,r){ return (r||document).querySelector(s); }
function $$(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
function nl(n,dec){ return Number(n).toLocaleString('nl-NL',{minimumFractionDigits:dec||0,maximumFractionDigits:dec||0}); }

/* ================= Oefeningen ================= */
var EX = {
  deadlift:{
    name:'Kettlebell deadlift', kind:'reps', bilateral:false, pose:'deadlift',
    cue:'Heupen naar achteren, rug lang en recht.',
    muscles:'Bilspieren, hamstrings (achterkant bovenbeen), onderrug en buikspieren.',
    start:'Sta iets breder dan heupbreed. De kettlebell staat tussen je voeten, net voor je tenen. Je tenen wijzen licht naar buiten.',
    steps:['Schuif je heupen naar achteren en buig je knieën een beetje, alsof je met je billen een deur dichtduwt.','Houd je rug lang en recht, borst open. Kijk naar een punt op de grond ongeveer 1–2 meter voor je.','Pak de handgreep met beide handen. Trek je schouders licht naar achteren en omlaag.','Span je buik aan en duw je voeten stevig in de grond.','Strek je heupen en sta rechtop. Knijp bovenin je billen samen.','Schuif je heupen weer naar achteren en zet de kettlebell rustig terug.'],
    points:['De beweging komt uit je heupen, niet uit je rug.','Houd de kettlebell dicht bij je lichaam.','Adem uit bij het opstaan, adem in bij het neerzetten.','Rechtop staan is genoeg: leun bovenin niet achterover.'],
    mistakes:['Een ronde onderrug.','Te veel door de knieën zakken (dan wordt het een squat).','De kettlebell te ver voor je lichaam houden.','Bovenin doorbuigen met een holle rug.'],
    warn:'Voel je scherpe pijn (iets anders dan gewone spiervermoeidheid)? Stop dan. Lukt het niet om je rug recht te houden? Zet de kettlebell dan op een stevige verhoging, zodat je minder diep hoeft.'
  },
  goblet:{
    name:'Goblet squat', kind:'reps', bilateral:false, pose:'goblet',
    cue:'Kettlebell tegen je borst, knieën volgen je tenen.',
    muscles:'Bovenbenen (quadriceps), bilspieren, buikspieren en bovenrug.',
    start:'Sta iets breder dan schouderbreed, tenen licht naar buiten. Houd de kettlebell met beide handen aan de handgreep tegen je borst, ellebogen omlaag.',
    steps:['Adem in en span je buik aan.','Buig je knieën en heupen tegelijk en zak recht omlaag.','Houd je borst omhoog. Je ellebogen komen tussen je knieën.','Zak zo diep als je gecontroleerd kunt. Je hielen blijven op de grond.','Duw door je hele voet omhoog naar de startpositie.','Adem uit bovenin en sta even stil voor de volgende herhaling.'],
    points:['Je knieën wijzen dezelfde kant op als je tenen.','Je gewicht staat op je hele voet, vooral op de hielen.','Borst omhoog, rug recht.','Zak rustig (ongeveer 2 seconden) en kom krachtig omhoog.'],
    mistakes:['Knieën zakken naar binnen.','Hielen komen van de grond.','Voorover zakken met een ronde rug.','Te snel zakken en onderin “stuiteren”.'],
    warn:'Zak alleen zo diep als het pijnloos en met rechte rug lukt. Een stoel achter je kan helpen om de diepte te bepalen.'
  },
  row:{
    name:'Eenarmige kettlebell row', kind:'reps', bilateral:true, pose:'row',
    sideHint:['Kettlebell in je linkerhand','Kettlebell in je rechterhand'],
    cue:'Heupen naar achteren, elleboog langs je lichaam omhoog.',
    muscles:'Brede rugspier, spieren tussen je schouderbladen, achterkant van je schouder, biceps en buikspieren.',
    start:'Voeten iets breder dan heupbreed. Buig voorover vanuit je heupen met een rechte rug en steun met één hand op je bovenbeen of een stevige stoel. De kettlebell hangt onder je schouder aan je andere hand.',
    steps:['Zet de kettlebell vlak voor je voeten en pak hem met één hand. Steun met je andere hand.','Houd je rug lang en recht, je heupen staan naar achteren.','Trek je schouderblad richting je ruggengraat.','Trek je elleboog langs je lichaam omhoog naar je heup.','Pauzeer even bovenin en laat de kettlebell rustig zakken tot je arm gestrekt is.','Doe eerst alle herhalingen links, daarna alle herhalingen rechts.'],
    points:['Je romp blijft stil: draai niet mee.','Elleboog dicht langs je lichaam.','Schouder blijft laag, niet richting je oor.','Laat de kettlebell gecontroleerd zakken (ongeveer 2 seconden).'],
    mistakes:['Meedraaien met je bovenlichaam.','Een ronde rug.','Rukken of zwaaien met de kettlebell.','De schouder optrekken.'],
    warn:'Krijg je last in je onderrug? Kom dan wat hoger overeind en steun met je hand op een stevige stoel of het aanrecht.'
  },
  carry:{
    name:'Suitcase carry', kind:'time', bilateral:true, pose:'carry',
    sideHint:['Kettlebell in je linkerhand','Kettlebell in je rechterhand'],
    cue:'Loop rechtop, laat je niet scheef trekken.',
    muscles:'Zijkant van je buik, grip en onderarmen, schouders en bilspieren.',
    start:'Sta rechtop met de kettlebell in één hand langs je zij, alsof je een koffer draagt. Je andere hand hangt los langs je lichaam.',
    steps:['Pak de kettlebell met één hand vast. Ga daarvoor door je knieën, niet door je rug.','Sta rechtop, schouders recht, borst open.','Span je buik aan, zodat je niet naar de kant van de kettlebell hangt.','Loop rustig met kleine stappen. Heb je weinig ruimte? Dan mag je ook op de plek blijven staan.','Zet de kettlebell na de tijd rustig neer en pak hem met de andere hand.','Eerst 30 seconden links, daarna 30 seconden rechts.'],
    points:['Je schouders blijven op gelijke hoogte.','Kleine, rustige stappen.','Adem rustig door, houd je adem niet vast.','Houd je blik vooruit.'],
    mistakes:['Scheef hangen naar de kant van de kettlebell.','De schouder optrekken.','Te snel lopen.','De kettlebell tegen je been laten zwaaien.'],
    warn:'Zorg voor vrije ruimte en een stroeve ondergrond. Verlies je je grip? Zet de kettlebell dan direct rustig neer.'
  },
  lunge:{
    name:'Reverse lunge', kind:'reps', bilateral:true, pose:'lunge',
    sideHint:['Stap met je linkerbeen naar achteren','Stap met je rechterbeen naar achteren'],
    cue:'Stap naar achteren en zak recht naar beneden.',
    muscles:'Bovenbenen, bilspieren, hamstrings, buikspieren en balans.',
    start:'Sta rechtop, voeten heupbreed, handen op je heupen. Zorg dat er een stoel of muur binnen handbereik is.',
    steps:['Zet een grote stap naar achteren met één been.','Zak recht omlaag tot beide knieën ongeveer 90° gebogen zijn.','Je achterste knie blijft net boven de grond.','Houd je romp rechtop en je gewicht vooral op je voorste voet.','Duw door je voorste hiel en zet je achterste voet terug naar de startpositie.','Doe eerst alle herhalingen met links en daarna met rechts. Train altijd beide benen.'],
    points:['Maak de stap groot genoeg: je voorste knie blijft boven je enkel.','Houd je romp rechtop.','Voorste knie wijst dezelfde kant op als je voet.','Stap rustig en gecontroleerd.'],
    mistakes:['Voorste knie schuift ver voorbij je tenen.','Een te kleine stap.','Voorover leunen.','Knie zakt naar binnen.'],
    warn:'Heb je last van je knie? Maak de beweging dan kleiner. Een stoel of muur geeft houvast.'
  },
  pushup:{
    name:'Incline push-up', kind:'reps', bilateral:false, pose:'pushup',
    cue:'Lichaam in één rechte lijn, ellebogen schuin naar achteren.',
    muscles:'Borstspieren, voorkant van je schouder, triceps en buikspieren.',
    start:'Plaats je handen iets breder dan je schouders op de rand van een stevig aanrecht of een stabiele verhoging. Loop met je voeten naar achteren tot je lichaam een rechte lijn vormt.',
    steps:['Span je buik en billen aan, je lichaam is één rechte lijn.','Buig je ellebogen schuin naar achteren (ongeveer 45° vanaf je lichaam).','Breng je borst richting de rand.','Stop vlak voor je de rand aanraakt.','Duw jezelf krachtig terug naar de startpositie.','Hoe lager de verhoging, hoe zwaarder de oefening.'],
    points:['Rechte lijn van hoofd tot hielen.','Ellebogen niet wijd uit elkaar.','Kijk iets voor je uit, nek in het verlengde van je rug.','Gecontroleerd omlaag, krachtig omhoog.'],
    mistakes:['Doorzakken in je onderrug.','Billen omhoog steken.','Ellebogen wijd naar buiten.','Maar een stukje bewegen.'],
    warn:'Controleer eerst of het aanrecht of de verhoging stevig staat en niet kan wegglijden of kantelen.'
  }
};

var LATER = [
  { name:'Kettlebell swing', text:'Een swing is een snelle heupbeweging met een grotere kans op fouten. Niet in je schema.',
    ready:['Je deadlift en goblet squat gaan met goede techniek.','Je hebt minstens 4–6 weken regelmatig getraind.','Je hebt de swing laten uitleggen door een gekwalificeerde trainer of een betrouwbare beginnerscursus.'],
    warn:'Leer dit niet alleen uit een korte video. Een swing met een ronde rug kan je onderrug overbelasten.' },
  { name:'Overhead press', text:'Boven je hoofd drukken vraagt veel schouderbeweeglijkheid en stabiliteit. Niet in je schema.',
    ready:['Je kunt je armen pijnloos volledig boven je hoofd strekken.','Je push-ups en rows gaan met goede techniek.','Je hebt de techniek laten controleren door een trainer.'],
    warn:'Begin pas als je de techniek beheerst. Een kettlebell van 16 kg kan boven je hoofd nog zwaar zijn.' }
];

var WORKOUTS = {
  A:{ title:'Training A', sub:'Full body', items:[
    {ex:'deadlift',sets:3,reps:10},{ex:'goblet',sets:2,reps:8},{ex:'row',sets:2,reps:8},{ex:'carry',sets:3,secs:30}]},
  B:{ title:'Training B', sub:'Full body', items:[
    {ex:'lunge',sets:2,reps:6},{ex:'deadlift',sets:2,reps:10},{ex:'row',sets:2,reps:8},{ex:'pushup',sets:2,min:8,max:12},{ex:'carry',sets:2,secs:30}]}
};

var WEEKS = [
  {t:'Techniek leren',d:'Houd je aan de voorgeschreven sets en herhalingen. Let op rustige, gecontroleerde bewegingen en een goede houding.'},
  {t:'Techniek leren',d:'Houd je aan de voorgeschreven sets en herhalingen. Let op rustige, gecontroleerde bewegingen en een goede houding.'},
  {t:'Rustig opbouwen',d:'Voeg waar het goed gaat 1–2 herhalingen per set toe. Doe dat niet bij alle oefeningen tegelijk.'},
  {t:'Rustig opbouwen',d:'Voeg waar het goed gaat 1–2 herhalingen per set toe. Doe dat niet bij alle oefeningen tegelijk.'},
  {t:'Eventueel meer volume',d:'Voeg alleen als je goed herstelt een extra set toe aan de goblet squat of row. Wordt je techniek slechter? Dan verhoog je niets.'},
  {t:'Eventueel meer volume',d:'Voeg alleen als je goed herstelt een extra set toe aan de goblet squat of row. Wordt je techniek slechter? Dan verhoog je niets.'},
  {t:'Controle en consistentie',d:'Volledige bewegingsuitslag, gecontroleerde herhalingen en een vaste routine. Geen verhoging in deze weken.'},
  {t:'Controle en consistentie',d:'Volledige bewegingsuitslag, gecontroleerde herhalingen en een vaste routine. Beoordeel aan het einde of je klaar bent voor een volgende stap.'}
];

var TIPS = [
  'Zak langzamer: tel 3 seconden naar beneden.',
  'Pauzeer 1–2 seconden onderin de beweging (squat) of bovenin (row).',
  'Voeg 1–2 herhalingen per set toe, niet bij alles tegelijk.',
  'Voeg vanaf week 5 een extra set toe aan goblet squat of row, alleen als je goed herstelt.',
  'Kort je rusttijd een stapje in (bijvoorbeeld van 90 naar 60 seconden), alleen als het goed gaat.'
];

var ASSESS = [
  'Ik haal alle sets met goede techniek.',
  'Ik herstel goed tussen trainingen en voel me niet langdurig uitgeput.',
  'Ik heb de laatste twee weken minstens twee keer per week getraind.',
  'De training voelt beheersbaar: uitdagend, maar niet tot het uiterste.'
];

/* Eenvoudige pictogrammen (eigen tekeningen): twee standen per oefening, zijaanzicht naar rechts */
var POSES = {
  deadlift:[
    {head:[64,36],sh:[55,41],hip:[34,54],knee:[46,72],foot:[46,90],elbow:[54,57],hand:[53,73],kb:[53,82]},
    {head:[50,19],sh:[49,28],hip:[48,52],knee:[50,71],foot:[50,90],elbow:[50,42],hand:[51,55],kb:[51,63]}],
  goblet:[
    {head:[50,19],sh:[49,28],hip:[48,51],knee:[50,70],foot:[50,90],elbow:[53,42],hand:[56,36],kb:[59,40]},
    {head:[48,35],sh:[46,44],hip:[38,68],knee:[60,70],foot:[50,90],elbow:[54,56],hand:[55,46],kb:[59,49]}],
  row:[
    {head:[64,36],sh:[55,41],hip:[34,54],knee:[46,72],foot:[46,90],elbow:[55,56],hand:[55,70],kb:[55,78],elbow2:[50,54],hand2:[47,69]},
    {head:[64,36],sh:[55,41],hip:[34,54],knee:[46,72],foot:[46,90],elbow:[44,48],hand:[50,56],kb:[50,64],elbow2:[50,54],hand2:[47,69]}],
  carry:[
    {head:[50,19],sh:[50,28],hip:[50,51],knee:[50,70],foot:[50,90],elbow:[50,42],hand:[50,57],kb:[50,66]},
    {head:[50,19],sh:[50,28],hip:[50,51],knee:[56,70],foot:[58,90],elbow:[50,42],hand:[50,57],kb:[50,66],knee2:[44,70],foot2:[40,90]}],
  lunge:[
    {head:[50,19],sh:[50,28],hip:[50,51],knee:[50,70],foot:[50,90],elbow:[58,40],hand:[52,50]},
    {head:[50,27],sh:[50,36],hip:[50,58],knee:[64,72],foot:[62,90],elbow:[58,48],hand:[52,57],knee2:[42,78],foot2:[28,88]}],
  pushup:[
    {head:[74,34],sh:[68,40],hip:[44,63],knee:[31,76],foot:[16,90],elbow:[69,50],hand:[70,61],surf:[62,61,34,29]},
    {head:[73,47],sh:[66,52],hip:[43,69],knee:[30,79],foot:[16,90],elbow:[58,58],hand:[70,61],surf:[62,61,34,29]}]
};

function poseSvg(p){
  function L(a,b,c){ return '<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" class="pl '+(c||'')+'"/>'; }
  var s='<svg class="pic" viewBox="0 0 100 100" role="img" aria-hidden="true">';
  if(p.surf) s+='<rect x="'+p.surf[0]+'" y="'+p.surf[1]+'" width="'+p.surf[2]+'" height="'+p.surf[3]+'" rx="2" class="psurf"/>';
  s+='<line x1="4" y1="90" x2="96" y2="90" class="pfloor"/>';
  if(p.knee2){ s+=L(p.hip,p.knee2,'far')+L(p.knee2,p.foot2,'far')+L(p.foot2,[p.foot2[0]+6,p.foot2[1]],'far'); }
  s+=L(p.hip,p.knee)+L(p.knee,p.foot)+L(p.foot,[p.foot[0]+6,p.foot[1]]);
  s+=L(p.sh,p.hip);
  if(p.elbow2) s+=L(p.sh,p.elbow2,'far')+L(p.elbow2,p.hand2,'far');
  if(p.kb){ var k=p.kb;
    s+='<path d="M'+(k[0]-3.6)+' '+(k[1]-4.2)+' a3.6 3.6 0 0 1 7.2 0" class="pkbh"/><circle cx="'+k[0]+'" cy="'+k[1]+'" r="6.2" class="pkb"/>'; }
  s+=L(p.sh,p.elbow)+L(p.elbow,p.hand);
  s+='<circle cx="'+p.head[0]+'" cy="'+p.head[1]+'" r="6" class="phead"/></svg>';
  return s;
}
function poseThumb(id){ return poseSvg(POSES[EX[id].pose][0]); }
function poseFrames(id){
  var p=POSES[EX[id].pose];
  return '<div class="frames"><div class="frame">'+poseSvg(p[0])+'<span>Start</span></div><div class="frame">'+poseSvg(p[1])+'<span>Onderste of eindstand</span></div></div>';
}

/* ================= Iconen ================= */
var ICON = {
  home:'<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  plan:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  ex:'<rect x="3" y="9" width="3" height="6" rx="1"/><rect x="18" y="9" width="3" height="6" rx="1"/><path d="M6 12h12M8 7v10M16 7v10"/>',
  chart:'<path d="M5 20v-7M12 20V5M19 20v-11"/>',
  set:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  play:'<path d="M7 4l13 8-13 8z"/>'
};
function icon(n,cls){ return '<svg class="i '+(cls||'')+'" viewBox="0 0 24 24" aria-hidden="true">'+ICON[n]+'</svg>'; }

/* ================= Staat en opslag ================= */
var state = null;
var storageOK = true;

function defaultState(){
  var t = todayISO();
  return {
    v:1, startDate:t,
    settings:{ name:'', days:[0,3,5], restSec:90, autoRest:true, sound:true, vibrate:true, wake:true },
    prog:{ week:1, weekStart:t, finished:false, ex:{} },
    plan:{ overrides:{}, skipped:{} },
    sessions:[], body:[], active:null, lastSessionId:null,
    assess:{}, flags:{ welcome:false }
  };
}
function isObj(x){ return x && typeof x==='object' && !Array.isArray(x); }
function validActive(a){
  return isObj(a) && Array.isArray(a.items) && a.items.length && Array.isArray(a.log) && a.log.length===a.items.length &&
    isObj(a.timer) && a.items[a.ei] && EX[a.items[a.ei].ex] && (a.phase==='work'||a.phase==='rest') && a.log[a.ei].sets[a.si];
}
function normalize(raw){
  var d = defaultState();
  if(!isObj(raw)) return d;
  if(validISO(raw.startDate)) d.startDate = raw.startDate;
  if(isObj(raw.settings)){
    var s = raw.settings;
    if(typeof s.name==='string') d.settings.name = s.name.slice(0,30);
    if(Array.isArray(s.days)){
      var days = s.days.filter(function(x,i,arr){ return Number.isInteger(x)&&x>=0&&x<=6&&arr.indexOf(x)===i; }).sort();
      if(days.length>=2&&days.length<=4) d.settings.days = days;
    }
    if([30,45,60,90,120].indexOf(s.restSec)>=0) d.settings.restSec = s.restSec;
    ['autoRest','sound','vibrate','wake'].forEach(function(k){ if(typeof s[k]==='boolean') d.settings[k]=s[k]; });
  }
  if(isObj(raw.prog)){
    var p = raw.prog;
    if(Number.isInteger(p.week)) d.prog.week = clamp(p.week,1,8);
    if(validISO(p.weekStart)) d.prog.weekStart = p.weekStart;
    d.prog.finished = p.finished===true;
    if(isObj(p.ex)) Object.keys(p.ex).forEach(function(k){
      if(!EX[k]||!isObj(p.ex[k])) return;
      d.prog.ex[k] = { steps:clamp(parseInt(p.ex[k].steps,10)||0,0,2), sets:clamp(parseInt(p.ex[k].sets,10)||0,0,1) };
    });
  }
  if(isObj(raw.plan)){
    if(isObj(raw.plan.overrides)) Object.keys(raw.plan.overrides).forEach(function(k){
      if(validISO(k) && ['A','B','walk','restwalk','rest'].indexOf(raw.plan.overrides[k])>=0) d.plan.overrides[k]=raw.plan.overrides[k]; });
    if(isObj(raw.plan.skipped)) Object.keys(raw.plan.skipped).forEach(function(k){ if(validISO(k)&&raw.plan.skipped[k]) d.plan.skipped[k]=true; });
  }
  if(Array.isArray(raw.sessions)) d.sessions = raw.sessions.filter(function(x){
    return isObj(x)&&typeof x.id==='string'&&typeof x.ts==='number'&&(x.type==='A'||x.type==='B')&&validISO(x.date)&&Array.isArray(x.ex);
  });
  if(Array.isArray(raw.body)) d.body = raw.body.filter(function(x){
    return isObj(x)&&validISO(x.date)&&((typeof x.kg==='number'&&isFinite(x.kg))||(typeof x.waist==='number'&&isFinite(x.waist)));
  }).map(function(x){ return {date:x.date, kg:typeof x.kg==='number'?x.kg:null, waist:typeof x.waist==='number'?x.waist:null}; });
  d.body.sort(function(a,b){ return a.date<b.date?-1:a.date>b.date?1:0; });
  if(validActive(raw.active)) d.active = raw.active;
  if(typeof raw.lastSessionId==='string') d.lastSessionId = raw.lastSessionId;
  if(isObj(raw.assess)) Object.keys(raw.assess).forEach(function(k){ if(/^c\d$/.test(k)) d.assess[k]=raw.assess[k]===true; });
  if(isObj(raw.flags)) d.flags.welcome = raw.flags.welcome===true;
  return d;
}
function load(){
  try{
    var txt = localStorage.getItem(STORAGE_KEY);
    state = txt ? normalize(JSON.parse(txt)) : defaultState();
  }catch(e){ state = defaultState(); storageOK = false; }
}
function save(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageOK = true; }
  catch(e){ storageOK = false; }
}

/* ================= Programma en schema ================= */
function weekInfo(){ return WEEKS[state.prog.week-1]; }
function weekCap(w){ return w<3 ? {steps:0,sets:0} : w<5 ? {steps:2,sets:0} : {steps:2,sets:1}; }
function canRaise(w){ return w>=3 && w<=6; }
function setsAllowed(id){ return id==='goblet' || id==='row'; }

function target(item){
  var p = state.prog.ex[item.ex] || {steps:0,sets:0};
  var e = EX[item.ex];
  var t = { ex:item.ex, sets:item.sets + (setsAllowed(item.ex)?p.sets:0) };
  if(e.kind==='time'){ t.secs = item.secs + 5*p.steps; }
  else if(item.min){ t.min=item.min+p.steps; t.max=item.max+p.steps; t.reps=Math.round((t.min+t.max)/2); }
  else { t.reps = item.reps + p.steps; }
  return t;
}
function targetText(t){
  var e = EX[t.ex];
  var per = e.bilateral ? (t.ex==='lunge'?' per been':' per arm') : '';
  if(e.kind==='time') return t.sets+' × '+t.secs+' sec'+per;
  if(t.min) return t.sets+' × '+t.min+'–'+t.max+' herh.'+per;
  return t.sets+' × '+t.reps+' herh.'+per;
}
function clampProgress(){
  var cap = weekCap(state.prog.week);
  Object.keys(state.prog.ex).forEach(function(k){
    var p = state.prog.ex[k];
    p.steps = Math.min(p.steps, cap.steps);
    p.sets = Math.min(p.sets, cap.sets);
  });
}

function sortedDays(){ return state.settings.days.slice().sort(function(a,b){ return a-b; }); }
function baseType(d){
  var wd = wdIdx(d), days = sortedDays(), slot = days.indexOf(wd);
  if(slot>=0){
    if(slot===0) return 'A';
    if(slot===1) return 'B';
    var wk = weeksBetween(parseISO(state.startDate), d);
    return (((wk+slot)%2)+2)%2===0 ? 'A' : 'B';
  }
  if(wd===1||wd===4) return 'walk';
  if(wd===2) return 'restwalk';
  return 'rest';
}
function effType(dIso){ return state.plan.overrides[dIso] || baseType(parseISO(dIso)); }
function isStrength(t){ return t==='A'||t==='B'; }
function sessionForPlan(dIso){ for(var i=0;i<state.sessions.length;i++){ if(state.sessions[i].planDate===dIso) return state.sessions[i]; } return null; }
function dayInfo(dIso){
  var t = effType(dIso), s = isStrength(t);
  return { date:dIso, type:t, strength:s, done:s?sessionForPlan(dIso):null, skipped:!!state.plan.skipped[dIso] };
}
function typeLabel(t){
  return t==='A'?'Training A':t==='B'?'Training B':t==='walk'?'Wandelen, 20–30 min':t==='restwalk'?'Rust of rustig wandelen':'Rustdag';
}
function nextTraining(){
  var base = new Date();
  for(var i=0;i<21;i++){
    var d = iso(addDays(base,i)), inf = dayInfo(d);
    if(inf.strength && !inf.done && !inf.skipped) return inf;
  }
  return null;
}

function weekKey(dIso){ return iso(mondayOf(parseISO(dIso))); }
function sessionsPerWeek(){
  var m = {};
  state.sessions.forEach(function(s){ var k=weekKey(s.date); m[k]=(m[k]||0)+1; });
  return m;
}
function weekStreak(){
  var m = sessionsPerWeek(), need = 2, wk = mondayOf(new Date()), n = 0;
  if((m[iso(wk)]||0) < need) wk = addDays(wk,-7);
  while((m[iso(wk)]||0) >= need){ n++; wk = addDays(wk,-7); }
  return n;
}
function activeWeeks(){ return Object.keys(sessionsPerWeek()).length; }
function lastSession(){
  var best=null; state.sessions.forEach(function(s){ if(!best||s.ts>best.ts) best=s; }); return best;
}
function estimateSec(type){
  var total = 0, setsTotal = 0;
  WORKOUTS[type].items.forEach(function(it){
    var t = target(it), e = EX[it.ex], sides = e.bilateral?2:1;
    var work = e.kind==='time' ? t.secs*sides : (t.reps||6)*3*sides;
    total += t.sets*(work+12);
    setsTotal += t.sets;
  });
  total += Math.max(0,setsTotal-1)*state.settings.restSec;
  return total;
}
function programAdvice(){
  var since = state.prog.weekStart;
  var ss = state.sessions.filter(function(s){ return s.date>=since; }).sort(function(a,b){ return a.ts-b.ts; });
  var need = state.settings.days.length;
  var lastTwo = ss.slice(-2);
  var heavy = lastTwo.length>0 && lastTwo.filter(function(s){ return s.rating==='zwaar'; }).length>=1 && ss.length>=1 && ss[ss.length-1].rating==='zwaar';
  if(heavy) return {kind:'warn', text:'Je laatste training voelde zwaar. Herhaal gerust deze week of neem extra rust voordat je verder gaat.'};
  if(ss.length>=need) return {kind:'ok', text:'Je hebt in deze programmaweek al '+ss.length+' trainingen gedaan. Gaat het goed en herstel je goed? Dan kun je door naar de volgende week.'};
  var left = need-ss.length;
  return {kind:'info', text:'Nog '+left+' '+(left===1?'training':'trainingen')+' in deze programmaweek ('+ss.length+' van '+need+'). Er is geen haast: je bepaalt zelf wanneer je doorgaat.'};
}

/* ================= Training: timer ================= */
function mkTimer(kind,durMs,run){ return { kind:kind, status:run?'running':'idle', startedAt:run?Date.now():0, acc:0, dur:durMs||0, lastSec:null }; }
function tElapsed(t){ return t.acc + (t.status==='running' ? Date.now()-t.startedAt : 0); }
function tRemaining(t){ return Math.max(0, t.dur - tElapsed(t)); }
function tStart(t){ if(t.status==='idle'||t.status==='paused'){ t.status='running'; t.startedAt=Date.now(); } }
function tPause(t){ if(t.status==='running'){ t.acc += Date.now()-t.startedAt; t.status='paused'; } }

/* ================= Training: geluid, trillen, scherm aan ================= */
var audioCtx = null;
function ensureAudio(){
  try{
    if(!audioCtx){ var AC = window.AudioContext||window.webkitAudioContext; if(AC) audioCtx = new AC(); }
    if(audioCtx && audioCtx.state==='suspended') audioCtx.resume();
  }catch(e){}
}
function beep(freq,dur,when,vol){
  if(!state.settings.sound || !audioCtx) return;
  try{
    var t0 = audioCtx.currentTime + (when||0);
    var o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type='sine'; o.frequency.value=freq;
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.exponentialRampToValueAtTime(vol||0.35,t0+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(t0); o.stop(t0+dur+0.05);
  }catch(e){}
}
function vibrate(p){ try{ if(state.settings.vibrate && navigator.vibrate) navigator.vibrate(p); }catch(e){} }
function signal(kind){
  if(kind==='tick'){ beep(660,0.09,0,0.25); }
  else if(kind==='end'){ beep(880,0.2,0); beep(880,0.2,0.3); beep(1175,0.45,0.6); vibrate([220,100,220,100,450]); }
  else if(kind==='switch'){ beep(740,0.15,0); beep(988,0.22,0.2); vibrate([160,80,160]); }
}
var wakeLock = null;
function wakeOn(){
  try{
    if(state.settings.wake && 'wakeLock' in navigator && document.visibilityState==='visible' && !wakeLock){
      navigator.wakeLock.request('screen').then(function(l){ wakeLock=l; l.addEventListener('release',function(){ wakeLock=null; }); }).catch(function(){});
    }
  }catch(e){}
}
function wakeOff(){ try{ if(wakeLock){ wakeLock.release(); wakeLock=null; } }catch(e){} }

/* ================= Training: engine ================= */
function itemEx(a,i){ return EX[a.items[i===undefined?a.ei:i].ex]; }
function sidesOf(a,i){ return itemEx(a,i).bilateral?2:1; }
function startReps(it){ return it.reps || 0; }
function newWorkTimer(it){
  return EX[it.ex].kind==='time' ? mkTimer('countdown',it.secs*1000,false) : mkTimer('stopwatch',0,false);
}
function unitDone(a,ei,si,sd){ var r=a.log[ei].sets[si].sides[sd]; return !!(r&&r.done); }
function unitList(a){
  var out=[]; for(var ei=0;ei<a.items.length;ei++) for(var si=0;si<a.items[ei].sets;si++) for(var sd=0;sd<sidesOf(a,ei);sd++) out.push({ei:ei,si:si,sd:sd});
  return out;
}
function totalUnits(a){ return unitList(a).length; }
function doneUnits(a){ return unitList(a).filter(function(u){ return unitDone(a,u.ei,u.si,u.sd); }).length; }
function nextUnit(a){
  var list = unitList(a), idx = -1;
  for(var i=0;i<list.length;i++) if(list[i].ei===a.ei&&list[i].si===a.si&&list[i].sd===a.sd){ idx=i; break; }
  for(var j=idx+1;j<list.length;j++) if(!unitDone(a,list[j].ei,list[j].si,list[j].sd)) return list[j];
  return null;
}
function touch(a){ var now=Date.now(); a.activeMs += clamp(now-a.lastTouch,0,240000); a.lastTouch=now; }
function resetWork(a){ var it=a.items[a.ei]; a.timer=newWorkTimer(it); a.curReps=startReps(it); }

function startWorkout(type,planDate){
  var w = WORKOUTS[type], now = Date.now();
  var items = w.items.map(function(it){ var t=target(it); return {ex:t.ex,sets:t.sets,reps:t.reps||0,min:t.min||0,max:t.max||0,secs:t.secs||0}; });
  state.active = {
    id:'s'+now, type:type, planDate:planDate||null, startedAt:now, lastTouch:now, activeMs:0,
    items:items,
    log:items.map(function(it){ var n=EX[it.ex].bilateral?2:1; var sets=[]; for(var i=0;i<it.sets;i++){ var sides=[]; for(var j=0;j<n;j++) sides.push(null); sets.push({sides:sides}); } return {sets:sets}; }),
    ei:0, si:0, sd:0, phase:'work', notice:'', curReps:0, timer:null
  };
  resetWork(state.active);
  save();
  nav('#/training');
}

function completeUnit(auto){
  var a = state.active; if(!a || a.phase!=='work') return;
  touch(a);
  var it = a.items[a.ei], e = EX[it.ex], rec = {done:true};
  if(e.kind==='time'){
    rec.secs = (auto || a.timer.status==='idle') ? it.secs : Math.max(1,Math.min(it.secs,Math.round(tElapsed(a.timer)/1000)));
  } else { rec.reps = a.curReps; }
  a.log[a.ei].sets[a.si].sides[a.sd] = rec;
  var nx = nextUnit(a);
  if(!nx){ finishWorkout(); return; }
  var sameSet = (nx.ei===a.ei && nx.si===a.si);
  a.ei=nx.ei; a.si=nx.si; a.sd=nx.sd;
  if(sameSet){
    a.phase='work'; resetWork(a);
    a.notice = 'Wissel: nu '+(a.sd===1?'rechts':'links');
    if(!auto) signal('switch');
  } else {
    a.phase='rest'; a.notice='';
    a.timer = mkTimer('countdown', state.settings.restSec*1000, state.settings.autoRest);
  }
  save(); renderTraining();
}
function endRest(){
  var a = state.active; if(!a || a.phase!=='rest') return;
  touch(a); a.phase='work'; a.notice=''; resetWork(a); save(); renderTraining();
}
function jumpExercise(delta){
  var a = state.active; if(!a) return;
  var n = a.ei + delta;
  if(n<0) return;
  if(n>=a.items.length){ askFinish(); return; }
  touch(a);
  a.ei=n; a.si=0; a.sd=0;
  outer: for(var si=0;si<a.items[n].sets;si++){ for(var sd=0;sd<sidesOf(a,n);sd++){ if(!unitDone(a,n,si,sd)){ a.si=si; a.sd=sd; break outer; } } }
  a.phase='work'; a.notice=''; resetWork(a); save(); renderTraining();
}
function buildSession(a){
  touch(a);
  var total = totalUnits(a), done = doneUnits(a);
  return {
    id:a.id, ts:Date.now(), date:todayISO(), type:a.type, planDate:a.planDate,
    durationSec:Math.round(a.activeMs/1000), complete:done===total, doneUnits:done, totalUnits:total, week:state.prog.week,
    ex:a.items.map(function(it,i){
      return { ex:it.ex, target:{sets:it.sets,reps:it.reps,min:it.min,max:it.max,secs:it.secs},
        sets:a.log[i].sets.map(function(s){ return {sides:s.sides.map(function(x){ return x&&x.done?{reps:x.reps,secs:x.secs}:null; })}; }) };
    }),
    rating:null
  };
}
function finishWorkout(){
  var a = state.active; if(!a) return;
  var s = buildSession(a);
  if(!s.planDate){
    var t = todayISO(), inf = dayInfo(t);
    if(inf.strength && !inf.done && !inf.skipped) s.planDate = t;
  }
  state.sessions.push(s);
  state.lastSessionId = s.id;
  if(s.planDate) delete state.plan.skipped[s.planDate];
  state.active = null;
  save(); wakeOff(); nav('#/klaar');
}
function discardWorkout(){ state.active=null; save(); wakeOff(); nav('#/home'); }

/* ================= UI-hulpjes ================= */
function toast(msg){
  var t=$('#toast'); t.textContent=msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t=setTimeout(function(){ t.classList.remove('on'); },2600);
}
function modal(o){
  return new Promise(function(resolve){
    var root=$('#modal-root');
    var acts=(o.actions||[]).map(function(a){ return '<button class="btn '+(a.cls||'')+'" data-val="'+esc(a.val)+'">'+esc(a.label)+'</button>'; }).join('');
    root.innerHTML='<div class="ov'+(o.sheet?'':' mid')+'"><div class="box" role="dialog" aria-modal="true" aria-label="'+esc(o.title)+'"><h2>'+esc(o.title)+'</h2>'+(o.html||'')+(acts?'<div class="acts">'+acts+'</div>':'')+'</div></div>';
    function close(v){ root.innerHTML=''; root.onclick=null; resolve(v); }
    root.onclick=function(e){
      var b=e.target.closest('[data-val]'); if(b){ close(b.getAttribute('data-val')); return; }
      if(e.target.classList.contains('ov')) close(null);
    };
  });
}
function confirmBox(title,text,okLabel,danger){
  return modal({title:title,html:'<p class="muted">'+text+'</p>',actions:[{label:okLabel,val:'ok',cls:danger?'danger':'primary'},{label:'Annuleren',val:'no',cls:'ghost'}]})
    .then(function(v){ return v==='ok'; });
}
function infoBox(title,text){ return modal({title:title,html:'<p class="muted">'+text+'</p>',actions:[{label:'Sluiten',val:'x',cls:'primary'}]}); }

/* ================= Grafieken ================= */
function barChart(items,label){
  var W=320,H=150,pt=18,pb=24,n=items.length,slot=(W-20)/n,bw=Math.min(24,slot-6);
  var max=Math.max(3,Math.max.apply(null,items.map(function(i){ return i.value; })));
  var s='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(label)+'"><line class="grid" x1="6" x2="'+(W-6)+'" y1="'+(H-pb)+'" y2="'+(H-pb)+'"/>';
  items.forEach(function(it,i){
    var h=Math.max(it.value>0?4:2,(H-pt-pb)*it.value/max), x=10+slot*i+(slot-bw)/2, y=H-pb-h, cx=x+bw/2;
    s+='<rect class="bar'+(it.hl?' hl':'')+'" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="4"/>';
    if(it.value>0) s+='<text class="val" x="'+cx.toFixed(1)+'" y="'+(y-4).toFixed(1)+'" text-anchor="middle">'+it.value+'</text>';
    s+='<text x="'+cx.toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle">'+esc(it.label)+'</text>';
  });
  return s+'</svg>';
}
function trendOf(pts){
  return pts.map(function(p,i){ var sl=pts.slice(Math.max(0,i-2),i+1); return sl.reduce(function(a,b){ return a+b.v; },0)/sl.length; });
}
function lineChart(pts,unit){
  var W=320,H=170,pl=38,pr=12,pt=14,pb=26;
  var xs=pts.map(function(p){ return parseISO(p.date).getTime(); }), minX=Math.min.apply(null,xs), maxX=Math.max.apply(null,xs);
  var tr=trendOf(pts), all=pts.map(function(p){ return p.v; }).concat(tr);
  var minV=Math.floor(Math.min.apply(null,all)-0.5), maxV=Math.ceil(Math.max.apply(null,all)+0.5);
  if(maxV-minV<2){ maxV+=1; minV-=1; }
  function X(i){ return maxX===minX ? pl+(W-pl-pr)/2 : pl+(W-pl-pr)*(xs[i]-minX)/(maxX-minX); }
  function Y(v){ return H-pb-(H-pt-pb)*(v-minV)/(maxV-minV); }
  var s='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Verloop van '+esc(unit)+'">';
  [minV,(minV+maxV)/2,maxV].forEach(function(v){
    s+='<line class="grid" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(v).toFixed(1)+'" y2="'+Y(v).toFixed(1)+'"/><text x="'+(pl-5)+'" y="'+(Y(v)+3).toFixed(1)+'" text-anchor="end">'+nl(v,v%1?1:0)+'</text>';
  });
  if(pts.length>1) s+='<polyline class="raw" points="'+pts.map(function(p,i){ return X(i).toFixed(1)+','+Y(p.v).toFixed(1); }).join(' ')+'"/>';
  pts.forEach(function(p,i){ s+='<circle class="pt" cx="'+X(i).toFixed(1)+'" cy="'+Y(p.v).toFixed(1)+'" r="3"/>'; });
  if(pts.length>1) s+='<polyline class="trend" points="'+tr.map(function(v,i){ return X(i).toFixed(1)+','+Y(v).toFixed(1); }).join(' ')+'"/>';
  else s+='<circle cx="'+X(0).toFixed(1)+'" cy="'+Y(tr[0]).toFixed(1)+'" r="5" fill="var(--acc)"/>';
  s+='<text x="'+pl+'" y="'+(H-8)+'" text-anchor="start">'+esc(fmtDay(pts[0].date))+'</text>';
  if(pts.length>1) s+='<text x="'+(W-pr)+'" y="'+(H-8)+'" text-anchor="end">'+esc(fmtDay(pts[pts.length-1].date))+'</text>';
  return {svg:s+'</svg>',trend:tr};
}
function weekBars(n){
  var m=sessionsPerWeek(), out=[], mon=mondayOf(new Date());
  for(var i=n-1;i>=0;i--){ var d=addDays(mon,-7*i); out.push({label:d.getDate()+'/'+(d.getMonth()+1),value:m[iso(d)]||0,hl:i===0}); }
  return out;
}
function heatmap(weeks){
  var byDate={}; state.sessions.forEach(function(s){ byDate[s.date]=true; });
  var today=todayISO(), mon=mondayOf(new Date()), start=state.startDate;
  var h='<div class="heat"><span></span>'+DAG_KORT.map(function(d){ return '<span class="h">'+d+'</span>'; }).join('');
  for(var w=weeks-1;w>=0;w--){
    var m=addDays(mon,-7*w);
    h+='<span class="l">'+m.getDate()+' '+MND_KORT[m.getMonth()]+'</span>';
    for(var i=0;i<7;i++){
      var di=iso(addDays(m,i)), cls='dot';
      if(byDate[di]) cls+=' done';
      else if(di>today) cls+=' future';
      else if(di>=start){ var inf=dayInfo(di); if(inf.strength&&!inf.skipped) cls+=' plan'; }
      h+='<span class="'+cls+'" title="'+di+'"></span>';
    }
  }
  return h+'</div>';
}
function consistency(){
  var today=todayISO(), from=addDays(new Date(),-27), st=parseISO(state.startDate);
  if(from<st) from=st;
  var planned=0, done=0;
  for(var d=from; iso(d)<=today; d=addDays(d,1)){
    var di=iso(d), inf=dayInfo(di);
    if(!inf.strength||inf.skipped) continue;
    if(inf.done){ planned++; done++; }
    else if(di<today) planned++;
  }
  return planned? {planned:planned,done:done,pct:Math.round(100*done/planned)} : null;
}

/* ================= Schermen ================= */
function dosageText(id){
  var out=[]; Object.keys(WORKOUTS).forEach(function(k){ WORKOUTS[k].items.forEach(function(it){ if(it.ex===id) out.push(WORKOUTS[k].title+': '+targetText(target(it))); }); });
  return out.join(' · ');
}
function exDetailHtml(id){
  var e=EX[id];
  return poseFrames(id)+
  '<div class="stack" style="margin-top:14px">'+
  '<div><h3>Spieren</h3><p>'+esc(e.muscles)+'</p></div>'+
  '<div><h3>Startpositie</h3><p>'+esc(e.start)+'</p></div>'+
  '<div><h3>Uitvoering</h3><ol class="steps">'+e.steps.map(function(s){ return '<li>'+esc(s)+'</li>'; }).join('')+'</ol></div>'+
  '<div><h3>Let hierop</h3><ul>'+e.points.map(function(s){ return '<li>'+esc(s)+'</li>'; }).join('')+'</ul></div>'+
  '<div><h3>Veelgemaakte fouten</h3><ul>'+e.mistakes.map(function(s){ return '<li>'+esc(s)+'</li>'; }).join('')+'</ul></div>'+
  '<div class="card warn"><h3>Veiligheid</h3><p class="small">'+esc(e.warn)+' Stop bij scherpe pijn.</p></div></div>';
}

function viewHome(){
  var now=new Date(), t=iso(now), h=now.getHours();
  var greet=h<6?'Goedenacht':h<12?'Goedemorgen':h<18?'Goedemiddag':'Goedenavond';
  var name=state.settings.name?', '+esc(state.settings.name):'';
  var a=state.active, inf=dayInfo(t), nx=nextTraining(), last=lastSession();
  var html='<div class="top"><div><h1>'+greet+name+'</h1><p class="muted">'+fmtLong(now)+'</p></div><a class="pill acc" href="#/programma">Week '+state.prog.week+' van 8</a></div><div class="stack">';
  if(!storageOK) html+='<div class="warnbar">Opslaan lukt niet in deze browser (privémodus?). Je voortgang blijft mogelijk niet bewaard.</div>';
  if(!state.flags.welcome) html+='<div class="card hl"><h2>Welkom bij Kettlebell Coach</h2><p class="muted">Een rustig schema voor beginners: trainingen van 20–30 minuten, met wandelen en rust ertussen. Deze app geeft algemene trainingsinformatie en is geen medisch advies. Heb je klachten of twijfel je? Overleg dan eerst met je huisarts.</p><div style="margin-top:12px"><button class="btn" data-act="welcome">Begrepen</button></div></div>';
  if(a){
    html+='<div class="card hl"><div class="row between"><div><h2 style="margin:0">Training bezig</h2><p class="muted small">'+WORKOUTS[a.type].title+' · '+doneUnits(a)+' van '+totalUnits(a)+' onderdelen klaar</p></div></div><div class="grid2" style="margin-top:12px"><button class="btn primary" data-act="resume">Hervat</button><button class="btn danger" data-act="dropactive">Weggooien</button></div></div>';
  }
  html+='<div class="card">';
  if(inf.strength && inf.done){
    html+='<span class="pill ok">Afgerond</span><p class="today-title" style="margin-top:8px">'+typeLabel(inf.type)+' is gedaan</p><p class="muted">Goed bezig. Neem nu rust en eet normaal.</p>';
  } else if(inf.strength && inf.skipped){
    html+='<span class="pill warn">Overgeslagen</span><p class="today-title" style="margin-top:8px">'+typeLabel(inf.type)+'</p><p class="muted">Je schema loopt gewoon door.</p><div class="acts"><button class="btn xs" data-act="unskip" data-date="'+t+'">Toch weer plannen</button></div>';
  } else if(inf.strength){
    var w=WORKOUTS[inf.type];
    html+='<span class="pill acc">Vandaag</span><p class="today-title" style="margin-top:8px">'+w.title+'</p><p class="muted">'+w.sub+' · ± '+minutesText(estimateSec(inf.type))+'</p><ul class="exlist">'+
      w.items.map(function(it){ return '<li><span>'+esc(EX[it.ex].name)+'</span><span>'+targetText(target(it))+'</span></li>'; }).join('')+'</ul>'+
      '<div class="acts"><button class="btn xs" data-act="move" data-date="'+t+'">Verplaats</button><button class="btn xs" data-act="skip" data-date="'+t+'">Sla over</button></div>';
  } else {
    var txt=inf.type==='walk'?'Wandel 20–30 minuten in een rustig tempo.':inf.type==='restwalk'?'Rust, of een rustige wandeling als je daar zin in hebt.':'Herstel hoort bij het schema. Vandaag geen krachttraining.';
    html+='<span class="pill ok">Rustdag</span><p class="today-title" style="margin-top:8px">'+typeLabel(inf.type)+'</p><p class="muted">'+txt+'</p>';
  }
  html+='</div>';
  if(nx && !(inf.strength&&!inf.done&&!inf.skipped)){
    html+='<div class="card flat"><p class="muted small">Eerstvolgende training</p><p style="font-weight:750;font-size:1.1rem">'+typeLabel(nx.type)+' · '+fmtLong(parseISO(nx.date))+'</p></div>';
  }
  if(a) html+='<button class="btn big primary" data-act="resume">'+icon('play','ic')+' Hervat training</button>';
  else html+='<button class="btn big primary" data-act="start" data-type="'+(nx?nx.type:'A')+'" data-date="'+(nx?nx.date:'')+'">'+'<span class="row" style="justify-content:center;gap:8px">'+icon('play','ic')+'Start training</span>'+(nx?'<small>'+typeLabel(nx.type)+(nx.date===t?' · vandaag':' · '+fmtShort(parseISO(nx.date)))+'</small>':'')+'</button>';
  var done=state.sessions.filter(function(s){ return s.complete; }).length;
  html+='<div class="grid3"><div class="stat"><b>'+done+'</b><span>afgerond</span></div><div class="stat"><b>'+weekStreak()+'</b><span>weekreeks</span></div><div class="stat"><b>'+activeWeeks()+'</b><span>actieve weken</span></div></div>';
  if(last) html+='<div class="card flat"><p class="muted small">Laatste training</p><p style="font-weight:750">'+typeLabel(last.type)+' · '+fmtDay(last.date)+'</p><p class="muted small">'+minutesText(last.durationSec)+' · '+(last.complete?'volledig afgerond':'gedeeltelijk afgerond')+'</p></div>';
  html+='<div class="card"><h2>Trainingen per week</h2>'+barChart(weekBars(8),'Trainingen per week, laatste 8 weken')+'<p class="muted tiny" style="margin-top:6px">Laatste 8 weken. Eén à twee trainingen per week is ook winst.</p></div>';
  if(!a) html+='<div class="card"><h2>Andere training starten</h2><div class="grid2"><button class="btn" data-act="startfree" data-type="A">Training A</button><button class="btn" data-act="startfree" data-type="B">Training B</button></div></div>';
  var lastKg=state.body.filter(function(b){ return b.kg!==null; }).pop();
  if(!lastKg || (new Date(t)-new Date(lastKg.date))/DAY_MS>=7) html+='<a class="btn ghost" href="#/gewicht">Gewicht invoeren (optioneel)</a>';
  return html+'</div>';
}

function dayRow(dIso){
  var inf=dayInfo(dIso), d=parseISO(dIso), today=todayISO(), isToday=dIso===today, past=dIso<today;
  var open=inf.strength&&!inf.done&&!inf.skipped;
  var badge='';
  if(inf.strength){
    if(inf.done) badge='<span class="pill ok">Afgerond</span>';
    else if(inf.skipped) badge='<span class="pill warn">Overgeslagen</span>';
    else if(past) badge='<span class="pill bad">Niet gedaan</span>';
    else if(isToday) badge='<span class="pill acc">Vandaag</span>';
  } else if(isToday) badge='<span class="pill">Vandaag</span>';
  var acts='';
  if(open) acts='<button class="btn xs primary" data-act="start" data-type="'+inf.type+'" data-date="'+dIso+'">'+(past?'Inhalen':'Start')+'</button><button class="btn xs" data-act="move" data-date="'+dIso+'">Verplaats</button><button class="btn xs" data-act="skip" data-date="'+dIso+'">Sla over</button>';
  else if(inf.strength&&inf.skipped) acts='<button class="btn xs" data-act="unskip" data-date="'+dIso+'">Herstel</button>';
  else if(!inf.strength&&dIso>=today) acts='<button class="btn xs" data-act="addtrain" data-date="'+dIso+'">+ Training</button>';
  if(state.plan.overrides[dIso]&&dIso>=today) acts+='<button class="btn xs ghost" data-act="resetday" data-date="'+dIso+'">Standaard</button>';
  return '<div class="card day'+(isToday?' today':'')+(past&&!open?' past':'')+'"><div class="row"><div class="d"><span>'+DAG_KORT[wdIdx(d)]+'</span><b>'+d.getDate()+'</b></div><div class="grow"><div style="font-weight:700">'+typeLabel(inf.type)+'</div>'+(state.plan.overrides[dIso]?'<div class="tiny muted">aangepast</div>':'')+'</div>'+badge+'</div>'+(acts?'<div class="acts">'+acts+'</div>':'')+'</div>';
}
function segPlan(on){ return '<div class="seg"><button class="'+(on==='week'?'on':'')+'" data-go="#/plan">Week</button><button class="'+(on==='prog'?'on':'')+'" data-go="#/programma">Programma</button></div>'; }
function viewPlan(){
  var mon=mondayOf(new Date()), h='<div class="top"><h1>Plan</h1></div>'+segPlan('week');
  [0,1].forEach(function(w){
    var m=addDays(mon,7*w);
    h+='<h2 style="margin-top:'+(w?'22px':'0')+'">'+(w?'Volgende week':'Deze week')+' <span class="muted small" style="font-weight:500">vanaf '+m.getDate()+' '+MND_KORT[m.getMonth()]+'</span></h2>';
    for(var i=0;i<7;i++) h+=dayRow(iso(addDays(m,i)));
  });
  return h+'<p class="muted small" style="margin-top:16px">Mis je een training? Geen probleem: sla hem over of verplaats hem. Je schema loopt gewoon door en je hoeft niets in te halen.</p>';
}

function viewProgram(){
  var wk=state.prog.week, info=weekInfo(), adv=programAdvice(), cap=weekCap(wk);
  var h='<div class="top"><h1>Plan</h1></div>'+segPlan('prog')+'<div class="stack">';
  h+='<div class="card hl"><span class="pill acc">Week '+wk+' van 8</span><h2 style="margin-top:10px">'+info.t+(state.prog.finished?' (voltooid)':'')+'</h2><p class="muted">'+info.d+'</p>'+
    '<p class="small" style="margin-top:10px"><span class="pill '+(adv.kind==='ok'?'ok':adv.kind==='warn'?'warn':'')+'">'+(adv.kind==='ok'?'Klaar voor volgende stap?':adv.kind==='warn'?'Let op':'Stand van zaken')+'</span></p><p class="small muted" style="margin-top:6px">'+adv.text+'</p>'+
    '<div class="grid3" style="margin-top:14px"><button class="btn sm" data-act="wprev"'+(wk<=1?' disabled':'')+'>‹ Vorige week</button><button class="btn sm" data-act="wrepeat">Herhaal week</button><button class="btn sm primary" data-act="wnext">'+(wk>=8?'Afronden':'Volgende week ›')+'</button></div></div>';
  if(state.prog.finished) h+='<div class="card"><h2>Programma voltooid</h2><p class="muted">Mooi gedaan. Je kunt week 8 blijven herhalen als vast onderhoudsschema, of opnieuw beginnen.</p><div class="grid2" style="margin-top:12px"><button class="btn" data-act="wrepeat">Herhaal week 8</button><button class="btn" data-act="wrestart">Opnieuw beginnen</button></div></div>';
  var seen={}, rows='';
  ['A','B'].forEach(function(k){ WORKOUTS[k].items.forEach(function(it){
    if(seen[it.ex]) return; seen[it.ex]=true;
    var p=state.prog.ex[it.ex]||{steps:0,sets:0}, e=EX[it.ex];
    var unit=e.kind==='time'?'+'+(5*p.steps)+' sec':'+'+p.steps+' herh.';
    rows+='<div style="padding:10px 0;border-top:1px solid var(--line)"><div style="font-weight:700">'+esc(e.name)+'</div><div class="small muted">'+esc(dosageText(it.ex))+'</div>'+
      '<div class="row between" style="margin-top:8px"><span class="small">'+(e.kind==='time'?'Tijd':'Herhalingen')+': <b>'+unit+'</b></span><span class="row"><button class="btn xs" data-act="pstep" data-ex="'+it.ex+'" data-d="-1"'+(p.steps<=0?' disabled':'')+'>−</button><button class="btn xs" data-act="pstep" data-ex="'+it.ex+'" data-d="1"'+((!canRaise(wk)||p.steps>=cap.steps)?' disabled':'')+'>+</button></span></div>'+
      (setsAllowed(it.ex)?'<div class="row between" style="margin-top:8px"><span class="small">Extra set: <b>'+(p.sets?'ja':'nee')+'</b></span><span class="row"><button class="btn xs" data-act="pset" data-ex="'+it.ex+'" data-d="-1"'+(p.sets<=0?' disabled':'')+'>−</button><button class="btn xs" data-act="pset" data-ex="'+it.ex+'" data-d="1"'+((!canRaise(wk)||p.sets>=cap.sets)?' disabled':'')+'>+</button></span></div>':'')+'</div>';
  }); });
  h+='<div class="card"><h2>Jij bepaalt de progressie</h2><p class="muted small">Er wordt niets automatisch zwaarder. '+(canRaise(wk)?(wk<5?'In deze weken mag je per oefening 1–2 herhalingen (bij de suitcase carry 5–10 seconden) toevoegen, waar het goed gaat.':'Je mag per oefening herhalingen toevoegen, en een extra set bij goblet squat of row, alleen als je goed herstelt.'):(wk<3?'In week 1–2 verhoog je niets: leer eerst de techniek.':'In deze weken verhoog je niets meer: focus op controle en consistentie.'))+'</p>'+rows+'</div>';
  h+='<div class="card"><h2>Sterker worden zonder zwaarder gewicht</h2><ul class="small muted">'+TIPS.map(function(x){ return '<li>'+x+'</li>'; }).join('')+'</ul></div>';
  if(wk>=7||state.prog.finished){
    var all=ASSESS.every(function(_,i){ return state.assess['c'+i]; });
    h+='<div class="card"><h2>Ben ik klaar voor een volgende stap?</h2>'+ASSESS.map(function(t,i){ return '<button class="sw" role="switch" aria-checked="'+(state.assess['c'+i]?'true':'false')+'" data-act="assess" data-i="'+i+'"><span>'+t+'</span><span class="knob"></span></button>'; }).join('')+
      '<p class="small muted" style="margin-top:8px">'+(all?'Je lijkt klaar voor een volgende stap, bijvoorbeeld meer herhalingen, een langzamer tempo of later een zwaardere kettlebell. Nieuwe oefeningen zoals swings leer je bij voorkeur van een trainer.':'Nog niet alles klopt? Dat is prima. Herhaal een week of ga rustig door. Er is geen haast.')+'</p></div>';
  }
  h+='<div class="card"><h2>Alle 8 weken</h2>'+WEEKS.map(function(w,i){ return '<div style="padding:8px 0;border-top:1px solid var(--line)"><b'+(i+1===wk?' style="color:var(--acc)"':'')+'>Week '+(i+1)+': '+w.t+'</b></div>'; }).join('')+'</div></div>';
  return h;
}

function viewExercises(){
  var h='<div class="top"><h1>Oefeningen</h1></div>';
  Object.keys(EX).forEach(function(id){
    h+='<a class="card listcard" href="#/oefening/'+id+'"><span class="thumb">'+poseThumb(id)+'</span><span class="grow"><b>'+esc(EX[id].name)+'</b><br><span class="small muted">'+esc(dosageText(id))+'</span></span><span class="muted">›</span></a>';
  });
  h+='<h2 style="margin-top:22px">Voor later (niet in je schema)</h2><div class="stack">';
  LATER.forEach(function(l){
    h+='<div class="card"><h3>'+l.name+'</h3><p class="small muted">'+l.text+'</p><p class="small" style="margin-top:8px"><b>Pas beginnen als:</b></p><ul class="small muted">'+l.ready.map(function(r){ return '<li>'+r+'</li>'; }).join('')+'</ul><div class="card warn" style="margin-top:10px"><p class="small">'+l.warn+'</p></div></div>';
  });
  return h+'</div>';
}
function viewExercise(id){
  var e=EX[id]; if(!e) return viewExercises();
  return '<div class="top"><div><a class="small" href="#/oefeningen">‹ Alle oefeningen</a><h1 style="margin-top:6px">'+esc(e.name)+'</h1><p class="muted small" style="margin-top:4px">'+esc(dosageText(id))+'</p></div></div>'+exDetailHtml(id);
}

function fmtSets(sx){
  var e=EX[sx.ex], u=e.kind==='time'?' s':'';
  var parts=sx.sets.map(function(s){
    if(s.sides.every(function(r){ return !r; })) return '–';
    var v=s.sides.map(function(r){ return r?(e.kind==='time'?r.secs:r.reps):'–'; });
    return v.length===2 ? 'L'+v[0]+u+' / R'+v[1]+u : v[0]+u;
  });
  return parts.join(', ')+(e.kind==='time'?'':' herh.');
}
function ratingText(r){ return r==='makkelijk'?'makkelijk':r==='goed'?'goed':r==='zwaar'?'zwaar':''; }
function sessionCard(s){
  return '<details class="card" style="padding:0"><summary style="padding:14px 16px"><span><b>'+typeLabel(s.type)+'</b> <span class="muted small">· '+fmtDay(s.date)+'</span><br><span class="muted small">'+minutesText(s.durationSec)+' · '+(s.complete?'volledig':'gedeeltelijk')+(s.rating?' · voelde '+ratingText(s.rating):'')+'</span></span><span class="muted">▾</span></summary><div style="padding:0 16px 16px">'+
    s.ex.map(function(x){ return '<div style="padding:8px 0;border-top:1px solid var(--line)"><b class="small">'+esc(EX[x.ex]?EX[x.ex].name:x.ex)+'</b><div class="small muted">'+fmtSets(x)+'</div></div>'; }).join('')+
    '<p class="tiny muted" style="margin-top:6px">L = links, R = rechts</p><button class="btn xs danger" style="margin-top:8px" data-act="delsession" data-id="'+esc(s.id)+'">Verwijder deze training</button></div></details>';
}
function segProg(on){ return '<div class="seg"><button class="'+(on==='stat'?'on':'')+'" data-go="#/voortgang">Statistieken</button><button class="'+(on==='kg'?'on':'')+'" data-go="#/gewicht">Gewicht</button></div>'; }
function viewProgress(){
  var ss=state.sessions.slice().sort(function(a,b){ return b.ts-a.ts; });
  var sec=ss.reduce(function(a,s){ return a+s.durationSec; },0), c=consistency();
  var h='<div class="top"><h1>Voortgang</h1></div>'+segProg('stat')+'<div class="stack">';
  h+='<div class="grid3"><div class="stat"><b>'+ss.length+'</b><span>trainingen</span></div><div class="stat"><b>'+Math.round(sec/60)+'</b><span>minuten totaal</span></div><div class="stat"><b>'+weekStreak()+'</b><span>weekreeks</span></div></div>';
  h+='<div class="card"><h2>Trainingen per week</h2>'+barChart(weekBars(12),'Trainingen per week, laatste 12 weken')+'</div>';
  h+='<div class="card"><h2>Consistentie</h2>'+heatmap(8)+'<p class="tiny muted" style="margin-top:10px">Gevulde cirkel = training gedaan. Open cirkel = geplande training niet gedaan.</p>'+
    (c?'<p style="margin-top:8px"><b>'+c.done+' van '+c.planned+'</b> geplande trainingen in de laatste 4 weken ('+c.pct+'%).</p>':'<p class="small muted" style="margin-top:8px">Nog te weinig gegevens voor een percentage.</p>')+'</div>';
  h+='<h2>Trainingen</h2>';
  h+=ss.length?ss.slice(0,20).map(sessionCard).join(''):'<div class="card flat"><p class="muted">Nog geen trainingen. Na je eerste training zie je hier je sets en herhalingen.</p></div>';
  return h+'</div>';
}

function viewWeight(){
  var kgs=state.body.filter(function(b){ return b.kg!==null; }).map(function(b){ return {date:b.date,v:b.kg}; });
  var wst=state.body.filter(function(b){ return b.waist!==null; }).map(function(b){ return {date:b.date,v:b.waist}; });
  var h='<div class="top"><h1>Voortgang</h1></div>'+segProg('kg')+'<div class="stack">';
  h+='<div class="card"><h2>Meting toevoegen</h2><div class="stack"><div><label class="f" for="bd">Datum</label><input type="date" id="bd" value="'+todayISO()+'" max="'+todayISO()+'"></div><div class="grid2"><div><label class="f" for="bkg">Gewicht (kg)</label><input type="number" id="bkg" inputmode="decimal" step="0.1" min="30" max="300" placeholder="bijv. 94,0"></div><div><label class="f" for="bwa">Middelomtrek (cm)</label><input type="number" id="bwa" inputmode="decimal" step="0.5" min="40" max="200" placeholder="optioneel"></div></div><button class="btn primary" data-act="savebody">Opslaan</button></div><p class="tiny muted" style="margin-top:8px">Eén keer per week, steeds op hetzelfde moment (bijv. zaterdagochtend), is genoeg.</p></div>';
  if(kgs.length){
    var lc=lineChart(kgs,'gewicht'), tr=lc.trend, first=tr[0], lastT=tr[tr.length-1];
    var span=(parseISO(kgs[kgs.length-1].date)-parseISO(kgs[0].date))/DAY_MS/7, diff=lastT-first;
    h+='<div class="card"><h2>Gewicht: trend</h2>'+lc.svg+'<p class="tiny muted" style="margin-top:6px">Grijze punten = metingen, oranje lijn = trend (gemiddelde van de laatste 3 metingen).</p>'+
      '<p style="margin-top:8px">Huidige trend: <b>'+nl(lastT,1)+' kg</b>'+(kgs.length>1?' ('+(diff>0?'+':'')+nl(diff,1)+' kg sinds de eerste meting)':'')+'</p>';
    if(span>=2){ var rate=diff/span; h+='<p class="small muted" style="margin-top:4px">Gemiddeld '+(rate>0?'+':'')+nl(rate,2)+' kg per week.'+(rate<-1?' Dat gaat vrij snel: eet normaal, slaap genoeg en let op je herstel.':'')+'</p>'; }
    else h+='<p class="small muted" style="margin-top:4px">Voer een paar weken metingen in om een betrouwbare trend te zien.</p>';
    h+='</div>';
  }
  if(wst.length>=1){ var lw=lineChart(wst,'middelomtrek'); h+='<div class="card"><h2>Middelomtrek</h2>'+lw.svg+'<p style="margin-top:8px">Laatste meting: <b>'+nl(wst[wst.length-1].v,1)+' cm</b></p></div>'; }
  h+='<div class="card"><h2>Praktische richtlijn</h2><ul class="small muted"><li><b>Geleidelijk:</b> ongeveer 0,25 tot 0,5 kg per week is voor veel mensen haalbaar en goed vol te houden.</li><li><b>Kijk naar de trend,</b> niet naar één dag. Vocht, eten en slaap kunnen je gewicht per dag 1–2 kg laten schommelen.</li><li><b>Normale maaltijden.</b> Geen crashdieet en geen extreem lage inname.</li><li><b>Eiwitten:</b> een eiwitrijke portie bij elke maaltijd (zoals eieren, kwark, vis, kip of peulvruchten) kan helpen om langer verzadigd te blijven. Sportrichtlijnen noemen vaak 1,2–1,6 gram eiwit per kg lichaamsgewicht per dag, ter oriëntatie.</li><li><b>Wandelen</b> op je wandeldagen telt mee en belast je herstel nauwelijks.</li><li><b>Slaap en herstel</b> maken je training effectiever.</li></ul><p class="tiny muted" style="margin-top:8px">Dit is algemene informatie en geen medisch of voedingsadvies. Heb je een aandoening of gebruik je medicijnen? Overleg met je huisarts of een diëtist.</p></div>';
  if(state.body.length){
    h+='<div class="card"><h2>Alle metingen</h2>'+state.body.slice().reverse().map(function(b){
      return '<div class="row between" style="padding:6px 0;border-top:1px solid var(--line)"><span>'+fmtDay(b.date)+' · '+(b.kg!==null?nl(b.kg,1)+' kg':'')+(b.kg!==null&&b.waist!==null?' · ':'')+(b.waist!==null?nl(b.waist,1)+' cm':'')+'</span><button class="btn xs danger" data-act="delbody" data-date="'+b.date+'" aria-label="Verwijder meting">Wis</button></div>'; }).join('')+'</div>';
  }
  return h+'</div>';
}

function swRow(label,key,sub){
  return '<button class="sw" role="switch" aria-checked="'+(state.settings[key]?'true':'false')+'" data-act="toggle" data-key="'+key+'"><span>'+label+(sub?'<br><span class="small muted">'+sub+'</span>':'')+'</span><span class="knob"></span></button>';
}
function viewSettings(){
  var s=state.settings, lastKg=state.body.filter(function(b){ return b.kg!==null; }).pop();
  var h='<div class="top"><h1>Instellingen</h1></div><div class="stack">';
  h+='<div class="card"><h2>Profiel</h2><label class="f" for="sname">Naam (optioneel, voor de begroeting)</label><input type="text" id="sname" maxlength="30" value="'+esc(s.name)+'" data-chg="name" autocomplete="off"><div style="margin-top:12px"><label class="f" for="skg">Huidig gewicht (kg)</label><div class="row"><input type="number" id="skg" inputmode="decimal" step="0.1" min="30" max="300" value="'+(lastKg?lastKg.kg:'')+'"><button class="btn sm primary" style="flex:none" data-act="setkg">Opslaan</button></div></div></div>';
  h+='<div class="card"><h2>Trainingsdagen</h2><div class="chips">'+DAG_KORT.map(function(d,i){ return '<button class="chip'+(s.days.indexOf(i)>=0?' on':'')+'" data-act="setday" data-d="'+i+'" aria-pressed="'+(s.days.indexOf(i)>=0)+'">'+d+'</button>'; }).join('')+'</div><p class="small muted" style="margin-top:10px">Kies 2 tot 4 dagen. De eerste dag is Training A, de tweede Training B en de derde wisselt per week. Standaard: ma, do en za.</p></div>';
  h+='<div class="card"><h2>Rusttijd tussen sets</h2><div class="chips">'+[30,45,60,90,120].map(function(v){ return '<button class="chip'+(s.restSec===v?' on':'')+'" data-act="setrest" data-v="'+v+'" aria-pressed="'+(s.restSec===v)+'">'+v+' sec</button>'; }).join('')+'</div>'+swRow('Rusttimer automatisch starten','autoRest','Start na elke afgeronde set')+swRow('Geluidssignalen','sound','Piepjes bij het einde van rust en tijd')+swRow('Trillen','vibrate','Als je telefoon dat ondersteunt')+swRow('Scherm aan houden tijdens training','wake','Als je telefoon dat ondersteunt')+'</div>';
  h+='<div class="card"><h2>Gegevens</h2><p class="small muted">Alles wordt alleen op dit toestel bewaard. Maak regelmatig een back-up, zeker voordat je browsergegevens wist of de app verwijdert.</p><div class="stack" style="margin-top:12px"><button class="btn" data-act="export">Exporteer alle gegevens (JSON)</button><button class="btn" data-act="importbtn">Importeer back-up</button><input type="file" id="imp" accept="application/json,.json" class="hide"><button class="btn danger" data-act="resetprog">Trainingsvoortgang resetten</button><button class="btn danger" data-act="wipe">Alle gegevens verwijderen</button></div></div>';
  h+='<div class="card flat"><h3>Over deze app</h3><p class="small muted">Kettlebell Coach 1.0 · werkt offline, geen account, geen advertenties. Algemene trainingsinformatie, geen medisch advies. Stop bij scherpe pijn, duizeligheid of benauwdheid en raadpleeg bij twijfel een arts.</p></div>';
  return h+'</div>';
}

function viewDone(){
  var s=state.sessions.filter(function(x){ return x.id===state.lastSessionId; })[0];
  if(!s) return viewHome();
  var sets=0; s.ex.forEach(function(x){ x.sets.forEach(function(st){ if(st.sides.every(function(r){ return r; })) sets++; }); });
  return '<div class="top"><div><span class="pill '+(s.complete?'ok':'warn')+'">'+(s.complete?'Volledig afgerond':'Gedeeltelijk afgerond')+'</span><h1 style="margin-top:10px">'+(s.complete?'Goed gedaan!':'Ook dit telt mee')+'</h1><p class="muted">'+typeLabel(s.type)+' · '+minutesText(s.durationSec)+'</p></div></div><div class="stack">'+
    '<div class="grid3"><div class="stat"><b>'+sets+'</b><span>sets klaar</span></div><div class="stat"><b>'+s.doneUnits+'/'+s.totalUnits+'</b><span>onderdelen</span></div><div class="stat"><b>'+minutesText(s.durationSec).replace(' min','')+'</b><span>minuten</span></div></div>'+
    '<div class="card"><h2>Hoe voelde het?</h2><div class="rate"><button class="btn'+(s.rating==='makkelijk'?' primary':'')+'" data-act="rate" data-v="makkelijk">Makkelijk</button><button class="btn'+(s.rating==='goed'?' primary':'')+'" data-act="rate" data-v="goed">Goed</button><button class="btn'+(s.rating==='zwaar'?' primary':'')+'" data-act="rate" data-v="zwaar">Zwaar</button></div><p class="tiny muted" style="margin-top:8px">Dit helpt bij het bepalen of je kunt doorgaan naar de volgende week.</p></div>'+
    '<div class="card flat"><p class="small muted">Zorg vandaag voor normale maaltijden, voldoende eiwitten en rust. De komende dag mag je wat spierpijn voelen; scherpe pijn niet.</p></div>'+
    '<a class="btn big primary" href="#/home">Klaar</a></div>';
}

/* ================= Trainingsscherm ================= */
function mmssUp(ms){ var s=Math.floor(ms/1000); return pad(Math.floor(s/60))+':'+pad(s%60); }
function timerText(a){
  var t=a.timer;
  return t.kind==='countdown' ? mmss(t.status==='idle'?t.dur:tRemaining(t)) : mmssUp(tElapsed(t));
}
function repsTarget(it){ return it.min ? it.min+'–'+it.max : String(it.reps); }
function viewTraining(){
  var a=state.active, it=a.items[a.ei], e=EX[it.ex], t=a.timer, rest=a.phase==='rest';
  var total=totalUnits(a), done=doneUnits(a), pct=Math.round(100*done/total);
  var timed=e.kind==='time', last=a.ei===a.items.length-1;
  var name, cue, chip='', tlab, tcls='card timer', mid='';
  if(rest){
    name='Rust';
    cue='Straks: '+e.name+', set '+(a.si+1)+' van '+it.sets+(e.bilateral?' (begin links)':'')+'.';
    tcls+=t.status==='done'?' end':' rest';
    tlab=t.status==='done'?'Rust voorbij. Klaar voor de volgende set.':t.status==='idle'?'Druk op Start om de rust te beginnen':t.status==='paused'?'Gepauzeerd':'Adem rustig door';
    mid='<div class="stepper" style="justify-content:center"><button class="btn sm" style="width:auto;height:60px;border-radius:16px" data-act="rest30">+ 30 sec rust</button></div>';
  } else {
    name=e.name;
    cue=(e.bilateral ? '<b>'+esc(e.sideHint[a.sd])+'.</b> ' : '')+esc(e.cue);
    if(e.bilateral) chip='<span class="side">'+(a.sd===0?'Links':'Rechts')+'</span>';
    tlab=a.notice || (timed ? (t.status==='idle'?'Druk op Start: '+it.secs+' seconden':t.status==='paused'?'Gepauzeerd':'Houd vol, rustig doorademen') : (t.status==='idle'?'Setklok (optioneel)':t.status==='paused'?'Gepauzeerd':'Gecontroleerd bewegen'));
    if(timed) mid='<div class="stepper" style="justify-content:center"><div class="v"><b>'+it.secs+' sec</b><span>per kant, ga rustig door</span></div></div>';
    else mid='<div class="stepper"><button data-act="reps" data-d="-1" aria-label="Eén herhaling minder">−</button><div class="v"><b id="repsNum">'+a.curReps+'</b><span>herhalingen · doel '+repsTarget(it)+(e.bilateral?' per kant':'')+'</span></div><button data-act="reps" data-d="1" aria-label="Eén herhaling meer">+</button></div>';
  }
  var s1 = t.status==='running' ? '<button class="btn big" data-act="tpause">Pauze</button>'
         : t.status==='paused' ? '<button class="btn big primary" data-act="tresume">Doorgaan</button>'
         : t.status==='done' ? '<button class="btn big" disabled>Start</button>'
         : '<button class="btn big primary" data-act="tstart">Start</button>';
  var s2;
  if(rest) s2 = t.status==='done' ? '<button class="btn big ok" data-act="tdone">Start volgende set</button>' : '<button class="btn big" data-act="tdone">Sla rust over</button>';
  else s2 = '<button class="btn big ok" data-act="tdone">'+(e.bilateral ? (a.sd===0?'Links klaar':'Rechts klaar') : 'Set klaar')+'</button>';
  return '<div class="tbar"><div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'" aria-label="Voortgang training"><i style="width:'+pct+'%"></i></div><div class="tmeta"><span>'+WORKOUTS[a.type].title+' · oefening '+(a.ei+1)+' van '+a.items.length+'</span><span>'+(rest?'Rust':'Set '+(a.si+1)+' van '+it.sets)+'</span></div></div>'+
    '<div class="tname">'+esc(name)+'</div><div class="tcue">'+cue+'</div>'+
    '<div style="min-height:46px;margin-top:4px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">'+chip+'<button class="btn xs ghost" data-act="tech">Uitleg en techniek</button></div>'+
    '<div class="'+tcls+'"><div class="tnum" id="tNum" aria-live="off">'+timerText(a)+'</div><div class="tlab">'+esc(tlab)+'</div></div>'+mid+
    '<div class="tfoot"><div class="tfoot-in">'+s1+s2+
    '<div class="three"><button class="btn" data-act="tprev"'+(a.ei===0?' disabled':'')+'>‹ Vorige<small>oefening</small></button><button class="btn" data-act="tnext">'+(last?'Afronden':'Volgende ›')+'<small>'+(last?'training':'oefening')+'</small></button><button class="btn danger" data-act="tend">Training<small>beëindigen</small></button></div></div></div>';
}
function renderTraining(){ if(route.name==='training') render(); }

function askFinish(){
  var a=state.active; if(!a) return;
  var done=doneUnits(a), total=totalUnits(a);
  if(done===0){ confirmBox('Training beëindigen?','Je hebt nog niets afgerond. De training wordt niet opgeslagen.','Beëindigen',true).then(function(ok){ if(ok) discardWorkout(); }); return; }
  modal({title:done===total?'Training afronden?':'Training beëindigen?',html:'<p class="muted">'+(done===total?'Alles is gedaan. ':'Je hebt '+done+' van '+total+' onderdelen afgerond. Wat je gedaan hebt wordt opgeslagen als gedeeltelijk afgerond. ')+'</p>',
    actions:[{label:'Doorgaan met trainen',val:'back',cls:'ghost'},{label:done===total?'Afronden en opslaan':'Beëindig en opslaan',val:'save',cls:'primary'}].concat(done===total?[]:[{label:'Weggooien',val:'drop',cls:'danger'}])})
    .then(function(v){ if(v==='save') finishWorkout(); else if(v==='drop') discardWorkout(); });
}

/* ================= Routing en render ================= */
var route = {name:'home',arg:''};
var lastRouteKey = '';
function parseRoute(){ var h=location.hash.replace(/^#\/?/,''), p=h.split('/'); route={name:p[0]||'home',arg:p.slice(1).join('/')}; }
function nav(h){ if(location.hash===h) render(); else location.hash=h; }
function tabOf(n){ return n==='plan'||n==='programma'?'plan':n==='oefeningen'||n==='oefening'?'oefeningen':n==='voortgang'||n==='gewicht'?'voortgang':n==='instellingen'?'instellingen':'home'; }
function renderNav(){
  var tabs=[['home','Start','home'],['plan','Plan','plan'],['oefeningen','Oefeningen','ex'],['voortgang','Voortgang','chart'],['instellingen','Instellingen','set']];
  var on=tabOf(route.name);
  $('#nav').innerHTML='<div class="nav-in">'+tabs.map(function(t){ return '<a href="#/'+t[0]+'" class="'+(t[0]===on?'on':'')+'"'+(t[0]===on?' aria-current="page"':'')+'>'+icon(t[2])+'<span>'+t[1]+'</span></a>'; }).join('')+'</div>';
}
function render(){
  parseRoute();
  if(route.name==='training' && !state.active){ history.replaceState(null,'','#/home'); route={name:'home',arg:''}; }
  if(route.name==='klaar' && !state.sessions.some(function(s){ return s.id===state.lastSessionId; })){ history.replaceState(null,'','#/home'); route={name:'home',arg:''}; }
  var training=route.name==='training';
  $('#app').classList.toggle('training',training);
  $('#nav').classList.toggle('hide',training||route.name==='klaar');
  var html;
  switch(route.name){
    case 'plan': html=viewPlan(); break;
    case 'programma': html=viewProgram(); break;
    case 'oefeningen': html=viewExercises(); break;
    case 'oefening': html=viewExercise(route.arg); break;
    case 'voortgang': html=viewProgress(); break;
    case 'gewicht': html=viewWeight(); break;
    case 'instellingen': html=viewSettings(); break;
    case 'training': html=viewTraining(); break;
    case 'klaar': html=viewDone(); break;
    default: html=viewHome(); route={name:'home',arg:''};
  }
  var y=window.scrollY;
  $('#view').innerHTML=html;
  var key=route.name+'/'+route.arg;
  if(key!==lastRouteKey){ window.scrollTo(0,0); lastRouteKey=key; } else window.scrollTo(0,y);
  renderNav();
  if(training) wakeOn(); else wakeOff();
}

/* ================= Tikken en acties ================= */
function upsertBody(date,kg,waist){
  var ex=state.body.filter(function(b){ return b.date===date; })[0];
  if(ex){ if(kg!==null) ex.kg=kg; if(waist!==null) ex.waist=waist; }
  else state.body.push({date:date,kg:kg,waist:waist});
  state.body.sort(function(a,b){ return a.date<b.date?-1:a.date>b.date?1:0; });
}
function setWeek(n,finished){
  state.prog.week=clamp(n,1,8); state.prog.weekStart=todayISO(); state.prog.finished=!!finished; clampProgress(); save(); render();
}
function readNum(id){ var el=document.getElementById(id); if(!el||el.value.trim()==='') return null; var v=parseFloat(el.value.replace(',','.')); return isFinite(v)?v:NaN; }

var ACT = {
  welcome:function(){ state.flags.welcome=true; save(); render(); },
  start:function(d){ if(state.active){ nav('#/training'); return; } startWorkout(d.type==='B'?'B':'A', d.date||null); },
  startfree:function(d){ if(state.active){ nav('#/training'); return; } startWorkout(d.type==='B'?'B':'A', null); },
  resume:function(){ nav('#/training'); },
  dropactive:function(){ confirmBox('Training weggooien?','De training die bezig was wordt niet opgeslagen.','Weggooien',true).then(function(ok){ if(ok){ state.active=null; save(); render(); } }); },
  skip:function(d){ state.plan.skipped[d.date]=true; save(); render(); toast('Overgeslagen. Je schema loopt gewoon door.'); },
  unskip:function(d){ delete state.plan.skipped[d.date]; save(); render(); },
  resetday:function(d){ delete state.plan.overrides[d.date]; delete state.plan.skipped[d.date]; save(); render(); },
  move:function(d){
    var from=d.date, today=todayISO(), opts=[];
    for(var i=0;i<14;i++){ var di=iso(addDays(new Date(),i)); if(di===from) continue; var inf=dayInfo(di); if(!inf.strength) opts.push(di); }
    if(!opts.length){ toast('Geen vrije dag in de komende twee weken.'); return; }
    var type=effType(from);
    modal({title:'Verplaats '+typeLabel(type),sheet:true,html:'<p class="muted small" style="margin-bottom:10px">Kies een dag zonder krachttraining.</p><div class="stack">'+opts.map(function(di){ return '<button class="btn" data-val="'+di+'">'+fmtLong(parseISO(di))+'<small>nu: '+typeLabel(effType(di))+'</small></button>'; }).join('')+'</div>',actions:[{label:'Annuleren',val:'no',cls:'ghost'}]})
    .then(function(v){
      if(!v||v==='no') return;
      if(isStrength(baseType(parseISO(from)))) state.plan.overrides[from]='rest'; else delete state.plan.overrides[from];
      delete state.plan.skipped[from];
      state.plan.overrides[v]=type; save(); render(); toast('Verplaatst naar '+fmtShort(parseISO(v))+'.');
    });
  },
  addtrain:function(d){
    modal({title:'Training toevoegen op '+fmtShort(parseISO(d.date)),sheet:true,html:'<p class="muted small">Plan alleen extra training als je goed hersteld bent.</p>',actions:[{label:'Training A',val:'A'},{label:'Training B',val:'B'},{label:'Annuleren',val:'no',cls:'ghost'}]})
    .then(function(v){ if(v==='A'||v==='B'){ state.plan.overrides[d.date]=v; save(); render(); } });
  },
  wprev:function(){ setWeek(state.prog.week-1,false); toast('Terug naar week '+state.prog.week+'.'); },
  wnext:function(){
    var wk=state.prog.week;
    if(wk>=8){ setWeek(8,true); toast('Programma afgerond. Goed gedaan!'); return; }
    setWeek(wk+1,false); toast('Week '+state.prog.week+' gestart.');
  },
  wrepeat:function(){ setWeek(state.prog.week,false); toast('Je herhaalt week '+state.prog.week+'. Geen probleem.'); },
  wrestart:function(){ confirmBox('Opnieuw beginnen?','Je gaat terug naar week 1 en je extra herhalingen en sets worden teruggezet. Je trainingsgeschiedenis blijft bewaard.','Opnieuw beginnen',true).then(function(ok){ if(ok){ state.prog.ex={}; state.assess={}; setWeek(1,false); } }); },
  pstep:function(d){
    var p=state.prog.ex[d.ex]||(state.prog.ex[d.ex]={steps:0,sets:0}), cap=weekCap(state.prog.week), dl=parseInt(d.d,10);
    if(dl>0&&!canRaise(state.prog.week)) return;
    p.steps=clamp(p.steps+dl,0,cap.steps); save(); render();
  },
  pset:function(d){
    var p=state.prog.ex[d.ex]||(state.prog.ex[d.ex]={steps:0,sets:0}), cap=weekCap(state.prog.week), dl=parseInt(d.d,10);
    if(dl>0&&!canRaise(state.prog.week)) return;
    p.sets=clamp(p.sets+dl,0,cap.sets); save(); render();
  },
  assess:function(d){ var k='c'+d.i; state.assess[k]=!state.assess[k]; save(); render(); },

  tstart:function(){ var a=state.active; touch(a); tStart(a.timer); save(); renderTraining(); },
  tresume:function(){ var a=state.active; touch(a); tStart(a.timer); save(); renderTraining(); },
  tpause:function(){ var a=state.active; touch(a); tPause(a.timer); save(); renderTraining(); },
  tdone:function(){ var a=state.active; if(!a) return; if(a.phase==='rest') endRest(); else completeUnit(false); },
  reps:function(d){ var a=state.active; a.curReps=clamp(a.curReps+parseInt(d.d,10),0,99); save(); var el=$('#repsNum'); if(el) el.textContent=a.curReps; },
  rest30:function(){
    var a=state.active, t=a.timer; touch(a);
    if(t.status==='done'){ t.dur+=30000; t.acc=t.dur-30000; t.status='running'; t.startedAt=Date.now(); t.lastSec=null; }
    else t.dur+=30000;
    save(); renderTraining();
  },
  tprev:function(){ jumpExercise(-1); },
  tnext:function(){ jumpExercise(1); },
  tend:function(){ askFinish(); },
  tech:function(){ var a=state.active; var id=a.items[a.ei].ex; modal({title:EX[id].name,sheet:true,html:exDetailHtml(id),actions:[{label:'Sluiten',val:'x',cls:'primary'}]}); },

  rate:function(d){ var s=state.sessions.filter(function(x){ return x.id===state.lastSessionId; })[0]; if(s){ s.rating=d.v; save(); render(); } },
  delsession:function(d){ confirmBox('Training verwijderen?','Deze training verdwijnt uit je statistieken.','Verwijderen',true).then(function(ok){ if(ok){ state.sessions=state.sessions.filter(function(s){ return s.id!==d.id; }); save(); render(); } }); },
  savebody:function(){
    var date=$('#bd').value, kg=readNum('bkg'), wa=readNum('bwa');
    if(!validISO(date)){ toast('Kies een geldige datum.'); return; }
    if(kg===null&&wa===null){ toast('Vul een gewicht of een middelomtrek in.'); return; }
    if((kg!==null&&(isNaN(kg)||kg<30||kg>300))||(wa!==null&&(isNaN(wa)||wa<40||wa>200))){ toast('Controleer de ingevulde waarden.'); return; }
    upsertBody(date,kg,wa); save(); render(); toast('Meting opgeslagen.');
  },
  delbody:function(d){ confirmBox('Meting wissen?','De meting van '+fmtDay(d.date)+' wordt verwijderd.','Wissen',true).then(function(ok){ if(ok){ state.body=state.body.filter(function(b){ return b.date!==d.date; }); save(); render(); } }); },
  setkg:function(){ var kg=readNum('skg'); if(kg===null||isNaN(kg)||kg<30||kg>300){ toast('Vul een gewicht tussen 30 en 300 kg in.'); return; } upsertBody(todayISO(),kg,null); save(); render(); toast('Gewicht opgeslagen.'); },
  setday:function(d){
    var i=parseInt(d.d,10), days=state.settings.days.slice(), p=days.indexOf(i);
    if(p>=0) days.splice(p,1); else days.push(i);
    if(days.length<2){ toast('Kies minstens 2 trainingsdagen.'); return; }
    if(days.length>4){ toast('Kies maximaal 4 trainingsdagen, voor voldoende herstel.'); return; }
    state.settings.days=days.sort(function(a,b){ return a-b; }); save(); render();
  },
  setrest:function(d){ state.settings.restSec=parseInt(d.v,10); save(); render(); },
  toggle:function(d){ state.settings[d.key]=!state.settings[d.key]; save(); render(); if(d.key==='sound'&&state.settings.sound){ ensureAudio(); beep(880,0.15,0); } if(d.key==='wake'&&!state.settings.wake) wakeOff(); },
  export:function(){
    var blob=new Blob([JSON.stringify({app:'kettlebell-coach',version:1,exportedAt:new Date().toISOString(),data:state},null,2)],{type:'application/json'});
    var url=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=url; a.download='kettlebell-coach-backup-'+todayISO()+'.json'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); },5000); toast('Back-up gedownload.');
  },
  importbtn:function(){ var f=$('#imp'); if(f) f.click(); },
  resetprog:function(){
    confirmBox('Trainingsvoortgang resetten?','Je trainingsgeschiedenis, het programma (terug naar week 1), overgeslagen en verplaatste trainingen worden gewist. Je gewichts- en omtrekmetingen en je instellingen blijven bewaard.','Resetten',true).then(function(ok){
      if(!ok) return;
      state.sessions=[]; state.lastSessionId=null; state.active=null; state.plan={overrides:{},skipped:{}};
      state.prog={week:1,weekStart:todayISO(),finished:false,ex:{}}; state.assess={}; state.startDate=todayISO(); save(); wakeOff(); nav('#/home'); toast('Voortgang gereset.');
    });
  },
  wipe:function(){
    confirmBox('Alle gegevens verwijderen?','Alles wordt gewist: trainingen, metingen en instellingen. Dit kan niet ongedaan worden gemaakt. Maak eerst een back-up als je die nog wilt.','Alles verwijderen',true).then(function(ok){
      if(!ok) return;
      try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
      state=defaultState(); wakeOff(); save(); history.replaceState(null,'','#/home'); render(); toast('Alle gegevens zijn verwijderd.');
    });
  }
};

function importFile(file){
  var r=new FileReader();
  r.onload=function(){
    var obj;
    try{ obj=JSON.parse(r.result); if(!isObj(obj)||obj.app!=='kettlebell-coach'||!isObj(obj.data)) throw new Error('vorm'); }
    catch(e){ infoBox('Dit bestand kan niet worden gelezen','Kies een JSON-bestand dat je eerder met deze app hebt geëxporteerd.'); return; }
    var n=normalize(obj.data); n.active=null;
    confirmBox('Back-up terugzetten?','Dit vervangt alle huidige gegevens door de back-up'+(obj.exportedAt?' van '+esc(String(obj.exportedAt).slice(0,10)):'')+' ('+n.sessions.length+' trainingen, '+n.body.length+' metingen).','Terugzetten',true).then(function(ok){
      if(!ok) return; state=n; save(); wakeOff(); nav('#/home'); render(); toast('Back-up teruggezet.');
    });
  };
  r.onerror=function(){ infoBox('Bestand niet gelezen','Er ging iets mis bij het lezen van het bestand.'); };
  r.readAsText(file);
}

/* ================= Klok: tikken, signalen ================= */
var lastTickSig = 0;
function tick(){
  var a=state.active; if(!a) return;
  var t=a.timer;
  if(t.kind==='countdown' && t.status==='running'){
    var rem=tRemaining(t), sec=Math.ceil(rem/1000);
    if(rem>0 && sec<=3 && t.lastSec!==sec && document.visibilityState==='visible'){ t.lastSec=sec; signal('tick'); }
    if(rem<=0){
      t.status='done'; t.acc=t.dur;
      signal('end');
      if(a.phase==='work'){ completeUnit(true); } else { save(); renderTraining(); }
      return;
    }
  }
  if(route.name==='training'){ var el=$('#tNum'); if(el){ var txt=timerText(a); if(el.textContent!==txt) el.textContent=txt; } }
}

/* ================= Start ================= */
function init(){
  load();
  document.addEventListener('click',function(e){
    var go=e.target.closest('[data-go]'); if(go){ nav(go.getAttribute('data-go')); return; }
    var el=e.target.closest('[data-act]'); if(!el) return;
    ensureAudio();
    var f=ACT[el.getAttribute('data-act')]; if(f){ e.preventDefault(); f(el.dataset,el); }
  });
  document.addEventListener('change',function(e){
    var t=e.target;
    if(t.id==='imp' && t.files && t.files[0]){ importFile(t.files[0]); t.value=''; return; }
    if(t.getAttribute&&t.getAttribute('data-chg')==='name'){ state.settings.name=t.value.trim().slice(0,30); save(); }
  });
  window.addEventListener('hashchange',render);
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='visible'){ tick(); if(route.name==='training'){ renderTraining(); wakeOn(); } }
  });
  window.addEventListener('pagehide',save);
  render();
  setInterval(tick,250);
  try{ if(navigator.storage&&navigator.storage.persist) navigator.storage.persist(); }catch(e){}
  if('serviceWorker' in navigator){
    window.addEventListener('load',function(){ navigator.serviceWorker.register('service-worker.js').catch(function(){}); });
  }
}
init();
})();
