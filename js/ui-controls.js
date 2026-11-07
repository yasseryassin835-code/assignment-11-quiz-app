
function initCustomSelects() {
  const selects = document.querySelectorAll('.custom-select');
  
  selects.forEach(function(select) {
    const trigger = select.querySelector('.custom-select-trigger');
    const options = select.querySelectorAll('.custom-select-option');
    const hiddenInput = select.parentElement.querySelector('input[type="hidden"]');
    const textSpan = trigger.querySelector('.custom-select-text');
    const iconSpan = trigger.querySelector('.custom-select-icon');


    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      document.querySelectorAll('.custom-select.open').forEach(function(s) {
        if (s !== select) {
          s.classList.remove('open');
        }
      });
      select.classList.toggle('open');
    });


    options.forEach(function(option) {
      option.addEventListener('click', function() {
        const value = option.getAttribute('data-value');
        const icon = option.querySelector('i').outerHTML;
        const text = option.textContent.trim();

        select.setAttribute('data-value', value);
        if (hiddenInput) {
          hiddenInput.value = value;
        }
        textSpan.textContent = text;
        iconSpan.innerHTML = icon;


        options.forEach(function(o) {
          o.classList.remove('selected');
        });
        option.classList.add('selected');
        select.classList.remove('open');
      });
    });
  });
}


function initNumberInputs() {
  const buttons = document.querySelectorAll('.number-btn');
  
  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const wrapper = btn.closest('.number-input-wrapper');
      const input = wrapper.querySelector('input[type="number"]');
      const min = parseInt(input.min) || 1;
      const max = parseInt(input.max) || 50;
      let value = parseInt(input.value) || min;

      const action = btn.getAttribute('data-action');
      
      if (action === 'increment' && value < max) {
        input.value = value + 1;
      } else if (action === 'decrement' && value > min) {
        input.value = value - 1;
      }
    });
  });
}


function initClickOutside() {
  document.addEventListener('click', function() {
    document.querySelectorAll('.custom-select.open').forEach(function(s) {
      s.classList.remove('open');
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initCustomSelects();
  initNumberInputs();
  initClickOutside();
});