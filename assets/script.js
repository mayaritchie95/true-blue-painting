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

// Hero pages: bottom nav bar detaches to a sticky TOP bar once scrolled past the hero
(function(){
  if(!document.body.classList.contains('has-hero'))return;
  var header=document.querySelector('.site-header');
  var hero=document.querySelector('.hero');
  if(!header||!hero)return;
  function headerH(){
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h'))||72;
  }
  function onScroll(){
    // Stick to top once the bottom of the hero (minus the bar height) passes the top of the viewport
    var trigger=hero.offsetHeight-headerH();
    if(window.scrollY>=trigger){header.classList.add('stuck');}
    else{header.classList.remove('stuck');}
  }
  onScroll();
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
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
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(e){io.observe(e);});
})();
