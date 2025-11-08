document.addEventListener('DOMContentLoaded', () => {
    // --- 전역 변수 ---
    let userAnswers = [];
    let currentQuestionIndex = 0;
    let quizTimer = null;
    let remainingTime = 60 * 60; // 60분
    let allQuestions = []; // 현재 진행 중인 퀴즈 문제를 저장할 배열

    // [!!] 검색 기능을 위한 새 전역 변수
    let searchableLearningContent = []; // 5개 과목의 모든 텍스트를 저장할 배열
    const learningFileMap = {
        'panel-1': { file: 'learning-access.json', title: '웹 접근성 표준 개론' },
        'panel-2': { file: 'learning-internet.json', title: '인터넷 개론' },
        'panel-3': { file: 'learning-html.json', title: 'HTML 개론' },
        'panel-4': { file: 'learning-css-script.json', title: 'CSS/스크립트 개론' },
        'panel-5': { file: 'learning-info-access.json', title: '정보 접근성 개론' }
    };

    // 전역 변수 상태 확인
    console.log('=== GLOBAL VARIABLES INITIALIZED ===');

    // --- 0. 퀴즈 데이터 로드 함수 ---
    async function loadQuizData(fileName) {
        try {
            const response = await fetch(fileName);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allQuestions = await response.json();
            console.log(`Quiz data loaded successfully: ${fileName}`, allQuestions.length, 'questions');
            return true;
        } catch (error) {
            console.error('Failed to load quiz data:', error);
            alert(`퀴즈 데이터를 불러오는 데 실패했습니다: ${fileName}\n파일이 올바른 위치에 있는지 확인해주세요.`);
            return false;
        }
    }

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
            // '시험소개' 탭을 클릭할 때마다 JSON을 다시 로드하도록 로직 추가
            if (id === 'intro-page') {
                const introContent = document.getElementById('intro-content');
                if (introContent && !introContent.dataset.loaded) { // 이미 로드되었는지 확인
                    loadIntroPage(introContent);
                    introContent.dataset.loaded = 'true'; // 로드됨으로 표시
                }
            }
            
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

    // --- 2.1 [!!] 시험소개 페이지 (JSON 동적 로딩) ---
    const introContent = document.getElementById('intro-content');
    
    // 필기 시험 테이블 생성 헬퍼 함수
    function buildWrittenExamTable(data) {
        let headers = data.headers.map(h => `<th>${h}</th>`).join('');
        let rowsHtml = '';

        // 첫 번째 행 (rowspan 적용)
        rowsHtml += `
            <tr>
                <td rowspan="${data.rows.length}" style="text-align: center;">${data.commonInfo.label}</td>
                <td>${data.rows[0].subject}</td>
                <td style="text-align: center;">${data.rows[0].count}</td>
                <td rowspan="${data.rows.length}">
                    ${data.commonInfo.time}<br>
                    <strong>${data.commonInfo.fee}</strong>
                </td>
            </tr>
        `;

        // 나머지 행
        for (let i = 1; i < data.rows.length; i++) {
            rowsHtml += `
                <tr>
                    <td>${data.rows[i].subject}</td>
                    <td style="text-align: center;">${data.rows[i].count}</td>
                </tr>
            `;
        }

        return `
            <h4>${data.title}</h4>
            <table class="exam-table">
                <thead><tr>${headers}</tr></thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        `;
    }

    // 실기 시험 테이블 생성 헬퍼 함수
    function buildPracticalExamTable(data) {
        let headers = data.headers.map(h => `<th>${h}</th>`).join('');
        let row = data.rows[0];
        let rowHtml = `
            <tr>
                <td style="text-align: center;">${row.label}</td>
                <td>${row.subject}</td>
                <td>${row.criteria}</td>
                <td style="text-align: center;">${row.type}</td>
                <td>${row.commonInfo}</td>
            </tr>
        `;

        return `
            <h4>${data.title}</h4>
            <table class="exam-table">
                <thead><tr>${headers}</tr></thead>
                <tbody>${rowHtml}</tbody>
            </table>
        `;
    }

    // CTA(링크) 영역 생성 헬퍼 함수
    function buildCta(data) {
        return `
            <div class="call-to-action">
                <p>${data.text}</p>
                <a href="${data.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                    ${data.buttonText}
                </a>
            </div>
        `;
    }

    // 시험소개 페이지 로드 메인 함수
    async function loadIntroPage(panelElement) {
        try {
            panelElement.innerHTML = '<p>시험소개 내용을 불러오는 중입니다...</p>';
            const response = await fetch('learning-intro.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            // JSON 데이터를 기반으로 HTML 동적 생성
            let finalHtml = `
                <article class="intro-article">
                    <h3>${data.introTitle}</h3>
                    <p>${data.introText}</p>
                    ${buildWrittenExamTable(data.writtenExam)}
                    ${buildPracticalExamTable(data.practicalExam)}
                    ${buildCta(data.cta)}
                </article>
            `;
            
            panelElement.innerHTML = finalHtml;
            
        } catch (error) {
            console.error('Failed to load intro content:', error);
            panelElement.innerHTML = '<p style="color: red;">시험소개 내용을 불러오지 못했습니다.</p>';
        }
    }

    // [!!] 페이지가 처음 로드될 때 '시험소개' 탭이 활성화 상태라면 JSON 로드
    if (introContent && !introContent.classList.contains('hidden')) {
        loadIntroPage(introContent);
        introContent.dataset.loaded = 'true';
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
            
            if (prevBtn) {
                prevBtn.disabled = currentSlide === 0;
                prevBtn.setAttribute('aria-disabled', currentSlide === 0 ? 'true' : 'false');
            }
            if (nextBtn) {
                nextBtn.disabled = currentSlide === slides.length - 1;
                nextBtn.setAttribute('aria-disabled', currentSlide === slides.length - 1 ? 'true' : 'false');
            }

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
        
        updateSlides();
    }

    // --- 3. [!!] 탭 인터페이스 로직 (동적 아코디언) ---
    const tabList = document.querySelector('[role="tablist"]');
    if (tabList) {
        const tabs = tabList.querySelectorAll('[role="tab"]');
        const panels = document.querySelectorAll('[role="tabpanel"]');
        
        // [!!] 아코디언 UI 생성 함수
        function buildAccordion(panelElement, data) {
            panelElement.innerHTML = ''; // 로딩 메시지 제거
            const accordionContainer = document.createElement('div');
            accordionContainer.className = 'accordion-container';

            data.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'accordion-item';

                const header = document.createElement('button');
                header.className = 'accordion-header';
                header.setAttribute('aria-expanded', 'false');
                header.setAttribute('aria-controls', `content-${item.objectiveId}`);
                header.textContent = item.title;

                const content = document.createElement('div');
                content.className = 'accordion-content';
                content.id = `content-${item.objectiveId}`;
                content.role = 'region';
                content.hidden = true;
                content.innerHTML = item.content; // JSON의 HTML 내용을 그대로 삽입

                header.addEventListener('click', () => {
                    const isExpanded = header.getAttribute('aria-expanded') === 'true';
                    header.setAttribute('aria-expanded', !isExpanded);
                    content.hidden = isExpanded;
                });

                itemDiv.appendChild(header);
                itemDiv.appendChild(content);
                accordionContainer.appendChild(itemDiv);
            });
            panelElement.appendChild(accordionContainer);
        }

        // [!!] 탭 전환 함수 (동적 로딩 로직 추가)
        async function switchTab(selectedTab) {
            const targetPanel = document.getElementById(selectedTab.getAttribute('aria-controls'));
            
            tabs.forEach(tab => {
                tab.setAttribute('aria-selected', 'false');
            });
            
            panels.forEach(panel => {
                panel.classList.add('hidden');
            });
            
            selectedTab.setAttribute('aria-selected', 'true');
            
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
                
                if (!targetPanel.dataset.loaded) {
                    const panelId = targetPanel.id;
                    const panelInfo = learningFileMap[panelId]; 
                    
                    if (panelInfo && panelInfo.file) {
                        try {
                            targetPanel.innerHTML = '<p>학습 내용을 불러오는 중입니다...</p>';
                            const response = await fetch(panelInfo.file);
                            if (!response.ok) throw new Error('Network response was not ok');
                            const data = await response.json();
                            
                            buildAccordion(targetPanel, data); // 아코디언 UI 생성
                            targetPanel.dataset.loaded = 'true'; // 로드되었음'으로 표시
                        } catch (error) {
                            console.error('Failed to load learning content:', error);
                            targetPanel.innerHTML = '<p style="color: red;">학습 내용을 불러오지 못했습니다.</p>';
                        }
                    } else {
                        targetPanel.innerHTML = '<p>학습 콘텐츠를 찾을 수 없습니다.</p>';
                    }
                }
            }
            
            const searchResults = document.getElementById('search-results');
            if (searchResults) {
                searchResults.classList.add('hidden');
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

        // [!!] 검색 인덱스를 초기화하는 함수
        async function initializeSearchIndex() {
            const searchInput = document.getElementById('study-search-input');
            const searchButton = document.querySelector('.study-search button');
            
            if (searchInput) {
                searchInput.disabled = true;
                searchInput.placeholder = '학습 데이터 로딩 중...';
            }
            if (searchButton) searchButton.disabled = true;

            const loadPromises = Object.entries(learningFileMap).map(async ([panelId, info]) => {
                try {
                    const response = await fetch(info.file);
                    if (!response.ok) throw new Error(`Failed to load ${info.file}`);
                    const data = await response.json(); 
                    
                    return data.map(chapter => ({
                        subjectTitle: info.title,
                        subjectPanelId: panelId,
                        chapterTitle: chapter.title,
                        chapterContent: chapter.content 
                    }));
                } catch (error) {
                    console.error(error);
                    return []; 
                }
            });

            const allResults = await Promise.all(loadPromises);
            
            searchableLearningContent = allResults.flat();
            
            if (searchInput) {
                searchInput.disabled = false;
                searchInput.placeholder = '키워드로 학습 내용 검색...';
            }
            if (searchButton) searchButton.disabled = false;
            
            console.log('Search Index is ready:', searchableLearningContent.length, 'chapters loaded.');
        }
        
        // [!!] 페이지 로드 시 첫 번째 탭 콘텐츠 미리 로드 및 검색 인덱스 생성
        const firstTab = document.getElementById('tab-1');
        if (firstTab && firstTab.getAttribute('aria-selected') === 'true') {
            switchTab(firstTab);
        }
        initializeSearchIndex(); // 검색 인덱스 생성 시작
    }

    // --- 3.1 [!!] JSON 기반 검색 기능 ---
    const studySearchForm = document.getElementById('study-search-form');
    
    if (studySearchForm) {
        
        function displaySearchResults(results, query) {
            const searchResults = document.getElementById('search-results');
            if (!searchResults) return;

            if (results.length === 0) {
                searchResults.innerHTML = `<h3>검색 결과</h3><p>"${query}"(으)로 검색된 결과가 없습니다.</p>`;
            } else {
                searchResults.innerHTML = `
                    <h3>검색 결과 (${results.length}개)</h3>
                    ${results.map(result => `
                        <div class="search-result-item">
                            <span class="subject-tag">${result.subject}</span>
                            <h4>${result.chapter}</h4>
                            <div class="matched-text">${result.snippet}</div>
                            <div class="context">
                                <button onclick="window.showSubjectTab('${result.subjectId}')" class="link-button">
                                    ${result.subject} 탭으로 이동
                                </button>
                            </div>
                        </div>
                    `).join('')}
                `;
            }
            searchResults.classList.remove('hidden');

            document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
                panel.classList.add('hidden');
            });
        }
        
        function performSearch(query) {
            if (searchableLearningContent.length === 0) {
                alert('아직 학습 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
                return;
            }

            const lowerQuery = query.toLowerCase();
            const results = [];
            
            function stripHtml(html) {
                return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
            }

            searchableLearningContent.forEach(chapter => {
                const plainTextContent = stripHtml(chapter.chapterContent).toLowerCase();
                const titleText = chapter.chapterTitle.toLowerCase();
                const fullText = titleText + ' ' + plainTextContent; // 제목 + 내용
                
                if (fullText.includes(lowerQuery)) {
                    
                    const matchedIndex = fullText.indexOf(lowerQuery);
                    const beforeMatch = fullText.substring(Math.max(0, matchedIndex - 30), matchedIndex);
                    const matchedText = fullText.substring(matchedIndex, matchedIndex + query.length);
                    const afterMatch = fullText.substring(matchedIndex + query.length, matchedIndex + query.length + 50);

                    results.push({
                        subject: chapter.subjectTitle,
                        subjectId: chapter.subjectPanelId,
                        chapter: chapter.chapterTitle,
                        snippet: `...${beforeMatch}<strong>${matchedText}</strong>${afterMatch}...`
                    });
                }
            });
            
            displaySearchResults(results, query);
        }

        studySearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('study-search-input').value.trim();
            if (query) performSearch(query);
        });

        window.showSubjectTab = function(subjectPanelId) {
            const targetTab = document.querySelector(`[aria-controls="${subjectPanelId}"]`);
            if (targetTab) {
                targetTab.click(); 
            }
            
            const searchResults = document.getElementById('search-results');
            if (searchResults) searchResults.classList.add('hidden');
            
            const studySearchInput = document.getElementById('study-search-input');
            if (studySearchInput) studySearchInput.value = '';
        };
    }


    // --- 4. 문제풀이 흐름 --- (기존과 동일)
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

    // 문제풀이 페이지 상태 초기화 함수 (기존과 동일)
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
        allQuestions = []; // 퀴즈 문제 배열 초기화
        
        if (quizTimer) {
            clearInterval(quizTimer);
            quizTimer = null;
        }
        remainingTime = 60 * 60;
        
        console.log('Quiz page reset - userAnswers initialized:', userAnswers);
    }

    // 문제풀이 탭 클릭 시 상태 초기화 (기존과 동일)
    const quizPageLink = document.querySelector('a[href="#quiz-page"]');
    if (quizPageLink) {
        quizPageLink.addEventListener('click', () => {
            setTimeout(() => {
                resetQuizPageState();
            }, 100);
        });
    }

    // --- 5. 퀴즈 인터페이스 --- (기존과 동일 - v4-fix 버전)
    const questionContainer = document.getElementById('question-container');
    if (questionContainer) {

        // (타이머 함수들 - 기존 코드와 동일)
        function startTimer() {
            const timerElement = document.getElementById('quiz-timer');
            if (!timerElement) return;
            
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
            updateTimerDisplay(); 
            updateTimerProgress(remainingTime, initialTime); 
            
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
                
                if (remainingTime === 600) announceTimeRemaining('시험 종료까지 10분 남았습니다.', false);
                else if (remainingTime === 300) announceTimeRemaining('시험 종료까지 5분 남았습니다.', false);
                else if (remainingTime === 60) announceTimeRemaining('시험 종료까지 1분 남았습니다!', true);
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
            const circularProgress = document.getElementById('timer-circle-fill');
            if (circularProgress) {
                const circumference = 2 * Math.PI * 9.6;
                const offset = circumference - (percentage / 100) * circumference;
                circularProgress.style.strokeDashoffset = offset;
            }
            const bgProgress = document.getElementById('timer-bg-progress');
            if (bgProgress) {
                bgProgress.style.width = `${percentage}%`;
            }
        }

        function updateTimerState(currentTime) {
            const timerElement = document.getElementById('quiz-timer');
            if (!timerElement) return;
            timerElement.classList.remove('warning', 'critical');
            if (currentTime <= 60) timerElement.classList.add('critical');
            else if (currentTime <= 300) timerElement.classList.add('warning');
        }

        function announceTimeRemaining(message, isUrgent = false) {
            console.log('Timer announcement:', message);
            const timerAnnouncements = document.getElementById('timer-announcements');
            if (timerAnnouncements) {
                timerAnnouncements.textContent = message;
                timerAnnouncements.setAttribute('aria-live', isUrgent ? 'assertive' : 'polite');
            }
            const announcement = document.createElement('div');
            announcement.className = `time-announcement ${isUrgent ? 'critical' : ''}`;
            announcement.innerHTML = `<span class="announcement-icon" aria-hidden="true">${isUrgent ? '⚠️' : '⏰'}</span><span>${message}</span>`;
            document.body.appendChild(announcement);
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

        // [!!] .textContent를 사용하도록 변경된 displayQuestion 함수 (기존과 동일)
        function displayQuestion(index) {
            if (allQuestions.length === 0) {
                 questionContainer.innerHTML = '<p>문제를 불러오는 중입니다...</p>';
                 return;
            }
            
            const question = allQuestions[index];
            if (!question) return;

            // userAnswers 배열 크기 확인 및 조정 (최초 1회 실행)
            if (userAnswers.length < allQuestions.length) {
                userAnswers = new Array(allQuestions.length).fill(undefined);
                console.log('UserAnswers array resized:', userAnswers);
            }
            
            // 1. 기존 내용 비우기
            questionContainer.innerHTML = '';
            
            // 2. Fieldset 생성
            const fieldset = document.createElement('fieldset');
            fieldset.className = 'question-fieldset';
            
            // 3. Legend (문제 번호) 생성
            const legend = document.createElement('legend');
            legend.className = 'question-legend';
            
            let questionLegendText = `문제 ${index + 1} / ${allQuestions.length}`;
            if (question.subject) {
                 questionLegendText += ` (${question.subject})`;
            }
            if (question.type === 'short') {
                 questionLegendText += ' (단답형)';
            }
            legend.textContent = questionLegendText; // .textContent 사용
            fieldset.appendChild(legend);

            // 4. Question (질문 텍스트) 생성
            let questionElement;
            if (question.type === 'short') {
                // 단답형은 <pre> 태그로 코드 포맷 유지
                questionElement = document.createElement('pre');
                questionElement.className = 'question-text';
            } else {
                questionElement = document.createElement('p');
                questionElement.className = 'question-text';
            }
            // [중요!] .textContent를 사용해 HTML 태그를 텍스트로 렌더링
            questionElement.textContent = question.question;
            fieldset.appendChild(questionElement);

            // 5. Answer Options (답변 영역) 생성
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'answer-options';

            if (question.type === 'short') {
                // 단답형 (textarea)
                const label = document.createElement('label');
                label.htmlFor = `short-answer-${index}`;
                label.className = 'visually-hidden';
                label.textContent = '답안 입력';
                
                const textarea = document.createElement('textarea');
                textarea.id = `short-answer-${index}`;
                textarea.className = 'short-answer-textarea';
                textarea.rows = 6;
                textarea.placeholder = '여기에 답안을 작성하세요...';
                textarea.value = userAnswers[index] || '';
                
                // 이벤트 리스너 부착
                textarea.addEventListener('blur', (e) => { 
                    userAnswers[index] = e.target.value;
                    console.log(`Question ${index + 1} answer saved (short): ${e.target.value.substring(0, 20)}...`);
                });
                
                optionsDiv.appendChild(label);
                optionsDiv.appendChild(textarea);
                
            } else {
                // 객관식 (radio)
                question.options.forEach((option, optionIndex) => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    
                    const input = document.createElement('input');
                    input.type = 'radio';
                    input.id = `option-${optionIndex}`;
                    input.name = `question-${index}`;
                    input.value = optionIndex;
                    if (userAnswers[index] === optionIndex) {
                        input.checked = true;
                    }
                    
                    const label = document.createElement('label');
                    label.htmlFor = `option-${optionIndex}`;
                    // [중요!] .textContent를 사용해 HTML 태그를 텍스트로 렌더링
                    label.textContent = option; 
                    
                    // 이벤트 리스너 부착
                    input.addEventListener('change', (e) => {
                        const selectedValue = parseInt(e.target.value);
                        userAnswers[index] = selectedValue;
                        console.log(`Question ${index + 1} answer saved (mcq): ${selectedValue}`);
                    });
                    
                    optionDiv.appendChild(input);
                    optionDiv.appendChild(label);
                    optionsDiv.appendChild(optionDiv);
                });
            }
            
            fieldset.appendChild(optionsDiv);
            
            // 6. 완성된 fieldset을 questionContainer에 삽입
            questionContainer.appendChild(fieldset);

            // --- [이하 로직은 동일] ---
            
            // 제출 버튼 표시/숨김
            const submitBtn = document.getElementById('submit-quiz-btn');
            if (submitBtn) {
                submitBtn.classList.toggle('hidden', index < allQuestions.length - 1);
            }

            // 이전/다음 버튼 표시/숨김
            const prevBtn = document.getElementById('prev-question-btn');
            const nextBtn = document.getElementById('next-question-btn');
            
            if (prevBtn) {
                prevBtn.style.display = index === 0 ? 'none' : 'block';
            }
            if (nextBtn) {
                nextBtn.style.display = index === allQuestions.length - 1 ? 'none' : 'block';
            }
        }

        // 이전/다음 버튼 이벤트 (기존과 동일)
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
                if (currentQuestionIndex < allQuestions.length - 1) {
                    currentQuestionIndex++;
                    console.log(`Moving to next question ${currentQuestionIndex + 1}`);
                    console.log('Current userAnswers before display:', userAnswers);
                    displayQuestion(currentQuestionIndex);
                }
            });
        }

        // 퀴즈 시작 버튼 로직 (동적 로딩) (기존과 동일)
        const startQuizBtn = document.getElementById('start-quiz-btn');
        const startMockExamBtn = document.getElementById('start-mock-exam-btn');

        // 공통 퀴즈 시작 로직
        function startQuiz() {
            if (allQuestions.length === 0) {
                alert('불러온 문제 데이터가 없습니다. 다시 시도해주세요.');
                return;
            }
            
            showSection('quiz-interface');
            currentQuestionIndex = 0;
            userAnswers = new Array(allQuestions.length).fill(undefined); 
            console.log('Quiz started - userAnswers initialized:', userAnswers);
            
            remainingTime = 60 * 60; // 60분으로 초기화
            startTimer(); // 타이머 시작
            displayQuestion(currentQuestionIndex); // 첫 문제 표시
        }
        
        // 과목별 퀴즈 시작 버튼
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', async () => {
                const selectedSubject = document.querySelector('input[name="subject"]:checked');
                if (!selectedSubject) {
                    alert('응시할 과목을 선택해주세요.');
                    return;
                }
                
                // 과목 value와 JSON 파일명 매핑
                const fileMap = {
                    "web_access": "questions-access.json",
                    "internet": "questions-internet.json",
                    "html": "questions-html.json",
                    "css_script": "questions-css-script.json",
                    "info_access": "questions-info-access.json"
                };
                
                const fileName = fileMap[selectedSubject.value];
                if (!fileName) {
                    alert('잘못된 과목 선택입니다.');
                    return;
                }

                startQuizBtn.disabled = true;
                startQuizBtn.textContent = '문제 불러오는 중...';
                
                const success = await loadQuizData(fileName);
                
                startQuizBtn.disabled = false;
                startQuizBtn.textContent = '문제풀기';

                if (success) {
                    startQuiz(); 
                }
            });
        }

        // 모의고사 퀴즈 시작 버튼
        if (startMockExamBtn) {
            startMockExamBtn.addEventListener('click', async () => {
                const fileName = "questions-mock-exam.json";

                startMockExamBtn.disabled = true;
                startMockExamBtn.textContent = '모의고사 불러오는 중...';

                const success = await loadQuizData(fileName);
                
                startMockExamBtn.disabled = false;
                startMockExamBtn.textContent = '모의고사 시작';

                if (success) {
                    startQuiz();
                }
            });
        }
    }

    // --- 6. [!!] .textContent로 HTML 태그를 안전하게 처리하도록 수정한 showResults 함수 (기존과 동일)
    function showResults() {
        console.log('=== SHOW RESULTS FUNCTION CALLED ===');
        
        const resultDashboard = document.getElementById('result-dashboard');
        const summaryContainer = resultDashboard.querySelector('#result-summary');
        const wrongListContainer = resultDashboard.querySelector('#wrong-questions-list');

        if (allQuestions.length === 0) {
            console.error("No questions loaded to show results.");
            summaryContainer.innerHTML = '<h3>시험 결과</h3><p>채점할 문제가 없습니다. 퀴즈를 다시 시작해주세요.</p>';
            return;
        }

        // 전역 userAnswers 배열 확인
        if (!userAnswers || userAnswers.length !== allQuestions.length) {
            console.warn('userAnswers array mismatch, re-initializing');
            userAnswers = new Array(allQuestions.length).fill(undefined);
        }

        let correctCount = 0;
        let totalMcqQuestions = 0;
        const wrongMcqAnswers = [];
        const shortAnswerReviews = [];

        console.log('=== SCORE CALCULATION START ===');
        
        for (let i = 0; i < allQuestions.length; i++) {
            const question = allQuestions[i];
            const userAnswer = userAnswers[i];

            if (question.type === 'short') {
                // 단답형 문제는 자동 채점에서 제외하고, 리뷰 목록에 추가
                shortAnswerReviews.push({
                    questionNumber: i + 1,
                    question: question.question,
                    userAnswer: userAnswer || "답안 없음",
                    correctAnswer: question.correct, // 모범 답안
                    explanation: question.explanation,
                    subject: question.subject || "기타" // 모의고사 과목명
                });
            } else { 
                // MCQ 또는 기본값 (자동 채점)
                totalMcqQuestions++;
                const correctAnswer = question.correct;
                
                if (userAnswer !== undefined && userAnswer === correctAnswer) {
                    correctCount++;
                } else {
                    wrongMcqAnswers.push({
                        questionNumber: i + 1,
                        question: question.question,
                        userAnswer: (userAnswer !== undefined && question.options[userAnswer]) ? question.options[userAnswer] : "답안 없음",
                        correctAnswer: question.options[correctAnswer],
                        explanation: question.explanation,
                        subject: question.subject || "기타" // 모의고사 과목명
                    });
                }
            }
        }

        // 점수는 객관식 문제 기준으로만 계산
        const score = totalMcqQuestions > 0 ? Math.round((correctCount / totalMcqQuestions) * 100) : 0;
        const totalQuestions = allQuestions.length;

        console.log(`=== FINAL SCORE (MCQ Only) ===`);
        console.log(`Correct: ${correctCount}/${totalMcqQuestions}`);
        console.log(`Score: ${score}%`);
        console.log(`Wrong MCQs: ${wrongMcqAnswers.length}`);
        console.log(`Short Answers to review: ${shortAnswerReviews.length}`);
        console.log('=== SCORE CALCULATION END ===');

        stopTimer();

        // 결과 요약 표시
        summaryContainer.innerHTML = `
            <h3>시험 결과</h3>
            <div class="score-display">
                <div class="score-item">
                    <div class="score-number">${score}%</div>
                    <div class="score-label">정답률 (객관식)</div>
                </div>
                <div class="score-item">
                    <div class="score-number">${correctCount} / ${totalMcqQuestions}</div>
                    <div class="score-label">정답 수 (객관식)</div>
                </div>
                <div class="score-item">
                    <div class="score-number">${totalQuestions}</div>
                    <div class="score-label">총 문항</div>
                </div>
            </div>
        `;
        
        wrongListContainer.innerHTML = ''; // 초기화
        
        // 1. 틀린 객관식 문제 표시
        if (wrongMcqAnswers.length === 0 && totalMcqQuestions > 0) {
            wrongListContainer.innerHTML = '<p>모든 객관식 문제를 맞췄습니다! 축하합니다! 🎉</p>';
        } else if (totalMcqQuestions > 0) {
            const wrongTitle = document.createElement('h3');
            wrongTitle.textContent = `틀린 객관식 문제 (${wrongMcqAnswers.length}개)`;
            wrongListContainer.appendChild(wrongTitle);
            
            wrongMcqAnswers.forEach((item) => {
                const details = document.createElement('details');
                
                // [!!] .textContent 수정을 위한 summary 생성
                const summary = document.createElement('summary');
                if (allQuestions[0].subject) { // 모의고사 과목 태그
                    const subjectTag = document.createElement('span');
                    subjectTag.className = 'subject-tag';
                    subjectTag.textContent = item.subject;
                    summary.appendChild(subjectTag);
                }
                // [!!] .textContent로 안전하게 질문 삽입
                summary.appendChild(document.createTextNode(`문제 ${item.questionNumber}: ${item.question}`));
                details.appendChild(summary);

                // --- 상세 내용 생성 ---
                const detailsContent = document.createElement('div');
                detailsContent.className = 'wrong-answer-details';
                
                // 1. 나의 답
                const p1 = document.createElement('p');
                p1.innerHTML = '<strong>나의 답:</strong> ';
                const span1 = document.createElement('span');
                span1.className = 'user-answer';
                span1.textContent = item.userAnswer; // .textContent 사용
                p1.appendChild(span1);
                detailsContent.appendChild(p1);

                // 2. 정답
                const p2 = document.createElement('p');
                p2.innerHTML = '<strong>정답:</strong> ';
                const span2 = document.createElement('span');
                span2.className = 'correct-answer';
                span2.textContent = item.correctAnswer; // .textContent 사용
                p2.appendChild(span2);
                detailsContent.appendChild(p2);

                // 3. 해설
                const p3 = document.createElement('p');
                p3.innerHTML = '<strong>해설:</strong> ';
                // [!!] .textContent로 안전하게 해설 삽입
                p3.appendChild(document.createTextNode(item.explanation));
                detailsContent.appendChild(p3);
                
                details.appendChild(detailsContent);
                wrongListContainer.appendChild(details);
            });
        }
        
        // 2. 단답형 문제 리뷰 표시
        if (shortAnswerReviews.length > 0) {
            const shortReviewContainer = document.createElement('div');
            shortReviewContainer.id = 'short-answer-review-list';
            shortReviewContainer.innerHTML = `<h3>단답형 문제 다시보기 (${shortAnswerReviews.length}개)</h3><p>단답형 문제는 직접 모범 답안과 비교해보세요.</p>`;
            
            shortAnswerReviews.forEach((item) => {
                const details = document.createElement('details');
                
                // [!!] .textContent 수정을 위한 summary 생성
                const summary = document.createElement('summary');
                if (allQuestions[0].subject) { // 모의고사 과목 태그
                    const subjectTag = document.createElement('span');
                    subjectTag.className = 'subject-tag';
                    subjectTag.textContent = item.subject;
                    summary.appendChild(subjectTag);
                }
                summary.appendChild(document.createTextNode(`문제 ${item.questionNumber}: (단답형)`));
                details.appendChild(summary);

                // --- 상세 내용 생성 (textContent로 안전하게) ---
                const detailsContent = document.createElement('div');
                detailsContent.className = 'wrong-answer-details short-answer-review';
                
                detailsContent.innerHTML = `
                    <p><strong>문제:</strong></p>
                    <p><strong>나의 답:</strong></p>
                    <p><strong>모범 답안:</strong></p>
                    <p><strong>해설:</strong></p>
                    `;
                
                const questionTextEl = document.createElement('pre');
                questionTextEl.className = 'question-text';
                questionTextEl.textContent = item.question; // .textContent
                
                const userAnswerEl = document.createElement('pre');
                userAnswerEl.className = 'user-answer';
                userAnswerEl.textContent = item.userAnswer || ' '; // .textContent

                const correctAnswerEl = document.createElement('pre');
                correctAnswerEl.className = 'correct-answer';
                correctAnswerEl.textContent = item.correctAnswer; // .textContent
                
                const explanationEl = document.createElement('p');
                explanationEl.textContent = item.explanation; // .textContent

                // 안전하게 생성된 요소들을 제자리에 삽입
                detailsContent.querySelector('p:nth-of-type(1)').insertAdjacentElement('afterend', questionTextEl);
                detailsContent.querySelector('p:nth-of-type(2)').insertAdjacentElement('afterend', userAnswerEl);
                detailsContent.querySelector('p:nth-of-type(3)').insertAdjacentElement('afterend', correctAnswerEl);
                detailsContent.querySelector('p:nth-of-type(4)').insertAdjacentElement('afterend', explanationEl);
                
                details.appendChild(detailsContent);
                shortReviewContainer.appendChild(details);
            });
            wrongListContainer.appendChild(shortReviewContainer);
        }

        showSection('result-dashboard');
    }

    // --- 7. 제출 확인 모달 로직 --- (기존과 동일)
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

    // --- 8. [!!] 보존된 문의하기 폼 검증 --- (기존과 동일)
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

    // --- 9. 브라우저 히스토리 관리 --- (기존과 동일)
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.id) {
            showSection(e.state.id);
        } else {
            const hash = window.location.hash.substring(1);
            showSection(hash || 'main-page');
        }
    });

    // --- 10. 접근성 향상을 위한 키보드 네비게이션 --- (기존과 동일)
    document.addEventListener('keydown', (e) => {
        // Tab 트랩핑 (모달이 열렸을 때)
        if (modalContainer && !modalContainer.classList.contains('hidden')) {
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

    console.log('=== APPLICATION INITIALIZED SUCCESSFULLY (Full Version, v7-IntroJSON) ===');
});
