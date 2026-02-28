-- Database export: AWE 2026 참관 일정 데이터
-- Generated: 2026-02-27

-- Table: awe_schedule
DROP TABLE IF EXISTS "awe_schedule";
CREATE TABLE awe_schedule (
  id TEXT PRIMARY KEY,
  user_type TEXT,
  day_num REAL,
  day_label TEXT,
  date_label TEXT,
  region TEXT,
  transport TEXT,
  time_slots TEXT,
  meal_morning TEXT,
  meal_lunch TEXT,
  meal_dinner TEXT,
  hotel TEXT,
  sort_order REAL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 책임자급 일정 데이터
INSERT INTO awe_schedule (id, user_type, day_num, day_label, date_label, region, transport, time_slots, meal_morning, meal_lunch, meal_dinner, hotel, sort_order, notes) VALUES
('exec-day1', 'executive', 1, '1일차', '3/10(화)', '인천/김포 → 북경', 'OZ 331 / OZ 3355',
'[{"time":"05:30","detail":"[인천공항 출발팀] OZ 331 · 인천공항 2터미널 아시아나항공 카운터 개별 수속"},{"time":"08:20","detail":"[인천공항 출발팀] OZ 331 · 인천공항 출발"},{"time":"05:30","detail":"[김포공항 출발팀] OZ 3355 · 김포공항 국제선터미널 아시아나항공 카운터 개별 수속"},{"time":"08:40","detail":"[김포공항 출발팀] OZ 3355 · 김포공항 출발"},{"time":"09:45","detail":"▶ 북경 수도 국제공항 도착 및 가이드 미팅"},{"time":"11:00","detail":"▶대륙의 5,000년을 품은 세계 최대의 전당 중국 국가박물관 (11:00 ~ 13:00)"},{"time":"15:00","detail":"▶Xiaomi EV Hyperfactory 방문 (15:00 ~ 16:00)"},{"time":"18:00","detail":"▶황재원 KOTRA 중국지역본부장 세미나 및 석식 (18:00 ~20:00) ※ 북경오리"}]',
'', '도시락', '현지식(북경오리)', 'Beijing Kun Tai Hotel(3/10-11)', 1, '');

INSERT INTO awe_schedule (id, user_type, day_num, day_label, date_label, region, transport, time_slots, meal_morning, meal_lunch, meal_dinner, hotel, sort_order, notes) VALUES
('exec-day2', 'executive', 2, '2일차', '3/11(수)', '북경', '',
'[{"time":"09:30","detail":"▶중국 근현대 과학자 500인 기념 박물관 중국과학자박물관 (09:30 ~ 12:00)"},{"time":"14:00","detail":"▶LEJU Robotics 로봇 데이터 트레이닝 센터 방문 (14:00 ~ 15:00)"},{"time":"18:30","detail":"▶이봉걸 한국무역협회 북경지부장 세미나 및 석식 (18:30 ~ 20:00)"}]',
'호텔', '현지식', '현지식', 'Beijing Kun Tai Hotel(3/10-11)', 2, '');

INSERT INTO awe_schedule (id, user_type, day_num, day_label, date_label, region, transport, time_slots, meal_morning, meal_lunch, meal_dinner, hotel, sort_order, notes) VALUES
('exec-day3', 'executive', 3, '3일차', '3/12(목)', '북경 → 상해', '고속열차',
'[{"time":"09:00","detail":"• 북경 남역 출발 (약 4시간 37분 소요)"},{"time":"13:40","detail":"• 상해 홍차오역 도착 후 가이드 미팅"},{"time":"14:30","detail":"▶센스타임 포동 린강 데이터센터 방문 (14:30 ~ 16:00)"},{"time":"18:00","detail":"• 석식 (박선경 한국무역협회 상해지부장 참석) 후 호텔 휴식"}]',
'호텔', '도시락', '현지식', 'Grand Metropark Hotel(3/12-14)', 3, '호텔 조식 후 고속열차 탑승하여 상해 이동');

INSERT INTO awe_schedule (id, user_type, day_num, day_label, date_label, region, transport, time_slots, meal_morning, meal_lunch, meal_dinner, hotel, sort_order, notes) VALUES
('exec-day4', 'executive', 4, '4일차', '3/13(금)', '상해', '',
'[{"time":"09:00","detail":"▶애지봇 방문"},{"time":"11:00","detail":"▶ 장강그룹 방문 및 미팅"},{"time":"16:00","detail":"▶화웨이 방문 및 식사"}]',
'호텔', '현지식', '화웨이', 'Grand Metropark Hotel(3/12-14)', 4, '호텔 조식 후 기업방문');

INSERT INTO awe_schedule (id, user_type, day_num, day_label, date_label, region, transport, time_slots, meal_morning, meal_lunch, meal_dinner, hotel, sort_order, notes) VALUES
('exec-day5', 'executive', 5, '5일차', '3/14(토)', '상해', '',
'[{"time":"09:00","detail":"▶상해 가전 AWE 박람회 참관/상담 (Eastern Hub 2전시장 ⇒ SNIEC 1전시장)"},{"time":"17:00","detail":"▶토론 및 간담회"},{"time":"석식 후","detail":"• 상해 난징동루 핫플레이스 탐방 (아시아브랜드, 팝컬쳐-화웨이, 삼성, 타마시네이션즈, 미니소랜드 등)"}]',
'호텔', '현지식', '호텔', 'Grand Metropark Hotel(3/12-14)', 5, '호텔 조식 후 전시장 이동, 상해 문화탐방');

INSERT INTO awe_schedule (id, user_type, day_num, day_label, date_label, region, transport, time_slots, meal_morning, meal_lunch, meal_dinner, hotel, sort_order, notes) VALUES
('exec-day6', 'executive', 6, '6일차', '3/15(일)', '상해 → 인천/김포', 'OZ 366 / KE 2058',
'[{"time":"09:00","detail":"▶상해 가전 AWE 박람회 참관/상담"},{"time":"16:25","detail":"[인천공항 도착팀] OZ 366 · 상해(푸동) 출발"},{"time":"19:20","detail":"[인천공항 도착팀] OZ 366 · 인천 도착 및 해산"},{"time":"18:25","detail":"[김포공항 도착팀] KE 2058 · 상해(홍차오) 출발"},{"time":"21:35","detail":"[김포공항 도착팀] KE 2058 · 김포 도착 및 해산"}]',
'호텔', '현지식', '', '', 6, '호텔 조식 후 전시장 이동, 귀국');

-- 실무자급 일정 데이터
INSERT INTO awe_schedule (id, user_type, day_num, day_label, date_label, region, transport, time_slots, meal_morning, meal_lunch, meal_dinner, hotel, sort_order, notes) VALUES
('staff-day1', 'staff', 1, '1일차', '3/11(수)', '인천 → 상해', 'OZ 365',
'[{"time":"11:10","detail":"▶ 인천공항 2터미널 아시아나항공 카운터 개별 수속"},{"time":"14:10","detail":"▶ OZ 365 인천공항 출발"},{"time":"15:10","detail":"▶ 상해(푸동) 공항 도착 및 가이드 미팅"},{"time":"16:00","detail":"• 이동 및 석식 후 호텔 휴식"}]',
'', '기내식', '현지식', 'Grand Metropark Hotel(3/12-14)', 1, '');

INSERT INTO awe_schedule (id, user_type, day_num, day_label, date_label, region, transport, time_slots, meal_morning, meal_lunch, meal_dinner, hotel, sort_order, notes) VALUES
('staff-day2', 'staff', 2, '2일차', '3/12(목)', '상해', '',
'[{"time":"09:00","detail":"▶중국기술 및 산업 동향 브리핑 / 권혁민 (09:00 ~ 11:00) ※ 호텔 세미나실"},{"time":"14:30","detail":"▶센스타임 포동 린강 데이터센터 방문 (14:30 ~ 16:00)"},{"time":"18:00","detail":"• 석식 (박선경 한국무역협회 상해지부장 참석) 후 호텔 휴식"}]',
'호텔', '현지식', '현지식', 'Grand Metropark Hotel(3/12-14)', 2, '');

INSERT INTO awe_schedule (id, user_type, day_num, day_label, date_label, region, transport, time_slots, meal_morning, meal_lunch, meal_dinner, hotel, sort_order, notes) VALUES
('staff-day3', 'staff', 3, '3일차', '3/13(금)', '상해', '',
'[{"time":"09:00","detail":"▶애지봇 방문"},{"time":"11:00","detail":"▶장강그룹 방문 및 미팅"},{"time":"16:00","detail":"▶화웨이 방문 및 식사"}]',
'호텔', '현지식', '화웨이', 'Grand Metropark Hotel(3/12-14)', 3, '호텔 조식 후 기업방문');

INSERT INTO awe_schedule (id, user_type, day_num, day_label, date_label, region, transport, time_slots, meal_morning, meal_lunch, meal_dinner, hotel, sort_order, notes) VALUES
('staff-day4', 'staff', 4, '4일차', '3/14(토)', '상해', '',
'[{"time":"09:00","detail":"▶상해 가전 AWE 박람회 참관/상담 (Eastern Hub 2전시장 ⇒ SNIEC 1전시장)"},{"time":"17:00","detail":"▶토론 및 간담회"},{"time":"석식 후","detail":"• 상해 난징동루 핫플레이스 탐방 (아시아브랜드, 팝컬쳐-화웨이, 삼성, 타마시네이션즈, 미니소랜드 등)"}]',
'호텔', '현지식', '호텔', 'Grand Metropark Hotel(3/12-14)', 4, '호텔 조식 후 전시장 이동, 상해 문화탐방');

INSERT INTO awe_schedule (id, user_type, day_num, day_label, date_label, region, transport, time_slots, meal_morning, meal_lunch, meal_dinner, hotel, sort_order, notes) VALUES
('staff-day5', 'staff', 5, '5일차', '3/15(일)', '상해 → 인천', 'OZ 366',
'[{"time":"09:00","detail":"▶상해 가전 AWE 박람회 참관/상담"},{"time":"12:00","detail":"• 중식 후 공항 이동"},{"time":"16:25","detail":"• OZ 366 상해(푸동)공항 출발"},{"time":"19:20","detail":"• 인천공항 도착 후 해산"}]',
'호텔', '현지식', '', '', 5, '호텔 조식 후 전시장 이동, 귀국');

-- Table: awe_content
DROP TABLE IF EXISTS "awe_content";
CREATE TABLE awe_content (
  id TEXT PRIMARY KEY,
  user_type TEXT,
  menu TEXT,
  section TEXT,
  title TEXT,
  content TEXT,
  sort_order REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: awe_files
DROP TABLE IF EXISTS "awe_files";
CREATE TABLE awe_files (
  id TEXT PRIMARY KEY,
  user_type TEXT,
  menu TEXT,
  file_name TEXT,
  file_type TEXT,
  file_data TEXT,
  file_size TEXT,
  thumbnail_url TEXT,
  sort_order REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: awe_contacts
DROP TABLE IF EXISTS "awe_contacts";
CREATE TABLE awe_contacts (
  id TEXT PRIMARY KEY,
  user_type TEXT,
  name TEXT,
  role TEXT,
  phone TEXT,
  sort_order REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: awe_notices
DROP TABLE IF EXISTS "awe_notices";
CREATE TABLE awe_notices (
  id TEXT PRIMARY KEY,
  user_type TEXT,
  content TEXT,
  created_at_custom REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: awe_participants
DROP TABLE IF EXISTS "awe_participants";
CREATE TABLE awe_participants (
  id TEXT PRIMARY KEY,
  user_type TEXT,
  company TEXT,
  name TEXT,
  position TEXT,
  role TEXT,
  sort_order REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
