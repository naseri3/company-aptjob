
		/**
		 * BE에서 내려줬다고 가정하는 값
		 * 실제 연동 시 이 값만 교체
		 */
		 console.log('index_test_modal.js 로드됨');

		const userInfo = {
			isLogin: true,
			memberType: 'PERSONAL',
			// 인성검사 json
			personalityTest: {
			  status: 'ING',
			  continueUrl: 'https://etesys.select-test.co.kr/user/page/test'
			},
			// 정성검사 json
			aptitudeTest: { status: 'ING', continueUrl: '#' }
		};

		document.addEventListener('DOMContentLoaded', () => {
		console.log('모달 JS 실행됨');
		  const { isLogin, memberType, personalityTest, aptitudeTest } = userInfo;

		  // 1. 노출 조건
		  if (!isLogin || memberType !== 'PERSONAL') return;

		  const hasPersonality = personalityTest.status === 'ING';
		  const hasAptitude = aptitudeTest.status === 'ING';

		  if (!hasPersonality && !hasAptitude) return;

		  // 2. 버튼 구성
		  const btnArea = document.getElementById('continueBtnArea');
		  btnArea.innerHTML = '';

		  if (hasPersonality) {
			btnArea.appendChild(createContinueButton(
			  '인성검사 이어하기',
			  personalityTest.continueUrl
			));
		  }

		  if (hasAptitude) {
			btnArea.appendChild(createContinueButton(
			  '적성검사 이어하기',
			  aptitudeTest.continueUrl
			));
		  }

		  // 3. 모달 노출
		  openTestModal();
		});

		function createContinueButton(text, url) {
		  const btn = document.createElement('button');
		  btn.className = 'btn primary';
		  btn.textContent = text;
		  btn.onclick = () => window.open(url, '_blank');
		  return btn;
		}

		function openTestModal() {
		  document.getElementById('testContinueModal')
			.classList.remove('hidden');
		}

		function closeTestModal() {
		  document.getElementById('testContinueModal')
			.classList.add('hidden');
		}