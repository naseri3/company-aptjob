/* =========================================================
   director-recruit.js
   소장채용 카드 렌더링 통합 스크립트
========================================================= */


/* ===============================
   1️⃣ JSON 데이터
=============================== */

const directorList = [
  {
    id: 301,
    title: "시설관리 경력직",
    area: "서울 > 서초구",
    position: "시설관리",
    salary: "월급 420만원(세전)",
    complexName: "래미안 서초 에스티지",
    experience: "경력 5년 이상",
    complexSize: 820,
    deadline: "2026-03-31",
    isClosed: false
  },
  {
    id: 302,
    title: "기전과장 채용",
    area: "경기 > 성남시 분당구",
    position: "기전과장",
    salary: "월급 480만원(세전)",
    complexName: "힐스테이트 판교",
    experience: "경력 무관",
    complexSize: 980,
    deadline: "2026-03-31",
    isClosed: false
  },
  {
    id: 303,
    title: "전기기사 모집",
    area: "경기 > 수원시 영통구",
    position: "전기기사",
    salary: "월급 390만원(세전)",
    complexName: "광교 자이",
    experience: "경력 3년 이상",
    complexSize: 740,
    deadline: "2026-03-31",
    isClosed: false
  },
  {
    id: 304,
    title: "관리과장 채용",
    area: "서울 > 마포구",
    position: "관리과장",
    salary: "월급 410만원(세전)",
    complexName: "마포 래미안 푸르지오",
    experience: "경력 무관",
    complexSize: 690,
    deadline: "2026-03-31",
    isClosed: false
  },
  {
    id: 305,
    title: "시설과장 모집",
    area: "경기 > 화성시",
    position: "시설과장",
    salary: "월급 395만원(세전)",
    complexName: "동탄 센트럴자이",
    experience: "경력 무관",
    complexSize: 950,
    deadline: "2026-03-31",
    isClosed: false
  },
  {
    id: 306,
    title: "관리과장 경력직",
    area: "인천 > 연수구",
    position: "관리과장",
    salary: "월급 430만원(세전)",
    complexName: "송도 더샵 퍼스트월드",
    experience: "경력 5년 이상",
    complexSize: 1100,
    deadline: "2026-03-31",
    isClosed: false
  },
  {
    id: 307,
    title: "전기과장 채용",
    area: "서울 > 송파구",
    position: "전기과장",
    salary: "월급 460만원(세전)",
    complexName: "잠실 엘스",
    experience: "고졸이상",
    complexSize: 1200,
    deadline: "2026-03-31",
    isClosed: false
  },
  {
    id: 308,
    title: "기전직 모집",
    area: "경기 > 과천시",
    position: "기전직",
    salary: "월급 370만원(세전)",
    complexName: "과천 푸르지오 써밋",
    experience: "경력 무관",
    complexSize: 680,
    deadline: "2026-03-31",
    isClosed: false
  },
  {
    id: 309,
    title: "시설관리 직원 채용",
    area: "경기 > 수원시 영통구",
    position: "시설관리",
    salary: "월급 350만원(세전)",
    complexName: "광교 중흥 S-클래스",
    experience: "경력 무관",
    complexSize: 720,
    deadline: "2026-03-31",
    isClosed: false
  },
  {
    id: 310,
    title: "시설관리 직원 채용",
    area: "강원 > 원주시",
    position: "시설관리",
    salary: "월급 380만원(세전)",
    complexName: "원주기업도시 2차 호반베르디움",
    experience: "고졸이상",
    complexSize: 720,
    deadline: "2026-02-09",
    isClosed: false
  }
];


/* ===============================
   컨테이너 선택
=============================== */
const container = document.querySelector('.director-card-list');


/* ===============================
   날짜 포맷 (~03-31)
=============================== */
function formatDeadline(dateStr) {
    return `~ ${dateStr.slice(5)}`;
}


/* ===============================
   마감 여부 체크
=============================== */

function isExpired(dateStr) {
    const now = new Date();
    // 마감일 23:59:59 생성
    const endDate = new Date(dateStr + "T23:59:59");
    return now > endDate;
}



/* ===============================
   카드 렌더링
=============================== */
function renderDirectorCards(list) {
    if (!container) return;
    container.innerHTML = '';
    if (!list || list.length === 0) return;


    /* ---------- 마감 공고 제외 ---------- */
    const filteredList = list.filter(item => {
        if (item.isClosed) return false;
        if (isExpired(item.deadline)) return false;
        return true;
    });
    if (filteredList.length === 0) return;


    /* ---------- 카드 생성 ---------- */
    filteredList.forEach(item => {
        const deadlineText = formatDeadline(item.deadline);
        const cardHTML = `
            <a href="/job-detail.html?id=${item.id}" 
               class="director-card-link">
                <div class="director-card">
                    <div class="director-card__top">
                        <span class="director-card__company">
                            ${item.complexName}
                        </span>
                    </div>
                    <h3 class="director-card__title">
                        ${item.title}
                    </h3>
                    <div class="director-card__tags">
                        <span class="tag">${item.area} |</span>
                        <span class="tag">${item.experience} |</span>
                        <span class="tag">${item.salary}</span>
                    </div>
                    <div class="director-card__bottom">
                        <span class="director-card__dday">
                            ${deadlineText}
                        </span>
                        <button class="director-card__detail">
                            상세보기
                        </button>
                    </div>
                </div>
            </a>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });

    /* ---------- 빈 카드 계산 ---------- */
    const remainder = filteredList.length % 3;
    let emptyCount = 0;

    if (remainder === 1) emptyCount = 2;
    if (remainder === 2) emptyCount = 1;

    /* ---------- 빈 카드 생성 ---------- */
    for (let i = 0; i < emptyCount; i++) {
        const emptyHTML = `
            <div class="director-card director-card--empty">

                <div class="director-card__empty">
                    <img class="job-card__img"
                        src="/assets/img/brandBox_logo.png" alt="공고 준비중" />
                    <span class="job-card__empty-text">
                        공고 준비 중입니다.
                    </span>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', emptyHTML);
    }
}

/* ===============================
   실행
=============================== */

document.addEventListener('DOMContentLoaded', () => {
    renderDirectorCards(directorList);
});
