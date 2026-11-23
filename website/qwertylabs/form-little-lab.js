/* The approved Qwerty Labs mascot messenger.
   One original artwork and paper note, responding only to local form state.
   No storage, tracking or submission. */
(function () {
  'use strict';
  var app=document.querySelector('[data-qlf-app]');
  var companion=document.querySelector('[data-little-lab]');
  if(!app||!companion)return;
  var bubble=companion.querySelector('[data-lab-speech]');
  if(!bubble)return;
  var kind=app.dataset.form||document.body.dataset.form||'classes';

  function firstName(selector){
    var field=app.querySelector(selector);
    return field ? field.value.trim().replace(/\s+/g,' ').slice(0,24) : '';
  }
  function names(){
    return Array.prototype.map.call(app.querySelectorAll('.qlf-child input[name$="-first"]'),function(field){
      return field.value.trim().replace(/\s+/g,' ').slice(0,24);
    }).filter(Boolean);
  }
  function joined(a){
    if(a.length===1)return a[0];
    if(a.length===2)return a[0]+' and '+a[1];
    return a.slice(0,-1).join(', ')+' and '+a[a.length-1];
  }
  function enrolMessage(){
    var a=names(), name=joined(a);
    var children=app.querySelectorAll('.qlf-child').length;
    var family=app.querySelector('input[name="family-type"]:checked');
    var returning=family && family.value==='returning';
    var parent=firstName('#parent-first');
    var selectedDays=app.querySelectorAll('input[name="camp-days"]:checked').length;
    var classTime=app.querySelector('#class-time');
    if(a.length){
      if(a.length<children)return name+'! Who else is joining?';
      if(parent)return 'Looking good, '+parent+'! '+name+(a.length===1?' is':' are')+' ready for some making.';
      if(returning)return (a.length===1?'It’s ':'')+name+'! '+'Yay'+', welcome back to the Lab.';
      if(a.length===1)return 'It’s '+name+'! Yay, a new maker to meet.';
      return name+'! '+(a.length===2?'Double yay, two':'Triple yay, three')+' new makers to meet.';
    }
    if(returning)return 'Ooh, a familiar family! Welcome back. Who’s coming?';
    if(selectedDays || (classTime && classTime.value))return 'Good choices! Who’s coming to make things?';
    if(family && family.value==='new')return 'Who’s the young maker joining us?';
    return 'Ooh, someone’s about to enrol.';
  }
  function simpleMessage(){
    var name=firstName('#first-first');
    if(kind==='adult')return name?'Hello '+name+'! What shall we make?':'Grown-up makers welcome. Yes, really.';
    if(kind==='contact')return name?'Hi '+name+'! We’re listening.':'Hello from the Lab. What’s on your mind?';
    if(kind.indexOf('interest')===0){
      var reason=app.querySelector('#reason');
      var purpose=reason?reason.value:'';
      if(name)return 'Thanks, '+name+'! We love a good idea.';
      if(purpose==='trial')return 'A trial? Lovely. Come see what we make.';
      if(purpose==='classes')return 'A class that fits? Let’s see what we can do.';
      if(purpose==='camps')return 'More making in the holidays. We like that.';
      return 'Curious? Good. That’s how things start.';
    }
    return 'Something good is happening.';
  }
  function refresh(){
    if(app.querySelector('.qlf-done:not([hidden])')){
      bubble.textContent='Looking good from here!';
    } else {
      bubble.textContent=(kind==='classes'||kind==='camps')?enrolMessage():simpleMessage();
    }
  }
  app.addEventListener('input',refresh);
  app.addEventListener('change',refresh);
  var status=document.getElementById('qlf-status');
  if(status)new MutationObserver(refresh).observe(status,{childList:true,characterData:true,subtree:true});
  var children=document.getElementById('qlf-children');
  if(children)new MutationObserver(refresh).observe(children,{childList:true});
  refresh();
})();