window.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.querySelector('.register-form');
  const namePattern = /^[А-ЯЁа-яёA-Za-z\s-]+$/;

  if (!registerForm) {
    return;
  }

  const fields = [
    registerForm.querySelector('input[name="firstName"]'),
    registerForm.querySelector('input[name="lastName"]'),
  ];
  const messageBox = registerForm.querySelector('.form-message');

  const setMessage = (text, isError = true) => {
    if (!messageBox) return;
    messageBox.textContent = text;
    messageBox.className = `form-message ${isError ? 'error' : 'success'}`;
  };

  const validateNameField = (input) => {
    if (!input.value || namePattern.test(input.value.trim())) {
      input.setCustomValidity('');
    } else {
      input.setCustomValidity('Имя и фамилия не могут содержать цифр.');
    }
  };

  fields.forEach((input) => {
    if (!input) return;
    input.addEventListener('input', () => validateNameField(input));
    input.addEventListener('invalid', () => validateNameField(input));
  });

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    fields.forEach((input) => validateNameField(input));

    if (!registerForm.checkValidity()) {
      registerForm.reportValidity();
      return;
    }

    const payload = {
      firstName: registerForm.querySelector('input[name="firstName"]').value.trim(),
      lastName: registerForm.querySelector('input[name="lastName"]').value.trim(),
      email: registerForm.querySelector('input[name="email"]').value.trim(),
    };

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при регистрации');
      }

      setMessage(data.message || 'Регистрация прошла успешно', false);
      registerForm.reset();
    } catch (error) {
      setMessage(error.message || 'Не удалось отправить форму');
    }
  });
});
