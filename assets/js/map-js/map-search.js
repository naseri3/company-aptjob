/*==========================================================
    지역 필터
===========================================================*/
const regionBtn = document.getElementById("regionBtn");
const dropdown = document.getElementById("regionDropdown");
const sidoList = document.getElementById("sidoList");
const gugunList = document.getElementById("gugunList");
const btnText = regionBtn.querySelector(".region-btn__text");

const geocoder = new kakao.maps.services.Geocoder();

async function loadRegionData() {
    try {
        const res = await fetch("/assets/data/region-data.json");
        if (!res.ok) {
            throw new Error("지역 데이터 로딩 실패");
        }
        regionData = await res.json();
    } catch (err) {
        console.error(err);
    }
}


/*==========================================================
    우리집 주소
===========================================================*/
const homeInput = document.getElementById("homeAddressInput");
const moveBtn = document.querySelector(".btn-move");

let homeMarker = null;


/*==========================================================
    기본 주소 로직
===========================================================*/
function initHomeAddress() {
    const memberAddress = window.memberAddress || null;
    const cookieAddress = localStorage.getItem("homeAddress");

    let address = "서울 중구 세종대로 110";

    if (memberAddress) {
        address = memberAddress;
    } 
    else if (cookieAddress) {
        address = cookieAddress;
    }

    homeInput.value = address;
    moveToAddress(address);
}



/*==========================================================
    주소 검색창
===========================================================*/
homeInput.addEventListener("click", openAddressSearch);

function openAddressSearch() {
    new daum.Postcode({
        oncomplete: function (data) {
            const address = data.address;
            homeInput.value = address;
            localStorage.setItem("homeAddress", address);
            moveToAddress(address);
        }
    }).open();
}


/*==========================================================
    지도 이동 + 마커 생성
===========================================================*/
function moveToAddress(address) {
    geocoder.addressSearch(address, function (result, status) {
        if (status !== kakao.maps.services.Status.OK) {
            alert("주소를 찾을 수 없습니다.");
            return;
        }

        const coords = new kakao.maps.LatLng(
            result[0].y,
            result[0].x
        );

        // 지도 이동
        map.panTo(coords);
        map.setLevel(4);

        // 기존 마커 제거
        if (homeMarker) {
            homeMarker.setMap(null);
        }

        // 우리집 마커
        homeMarker = new kakao.maps.Marker({
            map,
            position: coords,
            image: new kakao.maps.MarkerImage(
                "/assets/img/mapapidoc/map-marker.png",
                new kakao.maps.Size(32, 32),
                { offset: new kakao.maps.Point(16, 32) }
            ),
            zIndex: 9999
        });

        // 거리 계산 기준 좌표
        locPosition = coords;
    });
}


/*==========================================================
    이동 버튼
===========================================================*/
moveBtn.addEventListener("click", () => {
    const address = homeInput.value.trim();

    if (!address) {
        alert("주소를 먼저 검색해주세요.");
        return;
    }
    moveToAddress(address);
});


/*==========================================================
    지역 드롭다운
===========================================================*/
function toggleRegion() {
    const isOpen = dropdown.classList.contains("active");

    if (isOpen) {
        dropdown.classList.remove("active");
        regionBtn.classList.remove("active");
    } else {
        dropdown.classList.add("active");
        regionBtn.classList.add("active");
    }

}


/*==========================================================
    외부 클릭 시 닫기
===========================================================*/
document.addEventListener("click", (e) => {
    if (!e.target.closest(".map-search")) {
        dropdown.classList.remove("active");
    }
});


/*==========================================================
    시도 렌더링
===========================================================*/
function renderSido() {
    sidoList.innerHTML = "";

    Object.keys(regionData).forEach((sido, index) => {
        const li = document.createElement("li");
        if (index === 0) li.classList.add("active");

        li.innerHTML = `
            <span>${sido}</span>
            <span class="check">✔</span>
        `;

        li.addEventListener("click", () => {
            selectSido(li, sido);
        });

        sidoList.appendChild(li);
    });
}


/*==========================================================
    구군 렌더링
===========================================================*/
function renderGugun(sido) {
    gugunList.innerHTML = "";

    regionData[sido].forEach((gugun, index) => {
        const li = document.createElement("li");
        if (index === 0) li.classList.add("active");

        li.innerHTML = `
            <span>${gugun}</span>
            <span class="check">✔</span>
        `;

        li.addEventListener("click", () => {
            selectGugun(li);
        });

        gugunList.appendChild(li);

    });

}


/*==========================================================
    시도 선택
===========================================================*/
function selectSido(target, sido) {
    [...sidoList.children].forEach(li => li.classList.remove("active"));
    target.classList.add("active");
    renderGugun(sido);
}


/*==========================================================
    구군 선택
===========================================================*/
function selectGugun(target) {
    [...gugunList.children].forEach(li => li.classList.remove("active"));
    target.classList.add("active");
}


/*==========================================================
    지역 검색 버튼
===========================================================*/
document.querySelector(".btn-search").addEventListener("click", () => {

    const sido = document.querySelector("#sidoList .active span").textContent;
    const gugun = document.querySelector("#gugunList .active span").textContent;

    const address = gugun === "전체"
        ? `${sido}`
        : `${sido} ${gugun}`;

    geocoder.addressSearch(address, function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(
                result[0].y,
                result[0].x
            );

            map.setCenter(coords);
            map.setLevel(5);
        } else {
            alert("해당 지역을 찾을 수 없습니다.");
        }
    });

    btnText.textContent = "지역";
    dropdown.classList.remove("active");
});


/*==========================================================
    주소 검색 (우편번호 API)
===========================================================*/
function openAddressSearch() {
    new daum.Postcode({
        oncomplete: function (data) {
            let address = '';

            // 도로명 주소 우선
            if (data.roadAddress) {
                address = data.roadAddress;
            } else {
                address = data.jibunAddress;
            }
            // input 입력
            homeInput.value = address;
            // 저장
            localStorage.setItem("homeAddress", address);
            // 지도 이동
            moveToAddress(address);
        }
    }).open();
}



/*==========================================================
    초기 실행
===========================================================*/
document.addEventListener("DOMContentLoaded", async () => {
    await loadRegionData();
    renderSido();
    renderGugun("서울");
    initHomeAddress();
});