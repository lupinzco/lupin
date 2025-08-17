(function(){
  const $ = (id) => document.getElementById(id);
  const q = new URLSearchParams(window.location.search);
  const UA = navigator.userAgent || '';
  const IS_ANDROID = /Android/i.test(UA);

  // 스토어 URL (iOS는 실제 App Store URL로 교체 필요)
  const ANDROID_STORE = 'https://play.google.com/store/apps/details?id=com.lupin.app';
  const IOS_STORE = ''; // 예: 'https://apps.apple.com/app/id1234567890'

  // id 추출: ?id= 우선, 없으면 #id 또는 #/post/123 패턴 보조
  function extractId(){
    const idFromQuery = q.get('id');
    if (idFromQuery) return idFromQuery;
    const hash = window.location.hash || '';
    // #id
    if (hash && /^#\w+/.test(hash)) return hash.slice(1);
    // #/post/123
    const m = hash.match(/^#\/?post\/(\w[\w-]*)/);
    if (m) return m[1];
    return null;
  }

  function openWeb(id){
    // SPA 해시 라우팅으로 이동(웹용): 홈 또는 /#/post/{id}
    const base = (function(){
      // /lupin/post/index.html → /lupin/
      const href = window.location.href;
      const m = href.match(/^(https?:\/\/[^/]+)(\/lupin\/)/);
      return m ? (m[2]) : '/lupin/';
    })();
    const origin = window.location.origin;
    const target = id ? (origin + base + '#/post/' + encodeURIComponent(id)) : (origin + base);
    window.location.replace(target);
  }

  $('open-web')?.addEventListener('click', () => openWeb(extractId()));

  // 메인 플로우: 앱 열기 → 실패 시 스토어 → 그 외 웹 폴백
  function tryOpen(){
    const id = extractId();
    const schemeUrl = id ? (`lupin://post/${encodeURIComponent(id)}`) : 'lupin://post';

    // Android intent: 항상 host 포함(post), 미설치 시 Play 스토어
    const fallbackWeb = (window.location.origin + '/lupin/' + (id ? ('#/post/' + encodeURIComponent(id)) : ''));
    const intentUrl = 'intent://post' + (id ? ('/' + encodeURIComponent(id)) : '') +
      '#Intent;scheme=lupin;package=com.lupin.app;S.browser_fallback_url=' + encodeURIComponent(ANDROID_STORE || fallbackWeb) + ';end';

    if (IS_ANDROID) {
      // Android: intent 먼저 시도 → 설치 시 바로 앱, 미설치 시 스토어
      try { window.location.href = intentUrl; } catch(_) {}
      return;
    }

    // iOS 등: 스킴 우선 → 실패 시 App Store 또는 웹 폴백
    const timer = setTimeout(() => {
      if (IOS_STORE) {
        try { window.location.href = IOS_STORE; } catch(_) { openWeb(id); }
      } else {
        openWeb(id);
      }
    }, 1200);

    try { window.location.href = schemeUrl; } catch(_) {}
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearTimeout(timer);
    }, { once: true });
  }

  // 시작
  tryOpen();
})();
