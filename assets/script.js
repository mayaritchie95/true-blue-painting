// Mobile nav toggle
(function(){
  var toggle=document.querySelector('.nav-toggle');
  var links=document.getElementById('nav-links');
  if(toggle&&links){
    toggle.addEventListener('click',function(){
      var open=links.classList.toggle('open');
      toggle.setAttribute('aria-expanded',open?'true':'false');
    });
    links.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click',function(){links.classList.remove('open');toggle.setAttribute('aria-expanded','false');});
    });
  }
})();

// Before/After sliders
(function(){
  document.querySelectorAll('.ba').forEach(function(ba){
    var after=ba.querySelector('.after-img');
    var range=ba.querySelector('.ba-range');
    var handle=ba.querySelector('.ba-handle');
    if(!after||!range||!handle)return;
    function set(v){
      after.style.clipPath='inset(0 0 0 '+v+'%)';
      handle.style.left=v+'%';
      range.setAttribute('aria-valuenow',Math.round(v));
    }
    range.addEventListener('input',function(){set(range.value);});
    set(range.value||50);
  });
})();

// Simple contact-form validation + mailto fallback (no backend on static host)
(function(){
  var form=document.getElementById('quote-form');
  if(!form)return;
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var status=document.getElementById('form-status');
    if(!form.checkValidity()){
      form.reportValidity();return;
    }
    var d=new FormData(form);
    var body=
      'Name: '+(d.get('name')||'')+'\n'+
      'Email: '+(d.get('email')||'')+'\n'+
      'Phone: '+(d.get('phone')||'')+'\n'+
      'Address / service area: '+(d.get('address')||'')+'\n\n'+
      'Project details:\n'+(d.get('details')||'');
    var mail='mailto:okko.trueblueptg@gmail.com?subject='+
      encodeURIComponent('Website quote request — '+(d.get('name')||''))+
      '&body='+encodeURIComponent(body);
    if(status){
      status.hidden=false;
      status.textContent='Opening your email app to send this request to True Blue Painting. If nothing opens, email okko.trueblueptg@gmail.com or call 604-440-3020.';
      status.focus();
    }
    window.location.href=mail;
  });
})();

// Prefill the "service area" field from a ?area= link on the Service Areas page
(function(){
  var form=document.getElementById('quote-form');
  if(!form)return;
  var params=new URLSearchParams(window.location.search);
  var area=params.get('area');
  if(!area)return;
  var field=document.getElementById('address');
  if(!field)return;
  // Trim and cap length as a light safeguard
  field.value=area.replace(/\s+/g,' ').trim().slice(0,80);
  // Let the visitor know it was filled from their choice, and move focus to the first empty field
  var note=document.getElementById('area-note');
  if(note){note.hidden=false;}
  var firstEmpty=form.querySelector('#name');
  if(firstEmpty && !firstEmpty.value){
    // focus the name field without yanking the page to the form on load
    firstEmpty.focus({preventScroll:true});
  }
})();

// Hero pages: bottom nav bar sits at the bottom of the hero, then detaches to a sticky TOP bar on scroll
(function(){
  if(!document.body.classList.contains('has-hero'))return;
  var header=document.querySelector('.site-header');
  var hero=document.querySelector('.hero');
  if(!header||!hero)return;
  function headerH(){
    // Use the bar's real rendered height (falls back to the CSS var)
    return header.offsetHeight || parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
  }
  // Pin the bar to the hero's actual bottom (works whether the hero is full-screen or shorter)
  function placeBar(){
    var top=Math.max(0, hero.offsetHeight-headerH());
    document.documentElement.style.setProperty('--hero-bar-top', top+'px');
  }
  function onScroll(){
    var trigger=hero.offsetHeight-headerH();
    if(window.scrollY>=trigger){header.classList.add('stuck');}
    else{header.classList.remove('stuck');}
  }
  placeBar();
  onScroll();
  // Re-measure once the hero image/fonts settle, and on resize
  window.addEventListener('load',function(){placeBar();onScroll();});
  window.addEventListener('resize',function(){placeBar();onScroll();},{passive:true});
  window.addEventListener('scroll',onScroll,{passive:true});
})();

// Scroll-reveal: fade elements in as they enter the viewport
(function(){
  var els=document.querySelectorAll('.fade-in');
  if(!els.length)return;
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in');});return;}
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}
    });
  },{threshold:.08,rootMargin:'0px 0px -5% 0px'});
  els.forEach(function(e){io.observe(e);});
  // Reveal anything already within the viewport on load (so nothing starts invisible above the fold)
  requestAnimationFrame(function(){
    els.forEach(function(e){
      var r=e.getBoundingClientRect();
      if(r.top<window.innerHeight&&r.bottom>0){e.classList.add('in');io.unobserve(e);}
    });
  });
})();

// ===== Lightbox: pop out gallery images, before/after sliders, and the video =====
(function(){
  var lb=document.getElementById('lightbox');
  if(!lb)return;
  var stage=document.getElementById('lightbox-stage');
  var cap=document.getElementById('lightbox-cap');
  var btnClose=document.getElementById('lightbox-close');
  var btnPrev=document.getElementById('lightbox-prev');
  var btnNext=document.getElementById('lightbox-next');
  var lastFocused=null;

  // Build the list of gallery photos (finished-project figures) for prev/next
  var figures=[].slice.call(document.querySelectorAll('.gallery figure'));
  var galleryItems=figures.map(function(fig){
    var img=fig.querySelector('img');
    var capEl=fig.querySelector('figcaption');
    return {src:img?img.getAttribute('src'):'', alt:img?img.getAttribute('alt'):'', caption:capEl?capEl.textContent:''};
  });
  var currentIndex=-1; // -1 means not in gallery-photo mode

  function clearStage(){ stage.innerHTML=''; }

  function showImage(index){
    currentIndex=index;
    var item=galleryItems[index];
    clearStage();
    var img=document.createElement('img');
    img.src=item.src; img.alt=item.alt;
    stage.appendChild(img);
    cap.textContent=item.caption||'';
    toggleNav(galleryItems.length>1);
  }

  // Clone a before/after slider into the lightbox and re-init its drag behaviour
  function showSlider(baEl, caption){
    currentIndex=-1;
    clearStage();
    var clone=baEl.cloneNode(true);
    // reset the range + clip to centre
    var after=clone.querySelector('.after-img');
    var range=clone.querySelector('.ba-range');
    var handle=clone.querySelector('.ba-handle');
    if(after&&range&&handle){
      function set(v){ after.style.clipPath='inset(0 0 0 '+v+'%)'; handle.style.left=v+'%'; range.setAttribute('aria-valuenow',Math.round(v)); }
      range.value=50; set(50);
      range.addEventListener('input',function(){set(range.value);});
    }
    stage.appendChild(clone);
    cap.textContent=caption||'';
    toggleNav(false);
  }

  function showVideo(srcEl){
    currentIndex=-1;
    clearStage();
    var v=document.createElement('video');
    v.controls=true; v.playsInline=true; v.autoplay=true;
    var src=document.createElement('source');
    src.src=srcEl.getAttribute('src'); src.type='video/mp4';
    v.appendChild(src);
    stage.appendChild(v);
    cap.textContent='';
    toggleNav(false);
  }

  function toggleNav(show){
    btnPrev.style.display=show?'flex':'none';
    btnNext.style.display=show?'flex':'none';
  }

  function openLB(){
    lastFocused=document.activeElement;
    lb.classList.add('open');
    document.body.classList.add('lightbox-locked');
    btnClose.focus();
    document.addEventListener('keydown',onKey);
  }
  function closeLB(){
    lb.classList.remove('open');
    document.body.classList.remove('lightbox-locked');
    clearStage(); cap.textContent='';
    document.removeEventListener('keydown',onKey);
    if(lastFocused&&lastFocused.focus)lastFocused.focus();
  }
  function prev(){ if(currentIndex<0)return; showImage((currentIndex-1+galleryItems.length)%galleryItems.length); }
  function next(){ if(currentIndex<0)return; showImage((currentIndex+1)%galleryItems.length); }

  function onKey(e){
    if(e.key==='Escape')closeLB();
    else if(e.key==='ArrowLeft')prev();
    else if(e.key==='ArrowRight')next();
  }

  // Wire up gallery figures
  figures.forEach(function(fig,i){
    fig.setAttribute('role','button');
    fig.setAttribute('tabindex','0');
    fig.setAttribute('aria-label','View larger: '+(galleryItems[i].caption||galleryItems[i].alt||'image'));
    function open(){ showImage(i); openLB(); }
    fig.addEventListener('click',open);
    fig.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();open();} });
  });

  // Wire up before/after sliders with an explicit expand button
  // (the transparent range input covers the whole slider, so a dedicated button is needed)
  [].slice.call(document.querySelectorAll('.ba')).forEach(function(ba){
    var wrap=ba.parentElement;
    var capEl=wrap?wrap.querySelector('p'):null;
    var caption=capEl?capEl.textContent:'';
    if(getComputedStyle(ba).position==='static')ba.style.position='relative';
    var expand=document.createElement('button');
    expand.type='button';
    expand.className='ba-expand';
    expand.setAttribute('aria-label','View larger'+(caption?': '+caption:''));
    expand.innerHTML='&#10530;';
    expand.addEventListener('click',function(e){ e.stopPropagation(); showSlider(ba,caption); openLB(); });
    ba.appendChild(expand);
  });

  // Wire up the showcase video with a dedicated "expand" button (so native play/pause still works)
  var showcaseVideo=document.querySelector('section video');
  if(showcaseVideo){
    var src=showcaseVideo.querySelector('source');
    var vidWrap=showcaseVideo.parentElement;
    if(src&&vidWrap){
      if(getComputedStyle(vidWrap).position==='static')vidWrap.style.position='relative';
      var expand=document.createElement('button');
      expand.type='button';
      expand.className='video-expand';
      expand.setAttribute('aria-label','Expand video to full view');
      expand.innerHTML='&#10530;'; // expand arrows glyph
      expand.addEventListener('click',function(){ showcaseVideo.pause(); showVideo(src); openLB(); });
      vidWrap.appendChild(expand);
    }
  }

  btnClose.addEventListener('click',closeLB);
  btnPrev.addEventListener('click',prev);
  btnNext.addEventListener('click',next);
  lb.addEventListener('click',function(e){ if(e.target===lb)closeLB(); });
})();
