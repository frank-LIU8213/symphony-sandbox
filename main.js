// Application entry point – ownership: w_integrator
(function () {
  'use strict';

  // All namespaces are guaranteed to exist after the script tags.
  // As a safeguard, exit early if anything is missing.
  if (!window.MedRemMedications || !window.MedRemSchedule || !window.MedRemLogging || !window.MedRemNotifications) {
    console.error('Missing module');
    return;
  }

  // --- Initialise stores ---
  MedRemMedications.initMedications('medrem_medications');
  MedRemLogging.initLogging('medrem_history');
  MedRemNotifications.initNotifications();

  // --- Render initial UI ---
  renderApp();

  function renderApp() {
    // TODO: implement
  }
})();
