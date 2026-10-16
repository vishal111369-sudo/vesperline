(function(){
  "use strict";
  var root=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var listeners=[];

  /* ---------- board mode ---------- */
  var day=document.getElementById('mDay'), night=document.getElementById('mNight');
  function paint(){
    var isNight=root.dataset.mode==='night';
    day.setAttribute('aria-pressed',String(!isNight));
    night.setAttribute('aria-pressed',String(isNight));
    listeners.forEach(function(f){ f(); });
  }
  function setMode(m){
    root.dataset.mode=m;
    try{localStorage.setItem('vsp-mode',m);}catch(e){}
    paint();
  }
  paint();
  day.addEventListener('click',function(){setMode('day');});
  night.addEventListener('click',function(){setMode('night');});

  /* ---------- header and menu ---------- */
  var top=document.getElementById('top'), nav=document.getElementById('topnav'), bg=document.getElementById('burger');
  var onScroll=function(){ top.classList.toggle('stuck', window.scrollY>6); };
  onScroll(); addEventListener('scroll',onScroll,{passive:true});
  bg.addEventListener('click',function(){
    var open=nav.classList.toggle('open');
    bg.setAttribute('aria-expanded',open?'true':'false');
  });
  nav.addEventListener('click',function(e){
    if(e.target.tagName==='A'){ nav.classList.remove('open'); bg.setAttribute('aria-expanded','false'); }
  });

  /* ---------- hero constellation ---------- */
  var cv=document.getElementById('stars');
  if(cv && cv.getContext){
    var ctx=cv.getContext('2d'), pts=[], w=0, h=0, dpr=1, rgb='27,111,196', raf=0;
    var readAccent=function(){
      var c=getComputedStyle(root).getPropertyValue('--accent').trim();
      var m=c.match(/^#([0-9a-f]{6})$/i);
      if(m){
        var n=parseInt(m[1],16);
        rgb=[(n>>16)&255,(n>>8)&255,n&255].join(',');
      }
    };
    listeners.push(readAccent); readAccent();
    var seed=function(){
      var r=cv.getBoundingClientRect();
      w=Math.max(1,r.width); h=Math.max(1,r.height);
      dpr=Math.min(window.devicePixelRatio||1,2);
      cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      var n=Math.round(Math.min(74,Math.max(26,(w*h)/17000)));
      pts=[];
      for(var i=0;i<n;i++){
        pts.push({
          x:Math.random()*w, y:Math.random()*h,
          vx:(Math.random()-.5)*.13, vy:(Math.random()-.5)*.13,
          r:Math.random()*1.5+.7, a:Math.random()*.5+.28
        });
      }
    };
    var draw=function(){
      ctx.clearRect(0,0,w,h);
      var i,j,p,q,dx,dy,d2,LINK=132*132;
      for(i=0;i<pts.length;i++){
        p=pts[i];
        for(j=i+1;j<pts.length;j++){
          q=pts[j]; dx=p.x-q.x; dy=p.y-q.y; d2=dx*dx+dy*dy;
          if(d2<LINK){
            ctx.globalAlpha=(1-d2/LINK)*.17;
            ctx.strokeStyle='rgb('+rgb+')';
            ctx.lineWidth=1;
            ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
          }
        }
      }
      for(i=0;i<pts.length;i++){
        p=pts[i];
        ctx.globalAlpha=p.a;
        ctx.fillStyle='rgb('+rgb+')';
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.2832); ctx.fill();
      }
      ctx.globalAlpha=1;
    };
    var step=function(){
      for(var i=0;i<pts.length;i++){
        var p=pts[i];
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<-20)p.x=w+20; if(p.x>w+20)p.x=-20;
        if(p.y<-20)p.y=h+20; if(p.y>h+20)p.y=-20;
      }
      draw();
      raf=requestAnimationFrame(step);
    };
    var start=function(){ if(!raf && !reduce) raf=requestAnimationFrame(step); };
    var stop=function(){ if(raf){ cancelAnimationFrame(raf); raf=0; } };
    seed(); draw();
    if(!reduce){
      start();
      new IntersectionObserver(function(es){ es[0].isIntersecting?start():stop(); },{threshold:0}).observe(cv);
      document.addEventListener('visibilitychange',function(){ document.hidden?stop():start(); });
    }
    var rt; addEventListener('resize',function(){
      clearTimeout(rt); rt=setTimeout(function(){ seed(); draw(); },160);
    });
  }

  /* ---------- reveal ---------- */
  var rv=[].slice.call(document.querySelectorAll('.rv'));
  if(reduce||!('IntersectionObserver' in window)){
    rv.forEach(function(e){e.classList.add('in');});
  }else{
    var groups=new WeakMap();
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){
        if(!en.isIntersecting) return;
        var el=en.target, par=el.parentElement, d=0;
        if(par && par.children.length>2 && el.classList.contains('rv')){
          var sibs=[].slice.call(par.children).filter(function(c){return c.classList.contains('rv');});
          d=Math.min(sibs.indexOf(el),7)*62;
        }
        el.style.transitionDelay=d+'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    },{threshold:.14,rootMargin:'0px 0px -6% 0px'});
    rv.forEach(function(e){io.observe(e);});
  }

  /* ---------- triggers: mark the one the reader is on ---------- */
  var trig=document.getElementById('triggers');
  if(trig && fine && !reduce){
    var rows=[].slice.call(trig.children);
    var focus=function(){
      var mid=window.innerHeight*0.46, best=null, dist=1e9;
      rows.forEach(function(r){
        var b=r.getBoundingClientRect();
        if(b.bottom<0||b.top>window.innerHeight) return;
        var d=Math.abs((b.top+b.bottom)/2-mid);
        if(d<dist){dist=d;best=r;}
      });
      rows.forEach(function(r){ r.classList.toggle('on', r===best); });
    };
    focus(); addEventListener('scroll',focus,{passive:true});
  }

  /* ---------- the middle diagram ---------- */
  var vw=document.getElementById('vwrap'), off=document.getElementById('sOff'), on=document.getElementById('sOn');
  if(vw && off && on){
    var setv=function(v){
      vw.dataset.state=v;
      off.setAttribute('aria-pressed',String(v==='off'));
      on.setAttribute('aria-pressed',String(v==='on'));
    };
    off.addEventListener('click',function(){setv('off');});
    on.addEventListener('click',function(){setv('on');});
    var flipped=false;
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){
        if(es[0].isIntersecting && !flipped){
          flipped=true;
          setTimeout(function(){ setv('on'); }, reduce?0:1600);
        }
      },{threshold:.4}).observe(vw);
    }
  }

  /* ---------- section rail ---------- */
  var rail=document.getElementById('rail');
  if(rail){
    var items=[].slice.call(rail.querySelectorAll('li'));
    var secs=items.map(function(li){ return document.getElementById(li.dataset.t); });
    var mark=function(){
      var y=window.scrollY+window.innerHeight*0.34, best=-1;
      secs.forEach(function(s,i){ if(s && s.offsetTop<=y) best=i; });
      items.forEach(function(li,i){ li.classList.toggle('on', i===best); });
    };
    mark(); addEventListener('scroll',mark,{passive:true}); addEventListener('resize',mark);
  }

  requestAnimationFrame(function(){ setTimeout(function(){ root.classList.add('ready'); },60); });
})();

/* contact, audit and partnership forms: same FormSubmit route as the live site */
(function(){
  var forms=document.querySelectorAll('form.cform[data-subject]');
  [].forEach.call(forms,function(f){
    var n=f.querySelector('.fnote'), E=f.elements;
    f.addEventListener('submit',function(e){
      e.preventDefault();
      if(!f.checkValidity()){ n.className='fnote bad'; n.textContent='Add your name, a work email and a line about what you are dealing with.'; return; }
      if(E._honey && E._honey.value) return;
      var b=f.querySelector('button[type=submit]');
      b.disabled=true; n.className='fnote'; n.textContent='Sending.';
      fetch('https://formsubmit.co/ajax/info@vesperline.io',{
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify({name:E.name.value,email:E.email.value,company:E.company.value,phone:E.phone.value,
          message:E.message.value,topic:f.getAttribute('data-topic'),page:location.pathname,
          _subject:f.getAttribute('data-subject'),_template:'table',_captcha:'false'})
      }).then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(){ n.className='fnote ok'; n.textContent='Thank you. We will reply from info@vesperline.io within one working day.'; f.reset(); b.disabled=false; })
      .catch(function(){ n.className='fnote bad'; n.textContent='That did not send. Please email info@vesperline.io directly.'; b.disabled=false; });
    });
  });
})();
