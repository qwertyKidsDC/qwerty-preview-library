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

  var isClassInterest=kind==='interest-kids'||kind==='interest-teen-classes';

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
    var email=app.querySelector('#parent-email');
    var phone=app.querySelector('#parent-phone');
    var terms=app.querySelector('#terms-consent');
    if(a.length){
      if(a.length<children)return name+'! Who else is joining?';
      if(parent && terms && terms.checked)return 'Ready to review, '+parent+'! Give everything a final look.';
      if(parent && phone && phone.value.trim() && (!email || email.disabled || (email.validity.valid && email.value.trim())))return 'Nearly there, '+parent+'! Check the permissions and details.';
      if(parent && email && !email.disabled && email.validity.valid && email.value.trim())return 'Thanks, '+parent+'! A mobile number next.';
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
  function adultMessage(name){
    var interest=app.querySelector('#adult-interest');
    var choice=interest ? interest.value : '';
    var email=app.querySelector('#email');
    var last=firstName('#first-last');
    var experience=app.querySelector('#experience');
    var project=app.querySelector('#project');
    var timing=app.querySelector('#timing');
    var referral=app.querySelector('#referral');
    var newsletter=app.querySelector('#newsletter-opt-in');
    var detailsReady=name && last && email && email.value.trim() && email.validity.valid;
    if(detailsReady && choice && project && project.value.trim()){
      if(newsletter && newsletter.checked)return 'More news from the Lab? Excellent, '+name+'!';
      if(referral && referral.value)return 'Thanks for telling us how you found us, '+name+'!';
      if(timing && timing.value.trim())return 'Looking good, '+name+'! Almost there.';
      return 'Ooh, something to explore! Just a few optional details to go.';
    }
    if(detailsReady && choice){
      if(experience && experience.value==='new')return 'New to this? Excellent. What are you curious about?';
      if(experience && experience.value)return 'Let’s put that experience to work, '+name+'! What interests you?';
      return 'Now for the fun bit, '+name+'! What would you like to make or explore?';
    }
    if(name)return 'Hello '+name+'! Lovely to meet you.';
    if(choice==='mentoring')return 'Your own project? Ooh, what shall we make?';
    if(choice==='groups')return 'Making discoveries together? Count us in!';
    if(choice==='both')return 'A bit of both? Excellent choice!';
    return 'Grown-up makers welcome. Yes, really.';
  }
  function simpleMessage(){
    var name=firstName('#first-first');
    if(kind==='adult')return adultMessage(name);
    if(kind==='contact')return name?'Hi '+name+'! We’re listening.':'Hello from the Lab. What’s on your mind?';
    if(kind.indexOf('interest')===0){
      var reason=app.querySelector('#reason');
      var purpose=isClassInterest?'classes':reason?reason.value:'';
      var child=firstName('#child-first');
      var email=app.querySelector('#email');
      var phone=app.querySelector('#phone');
      var experience=app.querySelector('input[name="prior-coding"]:checked');
      var preferences=app.querySelectorAll('[data-group="class-preferences"] input:checked:not(:disabled)');
      var referral=app.querySelector('#referral');
      var newsletter=app.querySelector('#newsletter-opt-in');
      var year=app.querySelector('#child-year');
      var likely=app.querySelector('#likely');
      var coding=app.querySelector('#coding-note');
      if(name && phone && phone.value.trim() && email && email.value.trim() && email.validity.valid){
        if(newsletter && newsletter.checked)return 'More news from the Lab? Excellent, '+name+'!';
        if(referral && referral.value)return 'Thanks for telling us how you found us, '+name+'!';
        return 'Almost done, '+name+'! Just a couple of optional questions.';
      }
      if(name && email && email.value.trim() && email.validity.valid)
        return 'Nearly there, '+name+'! Just your mobile number.';
      if(name)return 'Thanks, '+name+'! A couple more details and you’re done.';
      if(child && experience && experience.value==='yes' && coding && !coding.value.trim())return 'Ooh, '+child+' has coded before! Tell us what they’ve tried.';
      if(child && experience)return child+' has ideas to explore. We’ll find a good place to start.';
      if(child && year && year.value)return 'A little about '+child+'’s coding experience next.';
      if(child)return 'Ooh, '+child+' might be joining us!';
      if(isClassInterest && likely && likely.value)return 'Good to know! Who’s coming to make things?';
      if(purpose==='classes' && preferences.length>1)
        return 'A few possibilities! That helps us plan new groups.';
      if(purpose==='classes' && preferences.length===1){
        var chosen=preferences[0].closest('.qlf-choice').textContent;
        if(chosen.indexOf('Tuesday')!==-1)return 'Tuesday could be interesting. A new group, perhaps?';
        if(chosen.indexOf('Friday')!==-1)return 'Friday making? Good to know.';
        if(chosen.indexOf('Waiting list')!==-1)return 'That group is full. We’ll keep your interest in mind.';
        return 'Another time? Tell us what would work.';
      }
      if(purpose==='classes')return 'A class that fits? Let’s see what we can do.';
      if(purpose==='camps')return 'More making in the holidays. We like that.';
      return 'Curious? Good. That’s how things start.';
    }
    return 'Something good is happening.';
  }
  function refresh(){
    if(app.querySelector('.qlf-done:not([hidden])')){
      var parent=firstName('#first-first');
      bubble.textContent=kind==='adult' && parent ?
        'Thanks, '+parent+'! Here’s to making things.' : isClassInterest && parent ?
        'Thanks, '+parent+'! We like making room for new makers.' : 'Looking good from here!';
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