// Application entry point – ownership: w_integrator
(function () {
  'use strict';

  // All namespaces are guaranteed to exist after the script tags.
  if (!window.MedRemMedications || !window.MedRemSchedule || !window.MedRemLogging || !window.MedRemNotifications) {
    console.error('Missing module');
    return;
  }

  // --- Initialise stores ---
  MedRemMedications.initMedications('medrem_medications');
  MedRemLogging.initLogging('medrem_history');
  MedRemNotifications.initNotifications();

  // --- Initialise new UI modules ---
  if (window.MedRemAnimations) {
    MedRemAnimations.initAnimations({ enableFadeIn: true, enablePulse: true });

    // Ensure required sections get fade-in per acceptance criteria
    ['upcoming-doses', 'medication-list', 'history-list'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) MedRemAnimations.fadeInSection(el);
    });
  }
  if (window.MedRemDecorations) {
    MedRemDecorations.initDecorations({ headerText: '💊 用药提醒', particleCount: 15 });
  }
  if (window.MedRemTheming) {
    MedRemTheming.initThemeToggle('theme-container');
  }
  if (window.MedRemSound) {
    MedRemSound.initSoundSettings('settings-section');
  }

  // --- Load generated background image (nano banana 2) ---
  (function loadBgImage() {
    var bgUrl = 'generated-images/generated.jpg';
    var img = new Image();
    img.onload = function () {
      document.body.style.backgroundImage = 'url(' + bgUrl + ')';
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';

      // Remove the overlay created by background.js so the image is fully visible
      var overlay = document.querySelector('.medrem-bg-overlay');
      if (overlay) {
        overlay.parentNode.removeChild(overlay);
      }
    };
    img.onerror = function () {
      // silently fall back to solid colour defined in styles.css
    };
    img.src = bgUrl;
  })();

  // --- DOM references ---
  const form = document.getElementById('medication-form');
  const nameInput = document.getElementById('med-name');
  const dosageInput = document.getElementById('med-dosage');
  const timesInput = document.getElementById('med-times');
  const scheduleTypeSelect = document.getElementById('med-schedule-type');
  const daysInput = document.getElementById('med-days');

  const medListEl = document.getElementById('medication-list');
  const dosesEl = document.getElementById('upcoming-doses');
  const historyEl = document.getElementById('history-list');

  // --- Utility: play a short beep (no external file needed) ---
  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 880;
      const gain = ctx.createGain();
      gain.gain.value = 0.3;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // audio not supported – silent fallback
    }
  }

  // ------------------------------------------------------------------
  // Render all sections
  // ------------------------------------------------------------------
  function render() {
    renderMedications();
    renderUpcomingDoses();
    renderHistory();
  }

  function renderMedications() {
    const meds = MedRemMedications.getMedications();
    if (meds.length === 0) {
      medListEl.innerHTML = '<div class="empty-msg">还没有添加药物</div>';
      return;
    }
    const html = meds.map(m => {
      const scheduleStr = formatSchedule(m.schedule);
      return `<div class="med-item">
        <div class="med-item__info">
          <span class="med-item__name">${escapeHtml(m.name)} ${escapeHtml(m.dosage)}</span>
          <span class="med-item__schedule">${scheduleStr}</span>
        </div>
        <button class="btn btn--small btn--danger" data-med-id="${m.id}">删除</button>
      </div>`;
    }).join('');
    medListEl.innerHTML = html;

    // attach remove handlers
    medListEl.querySelectorAll('[data-med-id]').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-med-id');
        MedRemMedications.removeMedication(id);
        render();
      });
    });
  }

  function renderUpcomingDoses() {
    const meds = MedRemMedications.getMedications();
    const allDoses = MedRemSchedule.getUpcomingDoses(meds);
    // cross‑reference history to know already‑taken doses
    const history = MedRemLogging.getHistory();
    const takenSet = new Set(history.map(h => h.doseId));

    // remove doses that have already been taken
    const doses = allDoses.filter(d => !takenSet.has(d.id));

    if (doses.length === 0) {
      dosesEl.innerHTML = '<div class="empty-msg">未来24小时没有待服用的剂量</div>';
      return;
    }

    const html = doses.map(d => {
      const timeStr = d.scheduledTime.toLocaleString('zh-CN', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      // find medication name
      const med = meds.find(m => m.id === d.medicationId);
      const drugName = med ? escapeHtml(med.name) : '未知';
      return `<div class="dose-card">
        <div class="dose-card__info">
          <span class="dose-card__drug">${drugName}</span>
          <span class="dose-card__time">${timeStr}</span>
        </div>
        <button class="btn btn--small btn--success" data-dose-id="${d.id}">标记已服</button>
      </div>`;
    }).join('');
    dosesEl.innerHTML = html;

    // attach mark‑taken handlers
    dosesEl.querySelectorAll('[data-dose-id]').forEach(btn => {
      btn.addEventListener('click', function () {
        const doseId = this.getAttribute('data-dose-id');
        // find the dose to get medication name
        const dose = doses.find(d => d.id === doseId);
        const med = meds.find(m => m.id === dose.medicationId);
        const medName = med ? med.name : '未知';
        // store history entry (date will be now)
        MedRemLogging.markDoseTaken(doseId, medName);
        render();
        // Play sound via MedRemSound to respect volume & sound settings
        if (window.MedRemSound) {
          MedRemSound.playSound('beep');
        } else {
          playBeep();
        }

        // Trigger animation if module available
        if (window.MedRemAnimations) {
          const card = this.closest('.dose-card');
          if (card) {
            MedRemAnimations.animateDoseTaken(card, function () {
              // After animation completes, pulse remaining items? optional
            });
          }
        }
      });
    });
  }

  function renderHistory() {
    const entries = MedRemLogging.getHistory();
    if (entries.length === 0) {
      historyEl.innerHTML = '<div class="empty-msg">暂无服药记录</div>';
      return;
    }
    const html = entries.map(e => {
      const timeStr = new Date(e.takenAt).toLocaleString('zh-CN', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      return `<div class="history-entry">
        <span class="history-entry__name">${escapeHtml(e.medicationName)}</span>
        <span class="history-entry__time">${timeStr}</span>
      </div>`;
    }).join('');
    historyEl.innerHTML = html;
  }

  // ------------------------------------------------------------------
  // Helper: format schedule for display
  // ------------------------------------------------------------------
  function formatSchedule(s) {
    const times = (s.times || []).join('、');
    if (s.type === 'daily') return `每天 ${times}`;
    if (s.type === 'weekly' && s.days) {
      const dayNames = ['日','一','二','三','四','五','六'];
      const daysStr = s.days.map(d => dayNames[d]).join('、');
      return `每周${daysStr} ${times}`;
    }
    if (s.type === 'customDays' && s.days) {
      const dayNames = ['日','一','二','三','四','五','六'];
      const daysStr = s.days.map(d => dayNames[d]).join('、');
      return `自定义 · 每周${daysStr} ${times}`;
    }
    return `${s.type} ${times}`;
  }

  // ------------------------------------------------------------------
  // Helper: escape HTML
  // ------------------------------------------------------------------
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ------------------------------------------------------------------
  // Form submit: add medication
  // ------------------------------------------------------------------
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = nameInput.value.trim();
    const dosage = dosageInput.value.trim();
    const timesRaw = timesInput.value.trim();
    if (!name || !dosage || !timesRaw) return;

    const times = timesRaw.split(',').map(s => s.trim()).filter(s => /^\d{2}:\d{2}$/.test(s));
    if (times.length === 0) {
      alert('请输入有效时间（HH:MM，多个用逗号分隔）');
      return;
    }

    const scheduleType = scheduleTypeSelect.value;

    // --- additional DOM references for schedule fields ---
    const startDateInput = document.getElementById('med-start-date');
    const monthlyDayInput = document.getElementById('med-monthly-day');
    const intervalValueInput = document.getElementById('med-interval-value');
    const intervalUnitSelect = document.getElementById('med-interval-unit');

    const todayStr = new Date().toISOString().split('T')[0];
    const schedule = { type: scheduleType, times: times };

    // ---------- weekly / customDays ----------
    let daysForWeekly = null;
    if (scheduleType === 'weekly' || scheduleType === 'customDays') {
      const daysRaw = daysInput.value.trim();
      daysForWeekly = daysRaw.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n >= 0 && n <= 6);
      if (daysForWeekly.length === 0) {
        alert('请输入有效的天数');
        return;
      }
    }

    // assemble schedule depending on type
    switch (scheduleType) {
      case 'weekly':
      case 'customDays':
        schedule.days = daysForWeekly;
        break;

      case 'biweekly': {
        const startDate = startDateInput.value || todayStr;
        const interval = parseInt(document.getElementById('med-biweekly-interval').value, 10) || 2;
        schedule.startDate = startDate;
        schedule.intervalValue = interval;
        break;
      }

      case 'monthly': {
        const startDate = startDateInput.value || todayStr;
        const dayOfMonth = parseInt(monthlyDayInput.value, 10) || 1;
        schedule.startDate = startDate;
        schedule.dayOfMonth = Math.min(dayOfMonth, 31);
        break;
      }

      case 'biannual': {
        const startDate = startDateInput.value || todayStr;
        const interval = parseInt(document.getElementById('med-biannual-interval').value, 10) || 6;
        schedule.startDate = startDate;
        schedule.intervalValue = interval;
        break;
      }

      case 'customInterval': {
        const startDate = startDateInput.value || todayStr;
        const intervalValue = parseInt(intervalValueInput.value, 10) || 1;
        const intervalUnit = intervalUnitSelect.value || 'day';
        schedule.startDate = startDate;
        schedule.intervalValue = intervalValue;
        schedule.intervalUnit = intervalUnit;
        break;
      }

      default:
        // daily – no extra fields
        break;
    }

    const medication = {
      id: crypto.randomUUID(),
      name: name,
      dosage: dosage,
      schedule: schedule
    };

    MedRemMedications.addMedication(medication);

    // clear form
    nameInput.value = '';
    dosageInput.value = '';
    timesInput.value = '';
    daysInput.value = '0,1,2,3,4,5,6';
    startDateInput.value = '';
    monthlyDayInput.value = '';
    intervalValueInput.value = '2';
    scheduleTypeSelect.value = 'daily';

    render();
  });

  // --- Initial render ---
  render();

  // --- Re-render periodically to catch notification updates ---
  setInterval(render, 10_000);
})();
