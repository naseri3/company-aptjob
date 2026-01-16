/*
--------------------------------------------------
 인성검사 FE UI 제어 로직
 (BE API 연동 전 / 기획 기준 임시 구현)
--------------------------------------------------

[상태 정의]
NONE : 검사 이력 없음 / 결과 만료 → 응시하기
ING  : 검사 진행 중 → 이어하기
DONE : 검사 완료 → 완료 UI

※ 실서비스에서는 상태 판단은 BE에서 내려주는 것이 정석
   FE는 상태값에 따라 UI만 제어
--------------------------------------------------
*/

/* ==================================================
   DOM ELEMENTS
================================================== */
const boxStart    = document.getElementById('box-start');     // #1 응시하기
const boxContinue = document.getElementById('box-continue');  // #2 이어하기
const boxComplete = document.getElementById('box-complete');  // #3 검사완료

/* ==================================================
   STATUS ENUM
================================================== */
const STATUS = {
  NONE: 'NONE',   // 최초 응시 / 결과 없음
  ING: 'ING',     // 검사 진행 중
  DONE: 'DONE'    // 검사 완료
};

/* ==================================================
   MOCK DATA (임시)
   ※ 추후 BE 데이터로 교체
================================================== */
/*
BE 연동 시 예시:
{
  hasExam: true,
  isCompleted: false,
  examDate: "2026-01-07"
}
*/
const examInfo = {
  hasExam: false,        // 검사 이력 존재 여부
  isCompleted: false,    // 검사 완료 여부
  examDate: '2026-01-07' // 검사 시작일 (YYYY-MM-DD)
};

/* ==================================================
   STATUS DECISION LOGIC
================================================== */
function getPersonalityStatus(info) {
  // 1. 검사 이력 없음 → 응시하기
  if (!info.hasExam) {
    return STATUS.NONE;
  }

  // 2. 검사 완료 → 완료 UI
  if (info.isCompleted) {
    return STATUS.DONE;
  }

  // 3. 검사 진행 중 → 이어하기
  return STATUS.ING;
}

/* ==================================================
   UI RENDERING
================================================== */
function renderPersonalityBox(status) {
  if (!boxStart || !boxContinue || !boxComplete) return;

  // 초기화 (모두 숨김)
  boxStart.style.display    = 'none';
  boxContinue.style.display = 'none';
  boxComplete.style.display = 'none';

  // 상태별 노출
  switch (status) {
    case STATUS.NONE:
      boxStart.style.display = 'block';
      break;

    case STATUS.ING:
      boxContinue.style.display = 'block';
      break;

    case STATUS.DONE:
      boxComplete.style.display = 'block';
      break;
  }
}

/* ==================================================
   BUTTON ACTIONS
================================================== */

/**
 * 인성검사 응시하기
 * → 사전 안내 페이지
 */
function startTest() {
  window.open(
    '/subpage/survey_pre_guide.html',
    '_blank'
  );
}

/**
 * 인성검사 이어하기
 * → 외부 검사 페이지
 */
function continueTest() {
  window.open(
    'https://etesys.select-test.co.kr/user/page/test',
    '_blank'
  );
}

/* ==================================================
   INIT
================================================== */
document.addEventListener('DOMContentLoaded', function () {
  const status = getPersonalityStatus(examInfo);
  renderPersonalityBox(status);
});
