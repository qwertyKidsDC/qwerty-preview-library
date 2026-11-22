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
    var current=app.querySelector('.qlf-step:not([hidden])');
    var step=current?Number(current.dataset.step):0;
    var a=names(),name=joined(a);
    var children=app.querySelectorAll('.qlf-child').length;
    var family=app.querySelector('#family-type');
    var returning=family&&family.value==='returning';
    if(step===3)return 'Almost there! Looking good from here.';
    if(step===2)return name ? 'Excitement! '+name+(a.length===1?' is':' are')+' on the way.'+(returning?' Back for more making!':'') :
      'The grown-ups have arrived. Nearly done!';
    if(step===1){
      if(!name)return returning?'Who is making things with us this time?':'Who is the young maker joining us?';
      if(a.length<children)return name+'! Who else is joining?';
      if(returning)return (a.length===1?'It’s ':'')+name+'! Lovely to see your family again.';
      if(a.length===1)return 'It’s '+name+'! Yay, a new maker to meet.';
      return name+'! '+(a.length===2?'Double': 'Triple')+' yay, new makers to meet.';
    }
    return returning?'Ooh, a familiar family! Welcome back.':'Ooh, someone’s about to enrol.';
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