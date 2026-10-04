// Mileage award seats: data/award.json (koreanair-award-alert) + data/fares.json (STAYOVER weekly approximate fares).
// Won per mile = (one-way cash fare without taxes) ÷ required miles; taxes and fuel surcharge are paid on award tickets too.
import {el,won,koreanAirLink} from './ui.js?v=20261004f';

const CABIN={F:'일등석',P:'프레스티지',E:'일반석'};
const AREA={AME:'미주',EUR:'유럽',OCN:'대양주',EAA:'일본·중국',SEA:'동남아',CIS:'몽골'};
const BOOK_URL='https://www.koreanair.com/booking/search?bookingType=A';
// Official SKYPASS charts, one-way from/to Korea, [off-peak, peak] (koreanair.com 공제 마일리지, checked 2026-10-04).
const ZONE={AME:'LONG',EUR:'LONG',OCN:'LONG',EAA:'NEA',CIS:'NEA',SEA:'SEA'};
const AWARD={P:{NEA:[22500,32500],SEA:[35000,52500],SWA:[45000,67500],LONG:[62500,92500]},F:{NEA:[32500,47500],SEA:[45000,67500],SWA:[57500,87500],LONG:[80000,120000]}};
const UPGRADE={P:{NEA:[10000,15000],SEA:[17500,25000],SWA:[20000,30000],LONG:[40000,60000]},F:{NEA:[12500,17500],SEA:[17500,25000],SWA:[20000,30000],LONG:[40000,60000]}};
// Upgrade into P starts from an Economy Flex ticket, into F from a Prestige ticket.
const FARE={award:{P:['prestige'],F:['first']},upgrade:{P:['prestige','economy-flex'],F:['first','prestige']}};
const AMERICAS=new Set('LAX SFO SEA LAS JFK IAD ORD ATL BOS DFW HNL YVR YYZ'.split(' '));

const iso=d=>`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6)}`;
function isPeak(peak,dep,date){
  const area=(peak||[]).find(a=>a.areaCd===(AMERICAS.has(dep)?'AME':'GLB'));
  const ymd=date.replace(/-/g,'');
  return !!area?.peakYear?.some(y=>y.peakMonth.some(m=>m.peakDate.some(p=>ymd>=p.from&&ymd<=p.to)));
}
// Rough fare: the collected calendar date closest to the seat date, within 20 days.
function nearFare(map,date){
  let best=null,gap=Infinity;
  for(const [d,v] of Object.entries(map||{})){const g=Math.abs(Date.parse(d)-Date.parse(date));if(g<gap){gap=g;best=v;}}
  return gap<=20*86400000?best:null;
}
function valueOf(fares,route,cabin,date,mode){
  const zone=ZONE[route.area]||'LONG',peak=isPeak(fares?.peak,route.dep,date);
  const miles=(mode==='award'?AWARD:UPGRADE)[cabin]?.[zone]?.[peak?1:0];
  const r=fares?.routes?.[route.dep+'-'+route.arr];
  const [top,from]=FARE[mode][cabin].map(c=>nearFare(r?.[c],date));
  if(!miles||!top||(mode==='upgrade'&&!from))return {miles,peak,value:null};
  const cash=top.base-(mode==='upgrade'?from.base:0);
  return {miles,peak,cash,buy:mode==='upgrade'?from.total:null,value:cash/miles};
}

export function mount(root,data,fares){
  const cabins=[...new Set(data.routes.map(r=>r.cabin))].sort();
  const areas=[...new Set(data.routes.map(r=>r.area).filter(Boolean))];
  const ui={cabin:cabins[0],areas:new Set(areas),term:'',mode:'award',min:0};

  const updated=new Date(data.updatedAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'});
  root.append(el('div',{className:'head'},el('h1',{},'대한항공 마일리지 빈자리'),
    el('p',{},`장거리 보너스 좌석(편도) · 날짜를 누르면 그 날짜로 마일리지 예매 화면이 열립니다(로그인 필요) · 좌석 ${updated} 조회 · `+(fares?`현금가 ${new Date(fares.updatedAt).toLocaleDateString('ko-KR')} 기준(대략, 매주 갱신) · 날짜에 마우스를 올리면 계산 근거`:'현금가 수집 전이라 1마일당 가치는 아직 표시되지 않습니다'))));

  const cabinSeg=el('div',{className:'segmented',role:'radiogroup'}),modeSeg=el('div',{className:'segmented',role:'radiogroup'}),areaChips=el('div',{className:'chips'});
  const minSel=el('select',{disabled:!fares},...[[0,'전체'],[20,'20원 이상'],[30,'30원 이상'],[40,'40원 이상'],[50,'50원 이상'],[60,'60원 이상'],[80,'80원 이상']].map(([v,t])=>el('option',{value:v},t)));
  const search=el('input',{type:'search',placeholder:'도시·공항 검색'});
  root.append(el('div',{className:'bar grouped'},
    el('div',{className:'group'},el('span',{className:'group-label'},'좌석 등급'),cabinSeg),
    el('div',{className:'group'},el('span',{className:'group-label'},'사용 방법'),modeSeg),
    el('div',{className:'group'},el('span',{className:'group-label'},'1마일당 가치'),minSel),
    el('div',{className:'group'},el('span',{className:'group-label'},'지역'),areaChips),
    el('div',{className:'group grow'},el('span',{className:'group-label'},'검색'),search)));
  const note=el('p',{className:'count'}),count=el('p',{className:'count'}),list=el('div',{className:'routes'});
  root.append(note,count,list);

  const seg=(box,items,cur,set)=>box.replaceChildren(...items.map(([v,t])=>{const b=el('button',{type:'button',role:'radio'},t);b.setAttribute('aria-checked',cur===v);b.onclick=()=>{set(v);render();};return b;}));
  const chip=(label,on,toggle)=>{const b=el('button',{type:'button',className:'chip'},label);b.setAttribute('aria-pressed',on);b.onclick=toggle;return b;};
  function render(){
    seg(cabinSeg,cabins.map(c=>[c,CABIN[c]||c]),ui.cabin,v=>ui.cabin=v);
    seg(modeSeg,[['award','마일리지 발권'],['upgrade',ui.cabin==='F'?'승급 (프레스티지→일등석)':'승급 (일반석→프레스티지)']],ui.mode,v=>ui.mode=v);
    areaChips.replaceChildren(...areas.map(a=>chip(AREA[a]||a,ui.areas.has(a),()=>{ui.areas.has(a)?ui.areas.delete(a):ui.areas.add(a);render();})));
    note.textContent=ui.mode==='upgrade'
      ?`승급: ${ui.cabin==='F'?'프레스티지':'일반석 플렉스'} 항공권을 현금으로 산 뒤 마일리지로 올립니다. 가치 = (${CABIN[ui.cabin]} 운임 − 산 항공권 운임) ÷ 승급 마일. 승급 가능 좌석은 마일리지 좌석과 다를 수 있으니 예약 시 확인하세요.`
      :'마일리지 발권: 가치 = 같은 좌석 현금 운임(세금·유류할증료 제외, 대략) ÷ 공제 마일. 세금·유류할증료는 마일리지 발권에도 따로 냅니다.';
    const term=ui.term.trim().toLowerCase();
    const rows=data.routes.filter(r=>r.cabin===ui.cabin&&ui.areas.has(r.area)&&(!term||[r.dep,r.arr,r.name].join(' ').toLowerCase().includes(term)))
      .map(r=>({r,dates:Object.entries(r.dates).map(([d,f])=>({d,f,v:valueOf(fares,r,ui.cabin,iso(d),ui.mode)})).filter(x=>!ui.min||(x.v.value??0)>=ui.min)}))
      .filter(x=>x.dates.length);
    count.textContent=`${CABIN[ui.cabin]||ui.cabin} ${rows.length}개 노선 · 좌석 ${rows.reduce((n,x)=>n+x.dates.length,0)}일`;
    list.replaceChildren(...(rows.length?rows.map(({r,dates})=>{
      const vals=dates.map(x=>x.v.value).filter(Number.isFinite),chart=(ui.mode==='award'?AWARD:UPGRADE)[ui.cabin]?.[ZONE[r.area]||'LONG'];
      const range=vals.length?`1마일당 ${Math.round(Math.min(...vals))}~${Math.round(Math.max(...vals))}원`:'가치 계산 전';
      return el('div',{className:'route'},
        el('div',{},el('b',{},`${r.dep} → ${r.arr}`),el('small',{},`${r.name} · ${AREA[r.area]||''}`)),
        el('div',{className:'n'},el('b',{},range),el('small',{},`${dates.length}일 · ${chart?chart.map(n=>n.toLocaleString('ko-KR')).join(' / ')+'마일 (평/성수기)':'-'}`)),
        el('div',{className:'dates'},...dates.map(({d,f,v})=>el('a',{className:'d'+(v.peak?' peak':''),target:'_blank',rel:'noopener',
          href:ui.mode==='upgrade'?koreanAirLink({trip:'OW',from:r.dep,to:r.arr,date:iso(d),cabin:ui.cabin==='F'?'business':'economy',upgrade:true}):koreanAirLink({type:'A',trip:'OW',from:r.dep,to:r.arr,date:iso(d),cabin:ui.cabin==='F'?'first':'business'}),
          title:[f.join(', '),v.peak?'성수기':'평수기',`${(v.miles||0).toLocaleString('ko-KR')}마일`,v.value?`현금 약 ${won(v.cash)} ÷ 마일 = ${v.value.toFixed(1)}원`:'현금가 없음',v.buy?`먼저 구매: 약 ${won(v.buy)}`:'','누르면 이 날짜로 예매 화면이 열립니다(로그인 필요)'].filter(Boolean).join(' · ')},
          `${d.slice(2,4)}.${d.slice(4,6)}.${d.slice(6)}`,v.value?el('em',{},` ${Math.round(v.value)}원`):''))),
        el('a',{className:'go',href:BOOK_URL,target:'_blank',rel:'noopener'},'예매 →'));
    }):[el('p',{className:'empty'},'조건에 맞는 남은 좌석이 없습니다.')]));
  }
  minSel.onchange=()=>{ui.min=Number(minSel.value);render();};
  search.oninput=()=>{ui.term=search.value;render();};
  render();
}
