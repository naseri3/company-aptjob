/* ==========================================================
   FILTER
========================================================== */
let selectedJobs = new Set();

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

    updateMarkers();
    syncListWithMapBounds();
}