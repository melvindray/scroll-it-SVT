const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:540,height:960},deviceScaleFactor:2});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/frame.html');const meta=await p.evaluate(()=>META);fs.writeFileSync('build/meta.json',JSON.stringify(meta,null,1));
const only=process.argv[2];
for(let fi=0;fi<meta.length;fi++)for(let ci=0;ci<meta[fi].clips.length;ci++)for(let qi=0;qi<meta[fi].clips[ci].cues.length;qi++){
 const id=`${meta[fi].id}_c${ci+1}_q${qi+1}`;if(only&&!id.startsWith(only))continue;
 await p.evaluate(([a,b,c])=>show(a,b,c),[fi,ci,qi]);fs.mkdirSync('build/img',{recursive:true});await p.screenshot({path:`build/img/${id}.png`});}
console.log('errors',errs);await b.close();})();
