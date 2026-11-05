import type { AgencyIcon } from "./seal-icons";

// NODE 발령 데이터.
// 티어 명칭과 확률은 임시값이다(PRODUCT.md: 사용자가 나중에 확정). 화면의 확률표는 이 값을 그대로 읽는다.

export type Tier = {
  id: string;
  label: string;
  weight: number; // 발령 확률(%)
  color: string; // 발령 통지 머리 칸 색
  ink: string; // 그 위 글자 색
  stamp: string; // 기관 관인 잉크: 등급 색을 흰 종이에서 읽히게 누른 색
  salaryMultiplier: number;
};

export const TIERS: Tier[] = [
  { id: "gray", label: "회색 등급", weight: 42, color: "#C0C0C0", ink: "#000000", stamp: "#555555", salaryMultiplier: 1 },
  { id: "green", label: "녹색 등급", weight: 26, color: "#00FF00", ink: "#000000", stamp: "#008000", salaryMultiplier: 1.12 },
  { id: "cyan", label: "청록 등급", weight: 14, color: "#00FFFF", ink: "#000000", stamp: "#007878", salaryMultiplier: 1.3 },
  { id: "blue", label: "파랑 등급", weight: 10, color: "#0000FF", ink: "#FFFFFF", stamp: "#0000CC", salaryMultiplier: 1.42 },
  { id: "yellow", label: "황색 등급", weight: 5, color: "#FFFF00", ink: "#000000", stamp: "#8A6A00", salaryMultiplier: 1.55 },
  { id: "red", label: "적색 등급", weight: 3, color: "#FF0000", ink: "#FFFFFF", stamp: "#CC0000", salaryMultiplier: 1.9 },
];

/** 특수보직은 티어와 별개로 굴린다(%). */
export const SPECIAL_POST_CHANCE = 1;

export const DAILY_LIMIT = 5;


export type Agency = {
  name: string;
  tier: Tier["id"];
  icon: AgencyIcon; // 원형 관인 가운데 그림
  departments: string[];
  allowances: string[];
};

export const AGENCIES: Agency[] = [
  // 회색
  { name: "우주쓰레기 분리수거관리소", tier: "gray", icon: "spaceTrash", departments: ["저궤도 재활용과", "위성잔해 민원팀", "분리배출 단속반", "정지궤도 수거1팀"], allowances: ["무중력 허리통증수당", "야간 유성우 근무수당", "우주복 세탁비"] },
  { name: "반려로봇 등록사무소", tier: "gray", icon: "robotDog", departments: ["신규등록과", "감정회로 검사팀", "유기로봇 보호소", "충전기 규격과"], allowances: ["기름칠 수당", "감정 교류 위로금", "펌웨어 야근수당"] },
  { name: "꿈 분실물 보관소", tier: "gray", icon: "dreamBox", departments: ["악몽 반환과", "데자뷔 분류팀", "잃어버린 꿈 접수창구", "장기보관 창고"], allowances: ["수면부족 수당", "기시감 위험수당", "베개 지급비"] },
  { name: "기상 민원 조정사무소", tier: "gray", icon: "umbrella", departments: ["소풍날 맑음 청원과", "첫눈 일정협의팀", "장마 이의신청과"], allowances: ["우산 파손 보전금", "일기예보 원망 위로수당"] },
  { name: "국립 양말짝 실종조사단", tier: "gray", icon: "sockSearch", departments: ["세탁기 수색과", "짝 매칭팀", "미아양말 보호과"], allowances: ["섬유유연제 지원금", "외짝 정신건강비"] },
  { name: "지하철 환승통로 길안내청", tier: "gray", icon: "subwayTransfer", departments: ["미로설계과", "출구번호 해석팀", "7번출구 탐사반"], allowances: ["만보 초과수당", "무릎 보호대 지급비"] },
  { name: "메타버스 층간소음 중재위원회", tier: "gray", icon: "vrNoise", departments: ["아바타 뛰기 단속과", "가상벽 방음과", "이웃 화해팀"], allowances: ["접속 피로수당", "헤드셋 눌림 보전금"] },
  { name: "엘리베이터 닫힘버튼 효용검증소", tier: "gray", icon: "elevatorButton", departments: ["누름횟수 집계과", "위약효과 연구팀", "버튼 마모 감식반"], allowances: ["연타 손가락 보전금", "기다림 인내수당"] },
  { name: "국립 이불밖 위험관리센터", tier: "gray", icon: "blanketWarning", departments: ["기상 의지 측정과", "발가락 노출 경보팀", "알람 스누즈 단속반"], allowances: ["새벽 기상수당", "전기장판 지원비"] },

  // 녹색
  { name: "인공지능 정서상담재단", tier: "green", icon: "aiHeart", departments: ["챗봇 번아웃 상담과", "알고리즘 우울 예방팀", "오류메시지 순화과", "학습데이터 트라우마 연구소"], allowances: ["공감노동 수당", "무한루프 정신건강비", "프롬프트 야근수당"] },
  { name: "해저도시 전입신고센터", tier: "green", icon: "domeCity", departments: ["수압적응 심사과", "잠수주소 발급팀", "산호주택 관리과"], allowances: ["수압 수당", "귀 먹먹함 보전금", "오리발 지급비"] },
  { name: "시간여행 출입국관리국", tier: "green", icon: "hourglass", departments: ["과거방문 비자과", "역설방지 심사팀", "미래 반입물품 검역과", "나비효과 신고센터"], allowances: ["시차적응 수당", "할아버지 역설 위험수당"] },
  { name: "화성 감자농업진흥원", tier: "green", icon: "potato", departments: ["붉은흙 개량과", "감자 품종연구팀", "화성 김장 지원반"], allowances: ["산소 절약 장려금", "모래폭풍 근무수당"] },
  { name: "국립 고양이언어연구원", tier: "green", icon: "catTalk", departments: ["골골송 번역과", "꾹꾹이 해석팀", "집사 민원창구"], allowances: ["털 알레르기 수당", "츄르 연구비", "키보드 점거 보전금"] },
  { name: "기억 백업 공증사무소", tier: "green", icon: "memoryDisk", departments: ["추억 원본대조과", "흑역사 삭제 심의팀", "첫사랑 보존과"], allowances: ["망각 방지 수당", "민망함 위로금"] },
  { name: "드론택배 항공교통관제청", tier: "green", icon: "droneBox", departments: ["베란다 착륙과", "공중정체 해소팀", "비둘기 충돌 조사반"], allowances: ["고공 근무수당", "프로펠러 소음 보전금"] },
  { name: "식물 감정노동 보호청", tier: "green", icon: "sadPlant", departments: ["물주기 갑질 신고센터", "선인장 고충상담과", "분갈이 이직지원팀"], allowances: ["광합성 초과근무수당", "햇빛 부족 위로금"] },
  { name: "가상화폐 유적 발굴조사단", tier: "green", icon: "digCoin", departments: ["잃어버린 지갑 복원과", "비밀번호 고고학팀", "폭락 흔적 감정반"], allowances: ["한숨 수당", "차트 응시 안구보전비"] },

  // 청록
  { name: "심해·지저생물외교청", tier: "cyan", icon: "anglerfish", departments: ["심해대사관 의전과", "지저문명 통역팀", "맨틀 국경협상과", "아귀 외교관 영접반"], allowances: ["수압 외교수당", "암흑 근무수당", "발광생물 눈부심 보전금"] },
  { name: "은하간 실종천체 수색본부", tier: "cyan", icon: "planetSearch", departments: ["블랙홀 수색과", "떠돌이행성 신고센터", "혜성 미아찾기팀", "명왕성 행성복권 추진단"], allowances: ["광년 출장비", "우주미아 위험수당"] },
  { name: "기후 되돌리기 특별기획단", tier: "cyan", icon: "climateRewind", departments: ["빙하 재동결과", "탄소 회수팀", "사계절 복원과"], allowances: ["폭염 근무수당", "북극곰 면담 수당"] },
  { name: "행성 테라포밍 인허가청", tier: "cyan", icon: "terraform", departments: ["대기조성 심사과", "바다 신설 허가팀", "산맥 건축과"], allowances: ["행성규모 책임수당", "인허가 지연 사과비"] },
  { name: "로봇노동조합 단체교섭위원회", tier: "cyan", icon: "robotFist", departments: ["충전시간 협상과", "강제업데이트 저지팀", "휴머노이드 복지과"], allowances: ["교섭 장기화 수당", "논리회로 과열 보전금"] },
  { name: "꿈 저작권보호위원회", tier: "cyan", icon: "dreamCopyright", departments: ["꿈 표절 심의과", "악몽 유통 단속팀", "자각몽 라이선스과"], allowances: ["야간 상시대기 수당", "잠꼬대 녹취비"] },
  { name: "남극 펭귄 통상교섭본부", tier: "cyan", icon: "penguin", departments: ["생선 관세 협상과", "빙하 영토 조정팀", "뒤뚱걸음 의전반"], allowances: ["혹한 근무수당", "패딩 지급비"] },
  { name: "지구 자전속도 관리공단", tier: "cyan", icon: "earthSpin", departments: ["하루 길이 측정과", "어지럼증 민원팀", "윤초 비상대응반"], allowances: ["멀미 보전금", "야간 자전 감시수당"] },

  // 파랑
  { name: "국립 소행성 주차단속원", tier: "blue", icon: "asteroidParking", departments: ["궤도 불법주차 단속과", "견인 우주선 운영팀", "과태료 은하송금과"], allowances: ["무중력 견인수당", "운석 충돌 위험수당"] },
  { name: "구름 모양 심의위원회", tier: "blue", icon: "heartCloud", departments: ["동물모양 인증과", "하트구름 배치팀", "먹구름 이미지 개선반"], allowances: ["하늘 응시 수당", "목 결림 보전금"] },
  { name: "외계인 관광객 안내공사", tier: "blue", icon: "alienTourist", departments: ["지구 맛집 안내과", "중력 적응 체험팀", "UFO 주차장 관리반"], allowances: ["통역 피로수당", "광선총 분실 위로금"] },
  { name: "인류 하품 전염방지본부", tier: "blue", icon: "yawn", departments: ["회의실 하품 감시과", "월요일 아침 비상대응팀", "전염경로 역학조사반"], allowances: ["졸음 참기 수당", "커피 지원금"] },
  { name: "꿈속 출근 방지위원회", tier: "blue", icon: "noWorkDream", departments: ["주말 악몽 차단과", "가짜 지각 경보팀", "꿈속 회의 해산반"], allowances: ["숙면 보장수당", "잠꼬대 결재비"] },
  { name: "국립 와이파이 신호복지원", tier: "blue", icon: "wifiCare", departments: ["음영지역 구조과", "공유기 재부팅팀", "비번 분실 상담센터"], allowances: ["안테나 세우기 수당", "버퍼링 위로금"] },

  // 황색
  { name: "달 뒷면 영토관리공단", tier: "yellow", icon: "moonFlag", departments: ["크레이터 지적과", "월면 분양팀", "지구 조망권 분쟁과"], allowances: ["저중력 적응수당", "월세(月稅) 지원금"] },
  { name: "외계문명 첫인사 의전실", tier: "yellow", icon: "ufoWave", departments: ["첫마디 문안과", "은하표준 악수팀", "오해 수습반"], allowances: ["문화충격 보전금", "촉수 악수 위험수당"] },
  { name: "국립 평행우주통계청", tier: "yellow", icon: "parallelStats", departments: ["다른 나 인구조사과", "선택의 갈림길 집계팀", "만약에 연구소"], allowances: ["정체성 혼란 수당", "동명이인 대면 위로금"] },
  { name: "태양수명 연장추진본부", tier: "yellow", icon: "sunCharge", departments: ["핵융합 연료보충과", "흑점 관리팀", "일몰 연기 협상반"], allowances: ["자외선 노출수당", "선글라스 지급비"] },
  { name: "블랙홀 출입허가청", tier: "yellow", icon: "blackHole", departments: ["사건지평선 검문과", "스파게티화 안전교육팀", "귀환 불가 서약접수반"], allowances: ["중력 왜곡 위험수당", "시간 지연 보상금"] },
  { name: "인류 마지막 숙제 해결본부", tier: "yellow", icon: "homework", departments: ["밀린 방학숙제 처리과", "미룬 일 일괄정리팀", "내일의 나 소환반"], allowances: ["벼락치기 수당", "마감 임박 정신건강비"] },

  // 적색
  { name: "우주상수 조정위원회", tier: "red", icon: "cosmicScale", departments: ["중력 미세조정과", "광속 개정 심의팀", "엔트로피 감축과"], allowances: ["물리법칙 책임수당", "존재론적 위험수당"] },
  { name: "시간표준 관리최고원", tier: "red", icon: "pendulumClock", departments: ["윤초 배분과", "월요일 단축 연구팀", "주말 연장 특별반"], allowances: ["시간외 근무수당(무한)", "시계 태엽 감기비"] },
  { name: "기관장 직속 비밀 낮잠감독관", tier: "red", icon: "sleepMask", departments: ["낮잠 품질관리과", "코골이 단속팀", "낮잠 명당 배정반"], allowances: ["낮잠 품질관리 수당", "베개 지급비"] },
  { name: "행성 이름짓기 최고위원회", tier: "red", icon: "planetName", departments: ["신규 은하 작명과", "별자리 저작권팀", "명명식 의전반"], allowances: ["작명 창작수당", "우주적 책임수당"] },
  { name: "빅뱅 재현 안전위원회", tier: "red", icon: "bigBang", departments: ["우주 재시작 심의과", "초기조건 보존팀", "되돌리기 단축키 관리반"], allowances: ["존재 소멸 위험수당", "무(無) 대기수당"] },
];

export type Rank = { title: string; weight: number; baseSalary: number /* 만원/년 */ };

export const RANKS: Rank[] = [
  { title: "9급 서기보", weight: 22, baseSalary: 3100 },
  { title: "8급 서기", weight: 18, baseSalary: 3400 },
  { title: "7급 주사보", weight: 16, baseSalary: 3800 },
  { title: "6급 주사", weight: 13, baseSalary: 4600 },
  { title: "5급 사무관", weight: 10, baseSalary: 5900 },
  { title: "4급 서기관", weight: 8, baseSalary: 7300 },
  { title: "3급 부이사관", weight: 5, baseSalary: 8600 },
  { title: "2급 이사관", weight: 3.5, baseSalary: 9600 },
  { title: "1급 관리관", weight: 2.5, baseSalary: 10500 },
  { title: "차장 (차관급)", weight: 1.2, baseSalary: 12800 },
  { title: "기관장 (장관급)", weight: 0.8, baseSalary: 15500 },
];

export const SPECIAL_POSTS: { title: string; allowance: string }[] = [
  { title: "은하연방 대한민국대표부", allowance: "은하외교 품위유지비" },
  { title: "전 부서 간식 총괄조달관", allowance: "간식 유혹 위험수당" },
  { title: "미래에서 파견된 감사관", allowance: "스포일러 자제 수당" },
  { title: "퇴근시간 수호 특임관", allowance: "칼퇴 집행 수당" },
  { title: "회의 줄이기 특별보좌관", allowance: "침묵 유지비" },
  { title: "기관 마스코트 (인형탈 상시착용)", allowance: "인형탈 통풍 수당" },
];
