document.addEventListener("DOMContentLoaded", async () => {
    let allSpots = []; // 存放從後端抓取的所有官方景點與商家資料
    let myItinerary = []; // 存放目前使用者排入的時間軸行程

    const token = localStorage.getItem("jwt_token");
    const availableSpotsContainer = document.getElementById('availableSpots');
    const timelineContainer = document.getElementById('itineraryTimeline');
    const emptyMsg = document.getElementById('emptyTimelineMsg');
    const btnSave = document.getElementById('btnSaveItinerary');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // ==========================================
    // 1. 初始化：從後端載入真實的景點與商家資料
    // ==========================================
    async function loadLocations() {
        try {
            const res = await fetch("/api/map/locations");
            const result = await res.json();
            if (result.status === 200) {
                allSpots = result.data;
                renderAvailableSpots(allSpots);
            } else {
                availableSpotsContainer.innerHTML = '<p class="text-center text-red-500">無法取得據點資料</p>';
            }
        } catch (error) {
            console.error("無法載入景點資料:", error);
            availableSpotsContainer.innerHTML = '<p class="text-center text-red-500">網路連線錯誤，請確認後端伺服器是否正常運作。</p>';
        }
    }

    // ==========================================
    // 2. 渲染左側可供挑選的景點與商家列表
    // ==========================================
    function renderAvailableSpots(spots) {
        availableSpotsContainer.innerHTML = '';
        
        if (spots.length === 0) {
            availableSpotsContainer.innerHTML = '<p class="text-center text-gray-400 py-4">此分類目前沒有可選擇的據點。</p>';
            return;
        }

        spots.forEach(spot => {
            const isMerchant = spot.merchantId !== null;
            const badgeClass = isMerchant ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600';
            const badgeLabel = isMerchant ? '合作商家' : '官方景點';
            
            const html = `
                <div class="spot-card">
                    <div class="spot-info">
                        <h4 class="font-bold text-gray-800">${spot.name} <span class="text-xs ${badgeClass} px-2 py-0.5 rounded ml-1">${badgeLabel}</span></h4>
                        <p class="text-xs text-gray-500 mt-1">${spot.address || '小半天秘境'}</p>
                    </div>
                    <button class="btn-add" onclick="addSpot(${spot.attractionId})">+</button>
                </div>
            `;
            availableSpotsContainer.insertAdjacentHTML('beforeend', html);
        });
    }

    // ==========================================
    // 3. 分類篩選按鈕事件監聽
    // ==========================================
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const type = e.target.getAttribute('data-type');
            if (type === 'all') {
                renderAvailableSpots(allSpots);
            } else if (type === 'scenic') {
                renderAvailableSpots(allSpots.filter(s => s.merchantId === null));
            } else if (type === 'merchant') {
                renderAvailableSpots(allSpots.filter(s => s.merchantId !== null));
            }
        });
    });

    // ==========================================
    // 4. 手動加入景點至行程表 (掛載至 window 供 HTML 行內 onclick 呼叫)
    // ==========================================
    window.addSpot = function(id) {
        const spot = allSpots.find(s => s.attractionId === id);
        if (spot) {
            myItinerary.push(spot);
            renderTimeline();
        }
    };

    // ==========================================
    // 5. 將景點從行程表中移除 (掛載至 window 供 onclick 呼叫)
    // ==========================================
    window.removeSpot = function(index) {
        myItinerary.splice(index, 1);
        renderTimeline();
    };

    // ==========================================
    // 6. 渲染右側時間軸行程
    // ==========================================
    function renderTimeline() {
        timelineContainer.innerHTML = '';
        
        if (myItinerary.length === 0) {
            emptyMsg.style.display = 'block';
            btnSave.classList.add('hidden');
            timelineContainer.appendChild(emptyMsg);
            return;
        }

        emptyMsg.style.display = 'none';
        btnSave.classList.remove('hidden');

        myItinerary.forEach((spot, index) => {
            const html = `
                <li class="timeline-item">
                    <div class="timeline-content">
                        <div class="text-xs text-gray-400 font-bold mb-1">ROUTE 0${index + 1}</div>
                        <h4 class="font-bold text-gray-800">${spot.name}</h4>
                        <p class="text-xs text-gray-500 mt-1">${spot.address || '南投縣鹿谷鄉小半天'}</p>
                    </div>
                    <button class="btn-remove" onclick="removeSpot(${index})">×</button>
                </li>
            `;
            timelineContainer.insertAdjacentHTML('beforeend', html);
        });
    }

    // 清空行程按鈕事件
    document.getElementById('btnClearItinerary').addEventListener('click', () => {
        if (myItinerary.length === 0) return;
        if (confirm("確定要清空目前排好的所有行程嗎？")) {
            myItinerary = [];
            renderTimeline();
        }
    });

    // ==========================================
    // 🚀 7. Spring AI 智慧行程推薦串接核心
    // ==========================================
    const btnAiRecommend = document.getElementById('btnAiRecommend');
    const aiInput = document.getElementById('aiInput');
    const aiLoader = document.getElementById('aiLoader');

    btnAiRecommend.addEventListener('click', async () => {
        const text = aiInput.value.trim();
        if (!text) {
            alert("請先輸入您的旅遊偏好或想法（例如：想帶長輩去喝茶看風景）喔！");
            return;
        }

        // 切換為載入中狀態，防範重複點擊
        btnAiRecommend.querySelector('span').innerText = "AI 正在規劃專屬路線...";
        aiLoader.classList.remove('hidden');
        btnAiRecommend.disabled = true;

        try {
            // 發送請求到 Spring Boot 後端 AiController
            const res = await fetch("/api/ai/recommend-itinerary", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": token ? `Bearer ${token}` : ""
                },
                body: JSON.stringify({ prompt: text })
            });
            
            // 後端解析成功後回傳的景點 ID 陣列（如 [2, 5, 6]）
            const recommendedIds = await res.json(); 

            if (recommendedIds && recommendedIds.length > 0) {
                myItinerary = []; // 清空舊的行程，塞入 AI 推薦的新行程
                
                recommendedIds.forEach(id => {
                    const spot = allSpots.find(s => s.attractionId === parseInt(id));
                    if (spot) {
                        myItinerary.push(spot);
                    }
                });

                renderTimeline();
                alert("✨ AI 已成功為您量身打造專屬行程！您可以自由手動微調順序或增減景點。");
            } else {
                alert("抱歉，AI 暫時無法媒合到完美的景點組合，請試著更換更詳細的文字描述！");
            }

        } catch (error) {
            console.error("AI 行程規劃發生錯誤:", error);
            alert("AI 智慧導覽模組連線忙線中，請稍後再試。");
        } finally {
            // 恢復按鈕狀態
            btnAiRecommend.querySelector('span').innerText = "生成專屬行程";
            aiLoader.classList.add('hidden');
            btnAiRecommend.disabled = false;
        }
    });

    // ==========================================
    // 8. 儲存行程按鈕事件
    // ==========================================
    if (btnSave) {
    btnSave.addEventListener('click', () => {
        if (myItinerary.length === 0) return;
        
        // 💡 關鍵修改：將行程儲存到 localStorage，並加上標記
        localStorage.setItem('savedItinerary', JSON.stringify(myItinerary));
        
        alert("行程規劃成功！即將為您同步到個人旅遊導覽地圖中。");
        window.location.href = "mapping.html?fromItinerary=true";
    });
}

    // 啟動載入
    loadLocations();
});