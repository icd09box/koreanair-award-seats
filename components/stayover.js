// 변태발권 survey: data/stayover.json from STAYOVER (cities[] same city both trips, pairs[] first trip code → second trip cityB).
import {el,won} from './ui.js';

const NAMES={NRT:'도쿄 나리타',HND:'도쿄 하네다',KIX:'오사카',NGO:'나고야',FUK:'후쿠오카',CTS:'삿포로',OKA:'오키나와',KOJ:'가고시마',KMQ:'고마쓰',OKJ:'오카야마',KIJ:'니가타',AOJ:'아오모리',
  PEK:'베이징',PVG:'상하이',CAN:'광저우',SZX:'선전',TAO:'칭다오',SHE:'선양',DLC:'다롄',XMN:'샤먼',TSN:'톈진',XIY:'시안',WEH:'웨이하이',YNJ:'옌지',CKG:'충칭',NKG:'난징',TPE:'타이베이',KHH:'가오슝',HKG:'홍콩',MFM:'마카오',UBN:'울란바토르',
  BKK:'방콕',HKT:'푸껫',CNX:'치앙마이',SIN:'싱가포르',KUL:'쿠알라룸푸르',BKI:'코타키나발루',CGK:'자카르타',DPS:'발리',MNL:'마닐라',CEB:'세부',CRK:'클락',SGN:'호찌민',HAN:'하노이',DAD:'다낭',CXR:'나트랑',PQC:'푸꾸옥',PNH:'프놈펜',RGN:'양곤',VTE:'비엔티안',
  DEL:'델리',BOM:'뭄바이',KTM:'카트만두',MLE:'몰디브',CMB:'콜롬보',TAS:'타슈켄트',ALA:'알마티',NQZ:'아스타나',DXB:'두바이',TLV:'텔아비브',
  SYD:'시드니',BNE:'브리즈번',AKL:'오클랜드',GUM:'괌',SPN:'사이판',NAN:'난디',
  LAX:'로스앤젤레스',SFO:'샌프란시스코',SEA:'시애틀',LAS:'라스베이거스',JFK:'뉴욕',IAD:'워싱턴',ORD:'시카고',ATL:'애틀랜타',BOS:'보스턴',DFW:'댈러스',HNL:'호놀룰루',YVR:'밴쿠버',YYZ:'토론토',
  LHR:'런던',CDG:'파리',FRA:'프랑크푸르트',AMS:'암스테르담',FCO:'로마',MXP:'밀라노',MAD:'마드리드',BCN:'바르셀로나',PRG:'프라하',VIE:'빈',ZRH:'취리히',IST:'이스탄불',BUD:'부다페스트',ZAG:'자그레브',CPH:'코펜하겐'};
const GROUPS={'일본':'NRT HND KIX NGO FUK CTS OKA KOJ KMQ OKJ KIJ AOJ','중화권':'PEK PVG CAN SZX TAO SHE DLC XMN TSN XIY WEH YNJ CKG NKG TPE KHH HKG MFM UBN','동남아':'BKK HKT CNX SIN KUL BKI CGK DPS MNL CEB CRK SGN HAN DAD CXR PQC PNH RGN VTE',
  '서·남아시아':'DEL BOM KTM MLE CMB TAS ALA NQZ DXB TLV','대양주':'SYD BNE AKL GUM SPN NAN','미주':'LAX SFO SEA LAS JFK IAD ORD ATL BOS DFW HNL YVR YYZ','유럽':'LHR CDG FRA AMS FCO MXP MAD BCN PRG VIE ZRH IST BUD ZAG CPH'};
const region=c=>Object.keys(GROUPS).find(k=>GROUPS[k].split(' ').includes(c))||'기타';
const name=c=>NAMES[c]||c;
const md=s=>Number(s.slice(5,7))+'/'+Number(s.slice(8,10));
const kd=s=>`${Number(s.slice(5,7))}월 ${Number(s.slice(8,10))}일(${'일월화수목금토'[new Date(s+'T00:00:00Z').getUTCDay()]})`;
const when=s=>s?new Date(s).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}):'-';

// Korean Air has no pre-filled booking links, so each card spells out what to enter.
function guideText(c,people){
  const b=c.best,t=b.parts,A=c.code,B=c.cityB||A,a=`${name(A)} (${A})`,bb=`${name(B)} (${B})`,same=A===B;
  const kind=same?'왕복':'다구간 (출발지와 귀국지가 달라 다구간으로 검색)';
  return [`[${same?name(A):name(A)+' + '+name(B)} 변태발권 · 성인 ${people}명 · 일반석]`,'',
    `■ 표① 인천 출발 장기 왕복 (약 ${won(t.outer)})`,`  대한항공 > 항공권 예매 > ${kind}`,
    same?`  출발지: 서울/인천 (ICN) → 도착지: ${a}`:`  여정1: 서울/인천 (ICN) → ${a}`,
    same?`  가는 날: ${kd(b.dates[0])} / 오는 날: ${kd(b.dates[3])}`:`  여정1 날짜: ${kd(b.dates[0])}\n  여정2: ${bb} → 서울/인천 (ICN), 날짜: ${kd(b.dates[3])}`,
    `  확인: 운임 규정의 최대 체류 기간이 ${kd(b.dates[3])} 귀국을 허용하는지`,'',
    `■ 표② ${name(A)} 출발 왕복 (약 ${won(t.inner)})`,`  대한항공 > 항공권 예매 > ${kind}`,
    same?`  출발지: ${a} → 도착지: 서울/인천 (ICN)`:`  여정1: ${a} → 서울/인천 (ICN)`,
    same?`  가는 날: ${kd(b.dates[1])} / 오는 날: ${kd(b.dates[2])}`:`  여정1 날짜: ${kd(b.dates[1])}\n  여정2: 서울/인천 (ICN) → ${bb}, 날짜: ${kd(b.dates[2])}`,
    '  확인: 해외 출발이라 현지 통화로 보이면 통화를 KRW로 바꿔 비교 (원화 결제는 한국 발행 카드만 가능)','',
    '■ 실제 탑승 순서',`  1) ${kd(b.dates[0])} 인천→${name(A)} — 표① 첫 구간`,`  2) ${kd(b.dates[1])} ${name(A)}→인천 — 표② 첫 구간`,`     (한국 ${b.stay}일 체류)`,
    `  3) ${kd(b.dates[2])} 인천→${name(B)} — 표② 둘째 구간`,`  4) ${kd(b.dates[3])} ${name(B)}→인천 — 표① 둘째 구간`,'',
    '■ 주의','  · 두 표는 각각 따로 예약합니다 (예약번호 2개).','  · 각 표는 순서대로 모두 타야 합니다. 앞 구간을 안 타면 뒤 구간이 자동 취소됩니다.',
    `  · 일반 왕복 두 번 ${won(b.baseline)} 대비 ${b.saving>0?won(b.saving)+' 절약':won(-b.saving)+' 더 비쌈'} (조회 ${when(c.observedAt)} 기준, 결제 전 재확인)`].join('\n');
}

function card(c,people){
  const b=c.best,t=b.parts,A=c.code,B=c.cityB||A,same=A===B;
  const pre=el('pre',{},guideText(c,people)),copy=el('button',{type:'button'},'예매 안내 복사');
  copy.onclick=async()=>{try{await navigator.clipboard.writeText(pre.textContent);copy.textContent='복사했습니다';}catch{copy.textContent='길게 눌러 선택해 복사하세요';}setTimeout(()=>copy.textContent='예매 안내 복사',2500);};
  return el('article',{className:'card'},
    el('div',{className:'visual',style:`background:${b.saving>0?'var(--hack)':'var(--plain)'}`},el('div',{className:'codes'},same?A:`${A} → ${B}`),el('div',{className:'route-name'},`${same?name(A):name(A)+' → '+name(B)} · 한국 ${b.stay}일`)),
    el('div',{className:'info'},
      el('h3',{},`${same?name(A):name(A)+' + '+name(B)} 변태발권`),
      el('p',{className:'sub'},`${md(b.dates[0])} ${name(A)} 출국 · ${md(b.dates[1])} 귀국 → 한국 ${b.stay}일 → ${md(b.dates[2])} ${name(B)} 출국 · ${md(b.dates[3])} 귀국`),
      el('span',{className:'badge'+(b.saving>0?'':' worse')},b.saving>0?won(b.saving)+' 절약':won(-b.saving)+' 더 비쌈'),
      el('ul',{className:'tickets'},
        el('li',{},`① 인천→${name(A)} ${md(b.dates[0])} / ${name(B)}→인천 ${md(b.dates[3])} (인천 출발 장기 왕복) · ${won(t.outer)}`),
        el('li',{},`② ${name(A)}→인천 ${md(b.dates[1])} / 인천→${name(B)} ${md(b.dates[2])} (${name(A)} 출발 왕복) · ${won(t.inner)}`))),
    el('div',{className:'price'},
      b.saving>0&&el('span',{className:'tag'},Math.round(b.saving/b.baseline*100)+'% 절약'),
      el('span',{className:'small'},'변태발권 왕복 2장'),el('strong',{className:'big'},won(b.hack)),el('s',{},won(b.baseline)),
      el('span',{className:'small'},`일반 왕복 두 번 (${won(t.rtA)} + ${won(t.rtB)})`),el('span',{className:'small'},'조회 '+when(c.observedAt)),
      el('a',{className:'cta',href:'https://www.koreanair.com/booking/search',target:'_blank',rel:'noopener'},'대한항공 예매 열기')),
    el('details',{className:'guide'},el('summary',{},'예매 방법 보기 (표 2장 입력값과 탑승 순서)'),pre,copy));
}

export function mount(root,data){
  const p=data.state?.progress||{},people=data.job?.settings?.people||1,regions=Object.keys(GROUPS).concat('기타');
  const ui={view:'results',cheaper:true,sort:'saving',regions:new Set(regions),term:'',limit:20};
  root.append(el('div',{className:'head'},el('h1',{},`변태발권 조사 · ${data.job?.month||''} 출국`),
    el('p',{},`도시 ${p.citiesDone??0}/${p.cities??0}곳 조사 · 같은 도시 싸지는 곳 ${p.cheaper??0}곳 · 다른 도시 조합 ${p.pairsChecked??0}건 중 ${p.pairsCheaper??0}건 · ${when(data.generatedAt)} 갱신 (새벽 자동 수집)`)));

  const viewSel=el('select',{},el('option',{value:'results'},'변태발권 결과'),el('option',{value:'cities'},'전체 도시 표'));
  const sortSel=el('select',{},el('option',{value:'saving'},'절약액 큰 순'),el('option',{value:'hack'},'변태발권 총액 낮은 순'),el('option',{value:'date'},'출국일 빠른 순'));
  const cheaper=el('input',{type:'checkbox',checked:true}),search=el('input',{type:'search',placeholder:'도시 검색'}),chips=el('div',{className:'chips'});
  root.append(el('div',{className:'bar'},el('label',{},'보기 ',viewSel),el('label',{},'정렬 ',sortSel),el('label',{},cheaper,'싸지는 것만'),search,chips));
  const count=el('p',{className:'count'}),list=el('div',{}),more=el('button',{type:'button',className:'more'},'더 보기');
  root.append(count,list,more);

  const match=c=>(ui.regions.has(region(c.code))||(c.cityB&&ui.regions.has(region(c.cityB))))&&(!ui.term||[c.code,c.cityB||'',name(c.code),name(c.cityB||c.code)].join(' ').toLowerCase().includes(ui.term));
  function render(){
    chips.replaceChildren(...regions.map(r=>{const b=el('button',{type:'button',className:'chip'},r);b.setAttribute('aria-pressed',ui.regions.has(r));b.onclick=()=>{ui.regions.has(r)?ui.regions.delete(r):ui.regions.add(r);render();};return b;}));
    if(ui.view==='cities'){
      const rows=(data.cities||[]).filter(match).sort((a,b)=>(b.best?.saving??-Infinity)-(a.best?.saving??-Infinity));
      count.textContent=`도시 ${rows.length}곳`;more.hidden=true;
      list.replaceChildren(el('div',{className:'table-wrap'},el('table',{className:'table'},
        el('tr',{},...['도시','지역','1월 최저 왕복','변태발권','일반 왕복 두 번','차이','상태'].map(h=>el('th',{},h))),
        ...rows.map(c=>{const b=c.best,f=c.cheapestFirstTrip;return el('tr',{className:c.done?'':'pending'},el('td',{},`${name(c.code)} ${c.code}`),el('td',{},region(c.code)),
          el('td',{className:'num'},f?`${won(f.price)} (${md(f.dates[0])}~${md(f.dates[1])})`:'-'),el('td',{className:'num'},b?won(b.hack):'-'),el('td',{className:'num'},b?won(b.baseline):'-'),
          el('td',{className:'num'},b?(b.saving>0?won(b.saving)+' 절약':won(-b.saving)+' 비쌈'):'-'),el('td',{},c.done?(c.reason||'완료'):'조사 중'));}))));
      return;
    }
    const sorters={saving:(a,b)=>b.best.saving-a.best.saving,hack:(a,b)=>a.best.hack-b.best.hack,date:(a,b)=>a.best.dates[0].localeCompare(b.best.dates[0])};
    const rows=[...(data.cities||[]),...(data.pairs||[])].filter(c=>c.best&&(!ui.cheaper||c.best.saving>0)&&match(c)).sort(sorters[ui.sort]);
    count.textContent=`${rows.length}건 (같은 도시 ${rows.filter(c=>!c.cityB).length} · 다른 도시 조합 ${rows.filter(c=>c.cityB).length})`;
    list.replaceChildren(...(rows.length?rows.slice(0,ui.limit).map(c=>card(c,people)):[el('p',{className:'empty'},'조건에 맞는 결과가 아직 없습니다.')]));
    more.hidden=rows.length<=ui.limit;
  }
  viewSel.onchange=()=>{ui.view=viewSel.value;render();};sortSel.onchange=()=>{ui.sort=sortSel.value;ui.limit=20;render();};
  cheaper.onchange=()=>{ui.cheaper=cheaper.checked;ui.limit=20;render();};search.oninput=()=>{ui.term=search.value.trim().toLowerCase();ui.limit=20;render();};
  more.onclick=()=>{ui.limit+=20;render();};
  render();
}
