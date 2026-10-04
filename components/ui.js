// Tiny element helper shared by the components: el('div',{className:'x',onclick},child,'text',...).
export function el(tag,props={},...children){
  const node=document.createElement(tag);
  for(const [k,v] of Object.entries(props))if(v!==undefined&&v!==null)k in node?node[k]=v:node.setAttribute(k,v);
  for(const c of children.flat())if(c!==null&&c!==undefined&&c!==false)node.append(c);
  return node;
}
export const won=n=>Number.isFinite(n)?n.toLocaleString('ko-KR')+'원':'-';
