// Mileage award seats: data/award.json from koreanair-award-alert (updatedAt, routes[{cabin,dep,arr,name,area,dates{YYYYMMDD:[flights]}}]).
import {el} from './ui.js';

const CABIN={F:'일등석',P:'프레스티지',E:'일반석'};
const AREA={AME:'미주',EUR:'유럽',OCN:'대양주',EAA:'일본·중국',SEA:'동남아',CIS:'몽골'};
// Korean Air takes search conditions only from the form, so the link opens the mileage booking tab.
const BOOK_URL='https://www.koreanair.com/booking/search?bookingType=A';

export function mount(root,data){
  const cabins=[...new Set(data.routes.map(r=>r.cabin))].sort();
  const areas=[...new Set(data.routes.map(r=>r.area).filter(Boolean))];
  const ui={cabin:cabins[0],areas:new Set(areas),term:''};

  const updated=new Date(data.updatedAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'});
  root.append(el('div',{className:'head'},el('h1',{},'대한항공 마일리지 빈자리'),el('p',{},`장거리 보너스 좌석(편도) · 대한항공 ${updated} 조회 기준 · 날짜에 마우스를 올리면 편명`)));

  const cabinChips=el('div',{className:'chips'}),areaChips=el('div',{className:'chips'});
  const search=el('input',{type:'search',placeholder:'도시·공항 검색'});
  root.append(el('div',{className:'bar'},cabinChips,areaChips,search));
  const count=el('p',{className:'count'}),list=el('div',{className:'routes'});
  root.append(count,list);

  const chip=(label,on,toggle)=>{const b=el('button',{type:'button',className:'chip'},label);b.setAttribute('aria-pressed',on);b.onclick=toggle;return b;};
  function render(){
    cabinChips.replaceChildren(...cabins.map(c=>chip(CABIN[c]||c,ui.cabin===c,()=>{ui.cabin=c;render();})));
    areaChips.replaceChildren(...areas.map(a=>chip(AREA[a]||a,ui.areas.has(a),()=>{ui.areas.has(a)?ui.areas.delete(a):ui.areas.add(a);render();})));
    const term=ui.term.trim().toLowerCase();
    const rows=data.routes.filter(r=>r.cabin===ui.cabin&&ui.areas.has(r.area)&&(!term||[r.dep,r.arr,r.name].join(' ').toLowerCase().includes(term)));
    count.textContent=`${CABIN[ui.cabin]||ui.cabin} ${rows.length}개 노선`;
    list.replaceChildren(...(rows.length?rows.map(r=>{
      const dates=Object.entries(r.dates);
      return el('div',{className:'route'},
        el('div',{},el('b',{},`${r.dep} → ${r.arr}`),el('small',{},`${r.name} · ${AREA[r.area]||''}`)),
        el('div',{className:'n'},dates.length+'일'),
        el('div',{className:'dates'},...dates.map(([d,f])=>el('span',{className:'d',title:f.join(', ')},`${d.slice(2,4)}.${d.slice(4,6)}.${d.slice(6)}`))),
        el('a',{className:'go',href:BOOK_URL,target:'_blank',rel:'noopener'},'예매 →'));
    }):[el('p',{className:'empty'},'조건에 맞는 남은 좌석이 없습니다.')]));
  }
  search.oninput=()=>{ui.term=search.value;render();};
  render();
}
