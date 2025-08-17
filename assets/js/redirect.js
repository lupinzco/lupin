// 딥링크 리다이렉트 처리
class DeepLinkHandler {
    constructor() {
        this.postId = this.extractPostId();
        this.userAgent = navigator.userAgent;
        this.isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(this.userAgent);
        this.isKakao = /KAKAOTALK/i.test(this.userAgent);
        
        this.init();
    }
    
    init() {
        console.log('DeepLink Handler 초기화');
        console.log('Post ID:', this.postId);
        console.log('Mobile:', this.isMobile);
        console.log('KakaoTalk:', this.isKakao);
        
        if (this.isMobile) {
            this.tryOpenApp();
        } else {
            this.showWebVersion();
        }
        
        // 메타태그 업데이트
        this.updateMetaTags();
    }
    
    extractPostId() {
        // URL에서 post ID 추출
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id') || urlParams.get('post_id');
        
        if (id) return id;
        
        // path에서 추출 시도
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1] || 'default';
    }
    
    tryOpenApp() {
        const appUrl = `lupin://post/${this.postId}`;
        console.log('앱 실행 시도:', appUrl);
        
        // 앱 실행 시도 - 여러 방법 동시 사용
        this.attemptAppLaunch(appUrl);
        
        // 실패 시 fallback 표시 (2.5초 후)
        setTimeout(() => {
            this.showFallback();
        }, 2500);
        
        // 페이지 visibility 변경 감지 (앱이 열리면 페이지가 숨겨짐)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('앱이 성공적으로 열린 것으로 추정');
                // 앱이 열렸다고 판단하고 fallback 취소
                clearTimeout(this.fallbackTimeout);
            }
        });
    }
    
    attemptAppLaunch(appUrl) {
        // 방법 1: iframe 사용
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = appUrl;
        document.body.appendChild(iframe);
        
        // 방법 2: 직접 location 변경
        setTimeout(() => {
            try {
                window.location.href = appUrl;
            } catch (e) {
                console.log('Direct location change failed:', e);
            }
        }, 500);
        
        // 방법 3: 링크 클릭 시뮬레이션
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = appUrl;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, 1000);
    }
    
    showFallback() {
        console.log('Fallback 화면 표시');
        document.getElementById('loading').style.display = 'none';
        document.getElementById('fallback').style.display = 'flex';
        
        // 게시물 정보 로드
        this.loadPostPreview();
    }
    
    showWebVersion() {
        console.log('웹 버전 표시');
        document.getElementById('loading').style.display = 'none';
        document.getElementById('web-content').style.display = 'flex';
        
        // 웹 콘텐츠 로드
        this.loadWebContent();
    }
    
    loadPostPreview() {
        // 실제 서비스에서는 API 호출
        const mockData = {
            title: `게시물 #${this.postId}`,
            summary: '앱에서 전체 내용을 확인해보세요.',
            date: '2024-01-15',
            author: '작성자'
        };
        
        document.getElementById('post-title').textContent = mockData.title;
        document.getElementById('post-summary').textContent = mockData.summary;
    }
    
    loadWebContent() {
        // 실제 서비스에서는 API 호출
        const mockData = {
            title: `게시물 #${this.postId}`,
            content: `
                <p>이것은 게시물 ${this.postId}의 전체 내용입니다.</p>
                <p>실제 서비스에서는 서버 API를 통해 실제 게시물 데이터를 불러와서 표시합니다.</p>
                <p>웹 버전에서도 충분한 기능을 제공하지만, 모바일 앱에서 더욱 편리한 경험을 제공합니다.</p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h4>💡 팁</h4>
                    <p>앱을 설치하면 다음과 같은 추가 기능을 이용할 수 있어요:</p>
                    <ul style="margin-left: 20px; margin-top: 10px;">
                        <li>실시간 알림</li>
                        <li>오프라인 읽기</li>
                        <li>빠른 공유</li>
                        <li>개인화 설정</li>
                    </ul>
                </div>
            `,
            date: '2024-01-15',
            author: '작성자'
        };
        
        document.getElementById('web-post-title').textContent = mockData.title;
        document.getElementById('web-post-content').innerHTML = mockData.content;
        document.getElementById('post-date').textContent = mockData.date;
        document.getElementById('post-author').textContent = mockData.author;
    }
    
    updateMetaTags() {
        // Open Graph 메타태그 동적 업데이트
        const title = `게시물 #${this.postId} - Lupin`;
        const description = `게시물을 확인해보세요!`;
        const url = window.location.href;
        
        document.title = title;
        
        this.updateMetaTag('og:title', title);
        this.updateMetaTag('og:description', description);
        this.updateMetaTag('og:url', url);
        this.updateMetaTag('description', description);
    }
    
    updateMetaTag(property, content) {
        let element = document.querySelector(`meta[property="${property}"]`) || 
                     document.querySelector(`meta[name="${property}"]`);
        
        if (element) {
            element.setAttribute('content', content);
        }
    }
}

// 전역 함수들
function showWebVersion() {
    document.getElementById('fallback').style.display = 'none';
    document.getElementById('web-content').style.display = 'flex';
    
    // 웹 콘텐츠 로드
    if (window.deepLinkHandler) {
        window.deepLinkHandler.loadWebContent();
    }
}

function showFallback() {
    document.getElementById('web-content').style.display = 'none';
    document.getElementById('fallback').style.display = 'flex';
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('페이지 로드 완료');
    window.deepLinkHandler = new DeepLinkHandler();
});

// 뒤로가기/앞으로가기 처리
window.addEventListener('popstate', function() {
    window.location.reload();
});
