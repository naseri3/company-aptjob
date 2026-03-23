/***************************************************
 * GLOBAL STATE
 * -------------------------------------------------
 * - 사용자가 선택한 지역, 직무, 경력 상태 저장
 * - 전국 모드 / 하위 지역 / 서울 전체 등 모두 동일하게 배열에 저장
 ***************************************************/
let selectedRegions = ["전국"];
let selectedJobs = [];
let selectedCareer = "경력무관";


// 지역 버튼 클릭 시 실행되는 함수 예시


/***************************************************
 * 공통 유틸 함수
 ***************************************************/
// 지역 8개 제한
const isRegionLimitExceeded = () => selectedRegions.length >= 8;

// "서울 > 서울 전체" 형식의 이름 생성
const getDefaultRegionName = (upperName, defaultBtn) =>
    `${upperName} > ${defaultBtn.textContent.trim()}`;

// 동일 시·도에 선택된 지역이 있는지 검사
const hasRegionInSameProvince = (upperName) =>
    selectedRegions.some((r) => r.startsWith(`${upperName} >`));

// 모든 하위 지역 버튼 활성화 제거
const clearDistrictButtons = () =>
    document
        .querySelectorAll(".district-options button")
        .forEach((b) => b.classList.remove("active"));



/***************************************************
 * 선택된 조건을 UI(selected-box)에 출력
 ***************************************************/
function updateSelectedBox() {

    const selectedBox = document.querySelector(".selected-box");
	
	//지역/직무 코드값 전송을 위한
	const regionInput = document.getElementById("selectedRegion");
	const jobInput = document.getElementById("selectedJob");


    if (!selectedBox) return;

    selectedBox.innerHTML = "";



    const amountInput = document.getElementById("amount");
    const hasValue =
        selectedRegions.length > 0 ||
        selectedJobs.length > 0 ||
        selectedCareer ||
        (amountInput?.value.trim() !== "");

    // 조건이 완전 비었을 때
    if (!hasValue) {
        selectedBox.innerHTML = `
      <p class="condition-guide">
        <img src="./assets/img/Vector.png" alt="">
        검색 조건을 설정해주세요.
      </p>`;
        return;
    }

    /*************** 지역 출력 ***************/
    if (selectedRegions.length > 0) {
		
        const line = createLine("지역 :");
        selectedRegions.forEach((region) => {
            const tag = createTag(region, () => removeRegion(region));
            line.appendChild(tag);
        });
        selectedBox.appendChild(line);

		regionInput.value = getActiveRegionCodes();		//지역 코드값 전송을 위한
	
	} else {
		selectedRegions = ["전국"];
        const line = createLine("지역 :");
        selectedRegions.forEach((region) => {
            const tag = createTag(region, () => removeRegion(region));
            line.appendChild(tag);
        });
        selectedBox.appendChild(line);

		regionInput.value = getActiveRegionCodes();		//지역 코드값 전송을 위한

    }
	console.log('regionInput : '+ regionInput.value);

    /*************** 경력 출력 ***************/

 

	const yearVal = document.getElementById("year")?.value.trim();
	let careerText = "";

	if (selectedCareer === "경력" && yearVal) {
		careerText = `경력 ${yearVal}년 이상`;
	} else if (selectedCareer === "경력무관") {
		careerText = "경력무관";
	} else if (selectedCareer === "신입") { // '신입'일 경우를 추가합니다.
		careerText = "신입";
	}
 

    // 숫자 없는 '경력' 은 출력하지 않는다
	if (careerText) {
		const line = createLine("경력 :");
		const tag = createTag(careerText, removeCareer); // removeCareer 함수가 '신입'도 처리하도록 수정이 필요할 수 있습니다.
		line.appendChild(tag);
		selectedBox.appendChild(line);
	}


    /*************** 급여 출력 ***************/
    if (amountInput?.value.trim() !== "") {
        const line = createLine("급여 :");
        const tag = createTag(
            `${amountInput.value}만원 이상`,
            () => ((amountInput.value = ""), updateSelectedBox())
        );
        line.appendChild(tag);
        selectedBox.appendChild(line);
    }

    /*************** 직무 출력 ***************/
    if (selectedJobs.length > 0) {
        const line = createLine("직무 :");
        selectedJobs.forEach((job) => {
            const tag = createTag(job, () => removeJob(job));
            line.appendChild(tag);
        });
        selectedBox.appendChild(line);

		jobInput.value = getActiveJobCodes();		//직무 코드값 전송을 위한

    } else {
		selectedJobs = [];
        const line = createLine("직무 :");
        selectedJobs.forEach((job) => {
            const tag = createTag(job, () => removeJob(job));
            line.appendChild(tag);
        });
        selectedBox.appendChild(line);

		jobInput.value = getActiveJobCodes();		//직무 코드값 전송을 위한

	}
	console.log('jobInput : '+ jobInput.value);

	syncUpperRegionActive();
}



/***************************************************
 * 상위 지역(active) 자동 반영 기능
 ***************************************************/
function syncUpperRegionActive() {
    const regionButtons = document.querySelectorAll(".region-options .btn");

    regionButtons.forEach((btn) => {
        const upperName = btn.textContent.trim();

        // 전국은 별도 처리
        if (upperName === "전국") return;

        // selectedRegions에 "서울 >", "경기 >", "부산 >" 같은 prefix가 있는지 확인
        const hasThisRegion = selectedRegions.some((r) =>
            r.startsWith(`${upperName} >`)
        );

        if (hasThisRegion) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}



/***************************************************
 * 출력 태그 UI 생성 함수들
 ***************************************************/
function createLine(labelText) {
    const div = document.createElement("div");
    div.className = "selected-line";

    const strong = document.createElement("strong");
    strong.textContent = labelText;

    div.appendChild(strong);
    return div;
}

function createTag(text, onRemove) {
    const span = document.createElement("span");
    span.textContent = text;

    const btn = document.createElement("button");
    btn.classList.add("remove-btn");
    btn.textContent = "X";
    btn.onclick = onRemove;

    span.appendChild(btn);
    return span;
}



/***************************************************
 * X 버튼로 지역 삭제 시 처리
 ***************************************************/
function removeRegion(region) {
    selectedRegions = selectedRegions.filter((r) => r !== region);

    const [upperName, lowerName] = region.split(" > ");

    // 하위 버튼 디액티브 처리
    const lowerBtn = [...document.querySelectorAll(".district-options button")]
        .find((b) => b.textContent.trim() === lowerName);
    if (lowerBtn) lowerBtn.classList.remove("active");

    // 전국 삭제 시 → 단순 UI 업데이트
    if (region === "전국") return updateSelectedBox();

    // 동일 시도에 다른 지역 남아 있는지?
    const remain = selectedRegions.filter((r) =>
        r.startsWith(`${upperName} >`)
    );


    if (remain.length > 0) return updateSelectedBox();

    // 하위 지역 모두 없어짐 → “○○ 전체” 자동 선택
    const upperBtn = [...document.querySelectorAll(".region-options .btn")]
        .find((b) => b.textContent.trim() === upperName);

    const upperKey = upperBtn?.dataset.district;
    const block = upperKey && document.querySelector(`.district.${upperKey}`);
    const defaultBtn =
        block &&
        block.querySelector(`button[data-district="${upperKey}-all"]`);

    const defaultName =
        defaultBtn && getDefaultRegionName(upperName, defaultBtn);

    if (defaultBtn && region !== defaultName) {
        if (isRegionLimitExceeded()) {
            alert("지역은 최대 8개까지만 선택 가능합니다.");
            return updateSelectedBox();
        }

        defaultBtn.classList.add("active");
        selectedRegions.push(defaultName);
        return updateSelectedBox();
    }


    // 완전 해제되면 UI 숨김
    upperBtn?.classList.remove("active");
    block && (block.style.display = "none");

    updateSelectedBox();

}



/***************************************************
 * 경력 삭제
 ***************************************************/
function removeCareer() {
    selectedCareer = "";
    const yearInput = document.getElementById("year");

    yearInput.value = "";
    yearInput.disabled = true;

    document
        .querySelectorAll('input[name="career"]')
        .forEach((r) => (r.checked = false));

    updateSelectedBox();
}



/***************************************************
 * 직무 삭제
 ***************************************************/
function removeJob(job) {
    selectedJobs = selectedJobs.filter((j) => j !== job);

    document
        .querySelectorAll(".occupation-options .btn")
        .forEach((b) => {
            if (b.textContent.trim() === job) b.classList.remove("active");
        });

    updateSelectedBox();
}



/***************************************************
 * 초기 기본 세팅
 ***************************************************/
document.addEventListener("DOMContentLoaded", () => {

    /** 전국 기본 활성화 **/
    const allRegionBtn = document.querySelector('.region-options .btn[data-district="all"]');
    if (allRegionBtn) allRegionBtn.classList.add("active");

    /** 지역 초기값 **/
    selectedRegions = ["전국"];

    /** 경력 초기값 **/
    const noneRadio = document.querySelector('input[name="career"][value="경력무관"]');
    const yearInput = document.getElementById("year");

    if (noneRadio) noneRadio.checked = true;
    selectedCareer = "경력무관";
    if (yearInput) yearInput.disabled = true;

    updateSelectedBox();



});

// 일부 브라우저에서 DOM 순서 문제 해결용
window.addEventListener("load", () => updateSelectedBox());


/***************************************************
 * 지역/직무/경력 이벤트 묶기
 ***************************************************/
document.addEventListener("DOMContentLoaded", () => {

    const regionButtons = document.querySelectorAll(".region-options .btn");
    const allDistrictBlocks = document.querySelectorAll(".district-options .district");
    const districtContainer = document.querySelector(".district-options");

    const careerRadios = document.querySelectorAll('input[name="career"]');
    const yearInput = document.getElementById("year");

    const resetBtn = document.getElementById("resetBtn");



    /***************************************************
     * 상위 지역 클릭(서울, 경기… 전국 포함)
     ***************************************************/
    regionButtons.forEach((upperBtn) => {
        upperBtn.addEventListener("click", () => {
            const upperKey = upperBtn.dataset.district;
            const upperName = upperBtn.textContent.trim();

            // 기존 상위 active 초기화 후 현재 버튼 active
            regionButtons.forEach((b) => b.classList.remove("active"));
            upperBtn.classList.add("active");

            /**************** 전국 클릭 시: 전체 초기화 ****************/
            if (upperKey === "all") {

                selectedRegions = ["전국"];

                // 상위 active 정리
                regionButtons.forEach((b) => b.classList.remove("active"));
                upperBtn.classList.add("active");

                // 하위 지역 UI 전체 숨기기
                clearDistrictButtons();
                allDistrictBlocks.forEach((d) => (d.style.display = "none"));
                districtContainer.style.display = "none";

                updateSelectedBox();
                return;
            }
			
			//지도용으로 하나의 지역만 선택
			selectedRegions = ["전국"];

            /**************** 시·도 클릭 시 ****************/
            selectedRegions = selectedRegions.filter((r) => r !== "전국");

            // 기존 하위 패널 숨기기
            allDistrictBlocks.forEach((d) => (d.style.display = "none"));
            districtContainer.style.display = "grid";

            const block = document.querySelector(`.district.${upperKey}`);
            block.style.display = "grid";

            // “○○ 전체” 버튼
            const lowerBtns = block.querySelectorAll("button");
            const defaultBtn = block.querySelector(`button[data-district="${upperKey}-all"]`);
            const defaultName = getDefaultRegionName(upperName, defaultBtn);

            // 해당 시·도에서 선택된 지역이 없으면 자동 전체 선택
            if (!hasRegionInSameProvince(upperName)) {
                if (isRegionLimitExceeded()) {
                    alert("지역은 최대 8개까지만 선택 가능합니다.");
                    return;
                }
                defaultBtn.classList.add("active");
                selectedRegions.push(defaultName);
            }

            // 하위 구·군 클릭 이벤트 등록
            lowerBtns.forEach((lowerBtn) => {
                lowerBtn.onclick = () =>
                    handleLowerClick(upperName, upperKey, lowerBtn, lowerBtns, defaultBtn);
            });

            updateSelectedBox();
        });


		/***************************************************
		 * URL 파라미터 sido 처리 (지역 자동 선택)
		 ***************************************************/
		const urlParams = new URLSearchParams(window.location.search);
		const sido = urlParams.get('sido') || "서울";
 
		if (sido && regionButtons.length > 0) {
			// Array.from을 사용하여 안전하게 배열로 변환 후 검색
			const targetUpperBtn = Array.from(regionButtons).find((btn) => {
				return btn.textContent.trim() === sido && btn.dataset.district !== "all";
			});

			if (targetUpperBtn) {
				// 기존 '전국' 기본값을 지우고 클릭 이벤트 발생
				selectedRegions = selectedRegions.filter((r) => r !== "전국");
				targetUpperBtn.click();
				
				// UI가 즉시 반영되도록 스크롤 이동 (필요 시)
				targetUpperBtn.scrollIntoView({ block: 'nearest' });
			}
		}

    });



    /***************************************************
     * 하위 구/군 클릭 처리
     ***************************************************/
	function handleLowerClick(upperName, upperKey, lowerBtn, lowerBtns, defaultBtn) {
		const lowerName = lowerBtn.textContent.trim();
		const regionFull = `${upperName} > ${lowerName}`;
		const defaultName = getDefaultRegionName(upperName, defaultBtn);

		// 1. 모든 하위 버튼(전체 버튼 포함)에서 active 클래스 제거
		lowerBtns.forEach((b) => b.classList.remove("active"));
		defaultBtn.classList.remove("active");

		// 2. 현재 상위 지역(upperName)에 해당하는 기존 선택 기록을 배열에서 삭제
		// (단일 선택이므로 해당 도/시의 다른 구 선택을 비워야 함)
		selectedRegions = selectedRegions.filter(
			(r) => !r.startsWith(`${upperName}`)
		);

		/********** ○○ 전체 클릭 **********/
		if (lowerBtn === defaultBtn) {
			lowerBtn.classList.add("active");
			selectedRegions.push(defaultName);
		} 
		/********** 개별 구/군 클릭 **********/
		else {
			// 이미 선택된 것을 다시 눌러서 해제하는 경우 (토글 기능 유지 여부 선택)
			// 만약 무조건 하나는 선택되어야 한다면 if문 없이 바로 push 하세요.
			lowerBtn.classList.add("active");
			selectedRegions.push(regionFull);
		}

		// 3. UI 업데이트 및 지도 이동 함수 호출 (필요 시)
		updateSelectedBox();
		
		// 이전에 만든 지도 이동 함수가 있다면 여기서 호출 가능
		// const searchName = lowerBtn === defaultBtn ? upperName : upperName + " " + lowerName;
		// moveToLocation(searchName, lowerBtn === defaultBtn ? 8 : 5);
	}

/////// 검색 파라메타로 넘어온 값이 있을때
	// strjob 파라미터 예: "개발자,디자이너"
	const queryString = window.location.search; // "?name=또치&age=30" 같은 문자열
	const urlParams = new URLSearchParams(queryString);
	const strjob = urlParams.get('strjob'); 
	
	// 쉼표로 분리하여 배열 생성
	const initialJobs = strjob ? strjob.split(",").map(s => s.trim()) : [];

	// 초기 선택 상태 설정 함수
	function initializeSelectedJobs() {
		document.querySelectorAll(".occupation-options .btn").forEach((btn) => {
			const jobName = btn.textContent.trim();
			if (initialJobs.includes(jobName)) {
				btn.classList.add("active");
				selectedJobs.push(jobName);
			} else {
				btn.classList.remove("active");
			}
		});
		updateSelectedBox();
	}

	// 초기화 호출
	if (initialJobs)
	{
		initializeSelectedJobs();
	}


/////// 검색 파라메타로 넘어온 값이 있을때
	

    /***************************************************
     * 직무 선택
     ***************************************************/
    document.querySelectorAll(".occupation-options .btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const jobName = btn.textContent.trim();

            if (btn.classList.contains("active")) {
                btn.classList.remove("active");
				 updateSelectedBox();	//재선택시 해제 후 코드값이 업데이트 안되서 추가 함.
                selectedJobs = selectedJobs.filter((j) => j !== jobName);
            } else {
                if (selectedJobs.length >= 3) {
                    alert("직무는 최대 3개까지 선택 가능합니다.");
                    return;
                }
                btn.classList.add("active");
                selectedJobs.push(jobName);
            }

            updateSelectedBox();
        });
    });



    /***************************************************
     * 경력 라디오 선택
     ***************************************************/
    careerRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            selectedCareer = radio.value;

            if (radio.value === "경력") {
                yearInput.disabled = false;
                yearInput.focus();
            } else {
                yearInput.disabled = true;
                yearInput.value = "";
            }

            updateSelectedBox();
        });
    });

	// year 입력 필드에 이벤트 리스너 추가
	/*yearInput.addEventListener('input', () => {
		// 사용자가 입력할 때마다 UI를 업데이트합니다.
		updateSelectedBox();
	});*/

    /***************************************************
     * Enter로 검색 갱신
     ***************************************************/
    document.querySelectorAll(
        '#amount, #year, input[name="career"], input[name="status"]'
    ).forEach((input) => {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                updateSelectedBox();
            }
        });
    });



    /***************************************************
     * 초기화 버튼
     ***************************************************/
    resetBtn?.addEventListener("click", () => {
        const amountInput = document.getElementById("amount");

        // 입력 초기화
        amountInput.value = "";
        yearInput.value = "";
        yearInput.disabled = true;

        // 경력 초기화
        careerRadios.forEach((r) => (r.checked = false));
        document.querySelector('input[name="career"][value="경력무관"]').checked = true;
        selectedCareer = "경력무관";

        // 선택값 초기화
        selectedRegions = ["전국"];
        selectedJobs = [];

        clearDistrictButtons();
        allDistrictBlocks.forEach((b) => (b.style.display = "none"));
        districtContainer.style.display = "none";

        regionButtons.forEach((b) => b.classList.remove("active"));
        const allRegionBtn = document.querySelector('.region-options .btn[data-district="all"]');
        if (allRegionBtn) allRegionBtn.classList.add("active");

        document
            .querySelectorAll(".occupation-options .btn")
            .forEach((b) => b.classList.remove("active"));

        updateSelectedBox();
    });

});


//선택한 지역코드값을 가져옴
function getActiveRegionCodes() {
    const selectedRegionCodes = [];
	const regionButtons = document.querySelectorAll(".district-options .district button.btn-outline-secondary");
    regionButtons.forEach(button => {
        // 'active' 클래스를 가지고 있는지 확인하고, data-region 속성이 있는지 확인합니다.
        if (button.classList.contains("active") && button.dataset.region) {
            selectedRegionCodes.push(button.dataset.region);
        }
    });

    return selectedRegionCodes;
}

//선택한 직무코드값을 가져옴
function getActiveJobCodes() {
    const selectedJobCodes = [];
	const jobButtons = document.querySelectorAll(".occupation-options .btn");
   
	jobButtons.forEach(button => {
        // 'active' 클래스를 가지고 있는지 확인하고, data-region 속성이 있는지 확인합니다.
        if (button.classList.contains("active") && button.dataset.job) {
            selectedJobCodes.push(button.dataset.job);
        }
    });

	/*// strjob 파라미터가 있고 빈 문자열이 아니면 배열에 추가
    if (strjob && strjob.trim() !== "") {
        selectedJobCodes.push(strjob.trim());
    }*/

    return selectedJobCodes;
}


