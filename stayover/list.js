(function(){
  'use strict';
  const cities={NRT:'도쿄 나리타',HND:'도쿄 하네다',KIX:'오사카',NGO:'나고야',FUK:'후쿠오카',CTS:'삿포로',OKA:'오키나와',KOJ:'가고시마',KMQ:'고마쓰',OKJ:'오카야마',KIJ:'니가타',AOJ:'아오모리',
    PEK:'베이징',PVG:'상하이',CAN:'광저우',SZX:'선전',TAO:'칭다오',SHE:'선양',DLC:'다롄',XMN:'샤먼',TSN:'톈진',XIY:'시안',WEH:'웨이하이',YNJ:'옌지',CKG:'충칭',NKG:'난징',TPE:'타이베이',KHH:'가오슝',HKG:'홍콩',MFM:'마카오',UBN:'울란바토르',
    BKK:'방콕',HKT:'푸껫',CNX:'치앙마이',SIN:'싱가포르',KUL:'쿠알라룸푸르',BKI:'코타키나발루',CGK:'자카르타',DPS:'발리',MNL:'마닐라',CEB:'세부',CRK:'클락',SGN:'호찌민',HAN:'하노이',DAD:'다낭',CXR:'나트랑',PQC:'푸꾸옥',PNH:'프놈펜',RGN:'양곤',VTE:'비엔티안',
    DEL:'델리',BOM:'뭄바이',KTM:'카트만두',MLE:'몰디브',CMB:'콜롬보',TAS:'타슈켄트',ALA:'알마티',NQZ:'아스타나',DXB:'두바이',TLV:'텔아비브',
    SYD:'시드니',BNE:'브리즈번',AKL:'오클랜드',GUM:'괌',SPN:'사이판',NAN:'난디',
    LAX:'로스앤젤레스',SFO:'샌프란시스코',SEA:'시애틀',LAS:'라스베이거스',JFK:'뉴욕',IAD:'워싱턴',ORD:'시카고',ATL:'애틀랜타',BOS:'보스턴',DFW:'댈러스',HNL:'호놀룰루',YVR:'밴쿠버',YYZ:'토론토',
    LHR:'런던',CDG:'파리',FRA:'프랑크푸르트',AMS:'암스테르담',FCO:'로마',MXP:'밀라노',MAD:'마드리드',BCN:'바르셀로나',PRG:'프라하',VIE:'빈',ZRH:'취리히',IST:'이스탄불',BUD:'부다페스트',ZAG:'자그레브',CPH:'코펜하겐'};
  const groups={'일본':['NRT','HND','KIX','NGO','FUK','CTS','OKA','KOJ','KMQ','OKJ','KIJ','AOJ'],'중화권':['PEK','PVG','CAN','SZX','TAO','SHE','DLC','XMN','TSN','XIY','WEH','YNJ','CKG','NKG','TPE','KHH','HKG','MFM','UBN'],'동남아':['BKK','HKT','CNX','SIN','KUL','BKI','CGK','DPS','MNL','CEB','CRK','SGN','HAN','DAD','CXR','PQC','PNH','RGN','VTE'],'서·남아시아':['DEL','BOM','KTM','MLE','CMB','TAS','ALA','NQZ','DXB','TLV'],'대양주':['SYD','BNE','AKL','GUM','SPN','NAN'],'미주':['LAX','SFO','SEA','LAS','JFK','IAD','ORD','ATL','BOS','DFW','HNL','YVR','YYZ'],'유럽':['LHR','CDG','FRA','AMS','FCO','MXP','MAD','BCN','PRG','VIE','ZRH','IST','BUD','ZAG','CPH']};
  const DEFAULT_DEST=Object.values(groups).flat();
  const region=code=>Object.keys(groups).find(k=>groups[k].includes(code))||'기타';
  const fresh=(r,now)=>Number.isFinite(Date.parse(r.observedAt))&&now-Date.parse(r.observedAt)>=0&&now-Date.parse(r.observedAt)<=30*60000;
  function filterRows(rows,f={},now=Date.now()){
    const term=(f.city||'').trim().toLowerCase();
    return rows.filter(r=>(!f.month||r.dates?.[0]?.startsWith(f.month))&&(!f.seats||(r.seats===true&&fresh(r,now)))&&(!f.cheaper||r.saving>0)&&(!Number.isFinite(f.maxPrice)||r.connected<=f.maxPrice)&&(!term||[r.cityA,r.cityB,cities[r.cityA],cities[r.cityB]].join(' ').toLowerCase().includes(term))&&(!f.stays||f.stays.some(s=>{const [a,b]=s.split('-').map(Number);return r.days>=a&&r.days<=b;}))&&(!f.regions||f.regions.includes(region(r.cityA))||f.regions.includes(region(r.cityB))))
      .sort((a,b)=>f.sort==='saving'?b.saving-a.saving:f.sort==='date'?String(a.dates?.[0]).localeCompare(String(b.dates?.[0])):a.connected-b.connected);
  }
  if(typeof module!=='undefined'&&module.exports){module.exports={filterRows,fresh};return;}
  const $=id=>document.getElementById(id),money=n=>Number.isFinite(n)?n.toLocaleString('ko-KR')+'원':'미확인';
  let status=null,limit=20,busy=false,loadedMonth=false;
  const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
  const date=s=>s?new Date(s).toLocaleString('ko-KR'):'아직 없음';
  function card(r){
    const el=node('article',undefined,'card');
    const visual=node('div',undefined,'visual');visual.style.background='#244977';
    visual.append(node('div',r.cityA+' → '+r.cityB,'codes'),node('div','인천 귀국 후 '+r.days+'일 체류','route'));
    const info=node('div',undefined,'info');info.append(node('h3',(cities[r.cityA]||r.cityA)+' + '+(cities[r.cityB]||r.cityB)),node('p',r.dates[0]+' 출국 · '+r.dates[3]+' 귀국','sub'));
    const score=node('div',undefined,'score');score.append(node('b',r.saving>0?money(r.saving)+' 절약 후보':money(Math.abs(r.saving))+' 추가 비용',r.saving<=0?'worse':''));info.append(score);
    info.append(node('p',r.status==='eligible'?'비교 조건 확인됨':'운임 규정·수하물 조건 확인 필요'));
    const list=node('ul',undefined,'tickets');
    for(const leg of r.legs||[]){list.append(node('li',`${leg.departureDate} ${leg.origin} → ${leg.destination} ${leg.flight||''}`));}info.append(list);
    const price=node('div',undefined,'price');price.append(node('span','연결 발권 전체 비용','small'),node('strong',money(r.connected),'big'),node('span','왕복 두 장 '+money(r.baseline),'small'),node('span','조회 '+date(r.observedAt)+(fresh(r,Date.now())?'':' · 재조회 필요'),'obs'));
    info.prepend(node('span',r.via==='outer'?'바깥 왕복 1장 + 다구간 1장 (표 2장)':'편도 2장 + 다구간 1장 (표 3장)','via'));
    const details=node('details',undefined,'detail');details.append(node('summary','구매할 표와 비교 기준'));
    const table=node('table');
    for(const t of r.tickets||[]){const row=node('tr');row.append(node('th',(t.buy?'구매 · ':'비교 · ')+t.name,t.buy?'buy':''),node('td',money(t.totalKRW),'num'));table.append(row);}
    details.append(table);
    details.append(node('p','총액은 전체 인원 기준입니다. 아래 공식 사이트에서 같은 구간·날짜로 재조회하세요. 가격과 좌석을 확보한 상태가 아닙니다.'));
    const link=node('a','대한항공에서 확인');link.href='https://www.koreanair.com/booking/search';link.target='_blank';link.rel='noopener noreferrer';details.append(link);
    el.append(visual,info,price,details);return el;
  }
  const md=s=>s?Number(s.slice(5,7))+'/'+Number(s.slice(8,10)):'';
  const name=c=>cities[c]||c;
  // c is a city (same city both trips) or a pair (first trip c.code, second trip c.cityB).
  function surveyCard(c){
    const b=c.best,t=b.parts,A=c.code,B=c.cityB||c.code,el=node('article',undefined,'card');
    const visual=node('div',undefined,'visual');visual.style.background=b.saving>0?'#1f6f4a':'#244977';
    visual.append(node('div',A===B?A:A+' → '+B,'codes'),node('div',(A===B?name(A):name(A)+' → '+name(B))+' · 한국 '+b.stay+'일','route'));
    const info=node('div',undefined,'info');
    info.append(node('h3',(A===B?name(A):name(A)+' + '+name(B))+' 변태발권'),node('p',`${md(b.dates[0])} ${name(A)} 출국 · ${md(b.dates[1])} 귀국 → 한국 ${b.stay}일 → ${md(b.dates[2])} ${name(B)} 출국 · ${md(b.dates[3])} 귀국`,'sub'));
    const score=node('div',undefined,'score');score.append(node('b',b.saving>0?money(b.saving)+' 절약':money(-b.saving)+' 더 비쌈',b.saving>0?'':'worse'));info.append(score);
    const list=node('ul',undefined,'tickets');
    list.append(node('li',`① 인천→${name(A)} ${md(b.dates[0])} / ${name(B)}→인천 ${md(b.dates[3])} (인천 출발 장기 왕복) · ${money(t.outer)}`));
    list.append(node('li',`② ${name(A)}→인천 ${md(b.dates[1])} / 인천→${name(B)} ${md(b.dates[2])} (${name(A)} 출발 왕복) · ${money(t.inner)}`));
    info.append(list);
    const price=node('div',undefined,'price');
    if(b.saving>0)price.append(node('span',Math.round(b.saving/b.baseline*100)+'% 절약','tag'));
    price.append(node('span','변태발권 왕복 2장','small'),node('strong',money(b.hack),'big'),node('s',money(b.baseline)),node('span',`일반 왕복 두 번 (${money(t.rtA)} + ${money(t.rtB)})`,'small'),node('span','운임 달력 조회 '+date(c.observedAt)+' · 구매 전 재확인','obs'));
    const link=node('a','대한항공 예매 열기');link.href='https://www.koreanair.com/booking/search';link.target='_blank';link.rel='noopener noreferrer';link.className='cta';price.append(link);
    el.append(visual,info,price,bookingGuide(c));return el;
  }
  const wd=s=>'일월화수목금토'[new Date(s+'T00:00:00Z').getUTCDay()];
  const kd=s=>`${Number(s.slice(5,7))}월 ${Number(s.slice(8,10))}일(${wd(s)})`;
  // Korean Air has no pre-filled booking links, so each card spells out exactly what to enter.
  function guideText(c){
    const b=c.best,t=b.parts,A=c.code,B=c.cityB||c.code,a=name(A)+' ('+A+')',bb=name(B)+' ('+B+')',people=status.job?.settings?.people||1;
    const kind=A===B?'왕복':'다구간 (출발지와 귀국지가 달라 왕복 대신 다구간으로 검색)';
    return [
      `[${A===B?name(A):name(A)+' + '+name(B)} 변태발권 · 성인 ${people}명 · 일반석]`,
      '',
      `■ 표① 인천 출발 장기 ${A===B?'왕복':'왕복(오픈조)'} (약 ${money(t.outer)})`,
      `  대한항공 > 항공권 예매 > ${kind}`,
      A===B?`  출발지: 서울/인천 (ICN)  →  도착지: ${a}`:`  여정1: 서울/인천 (ICN) → ${a}`,
      A===B?`  가는 날: ${kd(b.dates[0])}  /  오는 날: ${kd(b.dates[3])}`:`  여정1 날짜: ${kd(b.dates[0])}\n  여정2: ${bb} → 서울/인천 (ICN), 날짜: ${kd(b.dates[3])}`,
      `  확인: 운임 규정의 최대 체류 기간이 ${kd(b.dates[3])} 귀국을 허용하는지`,
      '',
      `■ 표② ${name(A)} 출발 ${A===B?'왕복':'왕복(오픈조)'} (약 ${money(t.inner)})`,
      `  대한항공 > 항공권 예매 > ${kind}`,
      A===B?`  출발지: ${a}  →  도착지: 서울/인천 (ICN)`:`  여정1: ${a} → 서울/인천 (ICN)`,
      A===B?`  가는 날: ${kd(b.dates[1])}  /  오는 날: ${kd(b.dates[2])}`:`  여정1 날짜: ${kd(b.dates[1])}\n  여정2: 서울/인천 (ICN) → ${bb}, 날짜: ${kd(b.dates[2])}`,
      `  확인: 해외 출발이라 현지 통화로 보이면 화면의 통화를 KRW로 바꿔 총액 비교 (원화 결제는 한국 발행 카드만 가능)`,
      '',
      `■ 실제 탑승 순서`,
      `  1) ${kd(b.dates[0])} 인천→${name(A)}  — 표① 첫 구간`,
      `  2) ${kd(b.dates[1])} ${name(A)}→인천  — 표② 첫 구간`,
      `     (한국 ${b.stay}일 체류)`,
      `  3) ${kd(b.dates[2])} 인천→${name(B)}  — 표② 둘째 구간`,
      `  4) ${kd(b.dates[3])} ${name(B)}→인천  — 표① 둘째 구간`,
      '',
      `■ 주의`,
      `  · 두 표는 각각 따로 예약합니다 (예약번호 2개).`,
      `  · 각 표는 순서대로 모두 타야 합니다. 앞 구간을 안 타면 뒤 구간이 자동 취소됩니다.`,
      `  · 일반 왕복 두 번 ${money(b.baseline)} 대비 ${b.saving>0?money(b.saving)+' 절약':money(-b.saving)+' 더 비쌈'} (조회 ${date(c.observedAt)} 기준, 결제 전 가격 재확인)`,
    ].join('\n');
  }
  function bookingGuide(c){
    const box=node('details',undefined,'detail guide');box.append(node('summary','예매 방법 보기 (표 2장 입력값과 탑승 순서)'));
    const text=guideText(c),pre=node('pre',text);box.append(pre);
    const copy=node('button','예매 안내 복사','copy');copy.type='button';
    copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(text);copy.textContent='복사했습니다';}catch{const r=document.createRange();r.selectNodeContents(pre);getSelection().removeAllRanges();getSelection().addRange(r);copy.textContent='선택됨 · Ctrl+C로 복사';}setTimeout(()=>copy.textContent='예매 안내 복사',2500);});
    box.append(copy);return box;
  }
  function renderCities(){
    const term=$('f-city').value.trim().toLowerCase(),regions=[...document.querySelectorAll('[name=region]:checked')].map(e=>e.value);
    const rows=(status.cities||[]).filter(c=>(!term||(c.code+' '+name(c.code)).toLowerCase().includes(term))&&regions.includes(region(c.code)))
      .sort((a,b)=>(b.best?.saving??-Infinity)-(a.best?.saving??-Infinity)||(a.cheapestFirstTrip?.price??Infinity)-(b.cheapestFirstTrip?.price??Infinity));
    $('result-title').textContent=`도시 ${rows.length}곳 · 조사 완료 ${rows.filter(c=>c.done).length}곳`;
    const table=node('table',undefined,'city-table'),head=node('tr');
    for(const h of ['도시','지역','1월 최저 왕복','변태발권 최저','일반 왕복 두 번','차이','상태'])head.append(node('th',h));table.append(head);
    for(const c of rows){
      const tr=node('tr',undefined,c.done?'':'pending'),b=c.best,f=c.cheapestFirstTrip;
      tr.append(node('td',name(c.code)+' '+c.code),node('td',region(c.code)),node('td',f?money(f.price)+' ('+md(f.dates[0])+'~'+md(f.dates[1])+')':'-','num'),
        node('td',b?money(b.hack):'-','num'),node('td',b?money(b.baseline):'-','num'),node('td',b?(b.saving>0?money(b.saving)+' 절약':money(-b.saving)+' 비쌈'):'-','num'),
        node('td',c.done?(c.reason||'완료'):'조사 중'));
      table.append(tr);
    }
    $('cards').append(table);$('more').hidden=true;
  }
  function renderSurvey(){
    $('cards').replaceChildren();
    if($('view').value==='cities')return renderCities();
    const max=Number($('f-price').value),term=$('f-city').value.trim().toLowerCase();
    const regions=[...document.querySelectorAll('[name=region]:checked')].map(e=>e.value),stays=[...document.querySelectorAll('[name=stay]:checked')].map(e=>e.value.split('-').map(Number));
    const list=[...(status.cities||[]),...(status.pairs||[])].filter(c=>c.best&&(!$('f-cheaper').checked||c.best.saving>0)&&(max===10000000||c.best.hack<=max)&&(!term||[c.code,c.cityB||'',name(c.code),name(c.cityB||c.code)].join(' ').toLowerCase().includes(term))&&regions.includes(region(c.code))&&stays.some(([a,b])=>c.best.stay>=a&&c.best.stay<=b))
      .sort($('sort').value==='date'?(a,b)=>a.best.dates[0].localeCompare(b.best.dates[0]):$('sort').value==='connected'?(a,b)=>a.best.hack-b.best.hack:(a,b)=>b.best.saving-a.best.saving);
    const pr=status.state?.progress||{};
    $('result-title').textContent=`변태발권 결과 ${list.length}건 (싸지는 것 ${list.filter(c=>c.best.saving>0).length}건 · 다른 도시 조합 ${list.filter(c=>c.cityB).length}건)`;
    if(!list.length)$('cards').append(node('p',pr.citiesDone?'현재 필터에 맞는 도시가 없습니다.':'도시별 운임을 조사하는 중입니다. 도시 하나가 끝날 때마다 결과가 추가됩니다.','empty'));
    list.slice(0,limit).forEach(c=>$('cards').append(surveyCard(c)));$('more').hidden=list.length<=limit;
  }
  function render(){
    if(!status)return;
    if(status.mode==='survey'){const max=Number($('f-price').value);$('f-price-label').textContent=max===10000000?'제한 없음':money(max);return renderSurvey();}
    const max=Number($('f-price').value);$('f-price-label').textContent=max===10000000?'제한 없음':money(max);
    const list=filterRows(status.list||[],{month:status.job?.month,seats:$('f-seats').checked,cheaper:$('f-cheaper').checked,stays:[...document.querySelectorAll('[name=stay]:checked')].map(e=>e.value),regions:[...document.querySelectorAll('[name=region]:checked')].map(e=>e.value),maxPrice:max===10000000?Infinity:max,city:$('f-city').value,sort:$('sort').value});
    $('result-title').textContent='연결 여정 '+list.length+'건';$('cards').replaceChildren();
    if(!list.length)$('cards').append(node('p',(status.list||[]).length?'현재 필터에 맞는 결과가 없습니다. 오래된 조회는 좌석 필터를 해제해 확인할 수 있습니다.':status.running?'운임을 수집하고 있습니다. 다섯 견적이 모이면 결과가 표시됩니다.':'아직 비교 결과가 없습니다. 출국월을 선택하고 검색을 시작하세요.','empty'));
    list.slice(0,limit).forEach(r=>$('cards').append(card(r)));$('more').hidden=list.length<=limit;
  }
  function syncMonth(value){
    const [year,month]=value.split('-');$('year').value=year;$('month-number').value=month;$('month').value=value;
    const end=new Date(Date.UTC(Number(year),Number(month),0)).toISOString().slice(0,10);
    for(const id of ['departure-from','departure-to']){$(id).min=value+'-01';$(id).max=end;}
    $('departure-from').value=value+'-01';$('departure-to').value=end;
  }
  function paintStatic(){
    $('search').hidden=true;$('pause').hidden=true;
    const nav=document.querySelector('.top nav'),back=node('a','마일리지 빈자리 →');back.href='../';nav.replaceChildren(node('b','변태발권 조사'),back);
    const s=status.state||{},p=s.progress||{};
    $('state-chip').textContent='공개 보기';$('state-chip').classList.add('ok');
    $('state-text').textContent=`${status.job?.month||''} 출국 기준 · ${date(status.generatedAt)} 갱신 · 도시 ${p.citiesDone??0}/${p.cities??0}곳 조사 · 새벽 자동 수집 후 갱신됩니다.`;
    render();
  }
  function paint(){
    if(status.static)return paintStatic();
    const s=status.state||{},worker=status.worker||{},run=s.runs?.[0];
    const paused=status.job?.paused;
    const state=worker.status==='error'?'실행 오류':paused?(status.running?'일시정지 중':'일시정지'):status.running?'수집 중':status.workerEnabled===false?'화면 확인 모드':({blocked:'접근 제한','blocked-wait':'접근 제한 대기',done:'회차 완료',unconfigured:'소스 미설정','no-job':'검색 대기',stopped:'일시정지',error:'조회 오류'}[s.lastStatus]||'검색 대기');
    $('state-chip').textContent=state;$('state-chip').classList.toggle('ok',s.lastStatus==='done'&&!status.running);
    const progress=s.progress;
    $('state-text').textContent=worker.status==='error'?worker.message:paused?'새 검색을 누르면 다시 시작합니다. 진행 중인 요청은 종료까지 기다립니다.':status.workerEnabled===false?'수집을 실행하지 않는 미리보기입니다. npm start로 실행하면 검색할 수 있습니다.':(s.lastMessage||worker.message||'2027년 1월 여행부터 검색할 수 있습니다.')+(progress?.mode==='survey'?` · 도시 ${progress.citiesDone}/${progress.cities}곳 조사 · 같은 도시 싸지는 곳 ${progress.cheaper}곳 · 다른 도시 조합 확인 ${progress.pairsChecked??0}건 중 싸지는 것 ${progress.pairsCheaper??0}건`:progress?` · 조합 ${progress.settled??0}/${progress.schedules??0} 확인 (비교 완료 ${progress.complete??0} · 운항 없음 ${progress.unserved??0}) · 이번 회차 요청 ${run?.requests??0}건`:'');
    const hours=status.plan?.activeHours;
    if(hours&&!status.running&&!paused)$('state-text').textContent+=` · 자동 수집은 매일 ${hours.start}~${hours.end}에만 진행 (검색 버튼은 즉시 1회 실행)`;
    if(status.running){
      const current=run?.currentQuery?.legs?.map(l=>`${l.date} ${l.from}→${l.to}`).join(' / ');
      const age=status.generatedAt?Math.max(0,Math.floor((Date.now()-Date.parse(status.generatedAt))/1000)):null;
      $('state-text').textContent+=` · 비교 ${run?.evaluated??0}건`+(current?' · 현재 '+current:'')+(age!==null?` · 상태 갱신 ${age}초 전`:'');
      if(age>90)$('state-text').textContent+=' · 응답 지연: 요청이 끝나지 않았거나 실행이 중단됐을 수 있습니다.';
    }
    $('bar').hidden=true; // Unknown total work: avoid an invented completion percentage.
    $('pause').disabled=status.workerEnabled===false||!status.job||paused;const searchButton=$('search').querySelector('button[type=submit]');searchButton.disabled=busy;searchButton.textContent=busy?'요청 중…':'🔍 검색';
    if(!loadedMonth&&status.job?.month){
      syncMonth(status.job.month);const cfg=status.job.settings||{};
      if(Array.isArray(cfg.destinations))for(const box of document.querySelectorAll('[name=dest]'))box.checked=cfg.destinations.includes(box.value);
      estimate();
      for(const [id,key]of [['people','people'],['trip-days','tripDays'],['stay-days','stayDays'],['second-trip-days','secondTripDays'],['step-days','stepDays'],['departure-from','departureFrom'],['departure-to','departureTo']])if(cfg[key]!==undefined)$(id).value=Array.isArray(cfg[key])?cfg[key][0]:cfg[key];
      if(cfg.stayMin)$('stay-min').value=cfg.stayMin;if(cfg.stayMax)$('stay-max').value=cfg.stayMax;
      loadedMonth=true;
    }
    if(status.plan){$('people-text').textContent='성인 '+status.plan.people+'명 · 일반석';$('plan-text').textContent=`여행 ${status.plan.tripDays?.join('/')}일 · 한국 약 ${status.plan.stayDays?.join('/')}일 · 여행 ${status.plan.secondTripDays?.join('/')}일`;}
    render();
  }
  async function request(path,body){const res=await fetch(path,{...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(12000)});const data=await res.json();if(!res.ok)throw new Error(data.error||'서버 요청 실패');return data;}
  // On GitHub Pages there is no local server; the published status.json is shown read-only.
  async function refresh(){
    try{status=await request('/api/status');paint();}
    catch(e){
      try{status=await request('status.json');status.static=true;paint();}
      catch{$('state-chip').textContent='서버 연결 실패';$('state-text').textContent='npm start로 로컬 서버를 실행해 주세요. '+e.message;}
    }
  }
  for(const name of [...Object.keys(groups),'기타']){const label=node('label');const input=node('input');input.type='checkbox';input.name='region';input.value=name;input.checked=true;label.append(input,document.createTextNode(name));$('f-regions').append(label);}
  const chosen=()=>[...document.querySelectorAll('[name=dest]:checked')].map(e=>e.value);
  // Lookups grow with the square of the destination count, so show the cost before the user starts a search.
  function estimate(){
    const n=chosen().length,from=Date.parse($('departure-from').value),to=Date.parse($('departure-to').value),step=Number($('step-days').value)||7;
    const dates=Number.isFinite(from)&&Number.isFinite(to)&&to>=from?Math.floor((to-from)/86400000/step)+1:0;
    // Survey: four fare calendars per city for each 15-day window of the departure month.
    const requests=n*12,perRun=status?.state?.progress?.requestsPerRun||60,every=status?.plan?.intervalMinutes||30;
    const hours=Math.ceil(requests/perRun*every/60);
    $('estimate').textContent=n?`${n}곳 선택 · 도시마다 1월 전체 날짜의 변태발권(왕복 2장) 계산 · 대한항공 조회 약 ${requests}건 · 전체 완료 약 ${hours}시간 (도시가 끝날 때마다 결과 표시)`:'여행지를 한 곳 이상 선택하세요.';
    $('estimate').classList.toggle('warn',hours>48);
  }
  for(const [name,codes] of Object.entries(groups)){
    const row=node('div',undefined,'dest-group');row.append(node('b',name));
    for(const code of codes){const label=node('label');const box=node('input');box.type='checkbox';box.name='dest';box.value=code;box.checked=DEFAULT_DEST.includes(code);label.append(box,document.createTextNode(cities[code]||code));row.append(label);}
    const all=node('button','전체');all.type='button';all.addEventListener('click',()=>{const boxes=row.querySelectorAll('input');const on=[...boxes].some(b=>!b.checked);boxes.forEach(b=>b.checked=on);estimate();});row.append(all);
    $('dest-picker').append(row);
  }
  $('dest-picker').addEventListener('change',estimate);
  $('view').addEventListener('change',()=>{limit=20;render();});
  for(const id of ['departure-from','departure-to','step-days'])$(id).addEventListener('change',estimate);
  const thisYear=new Date().getFullYear();
  for(let y=thisYear;y<=thisYear+2;y++){const option=node('option',String(y)+'년');option.value=String(y);$('year').append(option);}
  for(let m=1;m<=12;m++){const option=node('option',String(m)+'월');option.value=String(m).padStart(2,'0');$('month-number').append(option);}
  syncMonth('2027-01');
  for(const id of ['year','month-number'])$(id).addEventListener('change',()=>{syncMonth($('year').value+'-'+$('month-number').value);estimate();});
  estimate();
  $('search').addEventListener('submit',async e=>{e.preventDefault();if(busy)return;$('search-error').hidden=true;if(status?.running||status?.workerEnabled===false){$('search-error').textContent=status.running?'이미 수집 중입니다. 조건을 바꾸려면 수집 일시정지를 누르고 종료 후 검색하세요.':'현재 주소는 미리보기입니다. http://127.0.0.1:8767/ 에서 검색하세요.';$('search-error').hidden=false;return;}const picked=chosen();if(Number($('stay-min').value)>Number($('stay-max').value)){$('search-error').textContent='한국 체류 최소일이 최대일보다 큽니다.';$('search-error').hidden=false;return;}if(picked.length<1){$('search-error').textContent='여행지를 한 곳 이상 선택하세요.';$('search-error').hidden=false;return;}busy=true;if(status)paint();try{const result=await request('/api/search',{month:$('month').value,mode:'survey',settings:{people:Number($('people').value),tripDays:Number($('trip-days').value),stayMin:Number($('stay-min').value),stayMax:Number($('stay-max').value),secondTripDays:Number($('second-trip-days').value),stepDays:Number($('step-days').value),departureFrom:$('departure-from').value,departureTo:$('departure-to').value,destinations:chosen()}});if(!result.ok)throw new Error(result.worker?.message||'실행을 시작하지 못했습니다.');loadedMonth=true;await refresh();}catch(err){$('search-error').textContent='검색 시작 실패: '+err.message;$('search-error').hidden=false;}finally{busy=false;if(status)paint();}});
  $('search').addEventListener('invalid',e=>{$('search-error').textContent='입력값을 확인하세요: '+e.target.validationMessage;$('search-error').hidden=false;},true);
  $('pause').addEventListener('click',async()=>{try{await request('/api/pause',{});await refresh();}catch(e){$('state-text').textContent=e.message;}});
  document.querySelector('.filters').addEventListener('input',()=>{limit=20;render();});$('sort').addEventListener('change',render);$('more').addEventListener('click',()=>{limit+=20;render();});
  async function poll(){await refresh();setTimeout(poll,5000);}poll();
})();
