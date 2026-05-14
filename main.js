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

  // --- Override notifications sound to use beep ---
  const origCheckAndNotify = MedRemNotifications.checkAndNotify;
  MedRemNotifications.checkAndNotify = function (doses) {
    origCheckAndNotify(doses);
    // play a short sound when a dose is pending
    if (doses && doses.length > 0) {
      // only beep for doses that are due right now (check already done in module)
      playBeep();
    }
  };

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
        playBeep(); // immediate audio feedback
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
    if (s.type === 'custom' && s.days) {
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
    let days = [];
    if (scheduleType === 'weekly' || scheduleType === 'custom') {
      const daysRaw = daysInput.value.trim();
      days = daysRaw.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n >= 0 && n <= 6);
      if (days.length === 0) {
        alert('请输入有效的天数');
        return;
      }
    } else {
      // daily – include all days
      days = [0,1,2,3,4,5,6];
    }

    const medication = {
      id: crypto.randomUUID(),
      name: name,
      dosage: dosage,
      schedule: {
        type: scheduleType,
        times: times,
        days: days
      }
    };

    MedRemMedications.addMedication(medication);
    // clear form
    nameInput.value = '';
    dosageInput.value = '';
    timesInput.value = '';
    daysInput.value = '0,1,2,3,4,5,6';
    scheduleTypeSelect.value = 'daily';

    render();
  });

  // --- Initial render ---
  render();

  // --- Re-render periodically to catch notification updates ---
  setInterval(render, 10_000);
})();
