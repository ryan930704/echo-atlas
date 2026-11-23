// Agglomerative average-link clustering of normalized TF–IDF vectors.
const stop = new Set("a an and are as at be been but by can could did do for from had has have i in into is it its me more my of on or our really some that the their them there this to too us was we were what when where which with would you your".split(" "));
export function cluster(notes, threshold) {
  const docs = notes.map(note => (note.toLowerCase().match(/[a-z0-9]+/g) || []).filter(t => t.length > 1 && !stop.has(t)));
  const df = new Map();
  for (const terms of docs) for (const t of new Set(terms)) df.set(t,(df.get(t)||0)+1);
  const vectors = docs.map(terms => {
    const v = new Map();
    for (const t of terms) v.set(t,(v.get(t)||0)+1);
    for (const [t,n] of v) v.set(t,(1+Math.log(n))*(1+Math.log((notes.length+1)/(df.get(t)+1))));
    const norm = Math.hypot(...v.values());
    for (const [t,n] of v) v.set(t,n/norm);
    return v;
  });
  const sims = vectors.map(v => vectors.map(w => Array.from(v).reduce((s,[t,x])=>s+x*(w.get(t)||0),0)));
  const groups = notes.map((_,i)=>[i]);
  while (groups.length>1) {
    let best = -1, pair;
    groups.forEach((a,i)=>groups.slice(i+1).forEach((b,j)=>{
      let sum = 0;
      for (const x of a) for (const y of b) sum += sims[x][y];
      const score = sum/(a.length*b.length);
      if (score>best) {best=score; pair=[i,i+j+1];}
    }));
    if (best<threshold) break;
    const [a,b] = pair;
    groups[a].push(...groups.splice(b,1)[0]);
  }
  return groups.map(ids=>{
    const weights = new Map();
    for (const id of ids) for (const [t,w] of vectors[id]) weights.set(t,(weights.get(t)||0)+w);
    const terms = Array.from(weights).sort((a,b)=>b[1]-a[1]).map(([t])=>t);
    return {ids:ids.sort((a,b)=>a-b), terms, name:terms.slice(0,2).join(' / ') || 'Individual response'};
  }).sort((a,b)=>b.ids.length-a.ids.length || a.ids[0]-b.ids[0]);
}
