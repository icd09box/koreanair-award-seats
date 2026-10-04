// Bump ?v= in index.html, app.js and the component imports on every change: Pages lets browsers cache files for 10 minutes.
// App shell: hash tabs, each tab is a component module with mount(root, data) and its own data file.
import * as award from './components/award.js?v=20261004d';
import * as stayover from './components/stayover.js?v=20261004d';

const TABS={award:{component:award,data:'data/award.json'},stayover:{component:stayover,data:'data/stayover.json'}};
const cache={};

async function show(){
  const name=TABS[location.hash.slice(1)]?location.hash.slice(1):'award';
  document.querySelectorAll('[data-tab]').forEach(a=>a.setAttribute('aria-selected',a.dataset.tab===name));
  const root=document.getElementById('view'),tab=TABS[name];
  root.replaceChildren(Object.assign(document.createElement('p'),{className:'empty',textContent:'불러오는 중…'}));
  try{
    cache[name]??=await fetch(tab.data+'?t='+Date.now()).then(r=>{if(!r.ok)throw new Error('데이터가 아직 없습니다 ('+r.status+')');return r.json();});
    root.replaceChildren();
    tab.component.mount(root,cache[name]);
  }catch(e){
    root.replaceChildren(Object.assign(document.createElement('p'),{className:'empty',textContent:'결과를 불러오지 못했습니다. '+e.message}));
  }
}
addEventListener('hashchange',show);
show();
