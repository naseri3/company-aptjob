/* ==========================================================
   MAP CORE
   지도 초기화 및 기본 설정
========================================================== */
const DEFAULT_LEVEL = 8;
const MIN_LEVEL = 3;
const MAX_LEVEL = 9;


const mapContainer = document.getElementById("map");

const map = new kakao.maps.Map(mapContainer, {
    center: new kakao.maps.LatLng(37.5665, 126.9780),
    level: DEFAULT_LEVEL
});

map.addControl(new kakao.maps.MapTypeControl(), kakao.maps.ControlPosition.TOPRIGHT);
map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);


/* ==========================================================
   지도 줌 제한
========================================================== */
let isMaxAlertShown = false;
let fixedCenter = map.getCenter();

kakao.maps.event.addListener(map, "zoom_start", function () {
    fixedCenter = map.getCenter();
});

kakao.maps.event.addListener(map, "zoom_changed", function () {
    let level = map.getLevel();

    map.setCenter(fixedCenter);

    if (level < MIN_LEVEL) {
        map.setLevel(MIN_LEVEL);
    }

    if (level > MAX_LEVEL) {
        map.setLevel(MAX_LEVEL);
        showMapAlert();
    }

     markers.forEach(marker => {
        const isActive = marker === activeMarker;
        marker.setImage(createMarkerImage(marker.category, isActive));
    });

});

function showMapAlert() {
    const alertEl = document.getElementById("mapAlert");
    if (!alertEl) return;

    alertEl.classList.add("show");
    clearTimeout(alertEl._timer);

    alertEl._timer = setTimeout(() => {
        alertEl.classList.remove("show");
    }, 1000);
}


/* ==========================================================
   내 위치 마커
========================================================== */
let locPosition = new kakao.maps.LatLng(37.5663, 126.9780);


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
    return text.length > length ? text.slice(0, length) + "..." : text;
}