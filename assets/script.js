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
      'Address / service area: '+(d.get('address')||'')+'\n'+
      'Project type: '+(d.get('project')||'')+'\n\n'+
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
