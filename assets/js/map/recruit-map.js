/*==========================================================
    데이터
===========================================================*/
const positions = [
  {
    title: '서울시청',
    jobType: '관리과장',
    company: '(주)커피빈코리아',
    pay: '1,401,920',
    latlng: new kakao.maps.LatLng(37.5665, 126.9780)
  },
  {
    title: '덕수궁',
    jobType: '시설기사',
    company: '시설관리(주)',
    pay: '2,200,000',
    latlng: new kakao.maps.LatLng(37.5658, 126.9752)
  }
];



/*==========================================================
    패널 제어
===========================================================*/
window.openPanel = function (data) {
  const panel = document.getElementById('jobPanel');
  const content = document.getElementById('jobPanelContent');

  panel.classList.add('is-open');

  content.innerHTML = `
    <div class="job-card">
      <div class="job-card__title">${data.title}</div>
      <div class="job-card__meta">${data.company}</div>
      <div class="job-card__meta">직무: ${data.jobType}</div>
      <div class="job-card__meta">급여: ${data.pay}</div>
      <button class="btn btn-primary">공고 상세보기</button>
    </div>
  `;
};