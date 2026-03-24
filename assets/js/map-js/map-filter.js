/* ==========================================================
   FILTER
========================================================== */
let selectedJobs = new Set();

/* 쿠키 저장 */
function setCookie(name, value, days = 7) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

    document.cookie =
        name + "=" + encodeURIComponent(value) +
        ";expires=" + date.toUTCString() +
        ";path=/";
}

/* 쿠키 읽기 */
function getCookie(name) {
    const cookies = document.cookie.split(";");

    for (let c of cookies) {
        const [key, ...rest] = c.trim().split("=");

        if (key === name) {
            return decodeURIComponent(rest.join("="));
        }
    }

    return null;
}

/* 직무 필터 */
function filterMarkers(type, e) {

    const allBtn = document.querySelector(".job-filter__btn");

    if (type === "전체") {

        selectedJobs.clear();

        document.querySelectorAll(".job-filter__btn").forEach(btn => {
            btn.classList.remove("is-active");
        });

        allBtn.classList.add("is-active");

    } else {

        allBtn.classList.remove("is-active");

        if (selectedJobs.has(type)) {
            selectedJobs.delete(type);
            e.currentTarget.classList.remove("is-active");
        } else {
            selectedJobs.add(type);
            e.currentTarget.classList.add("is-active");
        }

        if (selectedJobs.size === 0) {
            allBtn.classList.add("is-active");
        }
    }

    /* ⭐ 직무 쿠키 저장 */
    setCookie("jobType", [...selectedJobs].join(","));

    updateMarkers();
    syncListWithMapBounds();
}

/* ==========================================================
   페이지 로드 시 직무 복원
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const savedJobs = getCookie("jobType");

    if (!savedJobs) return;

    const jobArray = savedJobs
        .split(",")
        .map(v => v.trim())
        .filter(Boolean);

    if (jobArray.length === 0) return;

    const allBtn = document.querySelector(".job-filter__btn");
    allBtn.classList.remove("is-active");

    jobArray.forEach(job => {

        const btn = [...document.querySelectorAll(".job-filter__btn")]
            .find(el => el.textContent.trim() === job);

        if (btn) {

            selectedJobs.add(job);

            btn.classList.add("is-active");

        }

    });

    updateMarkers();
    syncListWithMapBounds();

});

document.querySelector(".btn-cancel").addEventListener("click", () => {
    dropdown.classList.remove("active");
    regionBtn.classList.remove("active");
});