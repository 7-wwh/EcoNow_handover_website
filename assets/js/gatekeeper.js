(function () {
  var STORAGE_KEY = 'econow_gatekeeper_v1';
  var ENTRY_PAGE = 'index.html';
  var PROTECTED_PAGES = ['main.html', 'year2526.html', 'future.html', 'memories.html'];
  var ACCESS_WINDOW_MS = 12 * 60 * 60 * 1000;

  function normalizePagePath(pathname) {
    var path = (pathname || '').split('?')[0].split('#')[0];
    var file = path.substring(path.lastIndexOf('/') + 1);
    return file || ENTRY_PAGE;
  }

  function isProtectedPage(page) {
    return PROTECTED_PAGES.indexOf(page) !== -1;
  }

  function readGate() {
    var raw = null;

    try {
      raw = sessionStorage.getItem(STORAGE_KEY);
    } catch (err) {
      raw = null;
    }

    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (parseErr) {
        // Fall through to the backup storage below.
      }
    }

    try {
      if (!window.name) return null;
      return JSON.parse(window.name);
    } catch (fallbackErr) {
      return null;
    }
  }

  function writeGate(payload) {
    var gate = {
      authorized: true,
      email: payload && payload.email ? payload.email : '',
      deviceId: payload && payload.deviceId ? payload.deviceId : '',
      ipAddress: payload && payload.ipAddress ? payload.ipAddress : '',
      userAgent: navigator.userAgent,
      issuedAt: Date.now(),
      expiresAt: Date.now() + ACCESS_WINDOW_MS
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(gate));
    } catch (err) {
      window.name = JSON.stringify(gate);
    }
    return gate;
  }

  function gateIsValid(gate) {
    return !!gate && gate.authorized === true && typeof gate.expiresAt === 'number' && gate.expiresAt > Date.now();
  }

  function unlockDocument() {
    document.documentElement.classList.remove('econow-gate-locked');
  }

  function redirectToEntry(nextPage) {
    var safeNext = isProtectedPage(nextPage) ? nextPage : 'main.html';
    window.location.replace(ENTRY_PAGE + '?next=' + encodeURIComponent(safeNext));
  }

  function requireAccess() {
    var currentPage = normalizePagePath(window.location.pathname);

    if (!isProtectedPage(currentPage)) {
      unlockDocument();
      return true;
    }

    var gate = readGate();
    if (gateIsValid(gate)) {
      unlockDocument();
      return true;
    }

    redirectToEntry(currentPage);
    return false;
  }

  function resolveNextTarget(nextValue) {
    var candidate = normalizePagePath(nextValue || '');
    return isProtectedPage(candidate) ? candidate : 'main.html';
  }

  function getNextTargetFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search);
      return resolveNextTarget(params.get('next'));
    } catch (err) {
      return 'main.html';
    }
  }

  window.EcoNowGatekeeper = {
    grantAccess: writeGate,
    readAccess: readGate,
    requireAccess: requireAccess,
    getNextTargetFromUrl: getNextTargetFromUrl,
    resolveNextTarget: resolveNextTarget,
    isProtectedPage: isProtectedPage,
    clearAccess: function () {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        window.name = '';
      }
      window.name = '';
    }
  };

  requireAccess();
})();
