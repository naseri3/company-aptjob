document.addEventListener("DOMContentLoaded", () => {
    waitForMapData();
});

/* ==========================================================
    지도/데이터 준비 대기
========================================================== */
function waitForMapData() {
    const ready = typeof positions !== "undefined"
        && Array.isArray(positions)
        && positions.length > 0
        && typeof map !== "undefined";
    if (ready) {
        syncListWithMapBounds();
        bindMapListSyncEvents();
        return;
    }
    setTimeout(waitForMapData, 120);
}

/* ==========================================================
    지도 이벤트 바인딩
========================================================== */
function bindMapListSyncEvents() {
    if (!map || map.__jobListSyncBound) return;
    map.__jobListSyncBound = true;
    kakao.maps.event.addListener(map, "idle", function () {
        syncListWithMapBounds();
    });
}

/* ==========================================================
    현재 지도 영역 기준 리스트 동기화
========================================================== */
function syncListWithMapBounds() {
    if (!map || !positions || positions.length === 0) return;

    const bounds = map.getBounds();

    let visibleJobs = positions.filter(job =>
        bounds.contain(job.latlng)
    );

    if (selectedJobs && selectedJobs.size > 0) {
        visibleJobs = visibleJobs.filter(job =>
            selectedJobs.has(job.jobType) ||
            selectedJobs.has(getCategoryGroup(job.jobType))
        );
    }

    renderJobTable(visibleJobs);
    updateJobCount(visibleJobs);
}
/* ==========================================================
    리스트 렌더링
========================================================== */
function renderJobTable(jobs) {
    const tbody = document.getElementById("mapJobTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (!jobs || jobs.length === 0) {
        tbody.innerHTML = `
            <tr class="map-job__row map-job__row--empty">
                <td colspan="10" class="map-job__empty">
                    공고 정보가 없습니다
                </td>
            </tr>
        `;
        return;
    }

    const sortedJobs = [...jobs]
        .map(job => ({
            ...job,
            distance: getDistance(
                locPosition.getLat(),
                locPosition.getLng(),
                job.lat,
                job.lng
            )
        }))
        .sort((a, b) => a.distance - b.distance);

    sortedJobs.forEach(job => {
        const tr = document.createElement("tr");
        tr.className = "map-job__row";
        tr.onclick = function (e) {

            if (e.target.closest(".map-job__cell--favorite")) return;
            if (e.target.closest(".map-job__link")) return;

            handleJobClick(
                job.lat,
                job.lng,
                job.apartment,
                job.jobTitle
            );
        };

        tr.dataset.lat = String(job.lat);
        tr.dataset.lng = String(job.lng);
        tr.dataset.apartment = job.apartment;
        tr.innerHTML = `
            <td class="job-item map-job__cell map-job__cell--favorite">
                <span class="favorite-star">★</span>
            </td>
            <td class="job-item map-job__cell map-job__cell--title">
                <a class="title map-job__link"
                    onclick="handleJobClick(${job.lat}, ${job.lng}, '${escapeJsString(job.apartment)}', '${escapeJsString(job.jobTitle)}')">
                    ${job.jobTitle}
                </a>
            </td>
            <td class="job-item map-job__cell map-job__cell--job">
                ${job.jobType}
            </td>
            <td class="job-item map-job__cell map-job__cell--pay">
                ${formatPay(job.pay)}
            </td>
            <td class="job-item map-job__cell map-job__cell--apt">
                ${job.apartment}
            </td>
            <td class="job-item map-job__cell map-job__cell--size">
                ${job.apartmentSize || "-"}
            </td>
            <td class="job-item map-job__cell map-job__cell--date">
                ${job.startDate}
            </td>
            <td class="job-item map-job__cell map-job__cell--date map-job__cell--deadline">
                ${job.endDate}
            </td>
            <td class="job-item map-job__cell map-job__cell--distance">
                ${job.distance.toFixed(1)} km
            </td>
            <td class="job-item map-job__cell map-job__cell--action">
                <a href="#"
                   class="btn btn-apply"
                   onclick="handleJobClick(${job.lat}, ${job.lng}, '${escapeJsString(job.apartment)}', '${escapeJsString(job.jobTitle)}'); return false;">
                   지도 보기
                </a>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/* ==========================================================
    리스트 클릭
    - 지도 스크롤
    - 해당 마커 활성화
    - 패널 열기
    - 패널 내부에서 해당 공고 선택
    - 리스트 하이라이트
========================================================== */
function handleJobClick(lat, lng, apartment, jobTitle) {
    const mapEl = document.getElementById("map");
    if (mapEl) {
        mapEl.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    const targetMarker = markers.find(marker =>
        marker.jobs.some(job =>
            Number(job.lat) === Number(lat) &&
            Number(job.lng) === Number(lng) &&
            job.apartment === apartment
        )
    );

    if (!targetMarker) return;

    setActiveMarker(targetMarker);
    openPanel(targetMarker.groupKey);

    const panelJobIndex = targetMarker.jobs.findIndex(job =>
        Number(job.lat) === Number(lat) &&
        Number(job.lng) === Number(lng) &&
        job.apartment === apartment &&
        job.jobTitle === jobTitle
    );

    if (panelJobIndex > -1) {
        setTimeout(() => {
            selectJob(panelJobIndex);
        }, 0);
    }
    highlightRow(lat, lng, apartment, jobTitle);
}

/* ==========================================================
    리스트 active 처리
========================================================== */
function highlightRow(lat, lng, apartment, jobTitle) {
    document.querySelectorAll(".map-job__row").forEach(row => {
        row.classList.remove("is-active");
    });

    document.querySelectorAll(".map-job__row").forEach(row => {
        const titleBtn = row.querySelector(".map-job__link");
        const rowTitle = titleBtn ? titleBtn.textContent.trim() : "";

        if (
            row.dataset.lat == lat &&
            row.dataset.lng == lng &&
            row.dataset.apartment === apartment &&
            rowTitle === jobTitle
        ) {
            row.classList.add("is-active");
        }
    });
}

/* ==========================================================
    공고 개수 표시
========================================================== */
function updateJobCount(jobs) {
    const countText = document.querySelector(".map-job__title span");
    if (!countText) return;
    const count = jobs ? jobs.length : 0;
    countText.innerHTML = `총 ${count}건`;
}

/* ==========================================================
    유틸
========================================================== */
function formatPay(pay) {
    if (pay == null || pay === "") return "-";

    const value = String(pay).replace(/[^\d]/g, "");
    if (!value) return pay;

    return `월급${Number(value).toLocaleString()}`;
}

function escapeJsString(str) {
    return String(str ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
}