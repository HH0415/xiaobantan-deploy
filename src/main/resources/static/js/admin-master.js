document.addEventListener("DOMContentLoaded", () => {
    
    const token = localStorage.getItem('jwt_token');
    const userRole = localStorage.getItem('userRole');
    
    if (userRole !== 'admin') {
        window.location.href = "index.html";
        return;
    }

    async function fetchDashboardData() {
        try {
            const userRes = await fetch("/api/admin/users", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const userData = await userRes.json();
            
            const spotRes = await fetch("/api/map/locations");
            const spotData = await spotRes.json();

            const dashRes = await fetch("/api/admin/dashboard", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const dashData = await dashRes.json();

            let adminCount = 0;
            let merchantCount = 0;
            let touristCount = 0;
            let totalUsers = 0;

            if (userData.status === 200 && userData.data) {
                const users = userData.data;
                totalUsers = users.length;
                users.forEach(u => {
                    const r = (u.role || '').toLowerCase();
                    if (r.includes('admin')) {
                        adminCount++;
                    } else if (r.includes('merchant')) {
                        merchantCount++;
                    } else {
                        touristCount++;
                    }
                });
            }

            let totalSpots = 0;
            if (spotData.status === 200 && spotData.data) {
                totalSpots = spotData.data.length;
            }

            let totalTasks = 0;
            let activities = [];
            if (dashData.status === 200 && dashData.data) {
                totalTasks = dashData.data.totalTasks || 0;
                activities = dashData.data.recentActivities || [];
            }

            updateDashboardUI(totalUsers, merchantCount, touristCount, adminCount, totalSpots, totalTasks, activities);

        } catch (error) {
            document.getElementById('totalUsers').innerText = "連線失敗";
            document.getElementById('totalMerchants').innerText = "連線失敗";
            document.getElementById('totalSpots').innerText = "連線失敗";
            document.getElementById('totalTasks').innerText = "連線失敗";
        }
    }

    function updateDashboardUI(totalUsers, merchantCount, touristCount, adminCount, totalSpots, totalTasks, activities) {
        document.getElementById('totalUsers').innerText = totalUsers;
        document.getElementById('totalMerchants').innerText = merchantCount;
        document.getElementById('totalSpots').innerText = totalSpots;
        document.getElementById('totalTasks').innerText = totalTasks;

        let touristPct = 0;
        let merchantPct = 0;
        let adminPct = 0;

        if (totalUsers > 0) {
            touristPct = Math.round((touristCount / totalUsers) * 100);
            merchantPct = Math.round((merchantCount / totalUsers) * 100);
            adminPct = Math.round((adminCount / totalUsers) * 100);
        }

        document.getElementById('touristLabel').innerText = `一般遊客 (${touristPct}%)`;
        document.getElementById('touristBar').style.width = `${touristPct}%`;

        document.getElementById('merchantLabel').innerText = `合作商家 (${merchantPct}%)`;
        document.getElementById('merchantBar').style.width = `${merchantPct}%`;

        document.getElementById('adminLabel').innerText = `管理員 (${adminPct}%)`;
        document.getElementById('adminBar').style.width = `${adminPct}%`;

        const activityList = document.getElementById('activityList');
        activityList.innerHTML = '';
        
        if (activities && activities.length > 0) {
            activities.forEach(act => {
                const li = document.createElement('li');
                li.className = 'activity-item';
                
                const descSpan = document.createElement('span');
                descSpan.innerText = act.description;
                
                const timeSpan = document.createElement('span');
                timeSpan.className = 'activity-time';
                timeSpan.innerText = act.time;
                
                li.appendChild(descSpan);
                li.appendChild(timeSpan);
                activityList.appendChild(li);
            });
        } else {
            activityList.innerHTML = '<li class="activity-item">暫無最新動態</li>';
        }
    }

    fetchDashboardData();
});