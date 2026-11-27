/* Qwerty Labs form design previews.
   Source: existing QwertyKids Fluent Forms enrolment and EOI exports (Nov 2026).
   Deliberately no backend, localStorage, fetch, submission, booking or payment. */
(function () {
  'use strict';
  var host = document.querySelector('[data-form-app]');
  if (!host) return;

  var kind = host.dataset.form || document.body.dataset.form || 'contact';
  var isTeenClassInterest = kind === 'interest-teen-classes';
  var isClassInterest = kind === 'interest-kids' || isTeenClassInterest;
  var enrolment = kind === 'classes' || kind === 'camps';
  var isCamp = kind === 'camps';
  var form = document.createElement('form');
  var status = document.getElementById('form-status');
  var requiredHint = document.getElementById('form-required-hint');
  var title = document.getElementById('form-heading');
  var initialTitle = title ? title.textContent : '';
  var childCount = 1;
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function birthYears() {
    var year = isCamp ? 2027 : new Date().getFullYear(), options = [];
    for (var y = year - (isTeenClassInterest ? 12 : 6); y >= year - 17; y--) options.push([String(y), String(y)]);
    return options;
  }
  form.className = 'studio-form';
  form.noValidate = true;
  form.setAttribute('aria-label', enrolment ? (isCamp ? 'Camp enrolment preview' : 'Weekly classes enrolment preview') : 'Form design preview');

  // A function lets us describe a job once and reuse it. Every labelled field starts here.
  function field(id, label, type, required, hint, extra) {
    var tip = hint ? '<p class="form-hint" id="' + id + '-hint">' + hint + '</p>' : '';
    var desc = hint ? ' aria-describedby="' + id + '-hint"' : '';
    var input = type === 'textarea' ?
      '<textarea id="' + id + '" name="' + id + '" rows="3" ' + (required ? 'required ' : '') + desc + '></textarea>' :
      '<input id="' + id + '" name="' + id + '" type="' + type + '" ' + (required ? 'required ' : '') + (extra || '') + desc + '>';
    return '<div class="form-field"><label for="' + id + '">' + label + (required ? ' *' : '') + '</label>' + tip + input + '</div>';
  }
  function select(id, label, options, required, hint) {
    return '<div class="form-field"><label for="' + id + '">' + label + (required ? ' *' : '') + '</label>' +
      (hint ? '<p class="form-hint" id="' + id + '-hint">' + hint + '</p>' : '') +
      '<select id="' + id + '" name="' + id + '" ' + (required ? 'required ' : '') + (hint ? 'aria-describedby="' + id + '-hint"' : '') + '>' +
      '<option value="">Choose an option</option>' + options.map(function (o) {
        return '<option value="' + o[0] + '">' + o[1] + '</option>';
      }).join('') + '</select></div>';
  }
  function yesNo(id, label, required) {
    return radioChoices(id,label,[['yes','Yes'],['no','No']],required);
  }
  function checkbox(id, label, required) {
    return '<label class="form-choice"><input type="checkbox" id="' + id + '" name="' + id +
      '" value="yes" ' + (required ? 'required ' : '') + '><span>' + label + '</span></label>';
  }
  function radioChoices(id, legend, values, required) {
    return '<fieldset class="form-fieldset"><legend>' + legend + (required ? ' *' : '') + '</legend>' +
      values.map(function (option, i) {
        return '<label class="form-choice"><input type="radio" name="' + id + '" id="' + id + '-' + i +
          '" value="' + option[0] + '" ' + (required && i === 0 ? 'required ' : '') +
          '><span>' + option[1] + '</span></label>';
      }).join('') + '</fieldset>';
  }
  function checkboxGroup(id, legend, values, required) {
    return '<fieldset class="form-fieldset" data-group="' + id + '"' + (required ? ' data-required="true"' : '') +
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
    return '<fieldset class="form-fieldset" data-group="camp-days" data-required="true">' +
      '<legend>Summer camp days — January 2027 *</legend>' +
      '<p class="form-hint">Choose as many days as you\'d like in any order.</p>' +
      dates.map(function (date) {
        return '<label class="form-choice"><input type="checkbox" name="camp-days" value="' + date[0] +
          '"><span>' + date[1] + '</span></label>';
      }).join('') + '</fieldset>';
  }
  function newsletter() {
    return '<fieldset class="form-fieldset"><legend>Occasional studio news</legend>' +
      checkbox('newsletter-opt-in','Yes, send me occasional Qwerty Labs news. I can unsubscribe any time.',false) + '</fieldset>';
  }
  function nameFields(prefix, label, required) {
    return '<div class="form-grid">' +
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
    return '<fieldset class="form-fieldset form-child" data-child="' + i + '"><legend>Child ' + (i+1) + '</legend>' +
      nameFields(p.slice(0,-1),'Child',true) +
      (isCamp ? select(p+'camp-age','Age group during camp',[['kids','Kids aged 7–12'],['teens','Teens aged 13–17']],true) : '') +
      '<div class="form-new-family">' +
      '<div class="form-grid">' +
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
      radioChoices('family-type','Have you enrolled with Qwerty before?',[
        ['new','No, new family'],['returning','Yes, returning family']
      ],true) +
      (isCamp ?
        campDays() :
        select('class-time','Preferred class',[
          ['monday','Monday 4:45–6:00 pm'],['tuesday','Tuesday 5:15–6:30 pm'],
          ['sat-9','Saturday 9:00–10:15 am'],['sat-1030','Saturday 10:30–11:45 am'],
          ['sat-1215','Saturday 12:15–1:30 pm']
        ],true)) +
      '</section>';
  }
  function grownups() {
    return '<section><h3>Parent or carer</h3>' +
      nameFields('parent','Primary contact',true) +
      field('parent-phone','Mobile number','tel',true,'','autocomplete="tel" inputmode="tel"') +
      '<div class="form-new-family">' +
      field('parent-email','Email address','email',true,'','autocomplete="email"') +
      '<h3>Secondary contact</h3>' +
      nameFields('secondary','Secondary contact',true) +
      field('secondary-phone','Secondary mobile','tel',true,'','inputmode="tel"') +
      field('secondary-email','Secondary email','email',true,'','autocomplete="off"') +
      '<h3>Anything helpful to know?</h3>' +
      yesNo('support-needed','Is there anything we should know to support a child?',true) +
      '<div data-when="support-needed" data-match="yes" hidden>' +
      field('support-details','Support information','textarea',true,'Strategies, sensory needs or other things that help us teach well.') + '</div>' +
      yesNo('medication-needed','Does any child carry medication or have medical information we should know?',true) +
      '<div data-when="medication-needed" data-match="yes" hidden>' +
      field('medical-details','Medical information','textarea',true,'Include relevant medication, allergies or action plans.') + '</div>' +
      '<fieldset class="form-fieldset"><legend>Permissions</legend>' +
      checkbox('medical-consent','I authorise Qwerty to seek emergency medical assistance if needed and understand that I will be contacted as soon as practicable.',true) + '</fieldset>' +
      radioChoices('photos','May we use photos or video from the programme for Qwerty communications?',[
        ['yes','Yes'],['no','No']
      ],true) +
      checkbox('terms-consent','I agree to the <a href="info/booking-terms.html">Booking Terms</a> and acknowledge the <a href="info/privacy.html">Privacy Policy</a>.',true) +
      (isCamp ? '' : referral() + newsletter()) +
      '</div><div class="form-returning-only" hidden>' +
      field('changes','Anything changed since your last booking?','textarea',false) +
      '</div></section>';
  }
  function enrolmentMarkup() {
    return programmes() +
      '<section><h3>Who is coming?</h3>' +
      '<p class="form-hint">You can enrol up to three children together.' +
      (isCamp ? ' All children on this form attend the same requested days.' : '') + '</p>' +
      '<div id="form-children">' + child(0) + '</div>' +
      '<div class="form-actions"><button type="button" class="form-quiet-button" id="form-add-child">+ Add a child</button>' +
      '<button type="button" class="form-quiet-button" id="form-remove-child" hidden>Remove last child</button></div></section>' +
      (isCamp ? '<section><h3>Camp hours</h3>' +
        '<p class="form-hint" id="kids-camp-hours">Kids: 9:30 am–3:30 pm, arrive from 9 am.</p>' +
        '<p class="form-hint" id="teens-camp-hours">Teens: 11 am–5 pm, arrive from 10 am.</p>' +
        '<fieldset class="form-fieldset" id="kids-extended-hours" hidden><legend>Extended hours (kids only)</legend>' +
        checkbox('extended-hours','I would like extended hours for a child aged 7–12 (8 am–5:30 pm).',false) + '</fieldset></section>' : '') +
      grownups() +
      '<button type="submit" class="form-submit">Review enrolment</button>';
  }
  function interestMarkup() {
    return checkboxGroup('class-preferences','Which class times could work? Choose any that suit.',[
        'Tuesday 4:00–5:15 pm — Proposed new class',
        'Friday 4:00–5:15 pm — Proposed new class',
        ...(isTeenClassInterest ? [] : ['Monday 4:45–6:00 pm — Waiting list (full)']),
        'Saturday 10:30–11:45 am — Waiting list (full)',
        'Another day or time — Explore future demand'
      ],true) +
      '<div data-when="class-preferences-' + (isTeenClassInterest ? 3 : 4) + '" data-match="yes" hidden>' +
      field('different-time','What day or time could work?','textarea',true) + '</div>' +
      select('likely','If a suitable session opens, would you likely enrol?',[
        ['yes','Yes'],['maybe','Maybe']
      ],true) +
      '<div>' +
      nameFields('child',isTeenClassInterest ? 'Teen' : 'Child',true) +
      '<div class="form-grid">' +
      select('child-month','Birth month',months.map(function(m,j){return [String(j+1),m];}),true) +
      select('child-year','Birth year',birthYears(),true) + '</div>' +
      yesNo('prior-coding','Have they coded before?',true) +
      '<div data-when="prior-coding" data-match="yes" hidden>' +
      field('coding-note','Tell us a little about their coding experience','textarea',true) + '</div></div>' +
      '<h3>Your details</h3>' +
      nameFields('first','Parent or carer',true) +
      field('email','Email','email',true,'','autocomplete="email"') +
      field('phone','Mobile','tel',true,'','autocomplete="tel"') +
      referral() + newsletter();
  }
  function simpleMarkup() {
    if(isClassInterest)return interestMarkup();
    if(kind==='adult')return select('adult-interest','What are you interested in?',[
        ['mentoring','One-to-one mentoring'],['groups','Group workshops'],
        ['both','Both mentoring and group workshops']
      ],true) + nameFields('first','Your',true) +
      field('email','Email','email',true,'','autocomplete="email"') +
      field('phone','Mobile','tel',false,'','autocomplete="tel"') +
      select('experience','Experience with creative technology',[
        ['new','Just starting'],['some','Some experience'],
        ['confident','Quite confident']
      ],false) +
      field('project','What would you like to make or explore?','textarea',true) +
      field('timing','Preferred days or timeframe','text',false) + referral() + newsletter();
    return nameFields('first','Your',true) +
      field('phone','Mobile number','tel',true,'','autocomplete="tel" inputmode="tel"') +
      field('message','What would you like to know?','textarea',true);
  }

  form.innerHTML='<p class="form-alert" id="form-error" role="alert" tabindex="-1" hidden></p>' +
    (enrolment ? enrolmentMarkup() : simpleMarkup() +
      '<button type="submit" class="form-submit">' +
        (isClassInterest ? 'Register your interest' : 'Finish preview →') + '</button>');
  host.appendChild(form);
  var done=document.createElement('div');
  done.className='form-done';
  done.hidden=true;
  done.innerHTML = enrolment ?
    '<h3>Review your enrolment</h3>' +
    '<p>Check your details before continuing. Nothing has been sent yet.</p>' +
    '<div id="form-review"></div>' +
    '<button type="button" class="form-quiet-button" id="form-start-again">Edit details</button>' :
    (isClassInterest ?
      '<h3 id="form-thanks"></h3><p id="form-thanks-child"></p><ul id="form-selected-times"></ul>' +
      '<p>Nothing has been sent yet.</p>' :
      '<h3 id="form-simple-thanks">Review your details</h3><p>Nothing has been sent yet.</p>') +
    '<div id="form-review"></div>' +
    '<button type="button" class="form-quiet-button" id="form-start-again">Back to the form</button>';
  host.appendChild(done);

  function isReturning(){
    var family = form.querySelector('input[name="family-type"]:checked');
    return enrolment && !!family && family.value === 'returning';
  }
  function toggle(el,show){
    el.hidden=!show;
    Array.prototype.forEach.call(el.querySelectorAll('input,select,textarea'),function(input){input.disabled=!show;});
  }
  // The form is having a conversation with you, one answer at a time.
  // State is what the program knows right now. When an answer changes, update the visible questions.
  // Hidden fields are disabled so they are not accidentally included in validation.
  function sync(){
    Array.prototype.forEach.call(form.querySelectorAll('.form-new-family'),function(el){
      toggle(el,!isReturning());
    });
    Array.prototype.forEach.call(form.querySelectorAll('.form-returning-only'),function(el){
      toggle(el,isReturning());
    });
    Array.prototype.forEach.call(form.querySelectorAll('[data-when]'),function(el){
      var condition=el.getAttribute('data-when');
      var input=form.querySelector('#'+condition) ||
        form.querySelector('input[name="'+condition+'"]:checked');
      var acceptable=(el.getAttribute('data-match')||'').split(',');
      var ancestor=el.parentElement.closest('[hidden]');
      toggle(el,!ancestor && !!input && acceptable.indexOf(input.value)!==-1 &&
        (input.type !== 'checkbox' || input.checked));
    });
    // Show the relevant camp hours. Returning families choose an age group without re-entering birth details.
    if (isCamp) {
      var ageGroups = Array.from(form.querySelectorAll('select[name$="-camp-age"]')).map(function(field){return field.value;});
      var hasKids = ageGroups.indexOf('kids') !== -1;
      var hasTeens = ageGroups.indexOf('teens') !== -1;
      var undecided = ageGroups.indexOf('') !== -1;
      form.querySelector('#kids-camp-hours').hidden = !hasKids && !undecided;
      form.querySelector('#teens-camp-hours').hidden = !hasTeens && !undecided;
      var extended = form.querySelector('#kids-extended-hours');
      toggle(extended,hasKids);
      if (!hasKids) form.querySelector('#extended-hours').checked = false;
    }
  }
  var quietValidation = false;
  function error(message,input){
    var box=form.querySelector('#form-error');
    if (box.textContent !== message) box.textContent=message;
    box.hidden=false;
    if(input){
      input.setAttribute('aria-invalid','true');
      if (!quietValidation) input.focus();
    } else if (!quietValidation) box.focus();
  }
  function australianMobile(value) {
    return /^(?:04\d{8}|\+614\d{8}|614\d{8})$/.test(value.replace(/[\s()\-]/g, ''));
  }
  function same(valueA, valueB) {
    return valueA.trim().replace(/\s+/g, ' ').toLowerCase() ===
      valueB.trim().replace(/\s+/g, ' ').toLowerCase();
  }
  // Check the visible questions and explain the first problem we find.
  function validVisible(quiet){
    quietValidation = !!quiet;
    var err=form.querySelector('#form-error');
    Array.prototype.forEach.call(form.querySelectorAll('[aria-invalid]'),function(el){el.removeAttribute('aria-invalid');});
    var scope=form;
    var bad=Array.prototype.find.call(scope.querySelectorAll('input,select,textarea'),function(el){
      return !el.disabled && !el.closest('[hidden]') && !el.checkValidity();
    });
    if(bad){
      var lbl=scope.querySelector('label[for="'+bad.id+'"]');
      {
        var label = lbl ? lbl.textContent.replace('*','').trim() : '';
        var message = 'Please complete ' + (label ? label.toLowerCase() : 'the highlighted field') + '.';
        if (bad.validity.typeMismatch && bad.type === 'email') {
          message = 'Please check ' + (bad.id === 'secondary-email' ? 'the secondary' : 'your') + ' email address.';
        } else if (bad.type === 'radio') {
          var legend = bad.closest('fieldset').querySelector('legend');
          var question = legend ? legend.textContent.replace('*','').trim() : 'the highlighted question';
          message = 'Please answer: ' + question;
        } else if (bad.type === 'number' && (bad.validity.rangeUnderflow || bad.validity.rangeOverflow)) {
          message = 'Please enter a number between ' + bad.min + ' and ' + bad.max + '.';
        } else if (bad.type === 'checkbox') {
          message = bad.id === 'terms-consent' ? 'Please confirm you agree to the Booking Terms and acknowledge the Privacy Policy.' :
            bad.id === 'medical-consent' ? 'Please confirm the emergency medical permission.' : 'Please tick the highlighted box.';
        } else if (bad.id === 'class-time') {
          message = 'Please choose your preferred class.';
        } else if (bad.type === 'tel') {
          message = 'Please enter ' + (bad.id === 'secondary-phone' ? 'the secondary contact’s' : 'your') + ' mobile number.';
        }
        if (bad.closest('.form-child')) {
          var childNumber = Number(bad.closest('.form-child').dataset.child) + 1;
          message = 'Child ' + childNumber + ': ' + message;
        }
        error(message,bad);
      }
      return false;
    }
    if (!enrolment) {
      var contactPhone = form.querySelector('#phone');
      if (contactPhone && !contactPhone.disabled && contactPhone.value.trim() && !australianMobile(contactPhone.value)) {
        error('Enter an Australian mobile number, such as 0412 345 678.', contactPhone);
        return false;
      }
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
    if(badGroup){
      var groupMessages = {'camp-days':'Please choose at least one camp day.','class-preferences':'Please choose at least one class time.','days':'Please choose at least one day.','times':'Please choose at least one time window.'};
      error(groupMessages[badGroup.dataset.group] || 'Please choose at least one option.',badGroup.querySelector('input'));
      return false;
    }
    err.hidden=true;err.textContent='';
    return true;
  }
  // Build the review from the answers rather than asking families to type them twice.
  function reviewAnswers() {
    var container = done.querySelector('#form-review');
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
      if (input.type === 'checkbox' && group.length === 1 && !input.closest('[data-group]')) {
        value = input.checked ? 'Yes' : 'No';
      } else if (input.type === 'radio' || input.type === 'checkbox') {
        value = selected.map(function(item){
          var choice = item.closest('.form-choice');
          return choice ? choice.textContent.trim() : 'Yes';
        }).join(', ');
        if (!value && input.type === 'checkbox' && group.length === 1 && !input.closest('[data-group]')) value = 'No';
      } else if (input.tagName === 'SELECT') {
        value = input.value && input.selectedOptions.length ? input.selectedOptions[0].textContent.trim() : '';
      } else value = input.value.trim();
      if (!value) return;
      var fieldLabel = form.querySelector('label[for="' + input.id + '"]');
      var fieldset = input.closest('fieldset');
      var legend = fieldset && fieldset.querySelector('legend');
      var choiceLabel = input.closest('.form-choice');
      var label = input.type === 'checkbox' && group.length === 1 && choiceLabel ?
        choiceLabel.textContent.trim() :
        (input.type === 'radio' || input.type === 'checkbox') && legend ?
        legend.textContent.trim() : fieldLabel ? fieldLabel.textContent.trim() : input.name;
      label = label.replace(/\s*\*$/, '');
      var childFieldset = input.closest('.form-child');
      if (childFieldset) label = 'Child ' + (Number(childFieldset.dataset.child) + 1) +
        ' — ' + label.replace(/^Child /,'');
      var row = document.createElement('div');
      row.className = 'form-summary';
      var heading = document.createElement('strong');
      heading.textContent = label;
      var answer = document.createElement('span');
      answer.textContent = value;
      row.appendChild(heading);
      row.appendChild(answer);
      container.appendChild(row);
    });
  }
  function showClassInterestThanks() {
    var parent = form.querySelector('#first-first').value.trim();
    var child = form.querySelector('#child-first').value.trim();
    done.querySelector('#form-thanks').textContent = 'Thanks, ' + parent + '!';
    done.querySelector('#form-thanks-child').textContent =
      'Here are the class times you selected for ' + child + ':';
    var list = done.querySelector('#form-selected-times');
    list.textContent = '';
    Array.prototype.forEach.call(form.querySelectorAll('[data-group="class-preferences"] input:checked'), function(input) {
      var item = document.createElement('li');
      item.textContent = input.id === 'class-preferences-' + (isTeenClassInterest ? 3 : 4) ?
        form.querySelector('#different-time').value.trim() :
        input.closest('.form-choice').textContent.trim();
      list.appendChild(item);
    });
  }
  function showDone(){
    reviewAnswers();
    var thanks = done.querySelector('#form-simple-thanks');
    var first = form.querySelector('#first-first');
    if (thanks && first) thanks.textContent = 'Thanks, ' + first.value.trim() + '!';
    if (isClassInterest) {
      showClassInterestThanks();
      if (requiredHint) requiredHint.hidden = true;
      if (status) status.hidden = true;
    }
    form.hidden=true;done.hidden=false;
    if(title && !enrolment)title.textContent='Review your details';
    done.setAttribute('tabindex','-1');done.focus();
    if(status){
      status.textContent='';
      status.hidden=true;
    }
  }
  form.addEventListener('change',sync);
  // Clear the previous review alert when editing; do not flag untouched fields before review.
  function refreshValidation() {
    var box=form.querySelector('#form-error');
    if (!box.hidden) {
      box.hidden=true;
      box.textContent='';
      Array.prototype.forEach.call(form.querySelectorAll('[aria-invalid]'),function(el){el.removeAttribute('aria-invalid');});
    }
  }
  form.addEventListener('input', refreshValidation);
  form.addEventListener('change', refreshValidation);
  form.addEventListener('submit',function(ev){ev.preventDefault();sync();if(validVisible())showDone();});
  if(enrolment){
    form.querySelector('#form-add-child').addEventListener('click',function(){
      if(childCount>=3)return;
      form.querySelector('#form-children').insertAdjacentHTML('beforeend',child(childCount));
      childCount++;
      form.querySelector('#form-add-child').hidden=childCount>=3;
      form.querySelector('#form-remove-child').hidden=false;
      sync();
      refreshValidation();
    });
    form.querySelector('#form-remove-child').addEventListener('click',function(){
      if(childCount<=1)return;
      form.querySelector('#form-children').lastElementChild.remove();
      childCount--;
      form.querySelector('#form-add-child').hidden=false;
      form.querySelector('#form-remove-child').hidden=childCount===1;
      refreshValidation();
    });
  }
  done.querySelector('#form-start-again').addEventListener('click',function(){
    done.hidden=true;form.hidden=false;
    if(title)title.textContent=initialTitle;
    if (isClassInterest) {
      if (requiredHint) requiredHint.hidden = false;
      if (status) { status.hidden = false; status.textContent = ''; }
    } else if(status){
      status.hidden=false;
      status.textContent='';
    }
    form.querySelector('input,select,textarea').focus();
  });
  sync();
})();

/* Holler mascots respond to form state. */
/* The approved Qwerty Labs mascot messenger.
   One original artwork and paper note, responding only to local form state.
   No storage, tracking or submission. */
(function () {
  'use strict';
  var app=document.querySelector('[data-form-app]');
  var companion=document.querySelector('[data-form-mascot]');
  if(!app||!companion)return;
  var bubble=companion.querySelector('[data-lab-speech]');
  if(!bubble)return;
  var kind=app.dataset.form||document.body.dataset.form||'classes';

  var isClassInterest=kind==='interest-kids'||kind==='interest-teen-classes';
  var enrolment=kind==='classes'||kind==='camps';

  function firstName(selector){
    var field=app.querySelector(selector);
    return field ? field.value.trim().replace(/\s+/g,' ').slice(0,24) : '';
  }
  function names(){
    return Array.prototype.map.call(app.querySelectorAll('.form-child input[name$="-first"]'),function(field){
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
    var children=app.querySelectorAll('.form-child').length;
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
    if(!family)return 'Hello! Have we met before?';
    if(selectedDays || (classTime && classTime.value))return (selectedDays>1?'Good choices!':'Good choice!')+' Who’s coming to make things?';
    if(returning)return kind==='camps' ? 'Welcome back! Which days are you coming?' : 'Welcome back! Which class suits you?';
    return kind==='camps' ? 'Lovely to meet you! Which days suit?' : 'Lovely to meet you! Which class suits?';
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
    return 'Mentoring, workshops or a bit of both?';
  }
  function simpleMessage(){
    var name=firstName('#first-first');
    if(kind==='adult')return adultMessage(name);
    if(kind==='contact'){
      var phone=app.querySelector('#phone');
      var message=app.querySelector('#message');
      if(name && message && message.value.trim())return 'Thanks, '+name+'! Looking good from here.';
      if(name && phone && phone.value.trim())return 'What’s on your mind, '+name+'? We’re listening.';
      return name?'Hi '+name+'! Lovely to meet you.':'Hello! Who are we chatting with?';
    }
    if(isClassInterest){
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
      if(preferences.length>1)
        return 'A few possibilities! That helps us plan new groups.';
      if(preferences.length===1){
        var chosen=preferences[0].closest('.form-choice').textContent;
        if(chosen.indexOf('Tuesday')!==-1)return 'Tuesday could be interesting. A new group, perhaps?';
        if(chosen.indexOf('Friday')!==-1)return 'Friday making? Good to know.';
        if(chosen.indexOf('Waiting list')!==-1)return 'That group is full. We’ll keep your interest in mind.';
        return 'Another time? Tell us what would work.';
      }
      return 'Which class times could work for you?';
    }
    return 'Something good is happening.';
  }
  function refresh(){
    if(app.querySelector('.form-done:not([hidden])')){
      var parent=firstName(enrolment?'#parent-first':'#first-first');
      bubble.textContent=kind==='adult' && parent ?
        'Thanks, '+parent+'! Here’s to making things.' : isClassInterest && parent ?
        'Thanks, '+parent+'! We like making room for new makers.' : parent ? 'Thanks, '+parent+'! Looking good from here.' : 'Looking good from here!';
    } else {
      var error=app.querySelector('#form-error:not([hidden])');
      if(error && error.textContent.trim()){
        var message=error.textContent.trim();
        var friendly={
          'Please give a different person as your secondary contact.':'Oops! We need two different people as contacts.',
          'The secondary contact needs their own mobile number.':'Oops! Each contact needs their own mobile number.',
          'The secondary contact needs a different email address.':'Oops! We need a different email address for each contact.',
          'Please choose at least one camp day.':'Ooh, which day are you coming? Choose at least one camp day.'
        };
        bubble.textContent=friendly[message] || message;
        return;
      }
      bubble.textContent=(kind==='classes'||kind==='camps')?enrolMessage():simpleMessage();
    }
  }
  app.addEventListener('input',refresh);
  app.addEventListener('change',refresh);
  var error=app.querySelector('#form-error');
  if(error)new MutationObserver(refresh).observe(error,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  var review=app.querySelector('.form-done');
  if(review)new MutationObserver(refresh).observe(review,{attributes:true,attributeFilter:['hidden']});
  var status=document.getElementById('form-status');
  if(status)new MutationObserver(refresh).observe(status,{childList:true,characterData:true,subtree:true});
  var children=document.getElementById('form-children');
  if(children)new MutationObserver(refresh).observe(children,{childList:true});
  refresh();
})();