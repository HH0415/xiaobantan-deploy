document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("userId"); 
    const API_LOCATIONS_URL = "/api/map/locations";

    if (!userId) {
        alert("為了給您最佳的導覽體驗，請先登入小半天系統！");
        window.location.href = "auth.html";
        return;
    }

    const map = L.map('map').setView([23.715, 120.75], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const scenicIcon = L.icon({
        iconUrl: 'img/scenic-marker.png',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
    });

    const merchantIcon = L.icon({
        iconUrl: 'img/merchant-marker.png',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
    });

    let allLocations = [];
    const markersLayer = L.layerGroup().addTo(map); 

    async function fetchLocations() {
        try {
            const res = await fetch(API_LOCATIONS_URL);
            const result = await res.json();
            
            if (result.status === 200) {
                allLocations = result.data;
                renderMapAndList(allLocations);
            } else {
                alert("取得地圖資料失敗：" + result.message);
            }
        } catch (error) {
            console.error(error);
            document.getElementById('spotListGroup').innerHTML = '<div style="text-align:center; padding: 20px; color:#E53E3E;">網路連線錯誤，無法載入地圖據點。</div>';
        }
    }

    function renderMapAndList(locations) {
        markersLayer.clearLayers(); 
        const spotList = document.getElementById('spotListGroup');
        spotList.innerHTML = '';

        if (locations.length === 0) {
            spotList.innerHTML = '<div style="text-align:center; padding: 20px; color:#A0AEC0;">此分類目前沒有可顯示的據點。</div>';
            return;
        }

        locations.forEach(loc => {
            const isMerchant = loc.merchantId !== null;
            const currentIcon = isMerchant ? merchantIcon : scenicIcon;
            const badgeClass = isMerchant ? "badge-autumn" : "badge-spring";
            const typeLabel = isMerchant ? "合作商家" : "官方景點";
            const actionText = isMerchant ? "掃描解鎖" : "探索故事";

            let displayName = loc.name;
            let displayAddress = loc.address || '小半天秘境';

            if (isMerchant) {
                const localData = localStorage.getItem(`shop_profile_${loc.merchantId}`);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    if (parsed.title) displayName = parsed.title;
                    if (parsed.address) displayAddress = parsed.address;
                }
            }

            if (loc.latitude && loc.longitude) {
                const marker = L.marker([loc.latitude, loc.longitude], { icon: currentIcon })
                                .bindPopup(`<b>${displayName}</b><br>${typeLabel}`);
                
                markersLayer.addLayer(marker);

                marker.on('click', () => {
                    handleSpotClick(loc.attractionId, displayName, isMerchant, loc.merchantId);
                });
            }

            const listItemHtml = `
                <div class="spot-item-link" onclick="handleSpotClick(${loc.attractionId}, '${displayName}', ${isMerchant}, ${loc.merchantId})">
                    <span class="season-badge ${badgeClass}">${typeLabel}</span>
                    <div class="spot-text">
                        <h4>${displayName}</h4>
                        <p>${displayAddress}</p>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:10px; color:#718096; margin-top:2px;">${actionText}</div>
                    </div>
                </div>
            `;
            spotList.insertAdjacentHTML('beforeend', listItemHtml);
        });
    }

    const filterBtns = document.querySelectorAll('.btn-filter');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const filterType = e.target.innerText;
            let filteredLocations = [];

            if (filterType === '全部') {
                filteredLocations = allLocations;
            } else if (filterType === '官方景點') {
                filteredLocations = allLocations.filter(loc => loc.merchantId === null);
            } else if (filterType === '合作商家') {
                filteredLocations = allLocations.filter(loc => loc.merchantId !== null);
            }

            renderMapAndList(filteredLocations);
        });
    });

    window.handleSpotClick = function(id, name, isMerchant, merchantId) {
        if (!isMerchant) {
            window.location.href = `attraction.html?id=${id}`;
        } else {
            window.location.href = `shop-profile.html?shopId=${merchantId}&name=${encodeURIComponent(name)}`;
        }
    };
    // 在 document.addEventListener("DOMContentLoaded", ... 的最底部，加入此函式與呼叫
async function checkAndRenderItinerary() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fromItinerary') === 'true') {
        const savedItinerary = JSON.parse(localStorage.getItem('savedItinerary'));
        const sidebar = document.querySelector('.map-sidebar');
        
        if (savedItinerary && savedItinerary.length > 0) {
            // 清除原本的 hint-card
            const hintCard = sidebar.querySelector('.hint-card');
            if (hintCard) hintCard.remove();

            // 建立新的行程顯示區
            const itineraryDisplay = document.createElement('div');
            itineraryDisplay.className = 'hint-card';
            itineraryDisplay.style.backgroundColor = '#F0FDF4'; // 淺綠色底區分
            // 修改這段 innerHTML 的設定
itineraryDisplay.innerHTML = `
    <h4 style="color:#1E5E3A; margin-bottom:10px; font-weight:bold;">您的專屬行程</h4>
    <ul style="padding-left: 0; list-style: none; font-size: 14px; line-height: 1.6;"> 
        ${savedItinerary.map((spot, i) => `<li style="margin-bottom:5px;">${i+1}. ${spot.name}</li>`).join('')}
    </ul>
    <button onclick="window.location.href='itinerary.html'" style="margin-top:10px; font-size:12px; color:#1E5E3A; border:none; background:none; cursor:pointer; text-decoration:underline;">修改行程</button>
`;
            sidebar.prepend(itineraryDisplay);
        }
    }
}

// 在 fetchLocations() 呼叫之後，順便呼叫這個函式
fetchLocations();
checkAndRenderItinerary();
});