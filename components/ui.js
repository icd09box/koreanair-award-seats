// Tiny element helper shared by the components: el('div',{className:'x',onclick},child,'text',...).
export function el(tag,props={},...children){
  const node=document.createElement(tag);
  for(const [k,v] of Object.entries(props))if(v!==undefined&&v!==null)k in node?node[k]=v:node.setAttribute(k,v);
  for(const c of children.flat())if(c!==null&&c!==undefined&&c!==false)node.append(c);
  return node;
}
export const won=n=>Number.isFinite(n)?n.toLocaleString('ko-KR')+'원':'-';
// Korean Air's own deep link: fills route, dates, passengers and cabin on the search form (round trip or one way only).
// bookingType A (mileage) and upgradeSeat=Y ask for login first. Multi-city cannot be prefilled.
export function koreanAirLink({type='R',trip,from,to,date,ret,adults=1,cabin='economy',upgrade=false}){
  const q=new URLSearchParams({bookingType:type,tripType:trip,departure:from,arrival:to,departureDate:date,adults:String(adults),cabinClass:cabin});
  if(ret)q.set('returnDate',ret);
  if(upgrade){q.set('upgradeSeat','Y');q.set('isUpgradeableCabin','true');}
  return 'https://www.koreanair.com/booking/search?'+q;
}
