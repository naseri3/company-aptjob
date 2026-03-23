let positions = [];
let groupedPositions = {};
const markers = [];


/*==========================================================
    데이터
    - 같은 apartment 이름을 여러 건 넣으면 패널 하단 리스트로 묶여서 표시됨
===========================================================*/
fetch("/assets/data/job-map-data.json")
  .then(res => {
    if (!res.ok) {
      throw new Error("JSON 파일 못찾음");
    }
    return res.json();
  })
  .then(data => {

    positions = data.map(job => ({
      ...job,
      latlng: new kakao.maps.LatLng(job.lat, job.lng)
    }));

    initMapData();

  })
  .catch(err => {
    console.error("JSON 로딩 실패:", err);
  });


/*==========================================================
    지도 초기화
===========================================================*/
const mapContainer = document.getElementById('map');

const map = new kakao.maps.Map(mapContainer, {
    center: new kakao.maps.LatLng(37.5665, 126.9780),
    level: 3
});

map.addControl(new kakao.maps.MapTypeControl(), kakao.maps.ControlPosition.TOPRIGHT);
map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);


/*==========================================================
    지도 크기 제한
===========================================================*/
const MIN_LEVEL = 3;  // 최대 확대
const MAX_LEVEL = 9;  // 최대 축소

let isMaxAlertShown = false;

kakao.maps.event.addListener(map, 'zoom_changed', function () {
    let level = map.getLevel();

    // 확대 제한
    if (level < MIN_LEVEL) {
        map.setLevel(MIN_LEVEL);
        return;
    }

    // 축소 제한
    if (level > MAX_LEVEL) {
        map.setLevel(MAX_LEVEL);
        level = MAX_LEVEL;
    }

    // ✅ 줌할 때마다 마커 크기 즉시 재적용
    markers.forEach(marker => {
        const isActive = marker === activeMarker;
        marker.setImage(createMarkerImage(marker.category, isActive));
    });

    // ✅ MAX_LEVEL 도달 시 토스트 1초 노출
    if (level === MAX_LEVEL && !isMaxAlertShown) {
        showMapAlert();
        isMaxAlertShown = true;

        setTimeout(() => {
            isMaxAlertShown = false;
        }, 1200);
    }
});

/*==========================================================
    zoom 시 MAX_LEVEL Alert
===========================================================*/
function showMapAlert() {
    const alertEl = document.getElementById('mapAlert');
    if (!alertEl) return;

    alertEl.classList.add('show');

    clearTimeout(alertEl._hideTimer);
    alertEl._hideTimer = setTimeout(() => {
        alertEl.classList.remove('show');
    }, 1000);
}

/*==========================================================
    내 위치
===========================================================*/
const locPosition = new kakao.maps.LatLng(37.5663, 126.9780);

const myMarkerImage = new kakao.maps.MarkerImage(
    '/assets/img/mapapidoc/map-marker.png',
    new kakao.maps.Size(25, 25),
    { offset: new kakao.maps.Point(12.5, 25) }
);

const myMarker = new kakao.maps.Marker({
    map,
    position: locPosition,
    image: myMarkerImage, // 🔥 이거 빠졌던 거
    zIndex: 9999
});

map.setCenter(locPosition);


/*==========================================================
    유틸
===========================================================*/
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
}

function getDistanceFromMe(data) {
    return getDistance(
        locPosition.getLat(),
        locPosition.getLng(),
        data.latlng.getLat(),
        data.latlng.getLng()
    );
}

function truncate(text, length = 18) {
    return text.length > length ? text.slice(0, length) + '...' : text;
}


/*==========================================================
    그룹핑 (핵심 안정화)
===========================================================*/
function initMapData() {
    groupedPositions = positions.reduce((acc, item) => {
        const key = `${item.apartment}_${item.latlng.getLat()}_${item.latlng.getLng()}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push({ ...item });
        return acc;
    }, {});
    createMarkers();
}

/*==========================================================
    최신 공고
===========================================================*/
function getLatestJob(jobs) {
    return [...jobs].sort((a, b) =>
        new Date(b.startDate) - new Date(a.startDate)
    )[0];
}


/*==========================================================
    카테고리
===========================================================*/
function getCategoryGroup(job) {
    if (["소장", "관리과장", "관리주임"].includes(job)) return "관리";
    if (["경리(회계)", "서무"].includes(job)) return "경리";
    if (["기술과장", "시설과장", "시설기사","설비직(영선)", "기전직"].includes(job)) return "시설";
    if (["전기과장", "전기기사", "전기직"].includes(job)) return "전기";
    if (["커뮤니티", "경비원", "미화원", "기타"].includes(job)) return "기타";
}

const markerMap = {
    관리: "/assets/img/mapapidoc/map-marker-1.png",
    경리: "/assets/img/mapapidoc/map-marker-2.png",
    시설: "/assets/img/mapapidoc/map-marker-3.png",
    전기: "/assets/img/mapapidoc/map-marker-4.png",
    기타: "/assets/img/mapapidoc/map-marker-5.png"
};

function createMarkerImage(category, active) {
    const level = map.getLevel();
    const size = getMarkerSize(level, active);

    return new kakao.maps.MarkerImage(
        markerMap[category],
        new kakao.maps.Size(size, size),
        {
            offset: new kakao.maps.Point(size / 2, size)
        }
    );
}

/*==========================================================
    마커 크기 정의
===========================================================*/
function getMarkerSize(level, active) {
    if (level <= 5) return active ? 50 : 40; // 기본
    if (level <= 8) return active ? 40 : 30; // 축소

    return active ? 30 : 25; // 초축소
}


/*==========================================================
    zoom 시 모든 마커 다시 그리기
===========================================================*/
kakao.maps.event.addListener(map, 'zoom_changed', function () {

    let level = map.getLevel();

    if (level < MIN_LEVEL) {
        map.setLevel(MIN_LEVEL);
    }

    if (level > MAX_LEVEL) {
        map.setLevel(MAX_LEVEL);

        // ✅ 중복 방지
        if (!isMaxAlertShown) {
            showMapAlert();
            isMaxAlertShown = true;

            setTimeout(() => {
                isMaxAlertShown = false;
            }, 1200);
        }
    }
});


/*==========================================================
    필터
===========================================================*/
let selectedJobs = new Set();

function filterMarkers(type, e) {
    const allBtn = document.querySelector('.job-filter__btn');

    if (type === '전체') {
        selectedJobs.clear();

        document.querySelectorAll('.job-filter__btn').forEach(btn => {
            btn.classList.remove('is-active');
        });

        allBtn.classList.add('is-active');
    } else {
        allBtn.classList.remove('is-active');

        if (selectedJobs.has(type)) {
            selectedJobs.delete(type);
            e.currentTarget.classList.remove('is-active');
        } else {
            selectedJobs.add(type);
            e.currentTarget.classList.add('is-active');
        }

        if (selectedJobs.size === 0) {
            allBtn.classList.add('is-active');
        }
    }

    updateMarkers();
}

/*==========================================================
    마커 생성
===========================================================*/
let activeMarker = null;

function createMarkers() {
    Object.keys(groupedPositions).forEach(key => {
        const jobs = groupedPositions[key];
        const 대표 = getLatestJob(jobs);

        const category = getCategoryGroup(대표.jobType);
        const marker = new kakao.maps.Marker({
            map,
            position: 대표.latlng,
            image: createMarkerImage(category, false),
            zIndex: 1
        });
        marker.jobs = jobs;
        marker.groupKey = key;
        marker.category = category;
        kakao.maps.event.addListener(marker, 'click', function () {
            setActiveMarker(marker);
            openPanel(key);
        });
        markers.push(marker);

    });
    updateMarkers();
}


function setActiveMarker(marker) {
    // 기존 active 해제
    if (activeMarker) {
        activeMarker.setImage(
            createMarkerImage(activeMarker.category, false)
        );
        activeMarker.setZIndex(1);
    }
    // 현재 마커 활성화
    activeMarker = marker;

    marker.setImage(
        createMarkerImage(marker.category, true)
    );
    marker.setZIndex(999);
    // 지도 이동 (선택)
    map.panTo(marker.getPosition());
}

function updateMarkers() {

    markers.forEach(marker => {

        const jobs = marker.jobs;

        // 선택 없으면 전체 표시
        if (selectedJobs.size === 0) {
            const 대표 = getLatestJob(jobs);
            const category = getCategoryGroup(대표.jobType);

            marker.setPosition(대표.latlng);
            marker.category = category;
            marker.setImage(createMarkerImage(category, false));
            marker.setMap(map);
            return;
        }

        // 선택된 직무 기준 필터
        const filteredJobs = jobs.filter(job =>
            selectedJobs.has(job.jobType) ||
            selectedJobs.has(getCategoryGroup(job.jobType))
        );

        if (filteredJobs.length === 0) {
            marker.setMap(null);
            return;
        }

        const 대표 = getLatestJob(filteredJobs);
        const category = getCategoryGroup(대표.jobType);

        marker.setPosition(대표.latlng);
        marker.category = category;
        marker.setImage(createMarkerImage(category, false));
        marker.setMap(map);
    });
}


/*==========================================================
    summary 렌더
===========================================================*/
function renderSummary(job) {
    if (!job) return '';

    const category = getCategoryGroup(job.jobType);
    const iconSrc = markerMap[category];

    return `
        <div class="job-summary">

            <div class="job-summary__header">
                <div class="job-summary__icon">
                    <img src="${iconSrc}" alt="${category}">
                </div>

                <div class="job-summary__info">
                    <div class="job-summary__apartment">${job.apartment}</div>
                    <div class="job-summary__title">${job.jobTitle}</div>
                    <div class="job-summary__period">
                        ${job.startDate} ~ ${job.endDate}
                    </div>
                </div>
            </div>

            <div class="job-summary__table">
                <div class="job-summary__row">
                    <div class="job-summary__label">직무</div>
                    <div class="job-summary__value">${job.jobType}</div>
                </div>
                <div class="job-summary__row">
                    <div class="job-summary__label">경력</div>
                    <div class="job-summary__value">${job.career}</div>
                </div>
                <div class="job-summary__row">
                    <div class="job-summary__label">급여</div>
                    <div class="job-summary__value--pay">월급 ${job.pay}원</div>
                </div>
                <div class="job-summary__row">
                    <div class="job-summary__label">거리</div>
                    <div class="job-summary__value job-summary__distance-wrap">
                        ${job.distance} km
                        <button class="btn-route"
                            onclick="openKakaoMap('${job.latlng.getLat()}', '${job.latlng.getLng()}', '${job.apartment}')">
                            길찾기
                        </button>
                    </div>
                </div>
            </div>

            <button class="job-summary__btn"
                onclick="goDetail('${job.apartment}')">
                공고 상세보기
            </button>

        </div>
    `;
}

/*==========================================================
    패널
===========================================================*/
let currentGroupKey = null;

function openPanel(key) {
    currentGroupKey = key;

    const panel = document.getElementById('jobPanel');
    const content = document.getElementById('jobPanelContent');

    const originJobs = groupedPositions[key];
    if (!originJobs) return;

    let jobs;

    if (selectedJobs.size === 0) {
        jobs = originJobs.map(job => ({
            ...job,
            distance: getDistanceFromMe(job)
        }));
    } else {
        const filtered = originJobs.filter(job =>
            selectedJobs.has(job.jobType) ||
            selectedJobs.has(getCategoryGroup(job.jobType))
        );

        if (filtered.length === 0) return;

        jobs = filtered.map(job => ({
            ...job,
            distance: getDistanceFromMe(job)
        }));
    }


    const sorted = [...jobs].sort(
        (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );

    currentSelectedJob = sorted[0];
    currentPanelJobs = sorted;

    panel.classList.add('is-open');

    content.innerHTML = `
        <div id="jobSummaryWrap">
            ${renderSummary(currentSelectedJob)}
        </div>

        <div class="job-panel__list">
            ${sorted.map((job, i) => {
        const category = getCategoryGroup(job.jobType);
        const icon = markerMap[category];

        return `
                    <div class="job-panel__item ${i === 0 ? 'is-active' : ''}"
                        onclick="selectJob(${i})">
                        <div class="job-panel__inner">
                            <div class="job-panel__icon">
                                <img src="${icon}" alt="${category}">
                            </div>

                            <div class="job-panel__content">
                                <div class="job-panel__apartment">${job.apartment}</div>
                                <div class="job-panel__title">${job.jobTitle}</div>
                                <div class="job-panel__period">
                                    ${job.startDate} ~ ${job.endDate}
                                </div>
                            </div>

                        </div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}


/*==========================================================
    리스트 클릭 → summary 변경
===========================================================*/
function selectJob(index) {
    const job = currentPanelJobs[index];
    if (!job) return;

    currentSelectedJob = job;

    // ✅ summary 변경
    document.getElementById('jobSummaryWrap').innerHTML = renderSummary(job);

    // ✅ 리스트 active 처리
    document.querySelectorAll('.job-panel__item').forEach(el => {
        el.classList.remove('is-active');
    });
    document.querySelectorAll('.job-panel__item')[index].classList.add('is-active');

    // ===========================
    // ⭐ 여기부터 추가 (핵심)
    // ===========================

    // 현재 열려있는 마커 찾기
    const marker = markers.find(m => m.groupKey === currentGroupKey);
    if (!marker) return;

    const category = getCategoryGroup(job.jobType);

    // 마커 위치 변경
    marker.setPosition(job.latlng);

    // 마커 아이콘 변경
    marker.category = category;
    marker.setImage(createMarkerImage(category, true));

    // 지도 이동
    map.panTo(job.latlng);

    // activeMarker 동기화
    activeMarker = marker;
}


/*==========================================================
    리스트 클릭 → 마커 연동
===========================================================*/
function focusMarker(lat, lng) {
    const target = markers.find(m =>
        m.getPosition().getLat() == lat &&
        m.getPosition().getLng() == lng
    );

    if (!target) return;

    setActiveMarker(target);
    openPanel(target.groupKey);
}


/*==========================================================
    이동
===========================================================*/
function goDetail(apartment) {
    location.href = `/corp_office_info.html?apt=${encodeURIComponent(apartment)}`;
}


/*==========================================================
    패널 닫기
===========================================================*/
function closePanel() {
    const panel = document.getElementById('jobPanel');
    panel.classList.remove('is-open');
}


/*==========================================================
    지도 클릭 시 초기화
===========================================================*/
kakao.maps.event.addListener(map, 'click', function () {

    closePanel();

    if (activeMarker) {
        activeMarker.setImage(
            createMarkerImage(activeMarker.category, false)
        );
        activeMarker = null;
    }
});



/*==========================================================
    카카오맵 - 길찾기
===========================================================*/
function openKakaoMap(lat, lng, name) {
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;
    window.open(url, '_blank');
}