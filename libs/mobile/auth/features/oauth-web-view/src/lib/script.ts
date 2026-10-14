// A real mobile browser UA — OAuth providers reject WebViews that look automated.
export const mobileUserAgent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

// OAuth + MFA: the web page fetches its challenge from `/mfa/challenge` (only it passes the
// cookie + Origin check). We let that request through and hand its response to RN.
export const mfaChallengeCaptureScript = `(function() {
  var originalFetch = window.fetch;
  window.fetch = function(input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var request = originalFetch.apply(this, arguments);
    if (url.indexOf('/api/v1/auths/mfa/challenge') !== -1) {
      request
        .then(function(response) { return response.clone().json(); })
        .then(function(data) {
          window.ReactNativeWebView.postMessage(JSON.stringify(
            data && data.challenge_token ? { type: 'mfa', challenge: data } : { type: 'mfa_error' }
          ));
        })
        .catch(function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mfa_error' }));
        });
    }
    return request;
  };
  true;
})();`;

// Open WebUI sets the `token` cookie with httpOnly=false and also mirrors it into
// localStorage, so the page's own context can read it. The OAuth callback sets the
// cookie, then the frontend needs a beat to persist it — so we poll briefly and
// postMessage the token back to RN as soon as it appears.
export const tokenCaptureScript = `(function() {
  var attempts = 0;
  function readToken() {
    var token = '';
    var cookies = document.cookie ? document.cookie.split(';') : [];
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      if (cookie.indexOf('token=') === 0) {
        token = cookie.substring(6);
        break;
      }
    }
    if (!token) {
      try { token = localStorage.getItem('token') || ''; } catch (error) {}
    }
    return token;
  }
  function tryCapture() {
    attempts++;
    var token = readToken();
    if (token) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'token', token: token }));
    } else if (attempts < 6) {
      setTimeout(tryCapture, 500);
    }
  }
  tryCapture();
  true;
})();`;
