document.addEventListener("DOMContentLoaded", async () => {
    setTimeout(() => lucide.createIcons(), 200);

    const token = localStorage.getItem("jwt_token");
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName") || "神秘旅人";

    if (!token || !userId) {
        alert("請先登入系統才能查看個人成就喔！");
        window.location.href = "auth.html";
        return;
    }

    if (document.getElementById("user-display-name")) {
        document.getElementById("user-display-name").innerText = userName;
    }

    const BADGE_TEMPLATES = {
        1: { name: "長源古道通", icon: "trees", color: "bg-green-500", desc: "完成長源圳古道巡禮" },
        2: { name: "大崙山銀杏客", icon: "compass", color: "bg-amber-500", desc: "探訪大崙山銀杏森林" },
        3: { name: "石馬櫻花仙", icon: "flower", color: "bg-pink-500", desc: "解鎖石馬公園隱藏關卡" },
        4: { name: "品茗老饕", icon: "coffee", color: "bg-teal-600", desc: "完成在地特色茶行知識問答" },
        5: { name: "竹林隱士", icon: "puzzle", color: "bg-emerald-600", desc: "成功還原特色商家拼圖任務" }
    };

    const badgeGrid = document.getElementById("badge-wall-grid");

    async function fetchAllLocationsAndRender() {
        try {
            const res = await fetch("/api/map/locations");
            const result = await res.json();

            if (result.status === 200 && result.data) {
                if (badgeGrid) badgeGrid.innerHTML = "";
                
                result.data.forEach(loc => {
                    const isOfficial = loc.merchantId === null;
                    const idPrefix = isOfficial ? 'attraction' : 'shop';
                    const fullId = `${idPrefix}_${loc.attractionId || loc.id}`;
                    
                    const isUnlocked = localStorage.getItem(`unlocked_${loc.attractionId || loc.id}`) === 'true';
                    
                    let iconName = isOfficial ? "map-pin" : "store";
                    let colorClass = isOfficial ? "bg-blue-500" : "bg-emerald-600";
                    let descText = isOfficial ? `解鎖 ${loc.name} 專屬景點` : `完成 ${loc.name} 特色商家任務`;
                    let imageUrl = loc.imageUrl || '';

                    const card = document.createElement("div");
                    card.id = `badge-card-${fullId}`;
                    
                    if (isUnlocked) {
                        card.className = "badge-card badge-unlocked bg-emerald-50/30 border border-emerald-200 rounded-2xl p-6 text-center shadow-sm flex flex-col items-center gap-3";
                    } else {
                        card.className = "badge-card badge-locked bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm flex flex-col items-center gap-3 grayscale";
                    }

                    let imageHtml = '';
                    if (imageUrl) {
                        imageHtml = `<div class="w-14 h-14 rounded-full shadow-md bg-cover bg-center" style="background-image: url('${imageUrl}');"></div>`;
                    } else {
                        imageHtml = `
                            <div class="w-14 h-14 rounded-full ${colorClass} text-white flex items-center justify-center shadow-md">
                                <i data-lucide="${iconName}" class="w-7 h-7"></i>
                            </div>
                        `;
                    }

                    const statusBadgeHtml = isUnlocked 
                        ? `<span class="status-badge text-[10px] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold mt-auto">已解鎖</span>`
                        : `<span class="status-badge text-[10px] bg-gray-100 text-gray-400 px-3 py-1 rounded-full font-medium mt-auto">未解鎖</span>`;

                    card.innerHTML = `
                        ${imageHtml}
                        <div>
                            <h3 class="font-bold text-gray-700 text-[15px]">${loc.name}</h3>
                            <p class="text-[11px] text-gray-400 mt-1 leading-tight">${descText}</p>
                        </div>
                        ${statusBadgeHtml}
                    `;
                    if (badgeGrid) badgeGrid.appendChild(card);
                });
                lucide.createIcons();
            }
        } catch (error) {
        }
    }

    await fetchAllLocationsAndRender();

    try {
        const response = await fetch(`/api/tasks/progress/${userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.status === 200) {
            const data = result.data;
            document.getElementById("total-points").innerText = data.totalPoints || 0;
            document.getElementById("completed-count").innerText = data.completedTasks || 0;

            const timeline = document.getElementById("adventure-log-timeline");
            const noLogText = document.getElementById("no-log-text");
            const records = data.progressDetails || [];

            records.forEach(record => {
                if (record.status === "COMPLETED") {
                    
                    if (timeline) {
                        noLogText.classList.add("hidden");
                        const date = new Date(record.completedAt);
                        const time = `${date.getMonth()+1}/${date.getDate()} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
                        const logItem = document.createElement("div");
                        logItem.className = "flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm";
                        logItem.innerHTML = `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                    <i data-lucide="check" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-bold text-gray-700">成功通關 【任務 ID: ${record.taskId}】</p>
                                    <p class="text-xs text-gray-400 mt-0.5">獲得 50 探險積分</p>
                                </div>
                            </div>
                            <span class="text-xs font-mono text-gray-400">${time}</span>
                        `;
                        timeline.appendChild(logItem);
                    }
                }
            });
            lucide.createIcons();
        }
    } catch (err) {}
});