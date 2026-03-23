/* ==========================================================
   MARKER
========================================================== */
let activeMarker = null;

const markerMap = {
    관리: "/assets/img/mapapidoc/map-marker-1.png",
    경리: "/assets/img/mapapidoc/map-marker-2.png",
    시설: "/assets/img/mapapidoc/map-marker-3.png",
    전기: "/assets/img/mapapidoc/map-marker-4.png",
    기타직: "/assets/img/mapapidoc/map-marker-5.png"
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

function getMarkerSize(level, active) {
    if (level <= 5) return active ? 50 : 40;
    if (level <= 8) return active ? 40 : 30;
    return active ? 30 : 25;
}

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

        kakao.maps.event.addListener(marker, "click", function () {
            setActiveMarker(marker);
            openPanel(key);
        });

        markers.push(marker);
    });

    updateMarkers();
}

function setActiveMarker(marker) {
    if (activeMarker) {
        activeMarker.setImage(
            createMarkerImage(activeMarker.category, false)
        );
        activeMarker.setZIndex(1);
    }

    activeMarker = marker;

    marker.setImage(
        createMarkerImage(marker.category, true)
    );
    marker.setZIndex(999);

    map.panTo(marker.getPosition());
}

function updateMarkers() {
    markers.forEach(marker => {
        const jobs = marker.jobs;

        if (selectedJobs.size === 0) {
            const 대표 = getLatestJob(jobs);
            const category = getCategoryGroup(대표.jobType);

            marker.setPosition(대표.latlng);
            marker.category = category;
            marker.setImage(createMarkerImage(category, false));
            marker.setMap(map);
            return;
        }

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
        const isActive = marker === activeMarker;
        marker.setImage(createMarkerImage(category, isActive));
        marker.setMap(map);
    });
}