/* ==========================================================
   PANEL
========================================================== */
let currentPanelJobs = [];
let currentSelectedJob = null;
let currentGroupKey = null;

function renderSummary(job) {
    if (!job) return "";

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
                onclick="goDetail('${job.r_seq}')">
                공고 상세보기
            </button>
        </div>
    `;
}

function openPanel(key) {
    currentGroupKey = key;

    const panel = document.getElementById("jobPanel");
    const content = document.getElementById("jobPanelContent");

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

    panel.classList.add("is-open");

    content.innerHTML = `
        <div id="jobSummaryWrap">
            ${renderSummary(currentSelectedJob)}
        </div>

        <div class="job-panel__list">
            ${sorted.map((job, i) => {
                const category = getCategoryGroup(job.jobType);
                const icon = markerMap[category];

                return `
                    <div class="job-panel__item ${i === 0 ? "is-active" : ""}"
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
            }).join("")}
        </div>
    `;
}

function selectJob(index) {
    const job = currentPanelJobs[index];
    if (!job) return;

    currentSelectedJob = job;
    document.getElementById("jobSummaryWrap").innerHTML = renderSummary(job);

    document.querySelectorAll(".job-panel__item").forEach(el => {
        el.classList.remove("is-active");
    });
    document.querySelectorAll(".job-panel__item")[index].classList.add("is-active");

    const marker = markers.find(m => m.groupKey === currentGroupKey);
    if (!marker) return;

    const category = getCategoryGroup(job.jobType);

    marker.setPosition(job.latlng);
    marker.category = category;
    marker.setImage(createMarkerImage(category, true));

    map.panTo(job.latlng);
    activeMarker = marker;
}

function focusMarker(lat, lng) {
    const target = markers.find(m =>
        m.getPosition().getLat() == lat &&
        m.getPosition().getLng() == lng
    );

    if (!target) return;

    setActiveMarker(target);
    openPanel(target.groupKey);
}

function goDetail(r_seq) {
    location.href = `/subpage/recruit_detail.html?r_seq=${r_seq}`;
}

function closePanel() {
    const panel = document.getElementById("jobPanel");
    panel.classList.remove("is-open");
}

kakao.maps.event.addListener(map, "click", function () {
    closePanel();

    if (activeMarker) {
        activeMarker.setImage(
            createMarkerImage(activeMarker.category, false)
        );
        activeMarker = null;
    }
});

function openKakaoMap(lat, lng, name) {
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;
    window.open(url, "_blank");
}