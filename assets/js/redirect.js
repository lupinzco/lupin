(function(){
  const $ = (id) => document.getElementById(id);
  const q = new URLSearchParams(window.location.search);

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

  function showFallback(){
    $('loading').style.display = 'none';
    $('fallback').style.display = 'block';
  }

  function openWeb(id){
    // SPA 해시 라우팅으로 이동(웹용): /#/post/{id}
    const base = window.location.origin + window.location.pathname.replace(/post\/index\.html$/, '');
    window.location.href = base + '#/post/' + encodeURIComponent(id || '');
  }

  $('open-web')?.addEventListener('click', () => openWeb(extractId()));

  // 메인 플로우: 앱 열기 → 실패 시 앱/유니버설 링크 → 실패 시 폴백
  function tryOpen(){
    const id = extractId();
    // 앱으로 열기 필요값이 없으면 바로 폴백
    if (!id){
      showFallback();
      return;
    }

    const schemeUrl = `lupin://post/${encodeURIComponent(id)}`;
    const appLinkUrl = `https://lupinzco.github.io/lupin/post/${encodeURIComponent(id)}`;

    let didHide = false;
    const start = Date.now();

    // 1) 커스텀 스킴 시도
    function openScheme(){
      // 일부 브라우저에서 iframe 방식이 유리
      const ifr = document.createElement('iframe');
      ifr.style.display = 'none';
      ifr.src = schemeUrl;
      document.body.appendChild(ifr);

      // 1~1.5초 내 포그라운드 유지되면 실패로 간주하고 2단계 진행
      setTimeout(() => {
        if (Date.now() - start < 1600 && !didHide){
          window.location.href = appLinkUrl; // 2) 앱/유니버설 링크 시도
          // 2단계 이후에도 여전히 설치 안 된 경우 몇 초 뒤 폴백
          setTimeout(() => {
            showFallback();
          }, 1200);
        }
      }, 1200);
    }

    // iOS Safari에서 페이지가 백그라운드로 가면 visibilitychange가 발생하는 경우가 있어 감지용
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        didHide = true; // 앱 전환으로 추정 → 폴백 중지
      }
    });

    openScheme();
  }

  // 시작
  tryOpen();
})();
