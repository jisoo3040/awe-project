console.log("AWE GUIDE VERSION 2.0");
/**
 * AWE 2026 참관 안내 앱 - 최적화 버전
 * 핵심: 앱 시작 시 전체 데이터 1회 로드 → 메모리 캐시 → 메뉴 전환 즉시 렌더링
 */

// ===== 전역 상태 =====
const AppState = {
    userType: 'staff',
    isAdmin: false,
    currentMenu: 'important_notice',
    editCallback: null,
    _pendingEditText: null,
};

// ===== 메모리 캐시 =====
const Cache = {
    content: null,
    files: null,
    contacts: null,
    notices: null,        // awe_notices
    participants: null,   // awe_participants
    schedule: null,       // awe_schedule
    weather: null,
    weatherTime: 0,
    loaded: false,
};
const WEATHER_TTL = 30 * 60 * 1000; // 30분

// ===== localStorage 키 =====
const LS_CONTENT      = 'awe_cache_content';
const LS_FILES        = 'awe_cache_files';
const LS_CONTACTS     = 'awe_cache_contacts';
const LS_NOTICES      = 'awe_cache_notices';
const LS_PARTICIPANTS = 'awe_cache_participants';
const LS_SCHEDULE     = 'awe_cache_schedule';

// localStorage 저장 (파일 data는 용량이 크므로 메타만 저장)
function lsSave(key, data) {
    try {
        // awe_files는 file_data(base64) 제외하고 저장
        if (key === LS_FILES) {
            const slim = (data || []).map(f => {
                const { file_data, ...rest } = f;
                return rest;
            });
            localStorage.setItem(key, JSON.stringify(slim));
        } else {
            localStorage.setItem(key, JSON.stringify(data || []));
        }
    } catch (e) {
        // localStorage 용량 초과 시 무시
    }
}

// localStorage 로드
function lsLoad(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

// file_data는 별도 키에 id별 저장 (다운로드용)
function lsSaveFileData(fileId, fileData) {
    try {
        localStorage.setItem('awe_file_' + fileId, fileData);
    } catch {}
}
function lsLoadFileData(fileId) {
    try { return localStorage.getItem('awe_file_' + fileId) || null; } catch { return null; }
}
function lsRemoveFileData(fileId) {
    try { localStorage.removeItem('awe_file_' + fileId); } catch {}
}

const ADMIN_PW = '0000';
const TABLE_CONTENT      = 'awe_content';
const TABLE_FILES        = 'awe_files';
const TABLE_CONTACTS     = 'awe_contacts';
const TABLE_NOTICES      = 'awe_notices';
const TABLE_PARTICIPANTS = 'awe_participants';
const TABLE_SCHEDULE     = 'awe_schedule';

const MENUS = [
    { key: 'important_notice', label: '중요 안내사항', icon: 'fa-exclamation-circle' },
    { key: 'company_info',     label: '방문기업 정보', icon: 'fa-building' },
    { key: 'learning',         label: '학습자료',      icon: 'fa-book-open' },
    { key: 'participants',     label: '참가자명단',    icon: 'fa-users' },
    { key: 'schedule',         label: '일정표',        icon: 'fa-calendar-alt' },
    { key: 'room_assignment',  label: '호텔 정보',     icon: 'fa-hotel' },
];

// ===== prefetchAll – 정적 데이터 사용으로 전환되어 서버 fetch 불필요 =====
async function prefetchAll() {
    // 서버 DB 의존 완전 제거 – js/data.js의 정적 데이터를 사용
    // (관리자 모드에서 데이터 저장 시에만 서버 API 호출)
}

// ===== 캐시 부분 무효화 (저장 후 해당 테이블만 재fetch + localStorage 갱신) =====
async function invalidateContent() {
    // 저장 후 캐시 재로드 - 서버에서 fetch 후 콘텐츠 갱신
    try {
        const res  = await fetch(`/tables/${TABLE_CONTENT}?limit=500`);
        const data = await res.json();
        Cache.content = Array.isArray(data) ? data : [];
    } catch {}
}
async function invalidateFiles() {
    try {
        const res  = await fetch(`/tables/${TABLE_FILES}?limit=500`);
        const data = await res.json();
        Cache.files = Array.isArray(data) ? data : [];
    } catch {}
}
async function invalidateContacts() {
    try {
        const res  = await fetch(`/tables/${TABLE_CONTACTS}?limit=200`);
        const data = await res.json();
        Cache.contacts = Array.isArray(data) ? data : [];
    } catch {}
}
async function invalidateNotices() {
    try {
        const res  = await fetch(`/tables/${TABLE_NOTICES}?limit=500`);
        const data = await res.json();
        Cache.notices = Array.isArray(data) ? data : [];
    } catch {}
}
async function invalidateParticipants() {
    try {
        const res  = await fetch(`/tables/${TABLE_PARTICIPANTS}?limit=500`);
        const data = await res.json();
        Cache.participants = Array.isArray(data) ? data : [];
    } catch {}
}
async function invalidateSchedule() {
    try {
        const res = await fetch(`/tables/${TABLE_SCHEDULE}?limit=500`);
        const data = await res.json();

        // Cloudflare Pages Functions는 배열 그대로 반환
        Cache.schedule = Array.isArray(data) ? data : [];
    } catch (e) {
        console.error('일정 재로드 실패:', e);
        Cache.schedule = [];
    }
}
async function initGuideApp(type) {
    AppState.userType = type;
    AppState.isAdmin  = false;
    AppState.currentMenu = 'important_notice';

    const app = document.getElementById('main-app');
    app.style.display = 'block';
    app.innerHTML = buildAppHTML();
    bindEvents();

    await invalidateSchedule();

    Cache.notices      = (typeof STATIC_NOTICES !== 'undefined') ? STATIC_NOTICES : [];
    Cache.participants = (typeof STATIC_PARTICIPANTS !== 'undefined') ? STATIC_PARTICIPANTS : [];
    Cache.contacts     = (typeof STATIC_CONTACTS !== 'undefined') ? STATIC_CONTACTS : [];
    Cache.content      = (typeof STATIC_CONTENT !== 'undefined') ? STATIC_CONTENT : [];
    Cache.files        = (typeof STATIC_FILES !== 'undefined') ? STATIC_FILES : [];

    Cache.loaded = true;

    renderMenu(AppState.currentMenu);
}

// ===== 캐시 기반 조회 =====
function getCachedContent(menu, section) {
    return (Cache.content || []).find(r =>
        r.user_type === AppState.userType && r.menu === menu && r.section === section
    ) || null;
}

function getCachedFiles(menu) {
    return (Cache.files || [])
        .filter(r => r.user_type === AppState.userType && r.menu === menu)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

function getCachedContacts() {
    return (Cache.contacts || [])
        .filter(r => r.user_type === AppState.userType)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

// ===== HTML 빌드 =====
function buildAppHTML() {
    const gradeLabel = AppState.userType === 'executive' ? '책임자급' : '실무자급';
    const gradeCls   = AppState.userType === 'executive' ? 'executive' : 'staff';

    const navTabs = MENUS.map(m => `
        <button class="nav-tab ${m.key === 'important_notice' ? 'active' : ''}"
                data-menu="${m.key}" onclick="switchMenu('${m.key}')">
            <i class="fas ${m.icon}"></i>${m.label}
        </button>`).join('');

    return `
    <div id="guide-app">
        <header class="guide-header">
            <div class="guide-header-inner">
                <div class="guide-header-title">
                    <span class="event-name">상해 AWE 2026 참관</span>
                    <span class="grade-badge ${gradeCls}">${gradeLabel}</span>
                </div>
                <div class="header-actions">
                    <span class="admin-mode-badge" id="admin-badge">
                        <i class="fas fa-edit"></i> 관리자 모드
                    </span>
                    <button class="mode-btn active" id="user-mode-btn" title="사용자 모드" onclick="switchToUser()">
                        <i class="fas fa-user"></i><span>사용자</span>
                    </button>
                    <button class="mode-btn" id="admin-mode-btn" title="관리자 모드" onclick="requestAdminMode()">
                        <i class="fas fa-cog"></i><span>관리자</span>
                    </button>
                    <button class="home-btn" onclick="goHome()">
                        <i class="fas fa-home"></i> 처음으로
                    </button>
                </div>
            </div>
        </header>
        <nav class="guide-nav">
            <div class="guide-nav-inner" id="nav-tabs">${navTabs}</div>
        </nav>
        <main class="guide-content" id="menu-content"></main>
    </div>

    <!-- 비밀번호 모달 -->
    <div class="modal-overlay hidden" id="pw-modal">
        <div class="modal-box">
            <div class="modal-title"><i class="fas fa-lock" style="margin-right:8px;color:#1a1f4e;"></i>관리자 인증</div>
            <div class="modal-desc">관리자 모드로 전환하려면 비밀번호를 입력하세요.</div>
            <input type="password" class="modal-input" id="pw-input" placeholder="• • • •" maxlength="8"
                   onkeydown="if(event.key==='Enter')confirmAdminPw()">
            <div id="pw-error" style="color:#e53935;font-size:12px;margin-top:-14px;margin-bottom:16px;display:none;">
                <i class="fas fa-exclamation-circle"></i> 비밀번호가 올바르지 않습니다.
            </div>
            <div class="modal-buttons">
                <button class="btn-cancel" onclick="closePwModal()">취소</button>
                <button class="btn-confirm" onclick="confirmAdminPw()">확인</button>
            </div>
        </div>
    </div>

    <!-- 텍스트 편집 모달 -->
    <div class="modal-overlay hidden" id="edit-modal">
        <div class="modal-box" style="max-width:600px;">
            <div class="modal-title" id="edit-modal-title">내용 편집</div>
            <div class="modal-desc"  id="edit-modal-desc">내용을 입력하고 저장을 클릭하세요.</div>
            <textarea class="modal-textarea" id="edit-textarea" placeholder="내용을 입력하세요..."></textarea>
            <div class="modal-buttons">
                <button class="btn-cancel" onclick="closeEditModal()">취소</button>
                <button class="btn-confirm" onclick="requestSaveEdit()">저장</button>
            </div>
        </div>
    </div>

    <!-- 저장 확인 모달 -->
    <div class="modal-overlay hidden" id="confirm-modal">
        <div class="modal-box">
            <div class="confirm-icon"><i class="fas fa-pencil-alt"></i></div>
            <div class="modal-title" style="text-align:center;">수정하시겠습니까?</div>
            <div class="modal-desc"  style="text-align:center;">입력한 내용으로 저장됩니다. 계속 진행하시겠습니까?</div>
            <div class="modal-buttons" style="justify-content:center;">
                <button class="btn-cancel" onclick="closeConfirmModal()">취소</button>
                <button class="btn-confirm" onclick="executeConfirmedSave()">수정 완료</button>
            </div>
        </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div class="modal-overlay hidden" id="delete-modal">
        <div class="modal-box">
            <div class="confirm-icon" style="background:#ffebee;"><i class="fas fa-trash" style="color:#e53935;"></i></div>
            <div class="modal-title" style="text-align:center;">삭제하시겠습니까?</div>
            <div class="modal-desc"  style="text-align:center;" id="delete-modal-desc">이 항목을 삭제하면 복구할 수 없습니다.</div>
            <div class="modal-buttons" style="justify-content:center;">
                <button class="btn-cancel" onclick="closeDeleteModal()">취소</button>
                <button class="btn-confirm danger" id="delete-confirm-btn">삭제</button>
            </div>
        </div>
    </div>

    <!-- 연락처 편집 모달 -->
    <div class="modal-overlay hidden" id="contact-modal">
        <div class="modal-box" style="max-width:600px;">
            <div class="modal-title">스태프 연락처 편집</div>
            <div class="modal-desc">연락처 목록을 편집하세요.</div>
            <div id="contact-edit-list" style="margin-bottom:16px;max-height:300px;overflow-y:auto;"></div>
            <button onclick="addContactRow()" style="width:100%;padding:8px;border:1.5px dashed #c5cae9;background:transparent;border-radius:8px;color:#666;cursor:pointer;font-family:'Noto Sans KR',sans-serif;font-size:13px;margin-bottom:16px;">
                <i class="fas fa-plus"></i> 연락처 추가
            </button>
            <div class="modal-buttons">
                <button class="btn-cancel" onclick="closeContactModal()">취소</button>
                <button class="btn-confirm" onclick="requestSaveContacts()">저장</button>
            </div>
        </div>
    </div>

    <!-- 유튜브 플레이어 모달 -->
    <div class="modal-overlay hidden" id="yt-modal">
        <div class="modal-box" style="max-width:700px;padding:0;border-radius:16px;overflow:hidden;">
            <div style="position:relative;padding-top:56.25%;background:#000;">
                <iframe id="yt-iframe" style="position:absolute;inset:0;width:100%;height:100%;border:none;"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen></iframe>
            </div>
            <div style="padding:16px 20px;display:flex;justify-content:flex-end;">
                <button class="btn-cancel" onclick="closeYtModal()">닫기</button>
            </div>
        </div>
    </div>

    <!-- 이미지 미리보기 모달 -->
    <div class="modal-overlay hidden" id="img-modal" onclick="closeImgModal()">
        <img id="img-modal-img" style="max-width:95vw;max-height:90vh;border-radius:12px;object-fit:contain;" src="" alt="">
    </div>

    <!-- 토스트 -->
    <div class="toast-container" id="toast-container"></div>`;
}

// ===== 이벤트 바인딩 =====
function bindEvents() {
    if (!document.getElementById('file-input')) {
        const fi = document.createElement('input');
        fi.type = 'file';
        fi.id   = 'file-input';
        fi.style.display = 'none';
        fi.accept = '.pdf,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.doc,.docx';
        fi.onchange = handleFileUpload;
        document.body.appendChild(fi);
    }
}

// ===== 메뉴 전환 (캐시 → 즉시 렌더) =====
function switchMenu(menuKey) {
    AppState.currentMenu = menuKey;
    document.querySelectorAll('.nav-tab').forEach(t =>
        t.classList.toggle('active', t.dataset.menu === menuKey));
    renderMenu(menuKey);
}

function renderMenu(menuKey) {
    const content = document.getElementById('menu-content');
    if (!content) return;
    // 캐시가 준비됐으면 즉시 렌더, 아니면 로딩 표시 후 대기
    if (!Cache.loaded) {
        content.innerHTML = '<div style="text-align:center;padding:60px;"><div class="loading-spinner"></div></div>';
        const timer = setInterval(() => {
            if (Cache.loaded) { clearInterval(timer); renderMenu(menuKey); }
        }, 100);
        return;
    }
    switch (menuKey) {
        case 'important_notice': renderImportantNotice(content); break;
        case 'company_info':     renderCompanyInfo(content);     break;
        case 'learning':         renderLearning(content);        break;
        case 'participants':     renderParticipants(content);                                                  break;
        case 'schedule':         renderSchedule(content);                                                     break;
        case 'room_assignment':  renderHotelInfo(content);    break;
    }
}

// ===== 모드 전환 =====
function switchToUser() {
    AppState.isAdmin = false;
    document.body.classList.remove('admin-mode');
    document.getElementById('user-mode-btn').classList.add('active');
    document.getElementById('admin-mode-btn').classList.remove('active');
    document.getElementById('admin-badge').classList.remove('visible');
    showToast('사용자 모드로 전환되었습니다.', 'info');
    renderMenu(AppState.currentMenu);
}

function requestAdminMode() {
    document.getElementById('pw-modal').classList.remove('hidden');
    document.getElementById('pw-input').value = '';
    document.getElementById('pw-error').style.display = 'none';
    setTimeout(() => document.getElementById('pw-input').focus(), 100);
}

function confirmAdminPw() {
    if (document.getElementById('pw-input').value === ADMIN_PW) {
        AppState.isAdmin = true;
        document.body.classList.add('admin-mode');
        document.getElementById('admin-mode-btn').classList.add('active');
        document.getElementById('user-mode-btn').classList.remove('active');
        document.getElementById('admin-badge').classList.add('visible');
        closePwModal();
        showToast('관리자 모드로 전환되었습니다.', 'success');
        renderMenu(AppState.currentMenu);
    } else {
        document.getElementById('pw-error').style.display = 'block';
        document.getElementById('pw-input').value = '';
        document.getElementById('pw-input').focus();
    }
}

function closePwModal() { document.getElementById('pw-modal').classList.add('hidden'); }

function goHome() {
    AppState.isAdmin = false;
    document.body.classList.remove('admin-mode');
    document.getElementById('main-app').style.display = 'none';
    document.body.style.overflow = 'hidden';
    document.body.style.background = '#0a0e27';
    const landing = document.getElementById('landing-page');
    landing.style.display = 'flex';
    landing.classList.remove('fade-out');
}

// ===== 편집 모달 =====
function openEditModal(title, desc, currentText, callback) {
    AppState.editCallback = callback;
    document.getElementById('edit-modal-title').textContent = title;
    document.getElementById('edit-modal-desc').textContent  = desc;
    document.getElementById('edit-textarea').value = currentText || '';
    document.getElementById('edit-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('edit-textarea').focus(), 100);
}
function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    AppState.editCallback = null;
}
function requestSaveEdit() {
    AppState._pendingEditText = document.getElementById('edit-textarea').value.trim();
    document.getElementById('edit-modal').classList.add('hidden');
    document.getElementById('confirm-modal').classList.remove('hidden');
}
function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.add('hidden');
    if (AppState.editCallback && AppState.editCallback !== saveContactsCallback) {
        document.getElementById('edit-modal').classList.remove('hidden');
    }
    AppState.editCallback = null;
    AppState._pendingEditText = null;
}
async function executeConfirmedSave() {
    document.getElementById('confirm-modal').classList.add('hidden');
    const cb   = AppState.editCallback;
    const text = AppState._pendingEditText;
    AppState.editCallback    = null;
    AppState._pendingEditText = null;
    if (cb) await cb(text);
}
function closeDeleteModal() { document.getElementById('delete-modal').classList.add('hidden'); }

// ===== 저장 헬퍼 (저장 후 캐시만 무효화) =====
async function saveContent(menu, section, title, text) {

    try {

        const existing = getCachedContent(menu, section);

        if (existing) {

            await fetch(`/tables/${TABLE_CONTENT}/${existing.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...existing,
                    content: text,
                    title
                })
            });

        } else {

            await fetch(`/tables/${TABLE_CONTENT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: crypto.randomUUID(),
                    user_type: AppState.userType,
                    menu,
                    section,
                    title,
                    content: text,
                    sort_order: 0
                })
            });

        }

        await invalidateContent();

        showToast('저장되었습니다!', 'success');

    } catch (e) {

        showToast('저장 실패: ' + e.message, 'error');

    }
}

// ===== 1. 중요 안내사항 (캐시에서 즉시) =====
function renderImportantNotice(container) {
    const prepRec  = getCachedContent('important_notice', 'prep');
    const contacts = getCachedContacts();
    const prepText = prepRec ? prepRec.content : '';

    // 중요 안내 게시물: 최신순 정렬
    const notices = (Cache.notices || [])
        .filter(n => n.user_type === AppState.userType)
        .sort((a, b) => (b.created_at_custom || b.created_at || 0) - (a.created_at_custom || a.created_at || 0));

    container.innerHTML = `
    <!-- 중요 안내 카드 (게시판형) -->
    <div class="section-card important notice-board-card">
        <div class="section-card-header">
            <div class="section-card-title">
                <i class="fas fa-exclamation-triangle"></i>중요 안내
                <span class="section-badge important-badge">IMPORTANT</span>
            </div>
            <button class="edit-btn" onclick="openNoticeWriteModal()">
                <i class="fas fa-plus"></i> 작성
            </button>
        </div>
        <div class="notice-board" id="notice-board">
            ${renderNoticeList(notices)}
        </div>
    </div>

    <!-- 기본 안내 카드 -->
    <div class="section-card">
        <div class="section-card-header">
            <div class="section-card-title">
                <i class="fas fa-info-circle"></i>기본 안내
                <span class="section-badge basic-badge">BASIC</span>
            </div>
        </div>
        <div class="basic-info-grid">
            <div class="basic-info-item">
                <div class="basic-info-item-title">
                    <i class="fas fa-phone-alt"></i> 스태프 연락처
                    <button class="edit-btn" style="margin-left:auto;" onclick="openContactEditModal()"><i class="fas fa-pen"></i> 편집</button>
                </div>
                <div id="contact-display">${renderContactTable(contacts)}</div>
            </div>
            <div class="basic-info-item compact-prep">
                <div class="basic-info-item-title">
                    <i class="fas fa-suitcase"></i> 준비물
                    <button class="edit-btn" style="margin-left:auto;" onclick="editPrepItems()"><i class="fas fa-pen"></i> 편집</button>
                </div>
                <div id="prep-display">${renderPrepListCompact(prepText)}</div>
            </div>
        </div>
    </div>

    <!-- 날씨 카드 -->
    <div class="section-card">
        <div class="section-card-header">
            <div class="section-card-title">
                <i class="fas fa-cloud-sun"></i>현재 날씨
                <span class="section-badge basic-badge">LIVE</span>
            </div>
            <button onclick="refreshWeather()" style="padding:5px 12px;border:1px solid #d0d4e8;border-radius:8px;background:white;color:#555;font-size:12px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;">
                <i class="fas fa-sync-alt"></i> 새로고침
            </button>
        </div>
        <div class="weather-cities" id="weather-container">
            ${renderWeatherPlaceholders()}
        </div>
    </div>

    <!-- 공지 작성/수정 모달 -->
    <div class="modal-overlay hidden" id="notice-write-modal">
        <div class="modal-box" style="max-width:600px;">
            <div class="modal-title" id="notice-modal-title"><i class="fas fa-pen" style="margin-right:8px;color:#FF8F00;"></i>중요 안내 작성</div>
            <div class="modal-desc" id="notice-modal-desc">작성한 내용은 최신순으로 상단에 표시됩니다.</div>
            <textarea class="modal-textarea" id="notice-textarea" placeholder="안내 내용을 입력하세요..."></textarea>
            <div class="modal-buttons">
                <button class="btn-cancel" onclick="closeNoticeWriteModal()">취소</button>
                <button class="btn-confirm" onclick="requestSaveNotice()">저장</button>
            </div>
        </div>
    </div>

    <!-- 공지 저장/수정 확인 모달 -->
    <div class="modal-overlay hidden" id="notice-confirm-modal">
        <div class="modal-box">
            <div class="confirm-icon"><i class="fas fa-pencil-alt"></i></div>
            <div class="modal-title" style="text-align:center;" id="notice-confirm-label">등록하시겠습니까?</div>
            <div class="modal-desc" style="text-align:center;" id="notice-confirm-desc">작성한 중요 안내를 등록합니다.</div>
            <div class="modal-buttons" style="justify-content:center;">
                <button class="btn-cancel" onclick="closeNoticeConfirmModal()">취소</button>
                <button class="btn-confirm" onclick="executeSaveNotice()" id="notice-confirm-action-btn">등록</button>
            </div>
        </div>
    </div>`;

    loadWeather();
}

// 공지 목록 렌더링
function renderNoticeList(notices) {
    if (!notices || notices.length === 0) {
        return '<div class="content-empty" style="padding:32px 0;">등록된 중요 안내사항이 없습니다.<br><small style="font-size:11px;">관리자 모드에서 작성 버튼을 눌러 등록하세요.</small></div>';
    }
    return notices.map((n, idx) => {
        const ts = n.created_at_custom || n.created_at || 0;
        const date = ts ? new Date(ts) : null;
        const dateStr = date
            ? `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
            : '';
        const isNew = ts && (Date.now() - ts) < 24 * 60 * 60 * 1000;
        const escapedContent = escapeHtml(n.content || '').replace(/\n/g,'<br>');
        // 수정 버튼에 전달할 원본 내용을 data 속성에 저장 (줄바꿈 보존)
        const contentForEdit = encodeURIComponent(n.content || '');
        return `
        <div class="notice-item" id="notice-item-${n.id}">
            <div class="notice-item-header">
                <div class="notice-item-meta">
                    <span class="notice-num">${notices.length - idx}</span>
                    ${isNew ? '<span class="notice-new-badge">NEW</span>' : ''}
                    ${idx === 0 ? '<span class="notice-latest-badge">최신</span>' : ''}
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span class="notice-date">${dateStr}</span>
                    <button class="notice-edit-btn admin-only-btn" onclick="openNoticeEditModal('${n.id}', decodeURIComponent('${contentForEdit}'))" title="수정">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="notice-delete-btn admin-only-btn" onclick="confirmDeleteNotice('${n.id}')" title="삭제">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="notice-item-content">${escapedContent}</div>
        </div>`;
    }).join('<div class="notice-divider"></div>');
}

// 공지 작성 모달
function openNoticeWriteModal() {
    AppState._editingNoticeId = null; // 신규 작성
    document.getElementById('notice-modal-title').textContent = '중요 안내 작성';
    document.getElementById('notice-modal-desc').textContent = '작성한 내용은 최신순으로 상단에 표시됩니다.';
    document.getElementById('notice-confirm-label').textContent = '등록하시겠습니까?';
    document.getElementById('notice-confirm-desc').textContent = '작성한 중요 안내를 등록합니다.';
    document.getElementById('notice-confirm-action-btn').textContent = '등록';
    document.getElementById('notice-textarea').value = '';
    document.getElementById('notice-write-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('notice-textarea').focus(), 100);
}
function closeNoticeWriteModal() {
    document.getElementById('notice-write-modal').classList.add('hidden');
    AppState._editingNoticeId = null;
}

// 공지 수정 모달
function openNoticeEditModal(noticeId, currentContent) {
    AppState._editingNoticeId = noticeId;
    document.getElementById('notice-modal-title').textContent = '중요 안내 수정';
    document.getElementById('notice-modal-desc').textContent = '내용을 수정하고 저장을 클릭하세요.';
    document.getElementById('notice-confirm-label').textContent = '수정하시겠습니까?';
    document.getElementById('notice-confirm-desc').textContent = '변경된 내용으로 저장됩니다.';
    document.getElementById('notice-confirm-action-btn').textContent = '수정 완료';
    document.getElementById('notice-textarea').value = currentContent;
    document.getElementById('notice-write-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('notice-textarea').focus(), 100);
}

function requestSaveNotice() {
    const text = document.getElementById('notice-textarea').value.trim();
    if (!text) { showToast('내용을 입력하세요.', 'error'); return; }
    AppState._pendingNoticeText = text;
    document.getElementById('notice-write-modal').classList.add('hidden');
    document.getElementById('notice-confirm-modal').classList.remove('hidden');
}
function closeNoticeConfirmModal() {
    document.getElementById('notice-confirm-modal').classList.add('hidden');
    document.getElementById('notice-write-modal').classList.remove('hidden');
}
async function executeSaveNotice() {
    document.getElementById('notice-confirm-modal').classList.add('hidden');

    const text = AppState._pendingNoticeText;
    const editId = AppState._editingNoticeId;

    AppState._pendingNoticeText = null;
    AppState._editingNoticeId = null;

    if (!text) return;

    try {

        if (editId) {

            const existing = (Cache.notices || []).find(n => n.id === editId);

            await fetch(`/tables/${TABLE_NOTICES}/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...existing, content: text })
            });

            showToast('수정되었습니다!', 'success');

        } else {

            const now = Date.now();

            await fetch(`/tables/${TABLE_NOTICES}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: crypto.randomUUID(),
                    user_type: AppState.userType,
                    content: text,
                    created_at_custom: now
                })
            });

            showToast('중요 안내가 등록되었습니다!', 'success');
        }

        await invalidateNotices();

        const board = document.getElementById('notice-board');

        if (board) {

            const notices = (Cache.notices || [])
                .filter(n => n.user_type === AppState.userType)
                .sort((a, b) => (b.created_at_custom || b.created_at || 0) - (a.created_at_custom || a.created_at || 0));

            board.innerHTML = renderNoticeList(notices);
        }

    } catch (e) {
        showToast('저장 실패: ' + e.message, 'error');
    }
}

// 공지 삭제
let pendingNoticeDeleteId = '';
function confirmDeleteNotice(noticeId) {
    pendingNoticeDeleteId = noticeId;
    document.getElementById('delete-modal-desc').textContent = '이 안내 게시물을 삭제하시겠습니까?';
    document.getElementById('delete-confirm-btn').onclick = executeDeleteNotice;
    document.getElementById('delete-modal').classList.remove('hidden');
}
async function executeDeleteNotice() {
    document.getElementById('delete-modal').classList.add('hidden');
    try {
        await fetch(`/tables/${TABLE_NOTICES}/${pendingNoticeDeleteId}`, { method: 'DELETE' });
        await invalidateNotices();
        showToast('삭제되었습니다.', 'success');
        const board = document.getElementById('notice-board');
        if (board) {
            const notices = (Cache.notices || [])
                .filter(n => n.user_type === AppState.userType)
                .sort((a, b) => (b.created_at_custom || b.created_at || 0) - (a.created_at_custom || a.created_at || 0));
            board.innerHTML = renderNoticeList(notices);
        }
    } catch (e) { showToast('삭제 실패: ' + e.message, 'error'); }
}

function renderContactTable(contacts) {
    if (!contacts || contacts.length === 0)
        return '<div class="content-empty">연락처가 없습니다.</div>';
    return `<table class="contact-table">
        <thead><tr><th>이름</th><th>역할</th><th>연락처</th></tr></thead>
        <tbody>${contacts.map(c => `
            <tr>
                <td>${escapeHtml(c.name||'')}</td>
                <td>${escapeHtml(c.role||'')}</td>
                <td><a href="tel:${c.phone}" style="color:#1976D2;text-decoration:none;">${escapeHtml(c.phone||'')}</a></td>
            </tr>`).join('')}
        </tbody></table>`;
}

// 준비물: 컴팩트 인라인 표시
function renderPrepListCompact(text) {
    if (!text) return '<div class="content-empty" style="font-size:12px;">준비물 목록이 없습니다.</div>';
    const items = text.split('\n').filter(t => t.trim());
    return `<ol class="prep-numbered-list">${items.map((item, i) =>
        `<li class="prep-numbered-item"><span class="prep-num">${i + 1}</span><span class="prep-text">${escapeHtml(item.trim())}</span></li>`
    ).join('')}</ol>`;
}

function renderPrepList(text) {
    if (!text) return '<div class="content-empty">준비물 목록이 없습니다.</div>';
    const items = text.split('\n').filter(t => t.trim());
    return `<div class="prep-list">${items.map(item =>
        `<div class="prep-item"><i class="fas fa-check-circle"></i> ${escapeHtml(item.trim())}</div>`
    ).join('')}</div>`;
}



function editPrepItems() {
    const rec = getCachedContent('important_notice', 'prep');
    openEditModal('준비물 편집', '준비물을 한 줄에 하나씩 입력하세요.',
        rec ? rec.content : '',
        async (text) => {
            await saveContent('important_notice', 'prep', '준비물', text);
            const el = document.getElementById('prep-display');
            if (el) el.innerHTML = renderPrepListCompact(text);
        });
}

// ===== 연락처 =====
let tempContacts = [];

function openContactEditModal() {
    tempContacts = getCachedContacts().map(c => ({ ...c }));
    renderContactEditList();
    document.getElementById('contact-modal').classList.remove('hidden');
}
function closeContactModal() { document.getElementById('contact-modal').classList.add('hidden'); }

function renderContactEditList() {
    document.getElementById('contact-edit-list').innerHTML = tempContacts.map((c, i) => `
        <div class="contact-edit-row">
            <input type="text" value="${escapeHtml(c.name||'')}"  placeholder="이름"    oninput="tempContacts[${i}].name=this.value">
            <input type="text" value="${escapeHtml(c.role||'')}"  placeholder="역할"    oninput="tempContacts[${i}].role=this.value">
            <input type="tel"  value="${escapeHtml(c.phone||'')}" placeholder="연락처"  oninput="tempContacts[${i}].phone=this.value">
            <button class="file-action-btn delete-btn" onclick="removeContactRow(${i})" style="display:flex;"><i class="fas fa-times"></i></button>
        </div>`).join('');
}
function addContactRow() {
    tempContacts.push({ name:'', role:'', phone:'', user_type: AppState.userType, sort_order: tempContacts.length });
    renderContactEditList();
}
function removeContactRow(idx) { tempContacts.splice(idx, 1); renderContactEditList(); }

async function requestSaveContacts() {
    closeContactModal();
    AppState.editCallback    = saveContactsCallback;
    AppState._pendingEditText = '';
    document.getElementById('confirm-modal').classList.remove('hidden');
}
async function saveContactsCallback() {
    try {
        const existing = (Cache.contacts || []).filter(r => r.user_type === AppState.userType);

        await Promise.all(
            existing.map(c =>
                fetch(`/tables/${TABLE_CONTACTS}/${c.id}`, { method: 'DELETE' })
            )
        );

        await Promise.all(
            tempContacts
                .filter(c => c.name || c.phone)
                .map((c, i) =>
                    fetch(`/tables/${TABLE_CONTACTS}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: crypto.randomUUID(),
                            ...c,
                            user_type: AppState.userType,
                            sort_order: i
                        })
                    })
                )
        );

        await invalidateContacts();
        showToast('연락처가 저장되었습니다!', 'success');

        const el = document.getElementById('contact-display');
        if (el) el.innerHTML = renderContactTable(getCachedContacts());

    } catch (e) {
        showToast('저장 실패: ' + e.message, 'error');
    }
}

// ===== 날씨 (캐시 30분) =====
function renderWeatherPlaceholders() {
    return ['🏯 베이징 (北京)', '🏙️ 상하이 (上海)'].map(name => `
        <div class="weather-city-card">
            <div class="weather-loading">
                <div class="loading-spinner" style="border-color:rgba(255,255,255,0.2);border-top-color:white;margin:0 auto 10px;width:18px;height:18px;"></div>
                날씨 불러오는 중...
            </div>
        </div>`).join('');
}

async function loadWeather() {
    const now = Date.now();
    if (Cache.weather && (now - Cache.weatherTime) < WEATHER_TTL) {
        document.getElementById('weather-container').innerHTML = Cache.weather;
        return;
    }
    await fetchWeather();
}

async function refreshWeather() {
    Cache.weather = null; // 강제 갱신
    const container = document.getElementById('weather-container');
    if (container) container.innerHTML = renderWeatherPlaceholders();
    await fetchWeather();
}

async function fetchWeather() {
    const cities = [
        { name: '베이징 (北京)', lat: 39.9042, lon: 116.4074, emoji: '🏯' },
        { name: '상하이 (上海)', lat: 31.2304, lon: 121.4737, emoji: '🏙️' },
    ];
    const container = document.getElementById('weather-container');
    if (!container) return;

    const htmlArr = await Promise.all(cities.map(fetchCityWeather));
    const html = htmlArr.join('');
    Cache.weather    = html;
    Cache.weatherTime = Date.now();
    container.innerHTML = html;
}

async function fetchCityWeather(city) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FShanghai&forecast_days=7`;
        const res  = await fetch(url);
        const data = await res.json();
        const cur   = data.current;
        const daily = data.daily;

        const weeklyHtml = daily.time.map((d, i) => {
            const dateObj = new Date(d);
            const m = dateObj.getMonth() + 1;
            const day = dateObj.getDate();
            const label = i === 0 ? `오늘(${m}/${day})` : i === 1 ? `내일(${m}/${day})` : `${m}/${day}`;
            return `<div class="weather-day-item">
                <div class="weather-day-label">${label}</div>
                <div class="weather-day-icon">${weatherCodeToIcon(daily.weather_code[i])}</div>
                <div class="weather-day-temp">${Math.round(daily.temperature_2m_min[i])}° / ${Math.round(daily.temperature_2m_max[i])}°</div>
            </div>`;
        }).join('');

        return `<div class="weather-city-card">
            <div class="weather-city-name">${city.emoji} ${city.name}</div>
            <div class="weather-today">
                <div class="weather-icon">${weatherCodeToIcon(cur.weather_code)}</div>
                <div>
                    <div class="weather-temp-main">${Math.round(cur.temperature_2m)}°C</div>
                    <div class="weather-desc">${weatherCodeToDesc(cur.weather_code)}</div>
                    <div class="weather-range">습도 ${cur.relative_humidity_2m}% · 바람 ${Math.round(cur.wind_speed_10m)}km/h</div>
                </div>
            </div>
            <div class="weather-weekly">${weeklyHtml}</div>
        </div>`;
    } catch {
        return `<div class="weather-city-card">
            <div class="weather-city-name">${city.emoji} ${city.name}</div>
            <div class="weather-loading">날씨 정보를 불러올 수 없습니다.</div>
        </div>`;
    }
}

function weatherCodeToIcon(c) {
    if (c===0) return '☀️'; if (c<=2) return '🌤️'; if (c===3) return '☁️';
    if (c<=49) return '🌫️'; if (c<=59) return '🌦️'; if (c<=65) return '🌧️';
    if (c<=69) return '🌨️'; if (c<=77) return '🌨️'; if (c<=82) return '🌧️';
    if (c<=94) return '🌩️'; return '⛈️';
}
function weatherCodeToDesc(c) {
    if (c===0) return '맑음'; if (c<=2) return '구름 조금'; if (c===3) return '흐림';
    if (c<=49) return '안개'; if (c<=59) return '이슬비'; if (c<=65) return '비';
    if (c<=69) return '눈비'; if (c<=77) return '눈'; if (c<=82) return '소나기';
    if (c<=94) return '뇌우'; return '심한 뇌우';
}

// ===== 2. 방문기업 정보 =====
function renderCompanyInfo(container) {
    const rec  = getCachedContent('company_info', 'main');
    const text = rec ? rec.content : '';
    container.innerHTML = `
    <div class="section-card">
        <div class="section-card-header">
            <div class="section-card-title"><i class="fas fa-building"></i>방문기업 정보</div>
            <button class="edit-btn" onclick="editCompanyInfo()"><i class="fas fa-pen"></i> 편집</button>
        </div>
        <div class="content-display" id="company-info-text">
            ${text ? escapeHtml(text).replace(/\n/g,'<br>') : '<span class="content-empty">방문기업 정보를 입력하세요. (관리자 모드에서 편집 가능)</span>'}
        </div>
    </div>`;
}

function editCompanyInfo() {
    const rec = getCachedContent('company_info', 'main');
    openEditModal('방문기업 정보 편집', '방문기업에 대한 정보를 입력하세요.',
        rec ? rec.content : '',
        async (text) => {
            await saveContent('company_info', 'main', '방문기업 정보', text);
            const el = document.getElementById('company-info-text');
            if (el) el.innerHTML = text ? escapeHtml(text).replace(/\n/g,'<br>') : '<span class="content-empty">방문기업 정보를 입력하세요.</span>';
        });
}

// ===== 3. 학습자료 =====
function renderLearning(container) {
    const files    = getCachedFiles('learning');
    const ytFiles  = files.filter(f => f.file_type === 'youtube');
    const docFiles = files.filter(f => f.file_type !== 'youtube');

    container.innerHTML = `
    <div class="section-card">
        <div class="section-card-header">
            <div class="section-card-title"><i class="fas fa-file-alt"></i>문서 자료</div>
        </div>
        <div class="upload-area" onclick="triggerFileUpload('learning')">
            <i class="fas fa-cloud-upload-alt"></i>
            <p>클릭하여 파일 업로드<br>또는 파일을 여기에 드래그하세요</p>
            <p class="upload-types">PDF · 이미지(JPG, PNG) · 엑셀(XLS, XLSX) · 워드(DOC, DOCX)</p>
        </div>
        <div class="file-list" id="doc-file-list">
            ${docFiles.length === 0
                ? '<div class="empty-state"><i class="fas fa-folder-open"></i><p>업로드된 문서가 없습니다.</p></div>'
                : docFiles.map(renderFileItem).join('')}
        </div>
    </div>

    <div class="section-card">
        <div class="section-card-header">
            <div class="section-card-title"><i class="fab fa-youtube" style="color:#FF0000;"></i>영상 자료 (YouTube)</div>
        </div>
        <div class="youtube-add-form">
            <input type="text" id="yt-url-input" placeholder="YouTube URL을 입력하세요 (예: https://youtu.be/xxxxx)">
            <button onclick="addYoutubeLink()"><i class="fas fa-plus"></i> 추가</button>
        </div>
        <div id="yt-list">
            ${ytFiles.length === 0
                ? '<div class="empty-state"><i class="fab fa-youtube"></i><p>등록된 영상이 없습니다.</p></div>'
                : `<div class="youtube-grid">${ytFiles.map(renderYoutubeCard).join('')}</div>`}
        </div>
    </div>`;
    setupDragDrop('learning');
}

// ===== 4. 참가자명단 =====
function renderParticipants(container) {
    const list = (Cache.participants || [])
        .filter(p => p.user_type === AppState.userType)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    // 소속별 그룹핑
    const groups = {};
    list.forEach(p => {
        const key = p.company || '기타';
        if (!groups[key]) groups[key] = [];
        groups[key].push(p);
    });

    const totalCount = list.length;

    container.innerHTML = `
    <div class="section-card">
        <div class="section-card-header">
            <div class="section-card-title">
                <i class="fas fa-users"></i>참가자명단
                ${totalCount > 0 ? `<span class="participant-count-badge">${totalCount}명</span>` : ''}
            </div>
            <button class="edit-btn admin-only-btn" onclick="openParticipantAddModal()">
                <i class="fas fa-user-plus"></i> 참가자 추가
            </button>
        </div>

        ${totalCount === 0
            ? `<div class="empty-state"><i class="fas fa-users"></i><p>등록된 참가자가 없습니다.<br><small>관리자 모드에서 참가자를 추가하세요.</small></p></div>`
            : Object.entries(groups).map(([company, members]) => `
                <div class="participant-group">
                    <div class="participant-group-header">
                        <i class="fas fa-building"></i>
                        <span>${escapeHtml(company)}</span>
                        <span class="participant-group-count">${members.length}명</span>
                    </div>
                    <div class="participant-cards">
                        ${members.map(p => renderParticipantCard(p)).join('')}
                    </div>
                </div>`).join('')
        }
    </div>

    <!-- 참가자 추가/수정 모달 -->
    <div class="modal-overlay hidden" id="participant-modal">
        <div class="modal-box" style="max-width:480px;">
            <div class="modal-title" id="participant-modal-title">
                <i class="fas fa-user-plus" style="margin-right:8px;color:#1a1f4e;"></i>참가자 추가
            </div>
            <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;">
                <div>
                    <label class="participant-form-label">소속 계열사 *</label>
                    <input type="text" id="p-company" class="modal-input" placeholder="예) LG전자, LG디스플레이" style="margin:0;">
                </div>
                <div>
                    <label class="participant-form-label">이름 *</label>
                    <input type="text" id="p-name" class="modal-input" placeholder="홍길동" style="margin:0;">
                </div>
                <div>
                    <label class="participant-form-label">직위</label>
                    <input type="text" id="p-position" class="modal-input" placeholder="예) 부장, 차장, 과장, 대리" style="margin:0;">
                </div>
                <div>
                    <label class="participant-form-label">직책</label>
                    <input type="text" id="p-role" class="modal-input" placeholder="예) 팀장, 파트장, 담당" style="margin:0;">
                </div>
            </div>
            <div class="modal-buttons">
                <button class="btn-cancel" onclick="closeParticipantModal()">취소</button>
                <button class="btn-confirm" onclick="requestSaveParticipant()" id="participant-save-btn">저장</button>
            </div>
        </div>
    </div>

    <!-- 참가자 저장 확인 모달 -->
    <div class="modal-overlay hidden" id="participant-confirm-modal">
        <div class="modal-box">
            <div class="confirm-icon"><i class="fas fa-user-check"></i></div>
            <div class="modal-title" style="text-align:center;" id="participant-confirm-title">저장하시겠습니까?</div>
            <div class="modal-desc"  style="text-align:center;" id="participant-confirm-desc">참가자 정보를 저장합니다.</div>
            <div class="modal-buttons" style="justify-content:center;">
                <button class="btn-cancel" onclick="closeParticipantConfirmModal()">취소</button>
                <button class="btn-confirm" onclick="executeSaveParticipant()">저장</button>
            </div>
        </div>
    </div>`;
}

function renderParticipantCard(p) {
    const initials = (p.name || '?').charAt(0);
    const companyColors = getCompanyColor(p.company || '');
    return `
    <div class="participant-card" id="pcard-${p.id}">
        <div class="participant-avatar" style="background:${companyColors.bg};color:${companyColors.text};">
            ${initials}
        </div>
        <div class="participant-info">
            <div class="participant-name">${escapeHtml(p.name || '')}</div>
            <div class="participant-tags">
                ${p.position ? `<span class="p-tag position-tag">${escapeHtml(p.position)}</span>` : ''}
                ${p.role     ? `<span class="p-tag role-tag">${escapeHtml(p.role)}</span>`         : ''}
            </div>
        </div>
        <div class="participant-card-actions admin-only-btn" style="display:none;">
            <button class="p-action-btn edit" onclick="openParticipantEditModal('${p.id}')" title="수정">
                <i class="fas fa-pen"></i>
            </button>
            <button class="p-action-btn delete" onclick="confirmDeleteParticipant('${p.id}','${escapeHtml(p.name||'')}')" title="삭제">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    </div>`;
}

// 소속별 색상 (해시 기반으로 일관된 색상 배정)
function getCompanyColor(company) {
    const palettes = [
        { bg:'#e8eaf6', text:'#3949ab' },
        { bg:'#e3f2fd', text:'#1565c0' },
        { bg:'#e8f5e9', text:'#2e7d32' },
        { bg:'#fff3e0', text:'#e65100' },
        { bg:'#fce4ec', text:'#c62828' },
        { bg:'#f3e5f5', text:'#6a1b9a' },
        { bg:'#e0f2f1', text:'#00695c' },
        { bg:'#fff8e1', text:'#f57f17' },
    ];
    let hash = 0;
    for (let i = 0; i < company.length; i++) hash = (hash * 31 + company.charCodeAt(i)) & 0xffff;
    return palettes[hash % palettes.length];
}

// 참가자 추가 모달
let _editingParticipantId = null;
let _pendingParticipantData = null;

function openParticipantAddModal() {
    _editingParticipantId = null;
    document.getElementById('participant-modal-title').innerHTML =
        '<i class="fas fa-user-plus" style="margin-right:8px;color:#1a1f4e;"></i>참가자 추가';
    document.getElementById('p-company').value  = '';
    document.getElementById('p-name').value     = '';
    document.getElementById('p-position').value = '';
    document.getElementById('p-role').value     = '';
    document.getElementById('participant-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('p-company').focus(), 100);
}

function openParticipantEditModal(id) {
    const p = (Cache.participants || []).find(x => x.id === id);
    if (!p) return;
    _editingParticipantId = id;
    document.getElementById('participant-modal-title').innerHTML =
        '<i class="fas fa-user-edit" style="margin-right:8px;color:#1a1f4e;"></i>참가자 수정';
    document.getElementById('p-company').value  = p.company  || '';
    document.getElementById('p-name').value     = p.name     || '';
    document.getElementById('p-position').value = p.position || '';
    document.getElementById('p-role').value     = p.role     || '';
    document.getElementById('participant-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('p-name').focus(), 100);
}

function closeParticipantModal() {
    document.getElementById('participant-modal').classList.add('hidden');
    _editingParticipantId = null;
}

function requestSaveParticipant() {
    const company  = document.getElementById('p-company').value.trim();
    const name     = document.getElementById('p-name').value.trim();
    const position = document.getElementById('p-position').value.trim();
    const role     = document.getElementById('p-role').value.trim();
    if (!company) { showToast('소속 계열사를 입력하세요.', 'error'); return; }
    if (!name)    { showToast('이름을 입력하세요.', 'error'); return; }
    _pendingParticipantData = { company, name, position, role };
    document.getElementById('participant-modal').classList.add('hidden');
    document.getElementById('participant-confirm-title').textContent =
        _editingParticipantId ? '수정하시겠습니까?' : '등록하시겠습니까?';
    document.getElementById('participant-confirm-desc').textContent =
        _editingParticipantId ? '참가자 정보를 수정합니다.' : '참가자를 명단에 추가합니다.';
    document.getElementById('participant-confirm-modal').classList.remove('hidden');
}

function closeParticipantConfirmModal() {
    document.getElementById('participant-confirm-modal').classList.add('hidden');
    document.getElementById('participant-modal').classList.remove('hidden');
}

async function executeSaveParticipant() {
    document.getElementById('participant-confirm-modal').classList.add('hidden');
    const data = _pendingParticipantData;
    const editId = _editingParticipantId;
    _pendingParticipantData = null;
    _editingParticipantId  = null;
    if (!data) return;
    try {
        if (editId) {
            const existing = (Cache.participants || []).find(p => p.id === editId);
            await fetch(`/tables/${TABLE_PARTICIPANTS}/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...existing, ...data })
            });
            showToast('수정되었습니다!', 'success');
        } else {
            await fetch(`/tables/${TABLE_PARTICIPANTS}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: crypto.randomUUID(),
                    user_type: AppState.userType,
                    ...data,
                    sort_order: Date.now()
                })
            });
            showToast('참가자가 추가되었습니다!', 'success');
        }
        await invalidateParticipants();
        const content = document.getElementById('menu-content');
        if (content) renderParticipants(content);
    } catch (e) { showToast('저장 실패: ' + e.message, 'error'); }
}

// 참가자 삭제
let _pendingDeleteParticipantId = '';
function confirmDeleteParticipant(id, name) {
    _pendingDeleteParticipantId = id;
    document.getElementById('delete-modal-desc').textContent = `"${name}" 참가자를 삭제하시겠습니까?`;
    document.getElementById('delete-confirm-btn').onclick = executeDeleteParticipant;
    document.getElementById('delete-modal').classList.remove('hidden');
}
async function executeDeleteParticipant() {
    document.getElementById('delete-modal').classList.add('hidden');
    try {
        await fetch(`/tables/${TABLE_PARTICIPANTS}/${_pendingDeleteParticipantId}`, { method: 'DELETE' });
        await invalidateParticipants();
        showToast('삭제되었습니다.', 'success');
        const content = document.getElementById('menu-content');
        if (content) renderParticipants(content);
    } catch (e) { showToast('삭제 실패: ' + e.message, 'error'); }
}

// ===== 5. 일정표 =====
function renderSchedule(container) {
    // 중복 day_num 제거: 같은 user_type + day_num 중 가장 최근(created_at 큰) 것만 사용
    const allDays = (Cache.schedule || []).filter(d => d.user_type === AppState.userType);
    const dayMap = {};
    allDays.forEach(d => {
        const key = d.day_num || d.sort_order || d.date_label;
        if (!dayMap[key] || (d.created_at || 0) > (dayMap[key].created_at || 0)) {
            dayMap[key] = d;
        }
    });
    const days = Object.values(dayMap)
        .sort((a, b) => (a.sort_order || a.day_num || 0) - (b.sort_order || b.day_num || 0));

    const totalDays  = days.length;
    const typeLabel  = AppState.userType === 'executive' ? '책임자급 (5박6일 북경+상해)' : '실무자급 (4박5일 상해)';
    const colorClass = AppState.userType === 'executive' ? 'exec' : 'staff';

    container.innerHTML = `
    <div class="section-card">
        <div class="section-card-header">
            <div class="section-card-title">
                <i class="fas fa-calendar-alt"></i>일정표
                <span class="schedule-type-badge ${colorClass}">${typeLabel}</span>
            </div>
            <a href="schedule-print.html" target="_blank" class="pdf-export-btn">
                <i class="fas fa-file-pdf"></i> PDF 저장
            </a>
        </div>
        ${totalDays === 0
            ? `<div class="empty-state"><i class="fas fa-calendar-alt"></i><p>등록된 일정이 없습니다.</p></div>`
            : `<div class="schedule-timeline">${days.map((d, idx) => renderScheduleDay(d, idx, totalDays)).join('')}</div>`
        }
    </div>`;
}

// 팀 태그 없는 일반 슬롯 렌더링 헬퍼
function renderSingleSlot(slot, color) {
    const raw      = slot.detail || '';
    const isPoint  = raw.startsWith('▶');
    const hasBullet= raw.startsWith('•');
    let text = raw.replace(/^▶\s*/, '').replace(/^•\s*/, '');
    const parts    = text.split(/(※[^\n]*)/g);
    const mainText = parts[0].trim();
    const memoText = parts.slice(1).join('').trim();
    return `
    <div class="sched-slot ${isPoint ? 'slot-point' : 'slot-normal'}">
        <div class="sched-slot-time">
            ${slot.time ? `<span class="slot-time-badge" style="background:${color}15;color:${color};border-color:${color}40;">${escapeHtml(slot.time)}</span>` : '<span class="slot-time-empty"></span>'}
        </div>
        <div class="sched-slot-body">
            ${isPoint ? `<span class="slot-arrow" style="color:${color};">▶</span>` : (hasBullet ? '<span class="slot-dot">•</span>' : '<span class="slot-line">–</span>')}
            <div class="slot-detail-wrap">
                <span class="slot-detail ${isPoint ? 'slot-detail-point' : ''}">${escapeHtml(mainText)}</span>
                ${memoText ? `<span class="slot-memo">${escapeHtml(memoText)}</span>` : ''}
            </div>
        </div>
    </div>`;
}

function renderScheduleDay(d, idx, total) {
    const isLast = idx === total - 1;

    // 색상 팔레트 (일차별)
    const dayColors = ['#1a1f4e','#1565c0','#1976d2','#0288d1','#0097a7','#00796b'];
    const color = dayColors[Math.min(idx, dayColors.length - 1)];

    // time_slots JSON 파싱
    let slots = [];
    try {
        slots = JSON.parse(d.time_slots || '[]');
    } catch(e) { slots = []; }

    // 식사 뱃지
    const meals = [];
    if (d.meal_morning) meals.push({ label:'조', val: d.meal_morning, cls:'morning' });
    if (d.meal_lunch)   meals.push({ label:'중', val: d.meal_lunch,   cls:'lunch'   });
    if (d.meal_dinner)  meals.push({ label:'석', val: d.meal_dinner,  cls:'dinner'  });

    // 시간별 세부일정 렌더링
    // 규칙: [팀명] 태그가 있는 슬롯은 같은 팀명끼리 하나의 박스로 묶음
    //       비팀 슬롯은 원래 순서 그대로 개별 렌더
    //       DB 입력 순서를 기준으로 "팀 박스의 첫 등장 위치"에 박스 삽입
    const teamColorMap = {
        '인천공항 출발팀': { bg:'#e3f2fd', color:'#1565c0', border:'#90caf9', icon:'✈' },
        '김포공항 출발팀': { bg:'#e8f5e9', color:'#2e7d32', border:'#a5d6a7', icon:'✈' },
        '인천공항 도착팀': { bg:'#e3f2fd', color:'#1565c0', border:'#90caf9', icon:'🛬' },
        '김포공항 도착팀': { bg:'#e8f5e9', color:'#2e7d32', border:'#a5d6a7', icon:'🛬' },
    };

    // 1단계: 팀별 슬롯 수집 (입력 순서대로)
    const teamSlotMap = {};   // { teamLabel: [slot, ...] }
    const teamOrderArr = [];  // 팀 첫 등장 순서

    slots.forEach(slot => {
        const m = (slot.detail || '').match(/^\[([^\]]+)\]/);
        if (m) {
            const tl = m[1];
            if (!teamSlotMap[tl]) { teamSlotMap[tl] = []; teamOrderArr.push(tl); }
            teamSlotMap[tl].push(slot);
        }
    });

    // 2단계: 렌더 아이템 목록 생성 (비팀슬롯 + 팀박스, 순서 보존)
    // 각 팀 박스는 해당 팀의 "첫 번째 슬롯이 등장하는 위치"에 삽입
    const seenTeams = new Set();
    const renderQueue = []; // { type: 'single'|'teamBox', ... }

    slots.forEach(slot => {
        const m = (slot.detail || '').match(/^\[([^\]]+)\]/);
        if (!m) {
            renderQueue.push({ type: 'single', slot });
        } else {
            const tl = m[1];
            if (!seenTeams.has(tl)) {
                seenTeams.add(tl);
                renderQueue.push({ type: 'teamBox', teamLabel: tl });
            }
            // 나머지 같은 팀 슬롯은 teamBox 내부에서 처리 → 여기선 skip
        }
    });

    // 3단계: renderQueue를 HTML로 변환
    const renderTeamBox = (teamLabel) => {
        const tc       = teamColorMap[teamLabel] || { bg:'#f5f5f5', color:'#555', border:'#ddd', icon:'✈' };
        const tSlots   = teamSlotMap[teamLabel] || [];
        const rowsHtml = tSlots.map(s => {
            let text = (s.detail || '').replace(/^\[[^\]]+\]\s*/, '');
            // 비행편 강조: "OZ 331 ·" 또는 "OZ 331 •"
            text = text.replace(/^((?:OZ|KE|CA)\s*\d+)\s*[·•]\s*/, (_, f) =>
                `<b class="slot-flight">${escapeHtml(f)}</b> · `
            );
            const ps   = text.split(/(※[^\n]*)/g);
            const main = ps[0].trim();
            const memo = ps.slice(1).join('').trim();
            return `
            <div class="team-slot-row">
                <span class="team-slot-time" style="color:${tc.color};">${s.time ? escapeHtml(s.time) : ''}</span>
                <span class="team-slot-detail">${main}${memo ? `<span class="slot-memo"> ${escapeHtml(memo)}</span>` : ''}</span>
            </div>`;
        }).join('');
        return `
        <div class="sched-team-group" style="border-color:${tc.border};">
            <div class="sched-team-header" style="background:${tc.bg};color:${tc.color};border-bottom-color:${tc.border};">
                <span class="team-header-icon">${tc.icon}</span>
                <span class="team-header-label">${escapeHtml(teamLabel)}</span>
            </div>
            <div class="sched-team-rows">${rowsHtml}</div>
        </div>`;
    };

    let slotRows = renderQueue.map(item =>
        item.type === 'single'
            ? renderSingleSlot(item.slot, color)
            : renderTeamBox(item.teamLabel)
    ).join('');

    return `
    <div class="sched-day-row ${isLast ? 'last' : ''}">
        <!-- 왼쪽: 날짜 컬럼 (위: 날짜뱃지 → 선 → 아래: 동그라미) -->
        <div class="sched-day-col">
            <div class="sched-day-badge" style="background:${color};">
                <div class="sched-day-num">${escapeHtml(d.day_label || '')}</div>
                <div class="sched-day-date">${escapeHtml(d.date_label || '')}</div>
            </div>
            ${!isLast ? `<div class="sched-line"></div>` : '<div class="sched-line-stub"></div>'}
            <div class="sched-dot" style="background:${color};box-shadow:0 0 0 3px ${color}30;"></div>
        </div>

        <!-- 오른쪽: 내용 카드 -->
        <div class="sched-content-card" style="border-top:3px solid ${color};">
            <!-- 헤더: 지역 + 교통편 -->
            <div class="sched-card-header">
                <div class="sched-region">
                    <i class="fas fa-map-marker-alt" style="color:${color};"></i>
                    <strong>${escapeHtml(d.region || '')}</strong>
                </div>
                ${d.transport ? (() => {
                    const t = d.transport;
                    const icon = t.includes('열차') || t.includes('KTX') || t.includes('고속') ? 'fa-train'
                               : t.includes('버스') ? 'fa-bus'
                               : 'fa-plane';
                    return `<div class="sched-transport" style="background:${color}15;color:${color};border-color:${color}30;"><i class="fas ${icon}"></i>${escapeHtml(t)}</div>`;
                })() : ''}
            </div>
            ${d.notes ? `
            <div class="sched-summary">
                <i class="fas fa-sticky-note"></i>${escapeHtml(d.notes)}
            </div>` : ''}

            <!-- 시간별 세부일정 -->
            <div class="sched-slots">${slotRows}</div>

            <!-- 하단: 식사 + 호텔 -->
            <div class="sched-footer">
                ${meals.length > 0 ? `
                <div class="sched-meals">
                    <i class="fas fa-utensils"></i>
                    ${meals.map(m => `<span class="meal-chip meal-${m.cls}"><b>${m.label}</b> ${escapeHtml(m.val)}</span>`).join('')}
                </div>` : ''}
                ${d.hotel ? `
                <div class="sched-hotel">
                    <i class="fas fa-bed"></i>${escapeHtml(d.hotel)}
                </div>` : ''}
            </div>
        </div>
    </div>`;
}

// ===== 6·7. 파일 섹션 =====
function renderFileSection(container, menu, title, icon) {
    const files = getCachedFiles(menu);
    container.innerHTML = `
    <div class="section-card">
        <div class="section-card-header">
            <div class="section-card-title"><i class="fas ${icon}"></i>${escapeHtml(title)}</div>
        </div>
        <div class="upload-area" onclick="triggerFileUpload('${menu}')">
            <i class="fas fa-cloud-upload-alt"></i>
            <p>클릭하여 파일 업로드<br>또는 파일을 여기에 드래그하세요</p>
            <p class="upload-types">PDF · 이미지(JPG, PNG) · 엑셀(XLS, XLSX) · 워드(DOC, DOCX)</p>
        </div>
        <div class="file-list" id="file-list-${menu}">
            ${files.length === 0
                ? `<div class="empty-state"><i class="fas ${icon}"></i><p>업로드된 파일이 없습니다.<br><small>관리자 모드에서 파일을 업로드하세요.</small></p></div>`
                : files.map(renderFileItem).join('')}
        </div>
    </div>`;
    setupDragDrop(menu);
}

// ===== 파일 렌더링 =====
function renderFileItem(f) {
    const iconCls = { pdf:'pdf', image:'image', excel:'excel', word:'word' }[f.file_type] || 'default';
    const iconEl  = { pdf:'<i class="fas fa-file-pdf"></i>', image:'<i class="fas fa-file-image"></i>',
                      excel:'<i class="fas fa-file-excel"></i>', word:'<i class="fas fa-file-word"></i>' }[f.file_type]
                   || '<i class="fas fa-file"></i>';
    return `<div class="file-item" id="file-${f.id}">
        <div class="file-icon ${iconCls}">${iconEl}</div>
        <div class="file-info">
            <div class="file-name">${escapeHtml(f.file_name)}</div>
            <div class="file-meta">${(f.file_type||'').toUpperCase()} · ${f.file_size||''}</div>
        </div>
        <div class="file-actions">
            <button class="file-action-btn" onclick="downloadFile('${f.id}')" title="다운로드"><i class="fas fa-download"></i></button>
            ${f.file_type==='image' ? `<button class="file-action-btn" onclick="previewImageById('${f.id}')" title="미리보기"><i class="fas fa-eye"></i></button>` : ''}
            <button class="file-action-btn delete-btn admin-only-btn" onclick="confirmDeleteFile('${f.id}','${escapeHtml(f.file_name)}')" title="삭제"><i class="fas fa-trash"></i></button>
        </div>
    </div>`;
}

function renderYoutubeCard(f) {
    const ytId = extractYtId(f.file_data);
    const thumb = f.thumbnail_url || `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
    return `<div class="youtube-card" style="position:relative;" id="yt-${f.id}">
        <img class="youtube-thumb" src="${thumb}" alt="${escapeHtml(f.file_name)}"
             onerror="this.src='https://img.youtube.com/vi/${ytId}/hqdefault.jpg'">
        <div class="youtube-play-overlay" onclick="openYoutube('${f.file_data}')">
            <div class="youtube-play-btn"><i class="fas fa-play" style="margin-left:3px;"></i></div>
        </div>
        <div class="youtube-title">${escapeHtml(f.file_name)}</div>
        <button class="file-action-btn delete-btn admin-only-btn"
                onclick="confirmDeleteFile('${f.id}','${escapeHtml(f.file_name)}')"
                style="position:absolute;top:6px;right:6px;background:rgba(0,0,0,0.6);border-color:transparent;color:white;display:none;">
            <i class="fas fa-times"></i>
        </button>
    </div>`;
}

// ===== 파일 업로드 =====
let currentUploadMenu = '';

function triggerFileUpload(menu) {
    if (!AppState.isAdmin) return;
    currentUploadMenu = menu;
    const fi = document.getElementById('file-input');
    fi.value  = '';
    fi.accept = '.pdf,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.doc,.docx';
    fi.click();
}

function setupDragDrop(menu) {
    document.querySelectorAll('.upload-area').forEach(area => {
        area.ondragover  = (e) => { e.preventDefault(); area.style.borderColor = '#3949ab'; };
        area.ondragleave = ()  => { area.style.borderColor = '#c5cae9'; };
        area.ondrop      = (e) => {
            e.preventDefault(); area.style.borderColor = '#c5cae9';
            if (AppState.isAdmin && e.dataTransfer.files[0]) processFileUpload(e.dataTransfer.files[0], menu);
        };
    });
}

async function handleFileUpload(e) {
    if (e.target.files[0]) await processFileUpload(e.target.files[0], currentUploadMenu);
}

async function processFileUpload(file, menu) {
    if (file.size > 10 * 1024 * 1024) { showToast('파일 크기는 10MB 이하만 업로드 가능합니다.', 'error'); return; }
    showToast('파일 업로드 중...', 'info');
    try {
        const base64 = await fileToBase64(file);
        await fetch(`/tables/${TABLE_FILES}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_type: AppState.userType, menu,
                file_name: file.name, file_type: getFileType(file.name),
                file_data: base64, file_size: formatFileSize(file.size),
                thumbnail_url: '', sort_order: Date.now()
            })
        });
        await invalidateFiles();
        showToast(`"${file.name}" 업로드 완료!`, 'success');
        renderMenu(menu);
    } catch (e) { showToast('업로드 실패: ' + e.message, 'error'); }
}

// ===== 유튜브 =====
async function addYoutubeLink() {
    const input = document.getElementById('yt-url-input');
    const url   = input?.value?.trim();
    if (!url) { showToast('YouTube URL을 입력하세요.', 'error'); return; }
    const ytId = extractYtId(url);
    if (!ytId) { showToast('유효한 YouTube URL이 아닙니다.', 'error'); return; }
    showToast('YouTube 링크 추가 중...', 'info');
    try {
        const title = await fetchYtTitle(ytId);
        await fetch(`/tables/${TABLE_FILES}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_type: AppState.userType, menu: 'learning',
                file_name: title || url, file_type: 'youtube',
                file_data: url, file_size: '',
                thumbnail_url: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
                sort_order: Date.now()
            })
        });
        if (input) input.value = '';
        await invalidateFiles();
        showToast('YouTube 영상이 추가되었습니다!', 'success');
        renderMenu('learning');
    } catch (e) { showToast('추가 실패: ' + e.message, 'error'); }
}

async function fetchYtTitle(ytId) {
    try {
        const res  = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${ytId}`);
        const data = await res.json();
        return data.title || '';
    } catch { return ''; }
}

function extractYtId(url) {
    if (!url) return '';
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : '';
}

function openYoutube(url) {
    const ytId = extractYtId(url);
    if (!ytId) return;
    document.getElementById('yt-iframe').src = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
    document.getElementById('yt-modal').classList.remove('hidden');
}
function closeYtModal() {
    document.getElementById('yt-modal').classList.add('hidden');
    document.getElementById('yt-iframe').src = '';
}

// ===== 파일 다운로드/미리보기 =====
function getFileData(fileId) {
    // 1순위: 메모리 캐시, 2순위: localStorage
    const f = (Cache.files || []).find(f => f.id === fileId);
    if (f && f.file_data) return { meta: f, data: f.file_data };
    const lsData = lsLoadFileData(fileId);
    if (f && lsData) return { meta: f, data: lsData };
    return null;
}

function downloadFile(fileId) {
    const result = getFileData(fileId);
    if (!result) { showToast('파일 데이터를 찾을 수 없습니다.', 'error'); return; }
    const link = document.createElement('a');
    link.href     = result.data;
    link.download = result.meta.file_name;
    link.click();
}

function previewImageById(fileId) {
    const result = getFileData(fileId);
    if (!result) return;
    document.getElementById('img-modal-img').src = result.data;
    document.getElementById('img-modal').classList.remove('hidden');
}
function closeImgModal() { document.getElementById('img-modal').classList.add('hidden'); }

// ===== 파일 삭제 =====
let pendingDeleteId = '';
function confirmDeleteFile(fileId, fileName) {
    pendingDeleteId = fileId;
    document.getElementById('delete-modal-desc').textContent = `"${fileName}" 파일을 삭제하시겠습니까?`;
    document.getElementById('delete-confirm-btn').onclick = executeDeleteFile;
    document.getElementById('delete-modal').classList.remove('hidden');
}
async function executeDeleteFile() {
    document.getElementById('delete-modal').classList.add('hidden');
    try {
        await fetch(`/tables/${TABLE_FILES}/${pendingDeleteId}`, { method: 'DELETE' });
        lsRemoveFileData(pendingDeleteId); // localStorage file_data도 삭제
        await invalidateFiles();
        showToast('파일이 삭제되었습니다.', 'success');
        renderMenu(AppState.currentMenu);
    } catch (e) { showToast('삭제 실패: ' + e.message, 'error'); }
}

// ===== 유틸리티 =====
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function getFileType(name) {
    const ext = name.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['jpg','jpeg','png','gif','webp'].includes(ext)) return 'image';
    if (['xls','xlsx'].includes(ext)) return 'excel';
    if (['doc','docx'].includes(ext)) return 'word';
    return 'default';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/1024/1024).toFixed(1) + ' MB';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
              .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success:'fa-check-circle', error:'fa-times-circle', info:'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${icons[type]||'fa-info-circle'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function renderHotelInfo(container) {

container.innerHTML = `
<div class="section-card">

<div class="section-card-header">
<div class="section-card-title">
<i class="fas fa-hotel"></i>호텔 정보
</div>
</div>

<div style="margin-bottom:40px">

<h3>3/10 ~ 3/11</h3>
<h2>Beijing Kun Tai Hotel</h2>

<img src="https://images.unsplash.com/photo-1566073771259-6a8506099945"
style="width:100%;border-radius:12px;margin:15px 0;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

<p>📍 Chaoyang District, Beijing</p>

<iframe
src="https://maps.google.com/maps?q=Beijing%20Kun%20Tai%20Hotel&t=&z=15&ie=UTF8&iwloc=&output=embed"
style="width:100%;height:250px;border:0;border-radius:10px;">
</iframe>

</div>

<div>

<h3>3/12 ~ 3/14</h3>
<h2>Grand Metropark Hotel</h2>

<img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"
style="width:100%;border-radius:12px;margin:15px 0;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

<p>📍 Beijing 중심지</p>

<iframe
src="https://maps.google.com/maps?q=Grand%20Metropark%20Hotel%20Beijing&t=&z=15&ie=UTF8&iwloc=&output=embed"
style="width:100%;height:250px;border:0;border-radius:10px;">
</iframe>

</div>

</div>
`;
}
