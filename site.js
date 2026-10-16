(function(){
  var root=document.documentElement;
  var btn=document.querySelector('.theme');
  if(btn){
    btn.addEventListener('click',function(){
      var next=root.getAttribute('data-theme')==='light'?'dark':'light';
      root.setAttribute('data-theme',next);
      btn.setAttribute('aria-label',next==='light'?'Switch to dark theme':'Switch to light theme');
      try{localStorage.setItem('vl-theme',next);}catch(e){}
    });
    btn.setAttribute('aria-label',root.getAttribute('data-theme')==='light'?'Switch to dark theme':'Switch to light theme');
  }
  var m=document.querySelector('.menu'),l=document.querySelector('.nav-links');
  if(m&&l){
    m.addEventListener('click',function(){var o=l.classList.toggle('open');m.setAttribute('aria-expanded',o);});
  }
  var h=document.querySelector('.site-head');
  function onScroll(){if(h)h.classList.toggle('scrolled',window.scrollY>8);}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* generic forms (contact, partners) */
  document.querySelectorAll('form[data-endpoint]').forEach(function(f){
    f.addEventListener('submit',function(ev){
      ev.preventDefault();
      var msg=f.querySelector('.form-msg'),b=f.querySelector('button[type=submit]');
      var data={};new FormData(f).forEach(function(v,k){data[k]=v;});
      if(!data.email||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)){
        msg.className='form-msg err';msg.textContent='Enter a valid work email so we can reply.';return;
      }
      b.disabled=true;b.textContent='Sending';
      fetch(f.getAttribute('data-endpoint'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
        .then(function(r){if(!r.ok)throw new Error();return r.json();})
        .then(function(){msg.className='form-msg ok';msg.textContent='Thanks. Your message reached us, and a named person will reply within one working day.';f.reset();})
        .catch(function(){msg.className='form-msg err';msg.textContent='The message did not send. Email us directly at info@vesperline.io.';})
        .finally(function(){b.disabled=false;b.textContent=b.getAttribute('data-label')||'Send';});
    });
  });
})();
