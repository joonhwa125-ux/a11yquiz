document.addEventListener('DOMContentLoaded', () => {
    // --- 전역 변수 ---
    let userAnswers = [];
    let currentQuestionIndex = 0;
    let quizTimer = null;
    let remainingTime = 60 * 60; // 60분

    // 전역 변수 상태 확인
    console.log('=== GLOBAL VARIABLES INITIALIZED ===');
    console.log('userAnswers:', userAnswers);
    console.log('currentQuestionIndex:', currentQuestionIndex);

    // --- 1. SPA 네비게이션 로직 ---
    const mainContent = document.querySelector('main');
    const sections = mainContent.querySelectorAll('section[id]');
    const allLinks = document.querySelectorAll('a[href^="#"]');

    function showSection(id) {
        sections.forEach(section => {
            if (section.id === id) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
        
        const targetSection = document.getElementById(id);
        if (targetSection) {
            const firstHeading = targetSection.querySelector('h2');
            if (firstHeading) firstHeading.focus();
        }
    }

    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                showSection(targetId);
                window.history.pushState({ id: targetId }, '', href);
            }
        });
    });
    
    const initialSection = window.location.hash ? window.location.hash.substring(1) : 'main-page';
    showSection(initialSection);

    // --- 2.1 시험소개 페이지 내용 설정 ---
    const introContent = document.getElementById('intro-content');
    if (introContent) {
        introContent.innerHTML = `
            <article>
                <h3>시험 개요</h3>
                <p>웹 접근성 전문가 자격증은 한국정보통신기술협회(TTA)에서 주관하는 국가공인 민간자격증입니다.</p>
                
                <h4>응시 자격</h4>
                <ul>
                    <li>웹 개발 경험 1년 이상</li>
                    <li>웹 접근성 관련 교육 이수</li>
                    <li>관련 학과 졸업자</li>
                </ul>
                
                <h4>시험 구성</h4>
                <ul>
                    <li>웹 접근성 표준 개론 (20문항)</li>
                    <li>인터넷 개론 (20문항)</li>
                    <li>HTML 개론 (20문항)</li>
                    <li>CSS/JavaScript 개론 (20문항)</li>
                    <li>정보 접근성 개론 (20문항)</li>
                </ul>
                
                <h4>합격 기준</h4>
                <p>각 과목별 40점 이상, 전체 평균 60점 이상</p>
                
                <h4>시험 시간</h4>
                <p>총 60분 (100문항)</p>
                
                <h4>응시료</h4>
                <p>50,000원 (일반), 40,000원 (학생)</p>
            </article>
        `;
    }

    // --- 2. 캐러셀 로직 ---
    const carousel = document.getElementById('main-carousel');
    if (carousel) {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const nextBtn = carousel.querySelector('.carousel-control-next');
        const prevBtn = carousel.querySelector('.carousel-control-prev');
        let currentSlide = 0;

        function updateSlides() {
            slides.forEach((slide, index) => {
                if (index === currentSlide) {
                    slide.classList.remove('hidden');
                    slide.setAttribute('aria-hidden', 'false');
                } else {
                    slide.classList.add('hidden');
                    slide.setAttribute('aria-hidden', 'true');
                }
            });
            
            // 이전/다음 버튼 상태 관리
            if (prevBtn) {
                prevBtn.disabled = currentSlide === 0;
                prevBtn.setAttribute('aria-disabled', currentSlide === 0 ? 'true' : 'false');
            }
            if (nextBtn) {
                nextBtn.disabled = currentSlide === slides.length - 1;
                nextBtn.setAttribute('aria-disabled', currentSlide === slides.length - 1 ? 'true' : 'false');
            }

            // 라이브 리전에 현재 슬라이드 정보 업데이트
            const liveRegion = carousel.querySelector('.carousel-live-region');
            if (liveRegion) {
                liveRegion.textContent = `슬라이드 ${currentSlide + 1} / ${slides.length}`;
            }
        }

        function goToNextSlide() {
            if (currentSlide < slides.length - 1) {
                currentSlide = currentSlide + 1;
                updateSlides();
            }
        }
        
        function goToPrevSlide() {
            if (currentSlide > 0) {
                currentSlide = currentSlide - 1;
                updateSlides();
            }
        }
        
        if (nextBtn) nextBtn.addEventListener('click', goToNextSlide);
        if (prevBtn) prevBtn.addEventListener('click', goToPrevSlide);
        
        // 초기 버튼 상태 설정
        updateSlides();
    }

    // --- 3. 탭 인터페이스 로직 ---
    const tabList = document.querySelector('[role="tablist"]');
    if (tabList) {
        const tabs = tabList.querySelectorAll('[role="tab"]');
        const panels = document.querySelectorAll('[role="tabpanel"]');

        // 탭 패널 내용 설정
        const panelContents = {
            'panel-1': `
                <h3>웹 접근성 표준 개론</h3>
                <p>웹 접근성은 장애인, 고령자 등 모든 사용자가 웹 콘텐츠에 접근하고 이용할 수 있도록 하는 웹 사용성의 한 측면입니다.</p>
                <h4>주요 개념</h4>
                <ul>
                    <li><strong>인식의 용이성:</strong> 모든 사용자가 웹 콘텐츠를 동등하게 인식할 수 있어야 함</li>
                    <li><strong>운용의 용이성:</strong> 모든 사용자가 웹 콘텐츠를 조작하고 네비게이션할 수 있어야 함</li>
                    <li><strong>이해의 용이성:</strong> 모든 사용자가 웹 콘텐츠를 이해할 수 있어야 함</li>
                    <li><strong>견고성:</strong> 웹 콘텐츠는 보조 기술을 포함한 다양한 사용자 에이전트로 해석될 수 있어야 함</li>
                </ul>
                <h4>WCAG 2.2 가이드라인</h4>
                <p>웹 콘텐츠 접근성 지침 2.2는 웹 접근성을 위한 국제 표준으로, A, AA, AAA의 세 가지 수준으로 구성됩니다.</p>
                <h4>접근성 평가 방법</h4>
                <ul>
                    <li>자동화 도구를 활용한 기술적 검사</li>
                    <li>수동 검사를 통한 사용성 평가</li>
                    <li>사용자 테스트를 통한 실제 접근성 검증</li>
                </ul>
            `,
            'panel-2': `
                <h3>인터넷 개론</h3>
                <p>인터넷은 전 세계 컴퓨터 네트워크를 연결하는 글로벌 네트워크 시스템입니다.</p>
                <h4>주요 프로토콜</h4>
                <ul>
                    <li><strong>HTTP:</strong> 웹 페이지 전송을 위한 프로토콜</li>
                    <li><strong>HTTPS:</strong> 보안이 강화된 HTTP</li>
                    <li><strong>FTP:</strong> 파일 전송을 위한 프로토콜</li>
                    <li><strong>TCP/IP:</strong> 인터넷의 기본 통신 프로토콜</li>
                </ul>
                <h4>네트워크 구조</h4>
                <p>인터넷은 클라이언트-서버 모델을 기반으로 하며, DNS를 통해 도메인 이름을 IP 주소로 변환합니다.</p>
                <h4>보안 및 프라이버시</h4>
                <ul>
                    <li>SSL/TLS를 통한 데이터 암호화</li>
                    <li>방화벽을 통한 네트워크 보호</li>
                    <li>VPN을 통한 안전한 연결</li>
                </ul>
            `,
            'panel-3': `
                <h3>HTML 개론</h3>
                <p>웹 개발의 핵심 기술인 HTML의 접근성 고려사항을 학습합니다.</p>
                <h4>HTML 접근성</h4>
                <ul>
                    <li>시맨틱 마크업 사용</li>
                    <li>alt 속성과 대체 텍스트</li>
                    <li>테이블 구조화</li>
                    <li>폼 레이블 연결</li>
                </ul>
                <h4>시맨틱 HTML 요소</h4>
                <ul>
                    <li>header, nav, main, section, article, aside, footer</li>
                    <li>h1-h6 헤딩 구조</li>
                    <li>figure, figcaption</li>
                    <li>time, address</li>
                </ul>
                <h4>폼 접근성</h4>
                <p>폼 요소들은 적절한 레이블과 설명을 통해 모든 사용자가 쉽게 이해하고 사용할 수 있어야 합니다.</p>
                <ul>
                    <li>label 요소를 통한 레이블 연결</li>
                    <li>fieldset과 legend를 통한 그룹화</li>
                    <li>required, aria-invalid 등의 상태 표시</li>
                </ul>
            `,
            'panel-4': `
                <h3>CSS/SCRIPT 개론</h3>
                <p>CSS와 JavaScript를 활용한 웹 접근성 향상 기법을 학습합니다.</p>
                <h4>CSS 접근성</h4>
                <ul>
                    <li>색상 대비 및 가독성</li>
                    <li>포커스 표시 및 키보드 네비게이션</li>
                    <li>반응형 및 적응형 디자인</li>
                    <li>스크린 리더 지원</li>
                </ul>
                <h4>JavaScript 접근성</h4>
                <ul>
                    <li>키보드 이벤트 처리</li>
                    <li>ARIA 속성 동적 관리</li>
                    <li>포커스 관리</li>
                    <li>에러 처리 및 피드백</li>
                </ul>
                <h4>성능 최적화</h4>
                <p>접근성을 유지하면서도 성능을 최적화하는 방법을 학습합니다.</p>
                <ul>
                    <li>이미지 최적화 및 지연 로딩</li>
                    <li>CSS 및 JavaScript 압축</li>
                    <li>캐싱 전략</li>
                </ul>
            `,
            'panel-5': `
                <h3>정보 접근성</h3>
                <p>정보 접근성은 모든 사용자가 정보에 동등하게 접근할 수 있는 권리를 의미합니다.</p>
                <h4>접근성 향상 방법</h4>
                <ul>
                    <li>다양한 감각을 통한 정보 제공</li>
                    <li>키보드 및 보조 기술 지원</li>
                    <li>명확하고 이해하기 쉬운 콘텐츠</li>
                    <li>사용자 정의 가능한 인터페이스</li>
                </ul>
                <h4>법적 요구사항</h4>
                <p>웹 접근성은 단순한 기술적 문제가 아닌 법적 권리이며, 각국에서 관련 법령을 제정하고 있습니다.</p>
                <ul>
                    <li>장애인차별금지 및 권리구제 등에 관한 법률</li>
                    <li>국가정보화 기본법</li>
                    <li>지능정보화 기본법</li>
                </ul>
                <h4>평가 및 개선</h4>
                <ul>
                    <li>접근성 감사 및 평가</li>
                    <li>사용자 피드백 수집</li>
                    <li>지속적인 개선 프로세스</li>
                </ul>
            `
        };

        // 초기 패널 내용 설정
        panels.forEach(panel => {
            const panelId = panel.id;
            if (panelContents[panelId]) {
                panel.innerHTML = panelContents[panelId];
            }
        });

        function switchTab(selectedTab) {
            const targetPanel = document.getElementById(selectedTab.getAttribute('aria-controls'));
            
            // 모든 탭 비활성화
            tabs.forEach(tab => {
                tab.setAttribute('aria-selected', 'false');
            });
            
            // 모든 패널 숨김
            panels.forEach(panel => {
                panel.classList.add('hidden');
                panel.style.display = 'none';
            });
            
            // 선택된 탭 활성화
            selectedTab.setAttribute('aria-selected', 'true');
            
            // 선택된 패널 표시
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
                targetPanel.style.display = 'block';
            }
            
            // 검색 결과 숨김
            const searchResults = document.getElementById('search-results');
            if (searchResults) {
                searchResults.classList.add('hidden');
                const studySearchInput = document.getElementById('study-search-input');
                if (studySearchInput) studySearchInput.value = '';
            }
        }

        tabs.forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab));
            tab.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    switchTab(tab);
                }
            });
        });
    }

    // --- 3.1 과목 학습 검색 기능 ---
    const studySearchForm = document.getElementById('study-search-form');
    const studySearchInput = document.getElementById('study-search-input');
    const searchResults = document.getElementById('search-results');
    
    if (studySearchForm && studySearchInput && searchResults) {
        // 검색 가능한 콘텐츠 데이터 (전체 과목 포함)
        const searchableContent = [
            {
                subject: '웹 접근성 표준 개론',
                subjectId: 'panel-1',
                content: [
                    '웹 접근성은 장애인, 고령자 등 모든 사용자가 웹 콘텐츠에 접근하고 이용할 수 있도록 하는 웹 사용성의 한 측면입니다.',
                    '인식의 용이성은 모든 사용자가 웹 콘텐츠를 동등하게 인식할 수 있어야 함을 의미합니다.',
                    '운용의 용이성은 모든 사용자가 웹 콘텐츠를 조작하고 네비게이션할 수 있어야 함을 의미합니다.',
                    '이해의 용이성은 모든 사용자가 웹 콘텐츠를 이해할 수 있어야 함을 의미합니다.',
                    '견고성은 웹 콘텐츠가 보조 기술을 포함한 다양한 사용자 에이전트로 해석될 수 있어야 함을 의미합니다.',
                    'WCAG 2.2 가이드라인은 웹 접근성을 위한 국제 표준으로, A, AA, AAA의 세 가지 수준으로 구성됩니다.',
                    '접근성 평가는 자동화 도구를 활용한 기술적 검사, 수동 검사를 통한 사용성 평가, 사용자 테스트를 통한 실제 접근성 검증으로 이루어집니다.'
                ]
            },
            {
                subject: '인터넷 개론',
                subjectId: 'panel-2',
                content: [
                    '인터넷은 전 세계 컴퓨터 네트워크를 연결하는 글로벌 네트워크 시스템입니다.',
                    'HTTP는 웹 페이지 전송을 위한 프로토콜입니다.',
                    'HTTPS는 보안이 강화된 HTTP 프로토콜입니다.',
                    'FTP는 파일 전송을 위한 프로토콜입니다.',
                    'TCP/IP는 인터넷의 기본 통신 프로토콜입니다.',
                    '인터넷은 클라이언트-서버 모델을 기반으로 하며, DNS를 통해 도메인 이름을 IP 주소로 변환합니다.',
                    'SSL/TLS를 통한 데이터 암호화, 방화벽을 통한 네트워크 보호, VPN을 통한 안전한 연결이 보안 및 프라이버시를 보장합니다.'
                ]
            },
            {
                subject: 'HTML 개론',
                subjectId: 'panel-3',
                content: [
                    'HTML 접근성은 시맨틱 마크업 사용, alt 속성과 대체 텍스트, 테이블 구조화, 폼 레이블 연결을 포함합니다.',
                    '시맨틱 HTML 요소에는 header, nav, main, section, article, aside, footer가 있습니다.',
                    'h1-h6 헤딩 구조는 콘텐츠의 계층 구조를 명확하게 표현합니다.',
                    'figure, figcaption 요소는 이미지와 설명을 그룹화합니다.',
                    'time, address 요소는 시간과 주소 정보를 의미론적으로 표현합니다.',
                    '폼 요소들은 적절한 레이블과 설명을 통해 모든 사용자가 쉽게 이해하고 사용할 수 있어야 합니다.',
                    'label 요소를 통한 레이블 연결은 폼 접근성의 핵심입니다.',
                    'fieldset과 legend를 통한 그룹화로 관련 폼 요소들을 묶을 수 있습니다.',
                    'required, aria-invalid 등의 상태 표시로 폼의 유효성을 전달합니다.'
                ]
            },
            {
                subject: 'CSS/SCRIPT 개론',
                subjectId: 'panel-4',
                content: [
                    'CSS와 JavaScript를 활용한 웹 접근성 향상 기법을 학습합니다.',
                    'CSS 접근성은 색상 대비 및 가독성을 포함합니다.',
                    '포커스 표시 및 키보드 네비게이션은 CSS로 구현할 수 있습니다.',
                    '반응형 및 적응형 디자인으로 다양한 디바이스를 지원합니다.',
                    '스크린 리더 지원을 위한 CSS 기법이 있습니다.',
                    'JavaScript 접근성은 키보드 이벤트 처리를 포함합니다.',
                    'ARIA 속성 동적 관리는 JavaScript로 구현합니다.',
                    '포커스 관리는 사용자 경험에 중요한 요소입니다.',
                    '에러 처리 및 피드백은 접근성 향상에 필수적입니다.',
                    '접근성을 유지하면서도 성능을 최적화하는 방법을 학습해야 합니다.',
                    '이미지 최적화 및 지연 로딩으로 성능을 향상시킵니다.',
                    'CSS 및 JavaScript 압축으로 로딩 속도를 개선합니다.',
                    '캐싱 전략으로 웹사이트 성능을 최적화합니다.'
                ]
            },
            {
                subject: '정보 접근성 개론',
                subjectId: 'panel-5',
                content: [
                    '정보 접근성은 모든 사용자가 정보에 동등하게 접근할 수 있는 권리를 의미합니다.',
                    '다양한 감각을 통한 정보 제공으로 접근성을 향상시킵니다.',
                    '키보드 및 보조 기술 지원은 필수적입니다.',
                    '명확하고 이해하기 쉬운 콘텐츠 작성이 중요합니다.',
                    '사용자 정의 가능한 인터페이스를 제공해야 합니다.',
                    '웹 접근성은 단순한 기술적 문제가 아닌 법적 권리입니다.',
                    '장애인차별금지 및 권리구제 등에 관한 법률이 있습니다.',
                    '국가정보화 기본법에서 웹 접근성을 규정합니다.',
                    '지능정보화 기본법도 접근성 관련 조항을 포함합니다.',
                    '접근성 감사 및 평가를 정기적으로 실시해야 합니다.',
                    '사용자 피드백 수집을 통해 개선점을 찾습니다.',
                    '지속적인 개선 프로세스를 구축해야 합니다.'
                ]
            }
        ];

        function performSearch(query) {
            console.log('=== SEARCH FUNCTION CALLED ===');
            console.log('Search query:', query);
            
            if (!query.trim()) {
                searchResults.classList.add('hidden');
                document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
                    panel.style.display = 'block';
                });
                return;
            }

            const results = [];
            const lowerQuery = query.toLowerCase();
            console.log('Lowercase query:', lowerQuery);

            searchableContent.forEach((subject, subjectIndex) => {
                console.log(`Searching in subject ${subjectIndex + 1}: ${subject.subject}`);
                
                subject.content.forEach((text, contentIndex) => {
                    if (text.toLowerCase().includes(lowerQuery)) {
                        console.log(`Found match in ${subject.subject}, content ${contentIndex + 1}:`, text.substring(0, 100));
                        
                        const matchedIndex = text.toLowerCase().indexOf(lowerQuery);
                        const beforeMatch = text.substring(Math.max(0, matchedIndex - 50), matchedIndex);
                        const matchedText = text.substring(matchedIndex, matchedIndex + query.length);
                        const afterMatch = text.substring(matchedIndex + query.length, matchedIndex + query.length + 50);

                        results.push({
                            subject: subject.subject,
                            subjectId: subject.subjectId,
                            text: text,
                            beforeMatch: beforeMatch,
                            matchedText: matchedText,
                            afterMatch: afterMatch
                        });
                    }
                });
            });

            console.log('Total search results found:', results.length);
            displaySearchResults(results, query);
            
            if (results.length > 0) {
                document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
                    panel.style.display = 'none';
                });
            }
        }

        function displaySearchResults(results, query) {
            if (results.length === 0) {
                searchResults.innerHTML = `
                    <h3>검색 결과</h3>
                    <p>"${query}"에 대한 검색 결과가 없습니다.</p>
                `;
                document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
                    panel.style.display = 'block';
                });
            } else {
                searchResults.innerHTML = `
                    <h3>검색 결과 (${results.length}개)</h3>
                    <p>"${query}"에 대한 검색 결과입니다.</p>
                    ${results.map(result => `
                        <div class="search-result-item">
                            <span class="subject-tag">${result.subject}</span>
                            <h4>${result.subject}</h4>
                            <div class="matched-text">
                                ...${result.beforeMatch}<strong>${result.matchedText}</strong>${result.afterMatch}...
                            </div>
                            <div class="context">
                                <button onclick="showSubjectTab('${result.subjectId}')" class="link-button">
                                    ${result.subject} 보기
                                </button>
                            </div>
                        </div>
                    `).join('')}
                `;
                document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
                    panel.style.display = 'none';
                });
            }
            searchResults.classList.remove('hidden');
        }

        // 검색 폼 제출 이벤트
        studySearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = studySearchInput.value.trim();
            performSearch(query);
        });

        // 실시간 검색
        studySearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                performSearch(query);
            } else if (query.length === 0) {
                searchResults.classList.add('hidden');
                document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
                    panel.style.display = 'block';
                });
            }
        });

        // 검색 결과에서 과목 탭으로 이동하는 함수
        window.showSubjectTab = function(subjectId) {
            const targetTab = document.querySelector(`[aria-controls="${subjectId}"]`);
            if (targetTab) {
                document.querySelectorAll('[role="tab"]').forEach(tab => {
                    tab.setAttribute('aria-selected', 'false');
                });
                
                document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
                    panel.classList.add('hidden');
                    panel.style.display = 'none';
                });
                
                targetTab.setAttribute('aria-selected', 'true');
                
                const targetPanel = document.getElementById(subjectId);
                if (targetPanel) {
                    targetPanel.classList.remove('hidden');
                    targetPanel.style.display = 'block';
                }
                
                searchResults.classList.add('hidden');
                studySearchInput.value = '';
            }
        };
    }

    // --- 4. 문제풀이 흐름 ---
    const modeButtons = document.querySelectorAll('[data-mode]');
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.dataset.mode;
            document.getElementById('quiz-mode-selection').classList.add('hidden');
            
            if (mode === 'practice') {
                document.getElementById('subject-selection').classList.remove('hidden');
                document.getElementById('mock-exam-info').classList.add('hidden');
            } else if (mode === 'mock-exam') {
                document.getElementById('mock-exam-info').classList.remove('hidden');
                document.getElementById('subject-selection').classList.add('hidden');
            }
        });
    });

    // 문제풀이 페이지 상태 초기화 함수
    function resetQuizPageState() {
        document.getElementById('subject-selection').classList.add('hidden');
        document.getElementById('mock-exam-info').classList.add('hidden');
        document.getElementById('quiz-interface').classList.add('hidden');
        document.getElementById('result-dashboard').classList.add('hidden');
        document.getElementById('quiz-mode-selection').classList.remove('hidden');
        
        const selectedSubject = document.querySelector('input[name="subject"]:checked');
        if (selectedSubject) {
            selectedSubject.checked = false;
        }
        
        currentQuestionIndex = 0;
        userAnswers = [];
        
        if (quizTimer) {
            clearInterval(quizTimer);
            quizTimer = null;
        }
        remainingTime = 60 * 60;
        
        console.log('Quiz page reset - userAnswers initialized:', userAnswers);
    }

    // 문제풀이 탭 클릭 시 상태 초기화
    const quizPageLink = document.querySelector('a[href="#quiz-page"]');
    if (quizPageLink) {
        quizPageLink.addEventListener('click', () => {
            setTimeout(() => {
                resetQuizPageState();
            }, 100);
        });
    }

    // --- 5. 퀴즈 인터페이스 ---
    const questionContainer = document.getElementById('question-container');
    if (questionContainer) {
        // 샘플 문제 데이터 (수정된 내용)
        const sampleQuestions = [
            {
                question: "웹 접근성의 정의로 가장 적절한 것은?",
                options: [
                    "모든 사용자가 웹을 이용할 수 있도록 하는 것",
                    "장애인만을 위한 웹 서비스",
                    "고령자를 위한 웹 서비스",
                    "시각 장애인만을 위한 웹 서비스"
                ],
                correct: 0,
                explanation: "웹 접근성은 장애인, 고령자 등 모든 사용자가 웹 콘텐츠에 접근하고 이용할 수 있도록 하는 웹 사용성의 한 측면입니다."
            },
            {
                question: "WCAG 2.2의 주요 원칙이 아닌 것은?",
                options: [
                    "인식의 용이성",
                    "운용의 용이성",
                    "이해의 용이성",
                    "속도의 용이성"
                ],
                correct: 3,
                explanation: "WCAG 2.2의 주요 원칙은 인식의 용이성, 운용의 용이성, 이해의 용이성, 견고성입니다. '속도의 용이성'은 포함되지 않습니다."
            }
        ];

        // 타이머 함수들
        function startTimer() {
            const timerElement = document.getElementById('quiz-timer');
            if (!timerElement) return;
            
            // 개선된 타이머 HTML 구조 설정
            timerElement.innerHTML = `
                <div class="timer-progress">
                    <svg class="timer-progress-circle" viewBox="0 0 24 24">
                        <circle class="timer-progress-bg" cx="12" cy="12" r="9.6"></circle>
                        <circle class="timer-progress-fill" cx="12" cy="12" r="9.6" id="timer-circle-fill"></circle>
                    </svg>
                </div>
                <div class="timer-container">
                    <span class="timer-icon" aria-hidden="true">⏱️</span>
                    <div class="timer-text">
                        <span class="timer-time" id="timer-display">60:00</span>
                        <span class="timer-label">남은시간</span>
                    </div>
                </div>
                <div class="timer-bg-progress" id="timer-bg-progress"></div>
                <div id="timer-announcements" aria-live="assertive" class="visually-hidden"></div>
            `;
            
            const initialTime = remainingTime;
            
            quizTimer = setInterval(() => {
                remainingTime--;
                
                if (remainingTime <= 0) {
                    clearInterval(quizTimer);
                    announceTimeRemaining('시험 시간이 종료되었습니다. 자동으로 답안이 제출됩니다.', true);
                    setTimeout(() => {
                        showResults();
                    }, 2000);
                    return;
                }

                updateTimerDisplay();
                updateTimerProgress(remainingTime, initialTime);
                updateTimerState(remainingTime);
                
                // 시간 알림 (10분, 5분, 1분)
                if (remainingTime === 600) { // 10분
                    announceTimeRemaining('시험 종료까지 10분 남았습니다.', false);
                } else if (remainingTime === 300) { // 5분
                    announceTimeRemaining('시험 종료까지 5분 남았습니다.', false);
                } else if (remainingTime === 60) { // 1분
                    announceTimeRemaining('시험 종료까지 1분 남았습니다!', true);
                }
            }, 1000);
        }

        function updateTimerDisplay() {
            const timerDisplay = document.getElementById('timer-display');
            if (timerDisplay) {
                const minutes = Math.floor(remainingTime / 60);
                const seconds = remainingTime % 60;
                const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                timerDisplay.textContent = timeString;
            }
        }

        function updateTimerProgress(currentTime, initialTime) {
            const percentage = (currentTime / initialTime) * 100;
            
            // 원형 진행 바 업데이트
            const circularProgress = document.getElementById('timer-circle-fill');
            if (circularProgress) {
                const circumference = 2 * Math.PI * 9.6; // 반지름 9.6
                const offset = circumference - (percentage / 100) * circumference;
                circularProgress.style.strokeDashoffset = offset;
            }
            
            // 배경 진행 바 업데이트
            const bgProgress = document.getElementById('timer-bg-progress');
            if (bgProgress) {
                bgProgress.style.width = `${percentage}%`;
            }
        }

        function updateTimerState(currentTime) {
            const timerElement = document.getElementById('quiz-timer');
            if (!timerElement) return;
            
            // 시간에 따른 시각적 상태 변경
            timerElement.classList.remove('warning', 'critical');
            
            if (currentTime <= 60) { // 1분 이하
                timerElement.classList.add('critical');
            } else if (currentTime <= 300) { // 5분 이하
                timerElement.classList.add('warning');
            }
        }

        function announceTimeRemaining(message, isUrgent = false) {
            console.log('Timer announcement:', message);
            
            // aria-live 영역에 메시지 추가
            const timerAnnouncements = document.getElementById('timer-announcements');
            if (timerAnnouncements) {
                timerAnnouncements.textContent = message;
                
                if (isUrgent) {
                    timerAnnouncements.setAttribute('aria-live', 'assertive');
                } else {
                    timerAnnouncements.setAttribute('aria-live', 'polite');
                }
            }
            
            // 개선된 시각적 알림
            const announcement = document.createElement('div');
            announcement.className = `time-announcement ${isUrgent ? 'critical' : ''}`;
            announcement.innerHTML = `
                <span class="announcement-icon" aria-hidden="true">${isUrgent ? '⚠️' : '⏰'}</span>
                <span>${message}</span>
            `;
            
            document.body.appendChild(announcement);
            
            // 자동 제거 (더 빠른 페이드아웃)
            const displayTime = isUrgent ? 4000 : 3000;
            setTimeout(() => {
                if (announcement.parentNode) {
                    announcement.style.opacity = '0';
                    announcement.style.transform = 'translateX(50px)';
                    
                    setTimeout(() => {
                        if (announcement.parentNode) {
                            announcement.parentNode.removeChild(announcement);
                        }
                    }, 200);
                }
            }, displayTime);
            
            // aria-live 영역 정리
            setTimeout(() => {
                if (timerAnnouncements) {
                    timerAnnouncements.textContent = '';
                }
            }, 2000);
        }

        function stopTimer() {
            if (quizTimer) {
                clearInterval(quizTimer);
                quizTimer = null;
            }
        }

        function displayQuestion(index) {
            const question = sampleQuestions[index];
            if (!question) return;

            // userAnswers 배열 크기 확인 및 조정
            if (userAnswers.length < sampleQuestions.length) {
                userAnswers = new Array(sampleQuestions.length).fill(undefined);
                console.log('UserAnswers array resized:', userAnswers);
            }

            questionContainer.innerHTML = `
                <fieldset class="question-fieldset">
                    <legend class="question-legend">문제 ${index + 1} / ${sampleQuestions.length}</legend>
                    <p class="question-text">${question.question}</p>
                    <div class="answer-options">
                        ${question.options.map((option, optionIndex) => `
                            <div class="option">
                                <input type="radio" id="option-${optionIndex}" name="question-${index}" value="${optionIndex}" 
                                       ${userAnswers[index] === optionIndex ? 'checked' : ''}>
                                <label for="option-${optionIndex}">${option}</label>
                            </div>
                        `).join('')}
                    </div>
                </fieldset>
            `;

            // 옵션 선택 이벤트 - 전역 userAnswers 배열에 저장
            questionContainer.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    const selectedValue = parseInt(e.target.value);
                    userAnswers[index] = selectedValue;
                    console.log(`Question ${index + 1} answer saved: ${selectedValue}`);
                    console.log('Current userAnswers:', userAnswers);
                });
            });

            // 제출 버튼 표시/숨김
            const submitBtn = document.getElementById('submit-quiz-btn');
            if (submitBtn) {
                submitBtn.classList.toggle('hidden', index < sampleQuestions.length - 1);
            }

            // 이전/다음 버튼 표시/숨김
            const prevBtn = document.getElementById('prev-question-btn');
            const nextBtn = document.getElementById('next-question-btn');
            
            if (prevBtn) {
                prevBtn.style.display = index === 0 ? 'none' : 'block';
            }
            if (nextBtn) {
                nextBtn.style.display = index === sampleQuestions.length - 1 ? 'none' : 'block';
            }
        }

        // 이전/다음 버튼 이벤트
        const prevBtn = document.getElementById('prev-question-btn');
        const nextBtn = document.getElementById('next-question-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentQuestionIndex > 0) {
                    currentQuestionIndex--;
                    console.log(`Moving to previous question ${currentQuestionIndex + 1}`);
                    console.log('Current userAnswers before display:', userAnswers);
                    displayQuestion(currentQuestionIndex);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentQuestionIndex < sampleQuestions.length - 1) {
                    currentQuestionIndex++;
                    console.log(`Moving to next question ${currentQuestionIndex + 1}`);
                    console.log('Current userAnswers before display:', userAnswers);
                    displayQuestion(currentQuestionIndex);
                }
            });
        }

        // 문제풀이 시작 버튼들
        const startQuizBtn = document.getElementById('start-quiz-btn');
        const startMockExamBtn = document.getElementById('start-mock-exam-btn');

        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', () => {
                const selectedSubject = document.querySelector('input[name="subject"]:checked');
                if (selectedSubject) {
                    showSection('quiz-interface');
                    currentQuestionIndex = 0;
                    userAnswers = new Array(sampleQuestions.length).fill(undefined);
                    console.log('Quiz started - userAnswers initialized:', userAnswers);
                    displayQuestion(currentQuestionIndex);
                    remainingTime = 60 * 60; // 60분으로 초기화
                    startTimer(); // 타이머 시작
                } else {
                    alert('응시할 과목을 선택해주세요.');
                }
            });
        }

        if (startMockExamBtn) {
            startMockExamBtn.addEventListener('click', () => {
                showSection('quiz-interface');
                currentQuestionIndex = 0;
                userAnswers = new Array(sampleQuestions.length).fill(undefined);
                console.log('Mock exam started - userAnswers initialized:', userAnswers);
                displayQuestion(currentQuestionIndex);
                remainingTime = 60 * 60; // 60분으로 초기화
                startTimer(); // 타이머 시작
            });
        }
    }

    // --- 6. 결과 대시보드 (수정된 수식) ---
    function showResults() {
        console.log('=== SHOW RESULTS FUNCTION CALLED ===');
        
        const resultDashboard = document.getElementById('result-dashboard');
        const summaryContainer = resultDashboard.querySelector('#result-summary');
        const wrongListContainer = resultDashboard.querySelector('#wrong-questions-list');

        // 샘플 문제 데이터 (동일한 데이터 사용)
        const sampleQuestions = [
            {
                question: "웹 접근성의 정의로 가장 적절한 것은?",
                options: [
                    "모든 사용자가 웹을 이용할 수 있도록 하는 것",
                    "장애인만을 위한 웹 서비스",
                    "고령자를 위한 웹 서비스",
                    "시각 장애인만을 위한 웹 서비스"
                ],
                correct: 0,
                explanation: "웹 접근성은 장애인, 고령자 등 모든 사용자가 웹 콘텐츠에 접근하고 이용할 수 있도록 하는 웹 사용성의 한 측면입니다."
            },
            {
                question: "WCAG 2.2의 주요 원칙이 아닌 것은?",
                options: [
                    "인식의 용이성",
                    "운용의 용이성",
                    "이해의 용이성",
                    "속도의 용이성"
                ],
                correct: 3,
                explanation: "WCAG 2.2의 주요 원칙은 인식의 용이성, 운용의 용이성, 이해의 용이성, 견고성입니다. '속도의 용이성'은 포함되지 않습니다."
            }
        ];

        // 전역 userAnswers 배열 확인
        console.log('Global userAnswers array:', userAnswers);
        console.log('userAnswers type:', typeof userAnswers);
        console.log('userAnswers length:', userAnswers ? userAnswers.length : 'undefined');
        
        // userAnswers가 정의되지 않았거나 배열이 아닌 경우 빈 배열로 초기화
        if (!userAnswers || !Array.isArray(userAnswers)) {
            console.warn('userAnswers is not properly initialized, creating new array');
            userAnswers = new Array(sampleQuestions.length).fill(undefined);
        }

        let correctCount = 0;
        const wrongAnswers = []; // 수정: 배열로 초기화

        // 정답 체크
        console.log('=== SCORE CALCULATION START ===');
        console.log('Sample questions count:', sampleQuestions.length);
        
        for (let i = 0; i < sampleQuestions.length; i++) {
            const userAnswer = userAnswers[i];
            const correctAnswer = sampleQuestions[i].correct;
            
            console.log(`Question ${i + 1}:`);
            console.log(`  - User answer: ${userAnswer} (${userAnswer !== undefined ? sampleQuestions[i].options[userAnswer] : 'undefined'})`);
            console.log(`  - Correct answer: ${correctAnswer} (${sampleQuestions[i].options[correctAnswer]})`);
            
            if (userAnswer !== undefined && userAnswer === correctAnswer) {
                correctCount++;
                console.log(`  - Result: CORRECT! ✅`);
            } else if (userAnswer !== undefined) {
                wrongAnswers.push({
                    questionNumber: i + 1,
                    question: sampleQuestions[i].question,
                    userAnswer: sampleQuestions[i].options[userAnswer],
                    correctAnswer: sampleQuestions[i].options[correctAnswer],
                    explanation: sampleQuestions[i].explanation
                });
                console.log(`  - Result: WRONG! ❌`);
            } else {
                wrongAnswers.push({
                    questionNumber: i + 1,
                    question: sampleQuestions[i].question,
                    userAnswer: "답안 없음",
                    correctAnswer: sampleQuestions[i].options[correctAnswer],
                    explanation: sampleQuestions[i].explanation
                });
                console.log(`  - Result: NO ANSWER! ⚠️`);
            }
        }

        const totalQuestions = sampleQuestions.length;
        const score = Math.round((correctCount / totalQuestions) * 100);

        console.log(`=== FINAL SCORE ===`);
        console.log(`Correct: ${correctCount}/${totalQuestions}`);
        console.log(`Score: ${score}%`);
        console.log(`Wrong answers: ${wrongAnswers.length}`);
        console.log('=== SCORE CALCULATION END ===');

        // 타이머 정지
        stopTimer();

        // 결과 표시 (개선된 UI)
        summaryContainer.innerHTML = `
            <h3>시험 결과</h3>
            <div class="score-display">
                <div class="score-item">
                    <div class="score-number">${score}%</div>
                    <div class="score-label">정답률</div>
                </div>
                <div class="score-item">
                    <div class="score-number">${correctCount}</div>
                    <div class="score-label">정답 수</div>
                </div>
                <div class="score-item">
                    <div class="score-number">${totalQuestions}</div>
                    <div class="score-label">총 문항</div>
                </div>
            </div>
        `;
        
        // 틀린 문제 표시
        wrongListContainer.innerHTML = ''; // 초기화
        
        if (wrongAnswers.length === 0) {
            wrongListContainer.innerHTML = '<p>모든 문제를 맞췄습니다! 축하합니다! 🎉</p>';
        } else {
            const wrongTitle = document.createElement('h3');
            wrongTitle.textContent = `틀린 문제 상세보기 (${wrongAnswers.length}개)`;
            wrongListContainer.appendChild(wrongTitle);
            
            wrongAnswers.forEach((item) => {
                const details = document.createElement('details');
                details.innerHTML = `
                    <summary>문제 ${item.questionNumber}: ${item.question}</summary>
                    <div class="wrong-answer-details">
                        <p><strong>나의 답:</strong> <span class="user-answer">${item.userAnswer}</span></p>
                        <p><strong>정답:</strong> <span class="correct-answer">${item.correctAnswer}</span></p>
                        <p><strong>해설:</strong> ${item.explanation}</p>
                    </div>
                `;
                wrongListContainer.appendChild(details);
            });
        }

        showSection('result-dashboard');
    }

    // --- 7. 제출 확인 모달 로직 ---
    const modalContainer = document.getElementById('modal-container');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const submitQuizBtn = document.getElementById('submit-quiz-btn');
    let confirmCallback = null;

    function openModal(title, message, onConfirm) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;
        confirmCallback = onConfirm;
        modalContainer.classList.remove('hidden');
        modalConfirmBtn.focus();
    }

    function closeModal() {
        modalContainer.classList.add('hidden');
        confirmCallback = null;
        if (submitQuizBtn) submitQuizBtn.focus();
    }

    if (submitQuizBtn) {
        submitQuizBtn.addEventListener('click', () => {
            openModal(
                '답안 제출 확인',
                '시험을 종료하고 답안을 제출하시겠습니까?',
                () => {
                    closeModal();
                    showResults(); // 결과 대시보드 표시
                }
            );
        });
    }

    if (modalConfirmBtn) {
        modalConfirmBtn.addEventListener('click', () => {
            if (confirmCallback) confirmCallback();
        });
    }
    
    if (modalCancelBtn) {
        modalCancelBtn.addEventListener('click', closeModal);
    }

    // ESC 키로 모달 닫기
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalContainer && !modalContainer.classList.contains('hidden')) {
            closeModal();
        }
    });

    // --- 8. 문의하기 폼 검증 ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        // 실시간 유효성 검사 함수들
        function validateName(name) {
            return name.trim().length >= 2;
        }

        function validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email.trim());
        }

        function validateSelect(value) {
            return value.trim() !== '';
        }

        function validateMessage(message) {
            return message.trim().length >= 10;
        }

        function showError(fieldId, message) {
            const errorElement = document.getElementById(`${fieldId}-error`);
            if (errorElement) {
                errorElement.textContent = message;
            }
        }

        function clearError(fieldId) {
            const errorElement = document.getElementById(`${fieldId}-error`);
            if (errorElement) {
                errorElement.textContent = '';
            }
        }

        // 실시간 유효성 검사
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const inquiryTypeSelect = document.getElementById('inquiry-type');
        const messageTextarea = document.getElementById('message');

        if (nameInput) {
            nameInput.addEventListener('blur', () => {
                if (!validateName(nameInput.value)) {
                    showError('name', '이름은 2글자 이상 입력해주세요.');
                } else {
                    clearError('name');
                }
            });
        }

        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                if (!validateEmail(emailInput.value)) {
                    showError('email', '올바른 이메일 형식을 입력해주세요.');
                } else {
                    clearError('email');
                }
            });
        }

        if (inquiryTypeSelect) {
            inquiryTypeSelect.addEventListener('change', () => {
                if (!validateSelect(inquiryTypeSelect.value)) {
                    showError('inquiry-type', '문의 유형을 선택해주세요.');
                } else {
                    clearError('inquiry-type');
                }
            });
        }

        if (messageTextarea) {
            messageTextarea.addEventListener('blur', () => {
                if (!validateMessage(messageTextarea.value)) {
                    showError('message', '문의 내용은 10글자 이상 입력해주세요.');
                } else {
                    clearError('message');
                }
            });
        }

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // 폼 검증
            const name = nameInput ? nameInput.value : '';
            const email = emailInput ? emailInput.value : '';
            const inquiryType = inquiryTypeSelect ? inquiryTypeSelect.value : '';
            const message = messageTextarea ? messageTextarea.value : '';
            
            let isValid = true;

            if (!validateName(name)) {
                showError('name', '이름은 2글자 이상 입력해주세요.');
                isValid = false;
            } else {
                clearError('name');
            }

            if (!validateEmail(email)) {
                showError('email', '올바른 이메일 형식을 입력해주세요.');
                isValid = false;
            } else {
                clearError('email');
            }

            if (!validateSelect(inquiryType)) {
                showError('inquiry-type', '문의 유형을 선택해주세요.');
                isValid = false;
            } else {
                clearError('inquiry-type');
            }

            if (!validateMessage(message)) {
                showError('message', '문의 내용은 10글자 이상 입력해주세요.');
                isValid = false;
            } else {
                clearError('message');
            }
            
            if (isValid) {
                // 성공 메시지 표시
                openModal(
                    '문의 접수 완료',
                    '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.',
                    () => {
                        closeModal();
                        contactForm.reset();
                    }
                );
            } else {
                // 첫 번째 오류 필드에 포커스
                const firstErrorField = contactForm.querySelector('.error-message:not(:empty)');
                if (firstErrorField) {
                    const fieldId = firstErrorField.id.replace('-error', '');
                    const field = document.getElementById(fieldId);
                    if (field) field.focus();
                }
            }
        });
    }

    // --- 9. 브라우저 히스토리 관리 ---
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.id) {
            showSection(e.state.id);
        } else {
            const hash = window.location.hash.substring(1);
            showSection(hash || 'main-page');
        }
    });

    // --- 10. 접근성 향상을 위한 키보드 네비게이션 ---
    document.addEventListener('keydown', (e) => {
        // Tab 트랩핑 (모달이 열렸을 때)
        if (!modalContainer.classList.contains('hidden')) {
            const focusableElements = modalContainer.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        }
    });

    console.log('=== APPLICATION INITIALIZED SUCCESSFULLY ===');
});