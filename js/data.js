/**
 * AWE 2026 참관 안내 앱 - 완전 정적 데이터 (하드코딩)
 * 서버 DB 완전 독립 – 배포 환경에서도 동일하게 표시됨
 * 데이터 수정 시 이 파일만 수정 후 재배포하세요.
 */

// ===== 공지사항 =====
const STATIC_NOTICES = [
  {
    id: '2b16f1b8-21d9-4854-aafe-7212f9bd424c',
    user_type: 'executive',
    content: '[AWE 참관 등록 - 여행사 대행(인증번호 요청) 안내]\n- 이메일 인증이 필요하여, 여행사에서 인증번호를 요청드릴 예정입니다.\n여행사에서 연락을 드리면, 그룹웨어로 발송되는 인증번호를 말씀부탁드립니다.',
    created_at_custom: 1772094209428,
    created_at: 1772094211054,
  },
  {
    id: '3167673d-cae1-4cdb-b603-482ca45e7d73',
    user_type: 'executive',
    content: '[사전 특강 필참 안내]\n- 일시 : 3월 9일(월) 오후 2시 ~ 5시\n- 장소 : 수산빌딩 지하 1층 대강당 (서울 강남구 밤고개로5길 13 수산빌딩)\n   ※ 사전특강 관련 자료는 "학습자료"메뉴에서 확인하실 수 있습니다.',
    created_at_custom: 1772093074934,
    created_at: 1772093075669,
  },
  {
    id: '3a48f697-c2fd-4476-9fc0-e7b24a05b57e',
    user_type: 'staff',
    content: '[AWE 참관 등록 - 여행사 대행(인증번호 요청) 안내]\n- 이메일 인증이 필요하여, 여행사에서 인증번호를 요청드릴 예정입니다.\n여행사에서 연락을 드리면, 그룹웨어로 발송되는 인증번호를 말씀부탁드립니다.',
    created_at_custom: 1772176036199,
    created_at: 1772176037047,
  },
  {
    id: '66ea094a-80e1-4342-8928-d481ca980ab3',
    user_type: 'staff',
    content: '[사전 특강 필참 안내]\n- 일시 : 3월 9일(월) 오후 2시 ~ 5시\n- 장소 : 수산빌딩 지하 1층 대강당 (서울 강남구 밤고개로5길 13 수산빌딩)\n   ※ 사전특강 관련 자료는 "학습자료"메뉴에서 확인하실 수 있습니다.',
    created_at_custom: 1772176031565,
    created_at: 1772176032300,
  },
];

// ===== 참가자 명단 =====
const STATIC_PARTICIPANTS = [
  { id: '21e212ab-c7fe-40b1-8c9d-af7504997b9d', user_type: 'executive', company: '수산그룹',       name: '정석현', position: '회장',    role: '회장',                  sort_order: 1772095521686 },
  { id: '76149fd3-c0a6-406a-85fb-2dd4b0f4da00', user_type: 'executive', company: '수산인더스트리', name: '한봉섭', position: '부회장',   role: '부회장',                sort_order: 1772095538751 },
  { id: '4e68c1f7-e622-4f66-9864-de7596dcb9f1', user_type: 'executive', company: '수산인더스트리', name: '정보윤', position: '부사장',   role: '부사장',                sort_order: 1772095550083 },
  { id: 'bbe9171f-f2de-4a6c-afdb-cf2ecaa6d305', user_type: 'executive', company: '수산인더스트리', name: '고우식', position: '상무',     role: '기술개발본부장',        sort_order: 1772095564389 },
  { id: '0d71e275-e011-40b3-946d-12c6b7af2f99', user_type: 'executive', company: '수산인더스트리', name: '손영환', position: '상무',     role: '사업관리실장',          sort_order: 1772095579537 },
  { id: '4a12ba1e-b9ad-4841-89be-e95e33e3e682', user_type: 'executive', company: '수산이앤에스',   name: '황성재', position: '상무',     role: '기술개발본부장',        sort_order: 1772095595948 },
  { id: 'c45ff7a5-348f-4841-89b2-eeb850708faf', user_type: 'executive', company: '수산이앤에스',   name: '정필석', position: '상무',     role: '엔지니어링본부장',      sort_order: 1772095608755 },
  { id: '32def0ff-db87-4672-a0a2-d442d86b2530', user_type: 'executive', company: '수산이앤에스',   name: '조숙희', position: '상무',     role: '방산기술팀원',          sort_order: 1772095625635 },
  { id: 'ce8c0cfd-0851-49f8-8f96-748cbdc725d0', user_type: 'executive', company: '수산이앤에스',   name: '심길섭', position: '노조위원장', role: '노조위원장',           sort_order: 1772095641703 },
  { id: '51075d94-5414-41c6-bc43-3a8bc1a739e3', user_type: 'executive', company: '수산세보틱스',   name: '김병현', position: '사장',     role: '사장 (전략기획실장 겸직)', sort_order: 1772095652750 },
  { id: 'ae37cd28-9ea4-4179-83bc-6b9cb39a1d61', user_type: 'executive', company: '수산세보틱스',   name: '이호철', position: '전무',     role: '사외이사',              sort_order: 1772095697224 },
  { id: '768157a5-d79b-4c78-a3de-3a95f603c2c1', user_type: 'executive', company: '수산세보틱스',   name: '심선보', position: '노조지부장', role: '노조지부장',           sort_order: 1772095720169 },
  { id: 'e6ef8102-0dea-42c0-9327-a6205046534e', user_type: 'executive', company: '수산세보틱스',   name: '문상보', position: '부사장',   role: '부사장',                sort_order: 1772095748513 },
  { id: '48eb0fd2-a224-4105-98fd-58241cb7ac2b', user_type: 'executive', company: '수산비나모터',   name: '강문종', position: '부사장',   role: '부사장',                sort_order: 1772095767331 },
];

// ===== 연락처 =====
const STATIC_CONTACTS = [
  { id: '067f19cf-c613-40f1-a1a9-97538227c53a', user_type: 'executive', name: '김선채 과장', role: '전략기획실 인사기획팀', phone: '010-4634-2987', sort_order: 0 },
  { id: '3b790107-99ad-4ce8-9515-bb29d0c7e11e', user_type: 'executive', name: '임현준 대리', role: '전략기획실 인사기획팀', phone: '010-8992-7654', sort_order: 1 },
  { id: '8ca52f8d-3b04-448f-a651-3fcbb91593ce', user_type: 'staff',     name: '이동민 부장', role: '전략기획실 인사기획팀', phone: '010-7793-0081', sort_order: 0 },
  { id: '24f71f4b-041e-4890-a4cd-2606d1de5cb6', user_type: 'staff',     name: '최지수 대리', role: '전략기획실 인사기획팀', phone: '010-8790-8201', sort_order: 1 },
];

// ===== 콘텐츠 (준비물 등) =====
const STATIC_CONTENT = [
  {
    id: 'ea6d02a8-f1ec-4fd9-b068-569f8bf85d7a',
    user_type: 'executive',
    menu: 'important_notice',
    section: 'prep',
    title: '준비물',
    content: '1. ★여권\n2. ★핸드폰 로밍\n3. 세면용품 (칫솔 / 치약 / 면도기 등)\n4. 개인의약품\n5. 보조배터리/충전기\n6. 여벌 옷, 우산 등 개인 짐       ※하단 날씨 정보 참고\n7. 선글라스, 선크림, 모자 (선택사항)',
    sort_order: 0,
  },
  {
    id: 'a73c2e80-ea90-4e24-bba6-693e8e39104c',
    user_type: 'staff',
    menu: 'important_notice',
    section: 'prep',
    title: '준비물',
    content: '1. ★여권\n2. ★핸드폰 로밍\n3. 세면용품 (칫솔 / 치약 / 면도기 등)\n4. 개인의약품\n5. 보조배터리/충전기\n6. 여벌 옷, 우산 등 개인 짐      ※ 하단 날씨 정보 참고\n7. 선글라스, 선크림, 모자 (선택사항)',
    sort_order: 0,
  },
];

// ===== 파일 목록 =====
const STATIC_FILES = [];

// ===== 일정표 =====
const STATIC_SCHEDULE = [

  // ── 책임자급 (executive) – 5박 6일 북경+상해 ──
  {
    id: 'exec-day1',
    user_type: 'executive',
    day_num: 1, sort_order: 1,
    day_label: '제1일', date_label: '3/10(월)',
    region: '인천/김포 → 북경',
    transport: 'OZ 331 / OZ 3355',
    notes: '인천/김포 출발 → 북경 수도공항 도착 → 기업 방문 → 호텔',
    time_slots: JSON.stringify([
      { time: '05:30', detail: '[인천공항 출발팀] OZ 331 · 인천국제공항 2터미널 아시아나항공 카운터 개별 수속' },
      { time: '08:20', detail: '[인천공항 출발팀] 인천 출발' },
      { time: '05:30', detail: '[김포공항 출발팀] OZ 3355 · 김포공항 국제선터미널 아시아나항공 카운터 개별 수속' },
      { time: '08:40', detail: '[김포공항 출발팀] 김포 출발' },
      { time: '09:45', detail: '▶ 북경 수도 국제공항 도착 및 가이드 미팅 (합류)' },
      { time: '11:00', detail: '▶ 중국 국가박물관 방문' },
      { time: '15:00', detail: '▶ Xiaomi EV Hyperfactory 방문' },
      { time: '18:00', detail: '▶ KOTRA 세미나 및 석식 (북경오리)' },
    ]),
    meal_morning: '', meal_lunch: '도시락', meal_dinner: '북경오리',
    hotel: 'Beijing Kun Tai Hotel(3/10-11)',
    created_at: 1700000001000,
  },
  {
    id: 'exec-day2',
    user_type: 'executive',
    day_num: 2, sort_order: 2,
    day_label: '제2일', date_label: '3/11(수)',
    region: '북경', transport: '',
    notes: '호텔 조식 후 기업방문 및 세미나',
    time_slots: JSON.stringify([
      { time: '09:00', detail: '▶ 중국 기술·산업 동향 브리핑 (권혁민, 호텔 세미나실)' },
      { time: '14:30', detail: '▶ 센스타임 포동 린강 데이터센터 방문' },
      { time: '18:00', detail: '▶ 석식 (박선경 KITA 상해지부장 참석) 후 호텔 휴식' },
    ]),
    meal_morning: '호텔', meal_lunch: '현지식', meal_dinner: '현지식',
    hotel: 'Beijing Kun Tai Hotel(3/10-11)',
    created_at: 1700000002000,
  },
  {
    id: 'exec-day3',
    user_type: 'executive',
    day_num: 3, sort_order: 3,
    day_label: '제3일', date_label: '3/12(목)',
    region: '북경 → 상해', transport: '고속열차',
    notes: '호텔 조식 후 고속열차 탑승하여 상해 이동',
    time_slots: JSON.stringify([
      { time: '09:00', detail: '▶ 북경남역 출발 (고속열차)' },
      { time: '13:40', detail: '▶ 상해 홍교역 도착' },
      { time: '14:30', detail: '▶ 센스타임 포동 린강 데이터센터 방문' },
      { time: '18:00', detail: '▶ 석식 (박선경 KITA 상해지부장 참석) 후 호텔 휴식' },
    ]),
    meal_morning: '호텔', meal_lunch: '도시락', meal_dinner: '현지식',
    hotel: 'Grand Metropark Hotel(3/12-14)',
    created_at: 1700000003000,
  },
  {
    id: 'exec-day4',
    user_type: 'executive',
    day_num: 4, sort_order: 4,
    day_label: '제4일', date_label: '3/13(금)',
    region: '상해', transport: '',
    notes: '호텔 조식 후 기업방문',
    time_slots: JSON.stringify([
      { time: '09:00', detail: '▶ 애지봇 방문 및 미팅' },
      { time: '11:00', detail: '▶ 장강그룹 방문 및 미팅' },
      { time: '16:00', detail: '▶ 화웨이 방문 및 식사' },
    ]),
    meal_morning: '호텔', meal_lunch: '현지식', meal_dinner: '화웨이',
    hotel: 'Grand Metropark Hotel(3/12-14)',
    created_at: 1700000004000,
  },
  {
    id: 'exec-day5',
    user_type: 'executive',
    day_num: 5, sort_order: 5,
    day_label: '제5일', date_label: '3/14(토)',
    region: '상해 (AWE 박람회)', transport: '',
    notes: '호텔 조식 후 전시장 이동, 상해 문화탐방',
    time_slots: JSON.stringify([
      { time: '09:00', detail: '▶ 상해 가전 AWE 박람회 참관/상담  (Eastern Hub 2전시장 ⇒ SNIEC 1전시장)' },
      { time: '17:00', detail: '▶ 토론 및 간담회' },
      { time: '19:00', detail: '▶ 석식 후 난징동루 탐방 (아시아 브랜드, 팝컬쳐-화웨이, 삼성, 타마샤인 네이션스, 미니쏠랜드 등)' },
    ]),
    meal_morning: '호텔', meal_lunch: '현지식', meal_dinner: '호텔',
    hotel: 'Grand Metropark Hotel(3/12-14)',
    created_at: 1700000005000,
  },
  {
    id: 'exec-day6',
    user_type: 'executive',
    day_num: 6, sort_order: 6,
    day_label: '제6일', date_label: '3/15(일)',
    region: '상해 → 귀국', transport: 'OZ 366',
    notes: '호텔 조식 후 AWE 박람회 참관 → 귀국',
    time_slots: JSON.stringify([
      { time: '09:00', detail: '▶ 상해 가전 AWE 박람회 참관/상담' },
      { time: '12:00', detail: '▶ 중식 후 공항 이동' },
      { time: '16:25', detail: '[인천공항 도착팀] OZ 366 · 상해 포동 국제공항 출발 → 19:20 인천 도착 후 해산' },
      { time: '16:25', detail: '[김포공항 도착팀] OZ 366 · 상해 포동 국제공항 출발 → 19:20 인천 도착 후 해산' },
    ]),
    meal_morning: '호텔', meal_lunch: '현지식', meal_dinner: '',
    hotel: '',
    created_at: 1700000006000,
  },

  // ── 실무자급 (staff) – 4박 5일 상해 ──
  {
    id: 'staff-day1',
    user_type: 'staff',
    day_num: 1, sort_order: 1,
    day_label: '제1일', date_label: '3/11(화)',
    region: '상해 도착', transport: 'OZ 365',
    notes: '인천 출발 → 상해 포동공항 도착 → 호텔',
    time_slots: JSON.stringify([
      { time: '07:00', detail: '[인천공항 출발팀] OZ 365 · 인천국제공항 2터미널 아시아나항공 카운터 개별 수속' },
      { time: '09:30', detail: '[인천공항 출발팀] 인천 출발' },
      { time: '11:30', detail: '▶ 상해 포동 국제공항 도착 및 가이드 미팅' },
      { time: '16:00', detail: '▶ 이동 및 석식' },
      { time: '19:00', detail: '• 호텔 휴식' },
    ]),
    meal_morning: '', meal_lunch: '현지식', meal_dinner: '현지식',
    hotel: 'Grand Metropark Hotel(3/11-14)',
    created_at: 1700000011000,
  },
  {
    id: 'staff-day2',
    user_type: 'staff',
    day_num: 2, sort_order: 2,
    day_label: '제2일', date_label: '3/12(수)',
    region: '상해', transport: '',
    notes: '호텔 조식 후 기업방문 및 세미나',
    time_slots: JSON.stringify([
      { time: '09:00', detail: '▶ 중국 기술·산업 동향 브리핑 (권혁민, 호텔 세미나실)' },
      { time: '14:30', detail: '▶ 센스타임 포동 린강 데이터센터 방문' },
      { time: '18:00', detail: '▶ 석식 (박선경 KITA 상해지부장 참석) 후 호텔 휴식' },
    ]),
    meal_morning: '호텔', meal_lunch: '현지식', meal_dinner: '현지식',
    hotel: 'Grand Metropark Hotel(3/11-14)',
    created_at: 1700000012000,
  },
  {
    id: 'staff-day3',
    user_type: 'staff',
    day_num: 3, sort_order: 3,
    day_label: '제3일', date_label: '3/13(목)',
    region: '상해', transport: '',
    notes: '호텔 조식 후 기업 방문',
    time_slots: JSON.stringify([
      { time: '09:00', detail: '▶ 애지봇 방문 및 미팅' },
      { time: '11:00', detail: '▶ 장강그룹 방문 및 미팅' },
      { time: '16:00', detail: '▶ 화웨이 방문 및 식사' },
    ]),
    meal_morning: '호텔', meal_lunch: '현지식', meal_dinner: '화웨이',
    hotel: 'Grand Metropark Hotel(3/11-14)',
    created_at: 1700000013000,
  },
  {
    id: 'staff-day4',
    user_type: 'staff',
    day_num: 4, sort_order: 4,
    day_label: '제4일', date_label: '3/14(금)',
    region: '상해 (AWE 박람회)', transport: '',
    notes: '호텔 조식 후 AWE 전시 참관 및 상해 문화 탐방',
    time_slots: JSON.stringify([
      { time: '09:00', detail: '▶ 상해 가전 AWE 박람회 참관/상담  (Eastern Hub 2전시장 ⇒ SNIEC 1전시장)' },
      { time: '17:00', detail: '▶ 토론 및 간담회' },
      { time: '19:00', detail: '▶ 석식 후 난징동루 탐방 (아시아 브랜드, 팝컬쳐-화웨이, 삼성, 타마샤인 네이션스, 미니쏠랜드 등)' },
    ]),
    meal_morning: '호텔', meal_lunch: '현지식', meal_dinner: '호텔',
    hotel: 'Grand Metropark Hotel(3/11-14)',
    created_at: 1700000014000,
  },
  {
    id: 'staff-day5',
    user_type: 'staff',
    day_num: 5, sort_order: 5,
    day_label: '제5일', date_label: '3/15(토)',
    region: '상해 → 귀국', transport: 'OZ 366',
    notes: '호텔 조식 후 AWE 전시 참관 → 귀국',
    time_slots: JSON.stringify([
      { time: '09:00', detail: '▶ 상해 가전 AWE 박람회 참관/상담' },
      { time: '12:00', detail: '▶ 중식 후 공항 이동' },
      { time: '16:25', detail: '▶ OZ 366 상해 포동 국제공항 출발' },
      { time: '19:20', detail: '▶ 인천 도착 후 해산' },
    ]),
    meal_morning: '호텔', meal_lunch: '현지식', meal_dinner: '',
    hotel: '',
    created_at: 1700000015000,
  },
];
