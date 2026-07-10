(function () {
  var STORAGE_KEY = 'econow_gatekeeper_v1';
  var PROFILE_KEY = 'econow_profile_v1';
  var BAN_COLLECTION = 'banned_access';
  var ENTRY_PAGE = 'index.html';
  var PROTECTED_PAGES = ['main.html', 'year2526.html', 'future.html', 'memories.html'];
  var ACCESS_WINDOW_MS = 12 * 60 * 60 * 1000;
  var BAN_WATCH_INTERVAL_MS = 30000;
  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyDQNd1bQWwvkeOud5ROhlLiCUGTchJTblM",
    authDomain: "econow2526.firebaseapp.com",
    projectId: "econow2526",
    storageBucket: "econow2526.firebasestorage.app",
    messagingSenderId: "514653585801",
    appId: "1:514653585801:web:25021a25966df011f76158",
    measurementId: "G-ZHPJDXJ65H"
  };

  var firebaseToolsPromise = null;
  var banWatchTimer = null;

  function normalizePagePath(pathname) {
    var path = (pathname || '').split('?')[0].split('#')[0];
    var file = path.substring(path.lastIndexOf('/') + 1);
    return file || ENTRY_PAGE;
  }

  function isProtectedPage(page) {
    return PROTECTED_PAGES.indexOf(page) !== -1;
  }

  function loadProfile() {
    try {
      var raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      try {
        if (!window.name) return null;
        var parsed = JSON.parse(window.name);
        return parsed && parsed.profile ? parsed.profile : null;
      } catch (fallbackErr) {
        return null;
      }
    }
  }

  function saveProfile(payload) {
    var profile = {
      email: payload && payload.email ? String(payload.email).trim() : '',
      deviceId: payload && payload.deviceId ? String(payload.deviceId).trim() : '',
      ipAddress: payload && payload.ipAddress ? String(payload.ipAddress).trim() : '',
      savedAt: Date.now()
    };

    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (err) {
      try {
        var gateState = readGate() || {};
        gateState.profile = profile;
        window.name = JSON.stringify(gateState);
      } catch (fallbackErr) {
        // Ignore storage failures. The in-memory gate still works for this session.
      }
    }

    return profile;
  }

  function clearProfile() {
    try {
      localStorage.removeItem(PROFILE_KEY);
    } catch (err) {
      // Ignore storage failures.
    }
  }

  function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
  }

  function normalizeDeviceId(value) {
    return String(value || '').trim();
  }

  function normalizeIp(value) {
    return String(value || '').trim();
  }

  function makeBanDocId(kind, value) {
    return kind + ':' + encodeURIComponent(String(value || '').trim());
  }

  function isBanRecordActive(snapshot) {
    if (!snapshot || !snapshot.exists || !snapshot.exists()) return false;

    var data = snapshot.data ? snapshot.data() : null;
    if (!data) return true;
    if (data.active === false) return false;

    if (typeof data.status === 'string') {
      var status = data.status.toLowerCase();
      return status === 'banned' || status === 'blocked' || status === 'revoked';
    }

    return true;
  }

  function loadFirebaseTools() {
    if (!firebaseToolsPromise) {
      firebaseToolsPromise = Promise.all([
        import('https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js')
      ]).then(function (modules) {
        return {
          initializeApp: modules[0].initializeApp,
          getApps: modules[0].getApps,
          getApp: modules[0].getApp,
          getFirestore: modules[1].getFirestore,
          doc: modules[1].doc,
          getDoc: modules[1].getDoc
        };
      });
    }

    return firebaseToolsPromise;
  }

  async function getFirestoreDb() {
    var tools = await loadFirebaseTools();
    var app = tools.getApps && tools.getApps().length ? tools.getApp() : tools.initializeApp(FIREBASE_CONFIG);
    return {
      db: tools.getFirestore(app),
      doc: tools.doc,
      getDoc: tools.getDoc
    };
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
        var parsed = JSON.parse(raw);
        return parsed && parsed.gate ? parsed.gate : parsed;
      } catch (parseErr) {
        // Fall through to the backup storage below.
      }
    }

    try {
      if (!window.name) return null;
      var parsedName = JSON.parse(window.name);
      return parsedName && parsedName.gate ? parsedName.gate : parsedName;
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

    saveProfile(payload);

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(gate));
    } catch (err) {
      try {
        window.name = JSON.stringify({ gate: gate, profile: loadProfile() });
      } catch (fallbackErr) {
        window.name = JSON.stringify(gate);
      }
    }
    return gate;
  }

  function gateIsValid(gate) {
    return !!gate && gate.authorized === true && typeof gate.expiresAt === 'number' && gate.expiresAt > Date.now();
  }

  function unlockDocument() {
    document.documentElement.classList.remove('econow-gate-locked');
  }

  function lockDocument() {
    document.documentElement.classList.add('econow-gate-locked');
  }

  function redirectToEntry(nextPage) {
    var safeNext = isProtectedPage(nextPage) ? nextPage : 'main.html';
    window.location.replace(ENTRY_PAGE + '?next=' + encodeURIComponent(safeNext));
  }

  function clearGateState() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      // Fall through to window.name handling below.
    }

    try {
      if (!window.name) return;
      var parsed = JSON.parse(window.name);
      if (parsed && parsed.profile) {
        window.name = JSON.stringify({ profile: parsed.profile });
      } else {
        window.name = '';
      }
    } catch (fallbackErr) {
      window.name = '';
    }
  }

  async function checkRemoteBan(profile) {
    var resolvedProfile = profile || loadProfile();

    if (!resolvedProfile) {
      return { checked: false, blocked: false, reason: 'missing_profile' };
    }

    var identifiers = [];
    if (resolvedProfile.email) {
      identifiers.push({ kind: 'email', value: normalizeEmail(resolvedProfile.email) });
    }
    if (resolvedProfile.deviceId) {
      identifiers.push({ kind: 'device', value: normalizeDeviceId(resolvedProfile.deviceId) });
    }
    if (resolvedProfile.ipAddress) {
      identifiers.push({ kind: 'ip', value: normalizeIp(resolvedProfile.ipAddress) });
    }

    if (!identifiers.length) {
      return { checked: false, blocked: false, reason: 'empty_profile' };
    }

    try {
      var tools = await getFirestoreDb();
      var tasks = identifiers.map(function (item) {
        var ref = tools.doc(tools.db, BAN_COLLECTION, makeBanDocId(item.kind, item.value));
        return tools.getDoc(ref).then(function (snap) {
          return { kind: item.kind, value: item.value, snap: snap };
        });
      });

      var results = await Promise.all(tasks);
      var hit = results.find(function (result) {
        return isBanRecordActive(result.snap);
      });

      return {
        checked: true,
        blocked: !!hit,
        hit: hit || null
      };
    } catch (err) {
      console.warn('EcoNow ban check failed; allowing access for this session.', err);
      return { checked: false, blocked: false, error: err };
    }
  }

  function stopBanWatch() {
    if (banWatchTimer) {
      clearInterval(banWatchTimer);
      banWatchTimer = null;
    }
  }

  function startBanWatch(currentPage) {
    if (banWatchTimer || !isProtectedPage(currentPage)) {
      return;
    }

    var activePage = currentPage;
    var runCheck = async function () {
      var result = await checkRemoteBan(loadProfile());
      if (result.blocked) {
        stopBanWatch();
        clearGateState();
        redirectToEntry(activePage);
      }
    };

    banWatchTimer = window.setInterval(runCheck, BAN_WATCH_INTERVAL_MS);

    window.addEventListener('focus', runCheck);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) {
        runCheck();
      }
    });
  }

  function requireAccess() {
    var currentPage = normalizePagePath(window.location.pathname);

    if (!isProtectedPage(currentPage)) {
      unlockDocument();
      return true;
    }

    var gate = readGate();
    if (gateIsValid(gate)) {
      lockDocument();
      checkRemoteBan(loadProfile()).then(function (result) {
        if (result.blocked) {
          stopBanWatch();
          clearGateState();
          redirectToEntry(currentPage);
          return;
        }

        unlockDocument();
        startBanWatch(currentPage);
      });
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
    getProfile: loadProfile,
    setProfile: saveProfile,
    clearProfile: clearProfile,
    refreshRemoteBanStatus: checkRemoteBan,
    startBanWatch: startBanWatch,
    stopBanWatch: stopBanWatch,
    requireAccess: requireAccess,
    getNextTargetFromUrl: getNextTargetFromUrl,
    resolveNextTarget: resolveNextTarget,
    isProtectedPage: isProtectedPage,
    clearAccess: function () {
      clearGateState();
    }
  };

  requireAccess();
})();
