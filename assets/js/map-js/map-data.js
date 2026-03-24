/* ==========================================================
   MAP DATA
   공고 데이터 로딩
========================================================== */
let positions = [];
let groupedPositions = {};
const markers = [];

fetch("/assets/data/job-map-data.json")
    .then(res => {
        if (!res.ok) {
            throw new Error("JSON 파일 못찾음");
        }
        return res.json();
    })
    .then(data => {
        const today = new Date();

        positions = data
            .filter(job => parseDate(job.endDate) >= today)
            .map(job => ({
                ...job,
                latlng: new kakao.maps.LatLng(job.lat, job.lng)
            }));

        initMapData();
    })
    .catch(err => {
        console.error("JSON 로딩 실패:", err);
    });

function parseDate(dateStr) {
    const parts = dateStr.split("-");

    if (parts[0].length === 2) {
        return new Date(`20${parts[0]}`, parts[1]-1, parts[2], 23, 59, 59);
    }

    return new Date(parts[0], parts[1]-1, parts[2], 23, 59, 59);
}


/* ==========================================================
   주소 기준 그룹핑
========================================================== */
function initMapData() {
    groupedPositions = positions.reduce((acc, item) => {
        const key = `${item.apartment}_${item.lat}_${item.lng}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});
    createMarkers();
}


function getLatestJob(jobs) {
    return [...jobs].sort((a, b) =>
        new Date(b.startDate) - new Date(a.startDate)
    )[0];

}


function getCategoryGroup(job) {
    if (["소장", "관리과장", "관리주임"].includes(job)) return "관리";
    if (["경리(회계)", "서무직"].includes(job)) return "경리";
    if (["기술과장", "시설과장", "시설기사", "설비직(영선)", "기전직", "조경기사"].includes(job)) return "시설";
    if (["전기과장", "전기기사", "전기직"].includes(job)) return "전기";
    if (["커뮤니티", "경비원", "미화원", "기타"].includes(job)) return "기타직";
    return "기타직";
}