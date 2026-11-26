export const TAU=Math.PI*2;
export const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
export const rgba=(k,a)=>`rgba(${k[0]},${k[1]},${k[2]},${a})`;
export const lerp=(a,b,t)=>a+(b-a)*t;
export const clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const yumusak=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
// kübik bezier üzerinde nokta; P = [x0,y0,x1,y1,x2,y2,x3,y3]
export function bez(P,t){const u=1-t;return[u*u*u*P[0]+3*u*u*t*P[2]+3*u*t*t*P[4]+t*t*t*P[6],u*u*u*P[1]+3*u*u*t*P[3]+3*u*t*t*P[5]+t*t*t*P[7]]}
