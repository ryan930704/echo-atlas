const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const server = http.createServer((req,res)=>{
  const name = req.url==='/'?'index.html':req.url.slice(1);
  if(!['index.html','style.css','main.js','model.js','demo.js'].includes(name)){res.writeHead(404).end();return;}
  const type=name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html';
  res.writeHead(200,{'Content-Type':type+'; charset=utf-8'}).end(fs.readFileSync(path.join(__dirname,'dist',name)));
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  let browser;
  try{
    browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || 'chrome'});
    const page=await browser.newPage({viewport:{width:1920,height:1080}});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    page.on('requestfailed',r=>errors.push(r.url()));
    page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
    const shot=name=>page.screenshot({path:path.join(__dirname,'../shots',name+'.png')});
    await page.goto('http://127.0.0.1:'+server.address().port);
    await page.getByText('Hear the patterns.').waitFor();
    await page.getByRole('button',{name:'Run sample'}).click();
    assert.equal(await page.locator('.row').count(),5);
    assert.equal(await page.locator('.quote').count(),5);
    await shot('01-atlas');
    await page.locator('.row').nth(1).click();
    assert.match(await page.locator('#quotes').innerText(),/lunch/);
    await shot('02-evidence');
    await page.locator('#edit').click();
    await page.locator('#raw').fill('The captions lag behind the speaker.\nThe captions disappear during questions.\nPlease improve captions for the panel.\nThe entrance ramp is blocked.\nPlease clear the entrance ramp.\nPublish the slides.');
    await shot('03-input');
    await page.getByRole('button',{name:'Analyze responses'}).click();
    await page.locator('#cut').selectOption('.08');
    const download=page.waitForEvent('download');await page.locator('#download').click();
    const file=await (await download).path();
    assert.match(fs.readFileSync(file,'utf8'),/\[6\] Publish the slides/);
    await page.locator('#edit').click();
    await page.locator('#raw').fill(Array(101).fill('test').join('\n'));
    await page.getByRole('button',{name:'Analyze responses'}).click();
    assert.match(await page.locator('#error').innerText(),/100/);
    await page.keyboard.press('Escape');
    await page.setViewportSize({width:390,height:844});
    await page.locator('#sample').click();
    await page.locator('.row').last().click();
    assert.match(await page.locator('#quotes').innerText(),/quiet corner/);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.deepEqual(errors,[]);
    console.log('PASS desktop, mobile, evidence, custom input, validation, grouping, export, sample reset, resource and console checks');
  }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
