/* 
   Validation engine for the contact form by implementing the already-defined validation logic in validation.js
   */
(function () {
  const { REGEX, wireField, regexValidator, minLengthValidator } = window.ValidationEngine;

  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  const runName = wireField(
    document.getElementById('cName'),
    document.getElementById('err-cName'),
    regexValidator(REGEX.fullName, {
      empty: 'Enter your name.',
      invalid: 'Letters only — first and last name.',
    })
  );

  const runEmail = wireField(
    document.getElementById('cEmail'),
    document.getElementById('err-cEmail'),
    regexValidator(REGEX.studentEmail, {
      empty: 'Enter your email.',
      invalid: 'Enter a valid email address.',
    })
  );

  const runSubject = wireField(
    document.getElementById('cSubject'),
    document.getElementById('err-cSubject'),
    regexValidator(REGEX.subject, {
      empty: 'Enter a subject line.',
      invalid: 'Subject must be 3–80 characters (letters, numbers, basic punctuation).',
    })
  );

  const runMessage = wireField(
    document.getElementById('cMessage'),
    document.getElementById('err-cMessage'),
    minLengthValidator(20, {
      empty: 'Write a message.',
      invalid: 'Message must be at least 20 characters long.',
    })
  );

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const results = [runName(), runEmail(), runSubject(), runMessage()];
    const allValid = results.every(Boolean);

    status.classList.remove('show', 'success', 'error');

    if (!allValid) {
      status.textContent = 'Please fix the highlighted fields above before sending.';
      status.classList.add('show', 'error');
      const firstInvalid = form.querySelector('.field.is-invalid input, .field.is-invalid textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // No backend is required by the brief — simulate a send with a
    // realistic short delay so the interaction still feels real.
    const btn = document.getElementById('sendBtn');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    setTimeout(() => {
      status.textContent = 'Message sent — thanks! We usually reply within two working days.';
      status.classList.add('show', 'success');
      btn.disabled = false;
      btn.textContent = 'Send message';
      form.reset();
      document.querySelectorAll('.field').forEach((f) => f.classList.remove('is-valid', 'is-invalid'));
    }, 700);
  });
})();
