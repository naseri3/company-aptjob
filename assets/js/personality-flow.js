/*
외부 인성검사 결과 API 미제공으로 인해 기획된 FLOW 기준으로 UI만 제어하는
프론트엔드 임시 처리 로직입니다. (서버/DB/ASP Session과 무관)
*/


/* -------------------------
   UI 상태값 (화면 제어용)
-------------------------- */
// 0: 응시 전
// 2: 부적합 → 재응시 안내
// 3: 재응시 후 제출 가능
let personalityStatus = 0;


/* -------------------------
   DOM 요소
-------------------------- */
const boxStart  = document.getElementById('box-start');   // 응시 버튼
const boxSubmit = document.getElementById('box-submit');  // 제출 가능
const boxRetry  = document.getElementById('box-retry');   // 재응시 안내


/* -------------------------
   UI 렌더링
-------------------------- */
function renderBox() {
  boxStart.style.display  = 'none';
  boxSubmit.style.display = 'none';
  boxRetry.style.display  = 'none';

  if (personalityStatus === 0) {
    boxStart.style.display = 'block';
  } else if (personalityStatus === 2) {
    boxRetry.style.display = 'block';
  } else if (personalityStatus === 3) {
    boxSubmit.style.display = 'block';
  }
}


/* -------------------------
   인성검사 최초 응시
-------------------------- */
function startTest() {
  sessionStorage.setItem('returnToApply', 'Y');
  sessionStorage.setItem('testType', 'start');

  window.open(
    'https://www.aptjob.net/subpage/survey_pre_guide.html',
    '_blank'
  );
}



/* -------------------------
   인성검사 재응시
-------------------------- */
function retryTest() {
  sessionStorage.setItem('returnToApply', 'Y');
  sessionStorage.setItem('testType', 'retry');

  window.open(
    'https://etesys.select-test.co.kr/user/page/test',
    '_blank'
  );

  alert('재응시가 완료되면 검사 창을 닫은 후 새로고침(F5) 해주세요.');
}


/* -------------------------
   apply 페이지 로드 시
-------------------------- */
window.onload = function () {
  const returned = sessionStorage.getItem('returnToApply');
  const testType = sessionStorage.getItem('testType');

  if (returned === 'Y') {
    if (testType === 'start') {
		personalityStatus = 2;                   // 최초 응시 후 → 재응시 안내
    } else if (testType === 'retry') {
		personalityStatus = 3;                    // 재응시 후 → 제출 가능
    }

    sessionStorage.removeItem('returnToApply');
    sessionStorage.removeItem('testType');
  }

  renderBox();
};


/* -------------------------
   detail → apply 복귀 처리
--------------------------
window.addEventListener('load', function () {
  const shouldReturnToApply = sessionStorage.getItem('returnToApply');

  if (shouldReturnToApply === 'Y') {
    const params = new URLSearchParams(window.location.search);
    const rSeq = params.get('R_SEQ');

    let applyUrl = '/subpage/comfirm_apply_test.html';
    if (rSeq) {
      applyUrl += '?R_SEQ=' + rSeq;
    }

    sessionStorage.removeItem('returnToApply');
    location.replace(applyUrl);
  }
});
 */