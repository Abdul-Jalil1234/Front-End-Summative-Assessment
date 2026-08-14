/* 
   landing.js — intake form validation logic
    */
(function () {
  const { REGEX, wireField, regexValidator } = window.ValidationEngine;

  const form = document.getElementById('intakeForm');

  // Wire each field to its own regex-backed validator.
  const runName = wireField(
    document.getElementById('fullName'),
    document.getElementById('err-fullName'),
    regexValidator(REGEX.fullName, {
      empty: 'Enter your full name.',
      invalid: 'Use letters only — first and last name (no numbers or symbols).',
    })
  );

  const runId = wireField(
    document.getElementById('studentId'),
    document.getElementById('err-studentId'),
    regexValidator(REGEX.studentId, {
      empty: 'Enter your student ID.',
      invalid: 'Format must be 10 digits, e.g. 1276830987.',
    })
  );

  const runEmail = wireField(
    document.getElementById('email'),
    document.getElementById('err-email'),
    regexValidator(REGEX.studentEmail, {
      empty: 'Enter your email address.',
      invalid: 'Enter your student email (e.g. a.fuseini@alustudent.com).',
    })
  );

  const runPhone = wireField(
    document.getElementById('phone'),
    document.getElementById('err-phone'),
    regexValidator(REGEX.phone, {
      empty: 'Enter a phone number.',
      invalid: 'Enter a valid phone number (7–15 digits, optional country code).',
    })
  );

  // Auto-uppercase the student ID as they type, to match the ID pattern.
  document.getElementById('studentId').addEventListener('input', (e) => {
    const pos = e.target.selectionStart;
    e.target.value = e.target.value.toUpperCase();
    e.target.setSelectionRange(pos, pos);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Force-validate every field (covers the case where a student never
    // blurred a field before hitting submit).
    const results = [runName(), runId(), runEmail(), runPhone()];
    const allValid = results.every(Boolean);

    if (!allValid) {
      // Focus the first invalid field instead of using alert().
      const firstInvalid = form.querySelector('.field.is-invalid input');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Persist the student profile for later pages (Results / Contact).
    const profile = {
      fullName: document.getElementById('fullName').value.trim(),
      studentId: document.getElementById('studentId').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
    };
    sessionStorage.setItem('ljp_profile', JSON.stringify(profile));

    // Small confirmation micro-animation before navigating away.
    const btn = document.getElementById('startBtn');
    btn.textContent = 'Profile saved — loading quiz…';
    btn.disabled = true;
    setTimeout(() => { window.location.href = 'quiz.html'; }, 500);
  });
})();
