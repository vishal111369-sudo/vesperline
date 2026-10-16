(function(){
  'use strict';
  var stage=document.getElementById('scStage'); if(!stage) return;
  var top=document.getElementById('scTop'),fill=document.getElementById('scFill'),partEl=document.getElementById('scPart'),countEl=document.getElementById('scCount'),backBtn=document.getElementById('scBack');
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ARR='<svg viewBox="0 0 15 10" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M0 5h13M9 1l4 4-4 4"/></svg>';
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

  /* ---------- part 1: scored questions ---------- */
  var Q=[
    {a:'Run',q:'When a planned campaign goes live, is it on time and correct?',o:['Rarely','Sometimes','Usually','Always, with a checklist'],fix:['Add a two-step check before anything goes live','Errors that reach customers cost trust and budget. A short checklist and a second pair of eyes stop most of them.']},
    {a:'Run',q:'If your operations lead were away for two weeks, what would happen?',o:['Work would stop','It would slow down a lot','Someone would cover, with gaps','It would run normally, because the work is documented'],fix:['Document the ten tasks you repeat most','When the work lives in one person\'s head, every holiday is a risk. Written steps keep the operation running.']},
    {a:'Connect',q:'Do your systems agree on simple numbers, like the count of active customers?',o:['Every report shows a different number','We fix it by hand each month','Mostly, with small gaps','Yes, we have one source of truth'],fix:['Agree one definition and one source for your core numbers','Decisions made from whichever report is open lead to arguments, not action.']},
    {a:'Connect',q:'How do you find out that an integration or data sync has failed?',o:['A customer tells us','Someone notices days later','We check by hand every day','An automatic alert reaches us within hours'],fix:['Set up automatic alerts for failed syncs','Silent failures are the most expensive kind. Alerts turn days of damage into hours.']},
    {a:'Connect',q:'How many tools does your team copy data between by hand each week?',o:['Five or more','Three or four','One or two','None'],fix:['Replace the biggest copy-and-paste job with a direct connection','Manual copying is slow and error-prone, and it hides the real state of the business.']},
    {a:'Automate',q:'How much of your team\'s week goes on repetitive work, the same steps every time?',o:['More than 60%','40 to 60%','20 to 40%','Less than 20%'],fix:['List repetitive tasks by hours per week, and automate the top one','The first automation usually gives back a full day per person, every week.']},
    {a:'Automate',q:'Where are you with AI in your operations?',o:['Not started','People use chat tools on their own','One workflow is live','Several workflows are live, with approval steps and logs'],fix:['Run one AI workflow with an approval step and a log','Scattered personal use creates risk without results. One governed workflow shows real value safely.']},
    {a:'Measure',q:'When a campaign ends, how do you know it worked?',o:['We don\'t really know','We look at opens, clicks and conversions in the tool','We compare it with the previous period','We compare it against a control group'],fix:['Add a control group to your next campaign','A control group (customers picked at random who skip the campaign) shows what the campaign actually changed.']},
    {a:'Measure',q:'Do you know how long a new customer takes to pay back what it cost to acquire them?',o:['No','A rough guess','Yes, for some channels','Yes, tracked monthly for each group of new customers'],fix:['Track each month\'s new customers until they pay back','Payback time is the clearest single number for whether growth is healthy.']},
    {a:'Measure',q:'How often does leadership get a report they trust and act on?',o:['Rarely','Monthly, but the numbers get questioned','Monthly, and the numbers are trusted','Weekly, and decisions are made from it'],fix:['Move to one short weekly report with three numbers','A report that nobody questions is a report people act on.']}
  ];
  var AREAS=['Run','Connect','Automate','Measure'];
  var MODULE={Run:'Vesperline Run takes over the daily operation, so campaigns go out on time and nothing depends on one person.',Connect:'Vesperline Connect fixes how your systems talk to each other, with one version of the truth and alerts before failures spread.',Automate:'Vesperline Automate hands repetitive work to automation and AI, always with an approval step and a log.',Measure:'Vesperline Measure proves what each campaign earned, against a group left untouched, in your own data.'};
  var LEVELS=[
    {n:'Reactive',d:'Most work happens by hand, often after something breaks. The quickest gains come from steady routines and basic alerts.'},
    {n:'Repeatable',d:'The routines exist, but they depend on people and spreadsheets. Connecting systems and writing down the core work will free the team.'},
    {n:'Connected',d:'Your systems mostly agree and the work is steady. The next step is proving what the work actually earns.'},
    {n:'Measured',d:'You measure what works and cut what does not. Safe automation is where the next hours will come from.'},
    {n:'Self-improving',d:'You run a measured, automated operation. Gains now come from sharper targeting and fewer, better campaigns.'}
  ];

  /* ---------- part 2: setup ---------- */
  var L={
    platform:['SOFTSWISS','Pragmatic Solutions','Gr8 Tech','EveryMatrix','BetConstruct','Digitain','Playtech','GiG (Gaming Innovation Group)','Altenar','Kambi','Delasport','Uplatform','Soft2Bet','Built in-house'],
    crm:['Solitics','Optimove','Smartico','Fast Track','Xtremepush','OptiKPI','Braze','Bloomreach','Salesforce Marketing Cloud','HubSpot','Customer.io','Built in-house','None yet'],
    support:['Zendesk','Intercom','Freshdesk','LiveChat','Zoho Desk','Helpshift','Salesforce Service Cloud','Jira Service Management','None yet'],
    providers:['Twilio','Infobip','Sinch','Vonage','Bird (MessageBird)','Plivo','Gupshup','360dialog','Telesign','SendGrid','Mailgun','Amazon SES','OneSignal'],
    channels:['Email','SMS','WhatsApp','App push','Web push','On-site pop-ups','Inbox or message centre','Telegram','Phone calls','Live chat'],
    gamification:['Captain Up','Gamanza','Smartico','Fast Track Rewards','Optimove (gamification)','Built in-house','None yet'],
    reporting:['Bloomreach','Power BI','Tableau','Looker','Looker Studio','Metabase','Qlik','Google Sheets or Excel','Platform back-office reports','Built in-house dashboards'],
    brands:['1','2 to 5','6 to 10','More than 10'],
    customers:['Under 5,000','5,000 to 20,000','20,000 to 100,000','Over 100,000'],
    team:['No dedicated team','1 to 2 people','3 to 5 people','6 or more'],
    priority:['Keeping active customers active','Winning back lapsed customers','The first weeks of new customers','The cost of rewards and bonuses','Reporting and proof of results','Automation and AI']
  };
  var SETUP=[
    {k:'systems',t:'Which core systems do you run today?',h:'Start typing to search. If yours is not listed, type its name.'},
    {k:'messaging',t:'How do you reach customers today?',h:'Pick every channel you use, and the providers behind them.'},
    {k:'market',t:'Which markets do you operate in?',h:'This helps us match people who know your rules.'},
    {k:'tools',t:'Which engagement and reporting tools are in use?',h:'Start typing to search, or pick from the list.'},
    {k:'size',t:'How big is the operation?',h:'Rough ranges are fine.'},
    {k:'priority',t:'What matters most in the next 90 days?',h:'Pick one. Your report will start there.'}
  ];

  var scores=new Array(Q.length).fill(null);
  var setup={platform:'',crm:'',support:'',providers:[],providersOther:'',channels:[],market:'',licence:'',gamification:'',reporting:[],reportingOther:'',brands:'',customers:'',team:'',priority:''};
  var started=null;
  // screens: 0 intro, 1..10 questions, 11..16 setup, 17 calc, 18 result
  var cur=0,dir=1;
  var NQ=Q.length,NS=SETUP.length,CALC=1+NQ+NS,RESULT=CALC+1;

  function progress(){
    if(cur===0||cur>=CALC){top.hidden=true;return;}
    top.hidden=false;
    backBtn.disabled=false;
    if(cur<=NQ){partEl.textContent='Part 1 of 2: how you run';countEl.textContent=cur+' of '+NQ;fill.style.width=(cur-1)/NQ*100+'%';}
    else{var s=cur-NQ;partEl.textContent='Part 2 of 2: your setup';countEl.textContent=s+' of '+NS;fill.style.width=(s-1)/NS*100+'%';}
  }
  function go(n){dir=n>cur?1:-1;cur=n;render();}
  backBtn.addEventListener('click',function(){if(cur>1&&cur<CALC)go(cur-1);else if(cur===1)go(0);});

  function screen(html){
    stage.innerHTML='<div class="sc-screen'+(dir<0?' back':'')+'">'+html+'</div>';
    progress();
    var h=stage.querySelector('h1,.sc-q');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});}
    window.scrollTo(0,0);
  }

  function render(){
    if(cur===0)return renderIntro();
    if(cur<=NQ)return renderQ(cur-1);
    if(cur<CALC)return renderSetup(cur-NQ-1);
    if(cur===CALC)return renderCalc();
    return renderResult();
  }

  function renderIntro(){
    screen('<p class="eyebrow">Operations Scorecard</p><h1 class="d1" style="margin-top:12px;max-width:16ch">Find your level <em class="a">in three minutes.</em></h1><p class="lead" style="margin-top:22px">Where your operation sits on the five levels, which part is holding it back, and the three fixes that would help most.</p>'+
      '<div class="sc-meta"><div><b>16</b>short questions</div><div><b>3 min</b>to finish</div><div><b>Free</b>detailed report in 5 working days</div></div>'+
      '<button class="btn fill" id="scStart" type="button">Start the Scorecard '+ARR+'</button><p class="sc-tip">No preparation needed. Answer for how things work today, not how they should work.</p>');
    document.getElementById('scStart').addEventListener('click',function(){if(!started)started=Date.now();go(1);});
  }

  function renderQ(i){
    var q=Q[i];
    var opts=q.o.map(function(o,j){return '<button class="sc-opt" type="button" data-j="'+j+'" aria-pressed="'+(scores[i]===j)+'"><span class="key">'+(j+1)+'</span><span>'+esc(o)+'</span></button>';}).join('');
    screen('<span class="sc-area">'+q.a+'</span><p class="sc-q">'+esc(q.q)+'</p><div class="sc-opts" role="group" aria-label="Answers">'+opts+'</div><p class="sc-tip">Press 1 to 4 on your keyboard to answer.</p>');
    stage.querySelectorAll('.sc-opt').forEach(function(b){b.addEventListener('click',function(){pick(i,+b.getAttribute('data-j'));});});
  }
  function pick(i,j){
    scores[i]=j;
    stage.querySelectorAll('.sc-opt').forEach(function(b){var on=+b.getAttribute('data-j')===j;b.setAttribute('aria-pressed',on);if(on)b.classList.add('picked');});
    setTimeout(function(){go(cur+1);},reduce?60:260);
  }
  document.addEventListener('keydown',function(e){
    if(cur>=1&&cur<=NQ&&/^[1-4]$/.test(e.key)&&!e.metaKey&&!e.ctrlKey&&!(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))){pick(cur-1,+e.key-1);}
  });

  /* ---------- widgets ---------- */
  function combo(key,label,list,ph){
    var id='cb-'+key;
    return '<div class="fld"><label for="'+id+'">'+label+'</label><div class="combo" data-key="'+key+'"><input class="inp" id="'+id+'" type="text" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="'+id+'-l" autocomplete="off" placeholder="'+esc(ph)+'" value="'+esc(setup[key])+'"><ul class="combo-list" id="'+id+'-l" role="listbox" hidden></ul></div><div class="hint">Not listed? Type the name and keep going.</div></div>';
  }
  function bindCombo(el){
    var key=el.getAttribute('data-key'),inp=el.querySelector('input'),ul=el.querySelector('ul'),list=L[key],act=-1,items=[];
    function open(){
      var v=inp.value.trim().toLowerCase();
      items=list.filter(function(x){return !v||x.toLowerCase().indexOf(v)>-1;});
      var exact=list.some(function(x){return x.toLowerCase()===v;});
      var html=items.map(function(x,k){return '<li role="option" id="'+inp.id+'-o'+k+'" data-v="'+esc(x)+'" aria-selected="false">'+esc(x)+'</li>';}).join('');
      if(v&&!exact){items.push(inp.value.trim());html+='<li role="option" class="other" id="'+inp.id+'-o'+(items.length-1)+'" data-v="'+esc(inp.value.trim())+'" aria-selected="false">Use "'+esc(inp.value.trim())+'"</li>';}
      ul.innerHTML=html;ul.hidden=!items.length;inp.setAttribute('aria-expanded',!ul.hidden);act=-1;
      ul.querySelectorAll('li').forEach(function(li){li.addEventListener('mousedown',function(e){e.preventDefault();choose(li.getAttribute('data-v'));});});
    }
    function close(){ul.hidden=true;inp.setAttribute('aria-expanded','false');inp.removeAttribute('aria-activedescendant');}
    function choose(v){inp.value=v;setup[key]=v;close();}
    function hl(n){var lis=ul.querySelectorAll('li');if(!lis.length)return;act=(n+lis.length)%lis.length;lis.forEach(function(li,k){li.setAttribute('aria-selected',k===act);});lis[act].scrollIntoView({block:'nearest'});inp.setAttribute('aria-activedescendant',lis[act].id);}
    inp.addEventListener('focus',open);
    inp.addEventListener('input',function(){setup[key]=inp.value.trim();open();});
    inp.addEventListener('blur',function(){setTimeout(close,120);});
    inp.addEventListener('keydown',function(e){
      if(e.key==='ArrowDown'){e.preventDefault();if(ul.hidden)open();hl(act+1);}
      else if(e.key==='ArrowUp'){e.preventDefault();hl(act-1);}
      else if(e.key==='Enter'){if(!ul.hidden&&act>-1){e.preventDefault();choose(ul.querySelectorAll('li')[act].getAttribute('data-v'));}}
      else if(e.key==='Escape'){close();}
    });
  }
  function chips(key,label,list,multi,otherKey){
    var cur=setup[key];
    var html=list.map(function(x){var on=multi?cur.indexOf(x)>-1:cur===x;return '<button type="button" class="chip" data-v="'+esc(x)+'" aria-pressed="'+on+'">'+esc(x)+'</button>';}).join('');
    if(otherKey){var oo=!!setup[otherKey];html+='<button type="button" class="chip" data-other="1" aria-pressed="'+oo+'">Other</button>';}
    return '<div class="fld"><span class="lbl" id="lb-'+key+'">'+label+'</span><div class="'+(multi?'chips':'chips pick')+'" role="group" aria-labelledby="lb-'+key+'" data-key="'+key+'" data-multi="'+(multi?1:0)+'"'+(otherKey?' data-otherkey="'+otherKey+'"':'')+'>'+html+'</div>'+
      (otherKey?'<input class="inp" style="margin-top:12px'+(setup[otherKey]?'':';display:none')+'" data-otherinput="'+otherKey+'" placeholder="Type the names, separated by commas" value="'+esc(setup[otherKey])+'">':'')+'</div>';
  }
  function bindChips(g,onChange){
    var key=g.getAttribute('data-key'),multi=g.getAttribute('data-multi')==='1',ok=g.getAttribute('data-otherkey');
    g.querySelectorAll('.chip').forEach(function(c){c.addEventListener('click',function(){
      if(c.hasAttribute('data-other')){
        var inp=g.parentNode.querySelector('[data-otherinput]');var on=c.getAttribute('aria-pressed')!=='true';c.setAttribute('aria-pressed',on);inp.style.display=on?'':'none';if(on)inp.focus();else{inp.value='';setup[ok]='';}return;
      }
      var v=c.getAttribute('data-v');
      if(multi){var i=setup[key].indexOf(v);if(i>-1)setup[key].splice(i,1);else setup[key].push(v);c.setAttribute('aria-pressed',i===-1);}
      else{setup[key]=v;g.querySelectorAll('.chip').forEach(function(x){x.setAttribute('aria-pressed',x===c);});}
      if(onChange)onChange(key,v);
    });});
    var oi=g.parentNode.querySelector('[data-otherinput]');if(oi)oi.addEventListener('input',function(){setup[ok]=oi.value.trim();});
  }

  function renderSetup(s){
    var S=SETUP[s],body='';
    if(S.k==='systems'){body=combo('platform','Customer platform',L.platform,'Search platforms, for example SOFTSWISS')+combo('crm','CRM software',L.crm,'Search CRM tools, for example Optimove')+combo('support','Customer support or messaging desk',L.support,'Search tools, for example Zendesk');}
    if(S.k==='messaging'){body=chips('channels','Channels you use today',L.channels,true)+chips('providers','Providers for SMS, WhatsApp, email or push',L.providers,true,'providersOther');}
    if(S.k==='market'){body=chips('market','Market type',['Regulated','Grey','Black'],false)+'<div class="fld" id="licWrap"'+(setup.market==='Regulated'?'':' hidden')+'><label for="lic">Licence or licences</label><input class="inp" id="lic" placeholder="Licence name and number" value="'+esc(setup.licence)+'"></div>';}
    if(S.k==='tools'){body=combo('gamification','Gamification tool',L.gamification,'Search tools, for example Captain Up')+chips('reporting','Reporting tools',L.reporting,true,'reportingOther');}
    if(S.k==='size'){body=chips('brands','Number of brands',L.brands,false)+chips('customers','Active customers per month',L.customers,false)+chips('team','People working on CRM and operations',L.team,false);}
    if(S.k==='priority'){
      var opts=L.priority.map(function(o,j){return '<button class="sc-opt" type="button" data-v="'+esc(o)+'" aria-pressed="'+(setup.priority===o)+'"><span class="key">'+(j+1)+'</span><span>'+esc(o)+'</span></button>';}).join('');
      screen('<span class="sc-area">Your setup</span><p class="sc-q">'+S.t+'</p><p class="sc-help">'+S.h+'</p><div class="sc-opts">'+opts+'</div>');
      stage.querySelectorAll('.sc-opt').forEach(function(b){b.addEventListener('click',function(){setup.priority=b.getAttribute('data-v');stage.querySelectorAll('.sc-opt').forEach(function(x){x.setAttribute('aria-pressed',x===b);});setTimeout(function(){go(CALC);},reduce?60:260);});});
      return;
    }
    screen('<span class="sc-area">Your setup</span><p class="sc-q">'+S.t+'</p><p class="sc-help">'+S.h+'</p><div class="sc-fields">'+body+'</div><div class="sc-actions"><button class="btn fill" id="scNext" type="button">Continue '+ARR+'</button><button class="sc-skip" id="scSkip" type="button">Skip this question</button></div>');
    stage.querySelectorAll('.combo').forEach(bindCombo);
    stage.querySelectorAll('.chips').forEach(function(g){bindChips(g,function(k,v){if(k==='market'){var w=document.getElementById('licWrap');w.hidden=v!=='Regulated';if(v!=='Regulated')setup.licence='';}});});
    var lic=document.getElementById('lic');if(lic)lic.addEventListener('input',function(){setup.licence=lic.value.trim();});
    document.getElementById('scNext').addEventListener('click',function(){go(cur+1);});
    document.getElementById('scSkip').addEventListener('click',function(){go(cur+1);});
  }

  /* ---------- result ---------- */
  function compute(){
    var total=0,area={};AREAS.forEach(function(a){area[a]={s:0,m:0};});
    Q.forEach(function(q,i){var v=scores[i]==null?0:scores[i];total+=v;area[q.a].s+=v;area[q.a].m+=3;});
    var lvl=total<=6?1:total<=12?2:total<=18?3:total<=24?4:5;
    var pct={};AREAS.forEach(function(a){pct[a]=Math.round(area[a].s/area[a].m*100);});
    var weakest=AREAS.slice().sort(function(a,b){return pct[a]-pct[b];})[0];
    var order=Q.map(function(q,i){return {i:i,v:scores[i]==null?0:scores[i]};}).sort(function(a,b){return a.v-b.v||a.i-b.i;});
    var fixes=order.filter(function(x){return x.v<3;}).slice(0,3).map(function(x){return Q[x.i].fix;});
    if(!fixes.length)fixes=[['Cut campaigns that show no effect','At your level, fewer and better campaigns usually beat more volume.']];
    return {total:total,level:lvl,pct:pct,weakest:weakest,fixes:fixes};
  }
  function renderCalc(){
    screen('<div class="sc-calc"><div class="ring" aria-hidden="true"></div><p>Building your Scorecard</p><p class="s">Comparing your answers across the five levels</p></div>');
    setTimeout(function(){if(cur===CALC)go(RESULT);},reduce?300:1900);
  }
  var submitted=false;
  function detailHTML(r){
    var bars=AREAS.map(function(a){return '<div class="area"><span class="t">'+a+'</span><div class="track"><div class="fill" data-w="'+r.pct[a]+'"></div></div><span class="v">'+r.pct[a]+'%</span></div>';}).join('');
    var fx=r.fixes.map(function(f){return '<li><div><b>'+esc(f[0])+'</b><span>'+esc(f[1])+'</span></div></li>';}).join('');
    return '<h2 class="d3 res-h">Your four areas</h2><div class="areas">'+bars+'</div><h2 class="d3 res-h">Your three biggest fixes</h2><ol class="fixes">'+fx+'</ol>'+
      '<div class="res-start"><h3 class="d4">Where we would start</h3><p>'+esc(MODULE[r.weakest])+'</p></div>'+
      '<div class="sc-actions"><a class="btn fill" href="/contact">Book 30 minutes to walk through it '+ARR+'</a><a class="btn line" href="/sample-report">See a sample audit report</a></div>';
  }
  function renderResult(){
    var r=compute(),L5=LEVELS[r.level-1];
    var ladder=[1,2,3,4,5].map(function(n){return '<div class="'+(n<=r.level?'on':'')+(n===r.level?' here':'')+'" title="Level '+n+'"></div>';}).join('');
    var head='<div class="res-head"><div class="res-badge"><div><b>'+r.level+'</b><span>of 5</span></div></div><div><p class="eyebrow">Your Operations Scorecard</p><h1 class="d2" style="margin-top:10px">You are at level '+r.level+', <em class="a">'+L5.n.toLowerCase()+'.</em></h1><p class="lead">'+esc(L5.d)+'</p></div></div><div class="res-ladder" aria-label="Level '+r.level+' of 5">'+ladder+'</div>';
    if(submitted){
      screen(head+'<div class="res-note" id="resNote"></div>'+detailHTML(r));
      setNote();animateBars();return;
    }
    screen(head+'<div class="locked"><div class="blur" aria-hidden="true">'+detailHTML(r)+'</div>'+
      '<form class="gate" id="gate" novalidate><h2 class="d3">Your full Scorecard is ready</h2><p>See your four area scores, your three biggest fixes and where we would start. We will also prepare a free detailed report for you within five working days.</p>'+
      '<div class="sc-fields"><div class="fld"><label for="g-email">Work email</label><input class="inp" id="g-email" name="email" type="email" autocomplete="email" required></div>'+
      '<div class="f2"><div class="fld"><label for="g-name">First name <span class="opt">(optional)</span></label><input class="inp" id="g-name" name="name" autocomplete="given-name"></div><div class="fld"><label for="g-co">Company <span class="opt">(optional)</span></label><input class="inp" id="g-co" name="company" autocomplete="organization"></div></div>'+
      '<div class="hp2"><label>Leave empty<input name="website" tabindex="-1" autocomplete="off"></label></div>'+
      '<div class="fmsg" id="g-msg" role="status"></div>'+
      '<div><button class="btn fill" type="submit" id="g-btn">Show my Scorecard '+ARR+'</button></div><p class="fnote2">We email you a confirmation now and the detailed report within five working days. No newsletter, and at most one follow-up.</p></div></form></div>');
    animateBars();
    var f=document.getElementById('gate');
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var email=f.email.value.trim(),msg=document.getElementById('g-msg'),btn=document.getElementById('g-btn');
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){msg.className='fmsg bad';msg.textContent='Enter a valid work email to see your Scorecard.';f.email.focus();return;}
      btn.disabled=true;btn.textContent='Preparing your Scorecard';

      window.__vlEmail=email;
      if(f.website.value){submitted=true;window.__vlSent=true;renderResult();return;}
      var list=function(v){return Array.isArray(v)?v.join(', '):(v||'');};
      var data={_subject:'Operations Scorecard: level '+r.level+' from '+(f.company.value.trim()||email),_template:'table',_captcha:'false',
        _autoresponse:'Thank you for completing the Vesperline Operations Scorecard. Your operation is at level '+r.level+' of 5, '+L5.n+'. Area scores: Run '+r.pct.Run+'%, Connect '+r.pct.Connect+'%, Automate '+r.pct.Automate+'%, Measure '+r.pct.Measure+'%. Your free detailed report will arrive within 5 working days. It will cover your biggest gaps, what to fix first and how to measure the result. If you would like to walk through it together, reply to this email and we will find 30 minutes. The Vesperline team, vesperline.io',
        email:email,name:f.name.value.trim(),company:f.company.value.trim(),
        'Level':r.level+' of 5, '+L5.n,'Total score':r.total+' of 30','Run':r.pct.Run+'%','Connect':r.pct.Connect+'%','Automate':r.pct.Automate+'%','Measure':r.pct.Measure+'%',
        'Weakest area':r.weakest,'Top fixes':r.fixes.map(function(x){return x[0];}).join(' | '),
        'Platform':setup.platform,'CRM':setup.crm,'Support desk':setup.support,'Channels':list(setup.channels),
        'Messaging providers':[list(setup.providers),setup.providersOther].filter(Boolean).join(', '),
        'Market':setup.market,'Licence':setup.licence,'Gamification':setup.gamification,
        'Reporting':[list(setup.reporting),setup.reportingOther].filter(Boolean).join(', '),
        'Brands':setup.brands,'Active customers per month':setup.customers,'Team size':setup.team,'Priority, next 90 days':setup.priority,
        'Time taken':started?Math.round((Date.now()-started)/1000)+' seconds':''};
      Q.forEach(function(q,i){data['Q'+(i+1)+' '+q.a+': '+q.q]=(scores[i]==null?'Not answered':q.o[scores[i]])+' ('+(scores[i]==null?0:scores[i])+'/3)';});
      fetch('https://formsubmit.co/ajax/info@vesperline.io',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
        .then(function(res){if(!res.ok)throw new Error();return res.json();})
        .then(function(j){window.__vlSent=!(j&&String(j.success)==='false');})
        .catch(function(){window.__vlSent=false;})
        .finally(function(){submitted=true;renderResult();});
    });
  }
  function setNote(){
    var n=document.getElementById('resNote');if(!n)return;
    if(window.__vlSent){n.className='res-note';n.innerHTML='<b>Thank you.</b> We have sent a confirmation to '+esc(window.__vlEmail)+'. Your free detailed report will arrive within 5 working days.';}
    else{n.className='res-note warn';n.innerHTML='<b>Your Scorecard is below,</b> but we could not save your details just now. To receive the free detailed report, email <a href="mailto:info@vesperline.io?subject=Operations%20Scorecard">info@vesperline.io</a>.';}
  }
  function animateBars(){requestAnimationFrame(function(){requestAnimationFrame(function(){stage.querySelectorAll('.fill[data-w]').forEach(function(b){b.style.width=b.getAttribute('data-w')+'%';});});});}

  render();
})();
