/**
 * 글로벌 변수 설정 및 초기화
 */
var map = null;
var activeMarker = null;
var markerList = {};
var markersArray = [];
var startCoords = new kakao.maps.LatLng(37.554678, 126.970603);
var savedUserAddr = "내 위치";
var isInternalMove = false; 
var currentSelectedSeq = ""; // [추가] 현재 선택된 공고번호 전역 관리
var searchTimer = null;

// 마커 이미지 객체 (init 시점에 생성해도 무방하나 전역 선언이 효율적)
var normalImage = new kakao.maps.MarkerImage('/images/map/map_kind01.png', new kakao.maps.Size(36, 39));
var activeImage = new kakao.maps.MarkerImage(
    '/images/map/map_kind01_on.png',
    new kakao.maps.Size(45, 50),
    { offset: new kakao.maps.Point(22, 50) }
);




/**
 * 1. 실행 진입점
 */
function startMapService(mapId, jobList) {
    const userAddrInput = document.getElementById('addr_fo').value.trim();
    const coordPattern = /^[0-9.]+\s*,\s*[0-9.]+$/;

    if (coordPattern.test(userAddrInput)) {
        const parts = userAddrInput.split(',');
        startCoords = new kakao.maps.LatLng(parseFloat(parts[0]), parseFloat(parts[1]));
        savedUserAddr = "지정된 위치";
        initJobMap(mapId, jobList);
    } else if (userAddrInput) {
        const geocoder = new kakao.maps.services.Geocoder();
        savedUserAddr = userAddrInput;
        geocoder.addressSearch(userAddrInput, function(result, status) {
            if (status === kakao.maps.services.Status.OK) {
                startCoords = new kakao.maps.LatLng(result[0].y, result[0].x);
                initJobMap(mapId, jobList);
            } else {
                tryGeolocation(mapId, jobList);
            }
        });
    } else {
        tryGeolocation(mapId, jobList);
    }
}

/**
 * GPS 위치 획득
 */
function tryGeolocation(mapId, jobList) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                startCoords = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
                initJobMap(mapId, jobList);
            },
            function(err) {
                initJobMap(mapId, jobList);
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    } else {
        initJobMap(mapId, jobList);
    }
}

/**
 * 2. 지도 초기화 및 마커 표시
 */
function initJobMap(mapId, jobList) {
    var mapContainer = document.getElementById(mapId);
    if (!mapContainer) return;

    var mapOption = { center: startCoords, level: 8 }; // 레벨 8보다 6 추천 (시내 가독성)
    map = new kakao.maps.Map(mapContainer, mapOption);
    
    displayMarkers(jobList);
    bindMapEvents(map);

    var bounds = map.getBounds();
    var center = map.getCenter();

    // 초기 로드 시에는 강조할 번호가 없으므로 공백 전달
    loadJobDataByBounds(
        bounds.getSouthWest().getLat(), bounds.getSouthWest().getLng(),
        bounds.getNorthEast().getLat(), bounds.getNorthEast().getLng(),
        center.getLat(), center.getLng(), ""
    );

    map.addControl(new kakao.maps.MapTypeControl(), kakao.maps.ControlPosition.TOPRIGHT);
    map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
}

/**
 * 3. 마커 표시 및 관리 함수
 */
function displayMarkers(jobList) {
    // 기존 마커들 삭제
    markersArray.forEach(m => m.setMap(null));
    markersArray = [];
    markerList = {};

    var imageSrc = '/images/map/map_kind01.png'; 
    var imageSize = new kakao.maps.Size(36, 39);
    var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

    jobList.forEach(function(job) {
        if (!job.lat || !job.lng) return;

        var coords = new kakao.maps.LatLng(job.lat, job.lng);
        var marker = new kakao.maps.Marker({
            map: map,
            position: coords,
            image: markerImage
        });

        markerList[job.seq] = marker;
        markersArray.push(marker);

        kakao.maps.event.addListener(marker, 'click', function() {
            /*if (activeMarker) activeMarker.setZIndex(1);
            marker.setZIndex(3);
            activeMarker = marker;*/

			// [강조 로직 추가]
			// 1. 이전에 클릭된 마커가 있다면 다시 기본 이미지로 변경
			if (activeMarker) {
				activeMarker.setImage(normalImage);
				activeMarker.setZIndex(1);
			}

			// 2. 현재 클릭된 마커를 강조 이미지로 변경
			marker.setImage(activeImage);
			marker.setZIndex(3); // 다른 마커보다 위에 보이게 설정
			
			// 3. 현재 마커를 활성 마커로 저장
			activeMarker = marker;


            var distanceInMeters = calculateDistance(startCoords, coords);
            var distanceText = formatDistance(distanceInMeters);

			$j30("#selSeq").val(job.seq);

            fetch('/inc/ajax_recruit_mapinfo.asp?R_SEQ=' + job.seq)
                .then(response => response.text())
                .then(htmlData => {
                    const wrap = document.getElementById('summaryWrap');
                    const target = document.getElementById('summaryTarget');
                    
                    var distanceHtml = `
                        <div style="padding-left: 15px; padding-right: 30px; background: #fdfdfd; border-top: 1px solid #eee; display: flex; align-items: center; justify-content: space-between; margin-top: 10px;">
                            <span style="font-weight: bold; color: #007bff; font-size: 14px;">
                                📍 내 위치에서 약 ${distanceText}
                            </span>
                            <button id="btnFindRouteMap" style="padding: 5px 15px; font-size: 13px; cursor: pointer; border: none; background: #0055ff; color: #fff; border-radius: 4px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,85,255,0.2);">
                                길찾기
                            </button>
                        </div>`;
                            
                    //target.innerHTML = htmlData + distanceHtml;
                    target.innerHTML = distanceHtml + htmlData;
                    wrap.style.display = 'block';
                    map.panTo(coords);

                    var btn = document.getElementById('btnFindRouteMap');
                    if (btn) {
                        btn.onclick = function() {
                            var startName = encodeURIComponent(savedUserAddr);
                            var endName = encodeURIComponent(job.company || "공고지");
                            var startLatLng = startCoords.getLat() + ',' + startCoords.getLng();
                            var endLatLng = coords.getLat() + ',' + coords.getLng();
                            var url = 'https://map.kakao.com/link/from/' + startName + ',' + startLatLng + '/to/' + endName + ',' + endLatLng;
                            window.open(url, '_blank');
                        };
                    }
                });

				// [추가] 리스트에서 해당 공고 찾아서 강조
				const targetListElement = document.querySelector(`.job-item h4[onclick*="${job.seq}"]`);
				if (targetListElement) {
					const allItems = document.querySelectorAll('.job-item');
					allItems.forEach(item => item.classList.remove('selected'));
					targetListElement.closest('.job-item').classList.add('selected');
					
					// (선택사항) 리스트가 길 경우 해당 위치로 스크롤 이동
					targetListElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
				}

        });
    });
}

/**
 * 4. 이벤트 및 데이터 로딩
 */
var searchTimer = null;

function bindMapEvents(targetMap) {
    kakao.maps.event.addListener(targetMap, 'idle', function() {

		// 1. 만약 focusJob(리스트 클릭)을 통해 지도가 움직인 것이라면 실행하지 않음
        if (isInternalMove) {
            // 플래그를 여기서 바로 끄지 않고, focusJob의 setTimeout에서 제어하거나 
            // 혹은 여기서 끄고 리턴합니다.
            isInternalMove = false; 
            return;
        }

        if (searchTimer) clearTimeout(searchTimer);
        
        searchTimer = setTimeout(function() {
            var bounds = targetMap.getBounds();
			var center = targetMap.getCenter(); // [추가] 지도의 중심점 좌표 가져오기
            loadJobDataByBounds(
                bounds.getSouthWest().getLat(), 
                bounds.getSouthWest().getLng(), 
                bounds.getNorthEast().getLat(), 
                bounds.getNorthEast().getLng(),
				center.getLat(), // [추가] 중심 위도
	            center.getLng()  // [추가] 중심 경도
            );
        }, 300); // 0.3초간 멈춰있을 때만 실행
    });
}

function loadJobDataByBounds(minLat, minLng, maxLat, maxLng, centerLat, centerLng) {
	SelectedSeq = $j30("#selSeq").val();
	currentSelectedSeq =SelectedSeq || ""; // 상태 업데이트

	selectedJob = $j30("#selectedJob").val();
 
	// URL에 중심점 좌표와 검색 반경(예: 3km)을 추가로 전달
    const radius = 10; // 3km 이내로 제한하고 싶을 때
	//const url = `/inc/ajax_recruit_GeneralList.asp?minLat=${minLat}&minLng=${minLng}&maxLat=${maxLat}&maxLng=${maxLng}&cLat=${centerLat}&cLng=${centerLng}&radius=${radius}`;
	const url = `/inc/ajax_recruit_GeneralList.asp?minLat=${minLat}&minLng=${minLng}&maxLat=${maxLat}&maxLng=${maxLng}&cLat=${centerLat}&cLng=${centerLng}&radius=${radius}&selSeq=${currentSelectedSeq}&selectedJob=${selectedJob}`;

    fetch(url)
        .then(response => response.text())
        .then(data => {
            var $data = $j30(data);
            $j30("#dataGrid").html($data.filter("#dataGrid").html());
            //$j30("#dataGrid-paging").html($data.filter("#dataGrid-paging").html());
            $j30("#totacoun").html($data.filter("#totacoun").html());
            
            // [선택 사항] 드래그 후 리스트에 맞춰 마커도 새로 고침하고 싶다면:
            // if(jsonData) displayMarkers(jsonData);
        })
        .catch(err => console.error("데이터 로드 실패:", err));
}

/**
 * [신규] 리스트 제목 클릭 시 호출
 */
/**
 * 리스트 제목 클릭 시 호출될 함수
 * @param {HTMLElement} element - 클릭된 요소를 전달받음 (this)
 * @param {string} seq - 공고 번호
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 */

 function focusJob(element, seq, lat, lng) {
    if (!map) return;
	 
	 $j30("#selSeq").val(seq);

		
	// 1. selSeq 값 가져오기
	var SelectedSeq = $j30("#selSeq").val();

	// 2. 클릭 이동임을 표시하여 자동 로딩 방지
	isInternalMove = true;

	// 3. 모든 리스트 아이템에서 selected 클래스 제거
	const allItems = document.querySelectorAll('.job-item');
	allItems.forEach(item => item.classList.remove('selected'));

	let targetRow = null;

	// 4. #SelectedSeq 값과 동일한 data-seq가 있는 tr 찾기
	if (SelectedSeq) {
	  targetRow = document.querySelector(`tr.job-item[data-seq='${SelectedSeq}']`);
	}

	// 5. 만약 못 찾았다면 기존 방식으로 a 태그를 통해 찾기
	if (!targetRow) {
		const selector = `a[onclick*="'${SelectedSeq}'"], a[href*="'${SelectedSeq}'"]`;
		const link = document.querySelector(selector);
		if (link) {
			targetRow = link.closest('.job-item');
		}
	}

	// 6. 찾은 행이 있으면 selected 클래스 추가 및 스크롤 이동
	if (targetRow) {
		targetRow.classList.add('selected');
		targetRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	}


    // 5. 지도 이동 및 마커 클릭 트리거
    var coords = new kakao.maps.LatLng(lat, lng);
    map.panTo(coords); 

    if (markerList[seq]) {
        // 마커를 직접 클릭한 것과 동일한 효과 발생 (이미지 변경 + 상세창 노출)
        kakao.maps.event.trigger(markerList[seq], 'click');
    }

	// 이동이 끝날 때쯤 플래그를 해제하기 위해 약간의 지연을 줍니다.
    setTimeout(function() { isInternalMove = false; }, 500);

}



// --- 공통 유틸리티 ---
function calculateDistance(start, end) {
    var line = new kakao.maps.Polyline({ path: [start, end] });
    return line.getLength();
}
function formatDistance(distance) {
    return distance >= 1000 ? (distance / 1000).toFixed(1) + "km" : Math.round(distance) + "m";
}
function closeSummary() {
    document.getElementById('summaryWrap').style.display = 'none';
    document.getElementById('summaryTarget').innerHTML = '';
	$j30("#selSeq").val('');

}




/**
 * 3. 지역 버튼 클릭 이벤트 바인딩
 */
document.addEventListener('DOMContentLoaded', function() {
    const geocoder = new kakao.maps.services.Geocoder();
	
	    // [1] 시/도 버튼 클릭 (서울, 경기, 인천 등)
    const regionButtons = document.querySelectorAll('.region-options button');
    regionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const regionName = this.getAttribute('data-district');
            if (regionName && regionName !== 'all') {
                moveToLocation(regionName, 8); // 시/도는 조금 더 넓게(level 8)
            }
        });
    });

    // [2] 시/구/군 버튼 클릭 (강남구, 남동구 등)
    const districtButtons = document.querySelectorAll('.district-options button');
    districtButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            let districtName = this.getAttribute('data-district');
            
            // "서울-all" 같은 처리 방지 및 실제 주소 보정
            if (districtName.includes('-all')) {
                districtName = districtName.split('-')[0];
            }

            // 정확도를 위해 부모 지역명을 붙여서 검색 (예: "인천 남동구")
            const parentRegion = this.closest('.district').classList[1]; 
            const fullSearchName = parentRegion + " " + districtName;

            moveToLocation(fullSearchName, 5); // 시군구는 상세하게(level 5)
        });
    });

    /**
     * 주소명으로 지도를 이동시키는 공통 함수
     */
    function moveToLocation(address, zoomLevel) {
        if (!map) return;
		closeSummary();		//공고보기 레이어 닫기

        geocoder.addressSearch(address, function(result, status) {
            if (status === kakao.maps.services.Status.OK) {
                const moveLatLon = new kakao.maps.LatLng(result[0].y, result[0].x);
                
                // 해당 지역으로 부드럽게 이동
                map.setLevel(zoomLevel);
                map.panTo(moveLatLon);
                
                // 이동 후 해당 영역의 공고를 다시 불러오고 싶다면:
                // var bounds = map.getBounds();
                // loadJobDataByBounds(bounds.getSouthWest().getLat(), ..., map);
            }
        });
    }


});





function toggleFilter() {
    const container = document.getElementById('filterContainer');
    container.classList.toggle('active');
}

function filterByJob(jobType) {
    const checkboxes = document.querySelectorAll('input[name="job_chk"]');
    const allCb = document.getElementById('job_all');

    if (jobType === 'all') {
        // '전체' 클릭 시 다른 모든 체크박스 해제
        if (allCb.checked) {
            checkboxes.forEach(cb => { if(cb.id !== 'job_all') cb.checked = false; });
        }
    } else {
        // 개별 항목 클릭 시 '전체' 체크 해제
        allCb.checked = false;
    }

    // 아무것도 선택되지 않았을 경우 '전체' 다시 체크
    const checkedCount = document.querySelectorAll('input[name="job_chk"]:checked').length;
    if (checkedCount === 0) {
        allCb.checked = true;
    }

    // 로그 확인 및 지도 업데이트
    updateMapData();
}

function updateMapData() {
    // 1. 체크된 모든 value 가져오기
    const checkedValues = Array.from(document.querySelectorAll('input[name="job_chk"]:checked'))
                               .map(cb => cb.value);

    // 2. 만약 data-job(코드값)을 사용하고 싶다면 아래와 같이 사용 가능
    const checkedCodes = Array.from(document.querySelectorAll('input[name="job_chk"]:checked'))
                              .filter(cb => cb.value !== 'all')
                              .map(cb => cb.getAttribute('data-job'));

    console.log("선택된 직무명:", checkedValues.join(', '));
    console.log("선택된 코드값:", checkedCodes.join(', '));
	
	$j30("#selectedJob").val(checkedCodes);

    // 여기서 실제 서버 API(AJAX)를 호출하여 지도의 마커를 갱신하세요.
    // loadJobDataByBounds(..., checkedCodes.join(', ')); 
	PageLoading (1);
}