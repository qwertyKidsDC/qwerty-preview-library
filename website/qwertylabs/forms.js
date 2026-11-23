/* Qwerty Labs form design previews.
   Source: existing QwertyKids Fluent Forms enrolment and EOI exports (Nov 2026).
   Deliberately no backend, localStorage, fetch, submission, booking or payment. */
(function () {
  'use strict';
  var host = document.querySelector('[data-qlf-app]');
  if (!host) return;

  var kind = host.dataset.form || document.body.dataset.form || 'contact';
  var enrolment = kind === 'classes' || kind === 'camps';
  var isCamp = kind === 'camps';
  var form = document.createElement('form');
  var status = document.getElementById('qlf-status');
  var title = document.getElementById('qlf-title');
  var initialTitle = title ? title.textContent : '';
  var childCount = 1;
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function birthYears() {
    var year = new Date().getFullYear(), options = [];
    for (var y = year - 6; y >= year - 17; y--) options.push([String(y), String(y)]);
    return options;
  }
  form.className = 'qlf-form';
  form.noValidate = true;
  form.setAttribute('aria-label', enrolment ? (isCamp ? 'Camp enrolment preview' : 'Weekly classes enrolment preview') : 'Form design preview');

  function field(id, label, type, required, hint, extra) {
    var tip = hint ? '<p class="qlf-hint" id="' + id + '-hint">' + hint + '</p>' : '';
    var desc = hint ? ' aria-describedby="' + id + '-hint"' : '';
    var input = type === 'textarea' ?
      '<textarea id="' + id + '" name="' + id + '" rows="3" ' + (required ? 'required ' : '') + desc + '></textarea>' :
      '<input id="' + id + '" name="' + id + '" type="' + type + '" ' + (required ? 'required ' : '') + (extra || '') + desc + '>';
    return '<div class="qlf-field"><label for="' + id + '">' + label + (required ? ' *' : '') + '</label>' + tip + input + '</div>';
  }
  function select(id, label, options, required, hint) {
    return '<div class="qlf-field"><label for="' + id + '">' + label + (required ? ' *' : '') + '</label>' +
      (hint ? '<p class="qlf-hint" id="' + id + '-hint">' + hint + '</p>' : '') +
      '<select id="' + id + '" name="' + id + '" ' + (required ? 'required ' : '') + (hint ? 'aria-describedby="' + id + '-hint"' : '') + '>' +
      '<option value="">Choose an option</option>' + options.map(function (o) {
        return '<option value="' + o[0] + '">' + o[1] + '</option>';
      }).join('') + '</select></div>';
  }
  function yesNo(id, label, required) {
    return select(id,label,[['yes','Yes'],['no','No']],required);
  }
  function checkbox(id, label, required) {
    return '<label class="qlf-choice"><input type="checkbox" id="' + id + '" name="' + id +
      '" value="yes" ' + (required ? 'required ' : '') + '><span>' + label + '</span></label>';
  }
  function radioChoices(id, legend, values, required) {
    return '<fieldset class="qlf-fieldset"><legend>' + legend + (required ? ' *' : '') + '</legend>' +
      values.map(function (option, i) {
        return '<label class="qlf-choice"><input type="radio" name="' + id + '" id="' + id + '-' + i +
          '" value="' + option[0] + '" ' + (required && i === 0 ? 'required ' : '') +
          '><span>' + option[1] + '</span></label>';
      }).join('') + '</fieldset>';
  }
  function checkboxGroup(id, legend, values, required) {
    return '<fieldset class="qlf-fieldset" data-group="' + id + '"' + (required ? ' data-required="true"' : '') +
      '><legend>' + legend + (required ? ' *' : '') + '</legend>' +
      values.map(function (v,i) { return checkbox(id + '-' + i, v, false); }).join('') + '</fieldset>';
  }
  function campDays() {
    var dates = [
      ['2027-01-12','Tuesday 12 January'], ['2027-01-13','Wednesday 13 January'],
      ['2027-01-14','Thursday 14 January'], ['2027-01-15','Friday 15 January'],
      ['2027-01-18','Monday 18 January'], ['2027-01-19','Tuesday 19 January'],
      ['2027-01-20','Wednesday 20 January'], ['2027-01-21','Thursday 21 January'],
      ['2027-01-27','Wednesday 27 January'], ['2027-01-28','Thursday 28 January'],
      ['2027-01-29','Friday 29 January']
    ];
    return '<fieldset class="qlf-fieldset" data-group="camp-days" data-required="true">' +
      '<legend>Summer camp days — January 2027 *</legend>' +
      '<p class="qlf-hint">Choose as many days as you\'d like in any order.</p>' +
      dates.map(function (date) {
        return '<label class="qlf-choice"><input type="checkbox" name="camp-days" value="' + date[0] +
          '"><span>' + date[1] + '</span></label>';
      }).join('') + '</fieldset>';
  }
  function newsletter() {
    return '<fieldset class="qlf-fieldset"><legend>Occasional studio news</legend>' +
      checkbox('newsletter-opt-in','Yes, send me occasional Qwerty Labs news. I can unsubscribe any time.',false) + '</fieldset>';
  }
  function nameFields(prefix, label, required) {
    return '<div class="qlf-grid">' +
      field(prefix+'-first',label+' first name','text',required,'','autocomplete="given-name"') +
      field(prefix+'-last',label+' last name','text',required,'','autocomplete="family-name"') + '</div>';
  }
  function referral() {
    return select('referral','One last curiosity. How did you first hear about Qwerty?',[
      ['friend','A friend or family member'],['search','Google or another web search'],
      ['social','Social media'],['iwm','Inner West Mums'],['poster','A poster or flyer'],
      ['studio','Saw the studio or signage'],['other','Somewhere else'],['longtime','I have known Qwerty for ages']
    ],false);
  }
  function child(i) {
    var p='child-'+i+'-';
    return '<fieldset class="qlf-fieldset qlf-child" data-child="' + i + '"><legend>Child ' + (i+1) + '</legend>' +
      nameFields(p.slice(0,-1),'Child',true) +
      '<div class="qlf-new-family">' +
      '<div class="qlf-grid">' +
      select(p+'month','Birth month',months.map(function(m,j){return [String(j+1),m];}),true) +
      select(p+'year','Birth year',birthYears(),true) + '</div>' +
      (isCamp ? '' :
        yesNo(p+'experience','Have they coded before?',true) +
        '<div data-when="' + p + 'experience" data-match="yes" hidden>' +
        field(p+'coding','Tell us a little about their coding experience','textarea',true,'Scratch, Python, robotics, school clubs — whatever they have tried.') + '</div>') +
      '</div></fieldset>';
  }
  function programmes() {
    return '<section>' +
      (isCamp ? '' : '<h3 class="qlf-step-title">Choose your class</h3>') +
      select('family-type','Have you enrolled with Qwerty before?',[
        ['new','No, new family'],['returning','Yes, returning family']
      ],true,isCamp ? '' : 'We recognise returning families by the details you provide. Previous records are checked manually.') +
      (isCamp ?
        campDays() +
        '<fieldset class="qlf-fieldset"><legend>Extended hours</legend>' +
        checkbox('extended-hours','I would like extended hours (8 am–5:30 pm).',false) + '</fieldset>' :
        select('class-time','Preferred class',[
          ['monday','Monday 4:45–6:00 pm'],['tuesday','Tuesday 5:15–6:30 pm'],
          ['sat-9','Saturday 9:00–10:15 am'],['sat-1030','Saturday 10:30–11:45 am'],
          ['sat-1215','Saturday 12:15–1:30 pm'],
          ['other','Other time / please advise']
        ],true,'Current preferences, not confirmed availability. Please refer to the programme overview for the latest times.')) +
      (isCamp ? '' : '<p class="qlf-hint">We confirm availability and payment details separately. Nothing is booked here.</p>') +
      '</section>';
  }
  function grownups() {
    return '<section><h3 class="qlf-step-title">Parent or carer</h3>' +
      nameFields('parent','Primary contact',true) +
      field('parent-phone','Mobile number','tel',true,'','autocomplete="tel" inputmode="tel"') +
      '<div class="qlf-new-family">' +
      field('parent-email','Email address','email',true,'','autocomplete="email"') +
      '<h3 class="qlf-step-title">Secondary contact</h3>' +
      nameFields('secondary','Secondary contact',true) +
      field('secondary-phone','Secondary mobile','tel',true,'','inputmode="tel"') +
      field('secondary-email','Secondary email','email',true,'','autocomplete="off"') +
      '<h3 class="qlf-step-title">Anything helpful to know?</h3>' +
      yesNo('support-needed','Is there anything we should know to support a child?',true) +
      '<div data-when="support-needed" data-match="yes" hidden>' +
      field('support-details','Support information','textarea',true,'Strategies, sensory needs or other things that help us teach well.') + '</div>' +
      yesNo('medication-needed','Does any child carry medication or have medical information we should know?',true) +
      '<div data-when="medication-needed" data-match="yes" hidden>' +
      field('medical-details','Medical information','textarea',true,'Include relevant medication, allergies or action plans.') + '</div>' +
      '<fieldset class="qlf-fieldset"><legend>Permissions</legend>' +
      checkbox('medical-consent','I authorise Qwerty to seek emergency medical assistance if needed and understand that I will be contacted as soon as practicable.',true) + '</fieldset>' +
      radioChoices('photos','May we use photos or video from the programme for Qwerty communications?',[
        ['yes','Yes'],['no','No']
      ],true) +
      checkbox('terms-consent','I agree to the <a href="booking-terms.html">Booking Terms</a> and acknowledge the <a href="privacy.html">Privacy Policy</a>.',true) +
      (isCamp ? '' : referral() + newsletter()) +
      '</div><div class="qlf-returning-only" hidden>' +
      field('changes','Anything changed since your last booking?','textarea',false,'For example contact, medical, support or collection details. We check existing records manually.') +
      '</div></section>';
  }
  function enrolmentMarkup() {
    return programmes() +
      '<section><h3 class="qlf-step-title">Who is coming?</h3>' +
      '<p class="qlf-hint">You can enrol up to three children together.' +
      (isCamp ? ' All children on this form attend the same requested days.' : '') + '</p>' +
      '<div id="qlf-children">' + child(0) + '</div>' +
      '<div class="qlf-actions"><button type="button" class="qlf-quiet-button" id="qlf-add-child">+ Add a child</button>' +
      '<button type="button" class="qlf-quiet-button" id="qlf-remove-child" hidden>Remove last child</button></div></section>' +
      grownups() +
      '<button type="submit" class="qlf-submit">Review enrolment</button>';
  }
  function interestMarkup() {
    var teens=kind==='interest-teens';
    return select('reason','What would you like to hear about?',[
        ['trial','A trial session'],['classes','Class times or a waiting list'],
        ['camps',teens?'Teen camp days':'Holiday camp days']
      ],true) +
      '<div data-when="reason" data-match="classes" hidden>' +
      checkboxGroup('days','Which days suit you?',['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],true) +
      checkboxGroup('times','Which time windows could work?',[
        'After school (3:45–5:15 pm)','Late afternoon (5:15–6:45 pm)',
        'Evening (6:45–8 pm)','Saturday morning (9–11:45 am)',
        'Saturday afternoon (12–5 pm)','Flexible'
      ],true) +
      select('likely','If a suitable session opens, would you likely enrol?',[
        ['yes','Yes'],['maybe','Maybe']
      ],true) + '</div>' +
      '<div data-when="reason" data-match="camps" hidden>' +
      field('camp-availability','Which upcoming days or dates could work?','textarea',true,
        'Tell us what dates suit you; no payment or commitment is required.') +
      field('attendees','How many young people might attend?','number',true,'','min="1" max="20"') + '</div>' +
      '<div data-when="reason" data-match="trial" hidden>' +
      field('trial-availability','What days or times might work for a trial?','textarea',false) + '</div>' +
      '<div data-when="reason" data-match="trial,classes" hidden>' +
      nameFields('child','Child',true) +
      '<div class="qlf-grid">' +
      select('child-month','Birth month',months.map(function(m,j){return [String(j+1),m];}),true) +
      field('child-year','Birth year','number',true,'','min="2000" max="2100" inputmode="numeric"') + '</div>' +
      yesNo('prior-coding','Have they coded before?',true) +
      '<div data-when="prior-coding" data-match="yes" hidden>' +
      field('coding-note','Tell us a little about their coding experience','textarea',true) + '</div></div>' +
      '<h3 class="qlf-step-title">Your details</h3>' +
      nameFields('first','Parent or carer',true) +
      field('email','Email','email',true,'','autocomplete="email"') +
      field('phone','Mobile','tel',true,'','autocomplete="tel"') +
      referral() + newsletter();
  }
  function simpleMarkup() {
    if(kind==='interest-kids'||kind==='interest-teens'||kind==='interest')return interestMarkup();
    if(kind==='adult')return select('adult-interest','What are you interested in?',[
        ['studio','Studio workshops'],['online','Online workshops'],
        ['mentoring','One-to-one mentoring'],['groups','Group sessions'],
        ['projects','Help with a particular project']
      ],true) + nameFields('first','Your',true) +
      field('email','Email','email',true,'','autocomplete="email"') +
      field('phone','Mobile','tel',false,'','autocomplete="tel"') +
      select('experience','Experience with creative technology',[
        ['new','Just starting'],['some','Some experience'],
        ['confident','Quite confident'],['mixed','A mixture in our group']
      ],false) +
      field('project','What would you like to make or explore?','textarea',true) +
      field('timing','Preferred days or timeframe','text',false) + referral() + newsletter();
    if(kind==='newsletter') return nameFields('first','Your',true) +
      field('email','Email','email',true) +
      checkbox('subscribe-consent','Please subscribe me to Qwerty Labs updates. I can unsubscribe at any time.',true);
    return select('topic','What is your question about?',[
        ['classes','Classes'],['camps','Holiday camps'],
        ['adult','Adults and mentoring'],['other','Something else']
      ],true) + nameFields('first','Your',true) +
      field('email','Email','email',true,'','autocomplete="email"') +
      field('message','What would you like to know?','textarea',true) + newsletter();
  }

  form.innerHTML='<p class="qlf-alert" id="qlf-error" role="alert" tabindex="-1" hidden></p>' +
    (enrolment ? enrolmentMarkup() : simpleMarkup() +
      '<button type="submit" class="qlf-submit">Finish preview →</button>');
  host.appendChild(form);
  var done=document.createElement('div');
  done.className='qlf-done';
  done.hidden=true;
  done.innerHTML = enrolment ?
    '<h3 class="qlf-step-title">Review your enrolment</h3>' +
    '<p>Check your details before continuing. Nothing has been sent yet.</p>' +
    '<div id="qlf-review"></div>' +
    '<button type="button" class="qlf-quiet-button" id="qlf-start-again">Edit details</button>' :
    '<h3>Preview complete</h3><p>Nothing was submitted.</p>' +
    '<button type="button" class="qlf-quiet-button" id="qlf-start-again">Back to the form</button>';
  host.appendChild(done);

  function isReturning(){return enrolment && form.querySelector('#family-type').value==='returning';}
  function toggle(el,show){
    el.hidden=!show;
    Array.prototype.forEach.call(el.querySelectorAll('input,select,textarea'),function(input){input.disabled=!show;});
  }
  function sync(){
    Array.prototype.forEach.call(form.querySelectorAll('.qlf-new-family'),function(el){
      toggle(el,!isReturning());
    });
    Array.prototype.forEach.call(form.querySelectorAll('.qlf-returning-only'),function(el){
      toggle(el,isReturning());
    });
    Array.prototype.forEach.call(form.querySelectorAll('[data-when]'),function(el){
      var input=form.querySelector('#'+el.getAttribute('data-when'));
      var acceptable=(el.getAttribute('data-match')||'').split(',');
      var ancestor=el.parentElement.closest('[hidden]');
      toggle(el,!ancestor && !!input && acceptable.indexOf(input.value)!==-1);
    });
  }
  function error(message,input){
    var box=form.querySelector('#qlf-error');
    box.textContent=message;box.hidden=false;
    if(input){input.setAttribute('aria-invalid','true');input.focus();}
    else box.focus();
  }
  function australianMobile(value) {
    return /^(?:04\d{8}|\+614\d{8}|614\d{8})$/.test(value.replace(/[\s()\-]/g, ''));
  }
  function same(valueA, valueB) {
    return valueA.trim().replace(/\s+/g, ' ').toLowerCase() ===
      valueB.trim().replace(/\s+/g, ' ').toLowerCase();
  }
  function validVisible(){
    var err=form.querySelector('#qlf-error');
    err.hidden=true;err.textContent='';
    Array.prototype.forEach.call(form.querySelectorAll('[aria-invalid]'),function(el){el.removeAttribute('aria-invalid');});
    var scope=form;
    var bad=Array.prototype.find.call(scope.querySelectorAll('input,select,textarea'),function(el){
      return !el.disabled && !el.closest('[hidden]') && !el.checkValidity();
    });
    if(bad){
      var lbl=scope.querySelector('label[for="'+bad.id+'"]');
      error('Please complete '+(lbl?lbl.textContent.replace('*','').trim():'this answer')+'.',bad);
      return false;
    }
    if (enrolment) {
      var phones = ['parent-phone','secondary-phone'];
      for (var i = 0; i < phones.length; i++) {
        var phone = form.querySelector('#' + phones[i]);
        if (phone && !phone.disabled && !australianMobile(phone.value)) {
          error('Enter an Australian mobile number, such as 0412 345 678.', phone);
          return false;
        }
      }
      var primary = form.querySelector('#parent-first');
      var secondary = form.querySelector('#secondary-first');
      if (secondary && !secondary.disabled) {
        var sameName = same(primary.value, secondary.value) &&
          same(form.querySelector('#parent-last').value, form.querySelector('#secondary-last').value);
        var samePhone = form.querySelector('#parent-phone').value.replace(/[^0-9]/g,'').replace(/^61/, '0') ===
          form.querySelector('#secondary-phone').value.replace(/[^0-9]/g,'').replace(/^61/, '0');
        var sameEmail = same(form.querySelector('#parent-email').value, form.querySelector('#secondary-email').value);
        if (sameName) {error('Please give a different person as your secondary contact.',secondary);return false;}
        if (samePhone) {error('The secondary contact needs their own mobile number.',form.querySelector('#secondary-phone'));return false;}
        if (sameEmail) {error('The secondary contact needs a different email address.',form.querySelector('#secondary-email'));return false;}
      }
    }
    var badGroup=Array.prototype.find.call(scope.querySelectorAll('fieldset[data-required]'),function(el){
      return !el.closest('[hidden]') && !el.hidden &&
        !Array.prototype.some.call(el.querySelectorAll('input[type="checkbox"]'),function(box){return box.checked;});
    });
    if(badGroup){error('Please choose at least one option for '+badGroup.querySelector('legend').textContent.replace('*','').trim()+'.',badGroup.querySelector('input'));return false;}
    return true;
  }
  function reviewAnswers() {
    var container = done.querySelector('#qlf-review');
    if (!container) return;
    container.textContent = '';
    var seen = {};
    Array.prototype.forEach.call(form.querySelectorAll('input,select,textarea'),function(input){
      if (input.disabled || input.closest('[hidden]') || !input.name || seen[input.name]) return;
      seen[input.name] = true;
      var group = Array.prototype.filter.call(form.elements,function(item){
        return item.name === input.name && !item.disabled && !item.closest('[hidden]');
      });
      var selected = group.filter(function(item){return item.checked;});
      var value = '';
      if (input.type === 'radio' || input.type === 'checkbox') {
        value = selected.map(function(item){
          var choice = item.closest('.qlf-choice');
          return choice ? choice.textContent.trim() : 'Yes';
        }).join(', ');
        if (!value && input.type === 'checkbox' && group.length === 1) value = 'No';
      } else if (input.tagName === 'SELECT') {
        value = input.selectedOptions.length ? input.selectedOptions[0].textContent.trim() : '';
      } else value = input.value.trim();
      if (!value) return;
      var fieldLabel = form.querySelector('label[for="' + input.id + '"]');
      var fieldset = input.closest('fieldset');
      var legend = fieldset && fieldset.querySelector('legend');
      var label = (input.type === 'radio' || input.type === 'checkbox') && legend ?
        legend.textContent.trim() : fieldLabel ? fieldLabel.textContent.trim() : input.name;
      label = label.replace(/\s*\*$/, '');
      var childFieldset = input.closest('.qlf-child');
      if (childFieldset) label = 'Child ' + (Number(childFieldset.dataset.child) + 1) +
        ' — ' + label.replace(/^Child /,'');
      var row = document.createElement('div');
      row.className = 'qlf-summary';
      var heading = document.createElement('strong');
      heading.textContent = label;
      var answer = document.createElement('span');
      answer.textContent = value;
      row.appendChild(heading);
      row.appendChild(answer);
      container.appendChild(row);
    });
  }
  function showDone(){
    if (enrolment) reviewAnswers();
    form.hidden=true;done.hidden=false;
    if(title && !enrolment)title.textContent='Preview complete';
    done.setAttribute('tabindex','-1');done.focus();
    if(status)status.textContent=enrolment ?
      'Review your enrolment. No information has been sent.' :
      'Preview complete. No information was submitted.';
  }
  form.addEventListener('change',sync);
  form.addEventListener('submit',function(ev){ev.preventDefault();sync();if(validVisible())showDone();});
  if(enrolment){
    form.querySelector('#qlf-add-child').addEventListener('click',function(){
      if(childCount>=3)return;
      form.querySelector('#qlf-children').insertAdjacentHTML('beforeend',child(childCount));
      childCount++;
      form.querySelector('#qlf-add-child').hidden=childCount>=3;
      form.querySelector('#qlf-remove-child').hidden=false;
      sync();
    });
    form.querySelector('#qlf-remove-child').addEventListener('click',function(){
      if(childCount<=1)return;
      form.querySelector('#qlf-children').lastElementChild.remove();
      childCount--;
      form.querySelector('#qlf-add-child').hidden=false;
      form.querySelector('#qlf-remove-child').hidden=childCount===1;
    });
  }
  done.querySelector('#qlf-start-again').addEventListener('click',function(){
    done.hidden=true;form.hidden=false;
    if(title)title.textContent=initialTitle;
    if(status)status.textContent='Preview restarted.';
    form.querySelector('input,select,textarea').focus();
  });
  sync();
})();