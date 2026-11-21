/* Qwerty Labs shared form journeys — REVIEW PREVIEW.
   No submission endpoint, storage or payment handling. The preview does not transmit entered data. */
(function () {
  'use strict';
  var app = document.querySelector('[data-qlf-app]');
  if (!app) return;
  var kind = document.body.getAttribute('data-form') || 'contact';
  var form = document.createElement('form');
  form.className = 'qlf-form';
  form.noValidate = true;
  var status = document.getElementById('qlf-status');
  var title = document.getElementById('qlf-title');
  var originalTitle = title ? title.textContent : '';
  var step = 0;
  var childCount = 1;
  var emailRE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function field(id, label, type, required, attrs, hint) {
    return '<div class="qlf-field"><label for="' + id + '">' + label + (required ? ' *' : '') + '</label>' +
      (hint ? '<p class="qlf-hint" id="' + id + '-hint">' + hint + '</p>' : '') +
      (type === 'textarea'
        ? '<textarea id="' + id + '" name="' + id + '" rows="3" ' + (required ? 'required ' : '') + (attrs || '') + (hint ? ' aria-describedby="' + id + '-hint"' : '') + '></textarea>'
        : '<input id="' + id + '" name="' + id + '" type="' + type + '" ' + (required ? 'required ' : '') + (attrs || '') + (hint ? ' aria-describedby="' + id + '-hint"' : '') + '>') +
      '</div>';
  }
  function select(id, label, items, required, hint) {
    return '<div class="qlf-field"><label for="' + id + '">' + label + (required ? ' *' : '') + '</label>' +
      (hint ? '<p class="qlf-hint" id="' + id + '-hint">' + hint + '</p>' : '') +
      '<select id="' + id + '" name="' + id + '" ' + (required ? 'required ' : '') + (hint ? 'aria-describedby="' + id + '-hint"' : '') + '>' +
      '<option value="">Choose an option</option>' + items.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('') + '</select></div>';
  }
  function option(id, label, required) {
    return '<label class="qlf-choice"><input type="checkbox" id="' + id + '" name="' + id + '" value="yes" ' + (required ? 'required ' : '') + '><span>' + label + '</span></label>';
  }
  function newsletter() {
    return '<fieldset class="qlf-fieldset"><legend>Occasional studio news</legend>' +
      option('newsletter-opt-in', 'Yes, send me the occasional Qwerty newsletter. This is optional and I can unsubscribe anytime.', false) +
      '</fieldset>';
  }
  function errorBox() { return '<div class="qlf-alert" id="qlf-error" role="alert" tabindex="-1" hidden></div>'; }
  function personFields() {
    return field('name','Your name','text',true,'autocomplete="name"') +
      field('email','Email address','email',true,'autocomplete="email"') +
      field('phone','Phone number','tel',false,'autocomplete="tel"');
  }
  var simple = {
    contact: function () { return select('topic','What are you interested in?',[
      ['classes','Weekly classes'],['camps','School holiday camps'],['adult','Workshops or mentoring'],['other','Something else entirely']
    ],true) + field('name','Your name','text',true,'autocomplete="name"') +
      field('email','Email address','email',true,'autocomplete="email"') +
      field('message','What would you like to know?','textarea',true,'', 'A question, an idea, or a little context.') + newsletter(); },
    interest: function () { return select('reason','What would you like to do?',[
      ['trial','Ask about a trial'],['waiting','Join a waiting list'],['interest','Register interest in a future class or camp'],['change','Change or cancel an existing booking']
    ],true) + select('audience','Who is this for?',[
      ['kids','Kids (7–12)'],['teens','Teens (13–17)'],['mixed','More than one child']
    ],true) + personFields() + field('child-ages','Child age(s)','text',false,'') +
      field('availability','Which days or times might work?','textarea',false,'', 'A rough idea is fine.') +
      field('message','Anything else we should know?','textarea',false) + newsletter(); },
    adult: function () { return select('adult-interest','What are you interested in?',[
      ['workshop','Workshops'],['mentoring','One-to-one mentoring'],['group','A private group session'],['project','Help with a particular project']
    ],true) + personFields() + select('experience','Experience with creative technology',[
      ['new','Just getting started'],['some','Some experience'],['confident','Quite confident'],['varies','A mix of experience']
    ],false) + field('project','What would you like to make or explore?','textarea',true) +
      field('timing','Preferred days or timeframe','text',false) + newsletter(); },
    newsletter: function () { return field('name','Your name (optional)','text',false,'autocomplete="name"') +
      field('email','Email address','email',true,'autocomplete="email"') +
      option('subscribe-consent','Yes, subscribe me to Qwerty Labs updates. I can unsubscribe at any time.',true); },
    pwyw: function () { return field('name','Your name','text',true,'autocomplete="name"') +
      field('email','Email address','email',true,'autocomplete="email"') +
      select('programme','What did we arrange?',[['camp','Camp place'],['class','Weekly class'],['other','Other studio session']],true) +
      field('amount','Agreed amount in AUD','number',true,'min="0" step="0.01"') +
      field('reference','Any details we agreed','textarea',false) +
      '<p class="qlf-hint">This private arrangement form does not process payment. We will confirm details separately.</p>' + newsletter(); }
  };
  function child(index) {
    var k = 'child-' + index + '-';
    return '<fieldset class="qlf-fieldset qlf-child" data-child="' + index + '"><legend>Child ' + (index + 1) + '</legend>' +
      '<div class="qlf-grid">' + field(k+'first','First name','text',true) +
      field(k+'last','Last name','text',true) + '</div>' +
      select(k+'age','Age',[7,8,9,10,11,12,13,14,15,16,17].map(function(n){return [String(n),String(n)];}),true) +
      select(k+'experience','Previous experience',[['new','New to making with technology'],['some','A little experience'],['lots','Plenty of experience']],true) +
      (kind==='camps'
        ? field(k+'days','Preferred camp dates or days','textarea',true,'','We will confirm available dates and the final cost.')
        : select(k+'session','Preferred weekly session',[
          ['mon','Monday 4:45–6:00 pm'],['tue','Tuesday 5:15–6:30 pm'],
          ['sat9','Saturday 9:00–10:15 am'],['sat1030','Saturday 10:30–11:45 am'],['sat1215','Saturday 12:15–1:30 pm']
        ],true, 'A preference, not a confirmed place.')) +
      field(k+'support','Support or learning needs','textarea',false,'','Helpful strategies, sensory considerations, accessibility needs or other information.') +
      field(k+'medical','Medical information we should know','textarea',false,'','Allergies, medication, action plans or other relevant information. This is a preview: do not enter real details.') +
      select(k+'photo','Photo and video permission',[['no','No'],['yes','Yes']],true,'Choose separately for each child.') +
      '</fieldset>';
  }
  function enrolment() {
    var programme = kind === 'camps' ? 'camp' : 'class';
    var first = '<section class="qlf-step" data-step="0"><h3 class="qlf-step-title">Choose your ' + programme + '</h3>' +
      select('family-type','Have you enrolled with Qwerty before?',[
        ['new','New to Qwerty'],['returning','Returning family']
      ],true, 'Returning families will need secure verification before we reuse any existing records.') +
      (kind==='camps'
        ? select('holiday-period','Which holiday programme?',[
          ['jan2027','January 2027'],['apr2027','April 2027'],['jul2027','July 2027'],['sep2027','September/October 2027']
        ],true, 'Dates and places will be confirmed before any payment request.') +
          field('camp-preference','Days or dates you are interested in','textarea',true,'','You can request different days for each child in the next step.') +
          select('extended-hours','Might you need extended hours?',[
            ['no','No'],['yes','Yes'],['unsure','Not sure yet']
          ],true)
        : select('term','Which term are you considering?',[
          ['2027-t1','Term 1, 2027'],['2027-t2','Term 2, 2027'],['2027-t3','Term 3, 2027'],['2027-t4','Term 4, 2027']
        ],true) +
          select('preferred-class','Preferred class time',[
            ['mon','Monday 4:45–6:00 pm'],['tue','Tuesday 5:15–6:30 pm'],
            ['sat9','Saturday 9:00–10:15 am'],['sat1030','Saturday 10:30–11:45 am'],['sat1215','Saturday 12:15–1:30 pm'],['other','Another time / waiting list']
          ],true)) +
      '<p class="qlf-hint">This is a request, not a confirmed booking. We check availability and fees before payment.</p></section>';
    var second = '<section class="qlf-step" data-step="1" hidden><h3 class="qlf-step-title">Who is coming?</h3>' +
      '<p class="qlf-hint">Add siblings here. Each child has their own preferences and permissions.</p>' +
      '<div id="qlf-children">' + child(0) + '</div>' +
      '<div class="qlf-actions"><button type="button" class="qlf-quiet-button" id="qlf-add-child">+ Add another child</button><button type="button" class="qlf-quiet-button" id="qlf-remove-child" hidden>Remove last child</button></div></section>';
    var third = '<section class="qlf-step" data-step="2" hidden><h3 class="qlf-step-title">The grown-ups</h3>' +
      '<div class="qlf-grid">' + field('parent-first','Parent or carer first name','text',true,'autocomplete="given-name"') +
      field('parent-last','Last name','text',true,'autocomplete="family-name"') + '</div>' +
      field('parent-email','Email address','email',true,'autocomplete="email"') +
      field('parent-phone','Mobile number','tel',true,'autocomplete="tel"') +
      '<h3 class="qlf-step-title">Emergencies and collection</h3>' +
      field('emergency-name','Another emergency contact','text',true,'','Someone other than the parent or carer above.') +
      field('emergency-phone','Their phone number','tel',true) +
      field('collection','Other adults authorised to collect (if applicable)','textarea',false) +
      select('departure','Can the child leave independently?',[
        ['no','No — adult collection'],['yes','Yes, with permission'],['discuss','Discuss with Qwerty']
      ],true) +
      option('emergency-consent','I authorise Qwerty to seek emergency medical assistance for my child if needed, and understand that I will be contacted as soon as practicable.',true) +
      option('terms-consent','I have read and agree to the <a href="booking-terms.html" target="_blank" rel="noopener">Booking Terms</a> and acknowledge the <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>.',true) +
      newsletter() +
      '<p class="qlf-hint">Please do not enter real personal or medical details while this is a design preview. The final system will send sensitive details only to a secured backend, never into payment metadata.</p></section>';
    var fourth = '<section class="qlf-step" data-step="3" hidden><h3 class="qlf-step-title">Check the details</h3>' +
      '<div id="qlf-review" aria-live="polite"></div>' +
      '<p class="qlf-hint">Once live: Qwerty checks places and the final fee, sends a secure Stripe invoice, and confirms enrolment after verified payment. Nothing is booked or paid for in this preview.</p></section>';
    return '<ol class="qlf-stepper" id="qlf-stepper" aria-label="Enrolment progress"><li aria-current="step">1. Choose</li><li>2. Children</li><li>3. Contacts</li><li>4. Review</li></ol>' +
      first + second + third + fourth +
      '<div class="qlf-actions"><button type="button" class="qlf-quiet-button" id="qlf-back" hidden>Back</button>' +
      '<button type="button" class="qlf-submit" id="qlf-next">Next: children</button></div>';
  }
  var isEnrol = kind === 'classes' || kind === 'camps';
  form.innerHTML = errorBox() + (isEnrol ? enrolment() : simple[kind] ? simple[kind]() : simple.contact()) +
    (!isEnrol ? '<button type="submit" class="qlf-submit">Preview confirmation →</button>' : '');
  app.appendChild(form);
  var done = document.createElement('div');
  done.className='qlf-done'; done.hidden=true;
  done.innerHTML='<h2>Looking good.</h2><p>This is a design preview. Nothing has been sent, saved, booked or paid for.</p>' +
    '<button type="button" class="qlf-quiet-button" id="qlf-start-again">Back to the form</button>';
  app.appendChild(done);
  function showError(message) {
    var box = document.getElementById('qlf-error');
    box.textContent = message;
    box.hidden = false;
    box.focus();
  }
  function clearError() {
    var box=document.getElementById('qlf-error');box.hidden=true;box.textContent='';
    Array.prototype.forEach.call(form.querySelectorAll('[aria-invalid="true"]'),function(el){
      el.removeAttribute('aria-invalid');
      var hint=(el.getAttribute('aria-describedby')||'').split(/\s+/).filter(function(x){return x!=='qlf-error';}).join(' ');
      if(hint)el.setAttribute('aria-describedby',hint);else el.removeAttribute('aria-describedby');
    });
  }
  function validVisible() {
    clearError();
    var fields=Array.prototype.filter.call(form.querySelectorAll('input,select,textarea'),function(el){
      return !el.disabled && !el.closest('[hidden]') && !el.checkValidity();
    });
    if(fields.length){
      var first=fields[0];
      var related=form.querySelector('label[for="'+first.id+'"]');
      var name=related ? related.textContent.trim().replace(/\s*\*\s*$/,'') : 'this answer';
      var message=first.type==='email' ? 'Enter a valid email address.' :
        first.type==='checkbox' ? 'Please confirm: '+name :
        first.tagName==='SELECT' ? 'Choose an option for '+name+'.' :
        'Please complete: '+name+'.';
      first.setAttribute('aria-invalid','true');
      var hint=first.getAttribute('aria-describedby')||'';
      first.setAttribute('aria-describedby',(hint+' qlf-error').trim());
      showError(message);
      first.focus(); return false;
    }
    var email=Array.prototype.filter.call(form.querySelectorAll('input[type=email]'),function(el){return !el.closest('[hidden]');})[0];
    if(email && email.value && !emailRE.test(email.value.trim())){
      email.setAttribute('aria-invalid','true');showError('Enter a valid email address.');email.focus();return false;
    }
    return true;
  }
  function showDone(){
    form.hidden=true;done.hidden=false;
    if (title) title.textContent='Preview complete';
    done.setAttribute('tabindex','-1');done.focus();
    if (status) status.textContent='Preview complete. No data submitted.';
  }
  form.addEventListener('submit',function(e){e.preventDefault();if(validVisible())showDone();});
  done.querySelector('#qlf-start-again').addEventListener('click',function(){
    done.hidden=true;form.hidden=false;step=0;
    if(isEnrol)showStep(0);
    if(title)title.textContent=originalTitle;
    if(status)status.textContent='Form preview restarted.';
    form.querySelector('input,select,textarea').focus();
  });
  if(isEnrol) {
    var add=document.getElementById('qlf-add-child');
    var remove=document.getElementById('qlf-remove-child');
    add.addEventListener('click',function(){
      if(childCount>=4)return;
      var host=document.getElementById('qlf-children');
      host.insertAdjacentHTML('beforeend',child(childCount));
      childCount++;
      add.hidden=childCount>=4;remove.hidden=false;
    });
    remove.addEventListener('click',function(){
      if(childCount<=1)return;
      document.getElementById('qlf-children').lastElementChild.remove();
      childCount--;add.hidden=false;remove.hidden=childCount<=1;
    });
    document.getElementById('qlf-back').addEventListener('click',function(){showStep(step-1);});
    document.getElementById('qlf-next').addEventListener('click',function(){
      if(step<3 && !validVisible())return;
      if(step===3){showDone();return;}
      showStep(step+1);
    });
    function showStep(n){
      step=Math.max(0,Math.min(n,3));clearError();
      Array.prototype.forEach.call(form.querySelectorAll('.qlf-step'),function(p){p.hidden=Number(p.getAttribute('data-step'))!==step;});
      Array.prototype.forEach.call(document.querySelectorAll('#qlf-stepper li'),function(el,i){
        if(i===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');
      });
      var back=document.getElementById('qlf-back'),next=document.getElementById('qlf-next');
      back.hidden=step===0;
      next.textContent=['Next: children','Next: contacts','Review details','Finish preview'][step]+' →';
      if(step===3)review();
      if (status) status.textContent='Step '+(step+1)+' of 4: '+['Choose','Children','Contacts','Review'][step];
      form.querySelectorAll('.qlf-step')[step].querySelector('h3').setAttribute('tabindex','-1');
      form.querySelectorAll('.qlf-step')[step].querySelector('h3').focus();
    }
    function review() {
      var out=document.getElementById('qlf-review');out.replaceChildren();
      var list=[['Programme',kind==='camps'?'Holiday camps':'Weekly classes'],
        ['Family',document.getElementById('family-type').selectedOptions[0].textContent],
        ['Requested period',document.getElementById(kind==='camps'?'holiday-period':'term').selectedOptions[0].textContent],
        ['Children',Array.prototype.map.call(document.querySelectorAll('.qlf-child'),function(card){
          return card.querySelector('[name$="-first"]').value+' '+card.querySelector('[name$="-last"]').value;
        }).join(', ')],
        ['Parent or carer',document.getElementById('parent-first').value+' '+document.getElementById('parent-last').value],
        ['Email',document.getElementById('parent-email').value],
        ['Newsletter opt-in',document.getElementById('newsletter-opt-in').checked?'Yes':'No']];
      list.forEach(function(item){
        var p=document.createElement('p');p.className='qlf-summary';
        var b=document.createElement('strong');b.textContent=item[0];
        p.appendChild(b);p.appendChild(document.createTextNode(item[1]));out.appendChild(p);
      });
    }
  }
})();