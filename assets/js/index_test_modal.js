
/**
 * BE에서 내려줬다고 가정하는 값
 * 실제 연동 시 이 값만 교체
 */
console.log('index_test_modal.js 로드됨');

const userInfo = {
  isLogin: true,
  memberType: 'PERSONAL',

  // 인성검사
  personalityTest: {
    status: 'ING', // ING | DONE | NONE
    continueUrl: 'https://etesys.select-test.co.kr/user/page/test'
  },

  // 적성검사
  /* aptitudeTest: {
    status: 'ING',
    continueUrl: '#'
  } */
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('검사 이어하기 모달 JS 실행');

  const { isLogin, memberType, personalityTest, aptitudeTest } = userInfo;

  /* -----------------------------
     1. 모달 노출 조건
  ------------------------------ */
  if (!isLogin) return;
  if (memberType !== 'PERSONAL') return;

  const hasPersonality = personalityTest?.status === 'ING';
  const hasAptitude    = aptitudeTest?.status === 'ING';

  if (!hasPersonality && !hasAptitude) return;

  /* -----------------------------
     2. 버튼 구성
  ------------------------------ */
  const btnArea = document.getElementById('continueBtnArea');
  if (!btnArea) return;

  btnArea.innerHTML = '';

  if (hasPersonality) {
    btnArea.appendChild(
      createContinueButton(
        '인성검사 이어하기',
        personalityTest.continueUrl
      )
    );
  }
	/*
  if (hasAptitude) {
    btnArea.appendChild(
      createContinueButton(
        '적성검사 이어하기',
        aptitudeTest.continueUrl
      )
    );
  }
  */

  /* -----------------------------
     3. 모달 노출
  ------------------------------ */
  openTestModal();
});

/* =============================
   버튼 생성
============================= */
function createContinueButton(text, url) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'aptjob-test-continue-modal__btn';
  btn.textContent = text;

  btn.addEventListener('click', () => {
    window.open(url, '_blank');
  });

  return btn;
}

/* =============================
   모달 제어
============================= */
function openTestModal() {
  const modal = document.getElementById('testContinueModal');
  if (!modal) return;

  modal.classList.remove('is-hidden');
}

function closeTestModal() {
  const modal = document.getElementById('testContinueModal');
  if (!modal) return;

  modal.classList.add('is-hidden');
}
