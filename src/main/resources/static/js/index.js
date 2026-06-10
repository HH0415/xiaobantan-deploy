document.addEventListener("DOMContentLoaded", () => {
    function applyCmsOverride(elementId, storageKey) {
        const element = document.getElementById(elementId);
        const savedValue = localStorage.getItem(storageKey);
        
        if (element && savedValue && savedValue.trim() !== "") {
            element.innerText = savedValue;
        }
    }
    
    if (document.getElementById('idxStatNum1') || document.getElementById('idxSeasonTitle1')) {
        applyCmsOverride('idxStatNum1', 'cms_stat_num1');
        applyCmsOverride('idxStatLabel1', 'cms_stat_label1');
        applyCmsOverride('idxStatSub1', 'cms_stat_sub1');
        applyCmsOverride('idxStatNum2', 'cms_stat_num2');
        applyCmsOverride('idxStatLabel2', 'cms_stat_label2');
        applyCmsOverride('idxStatSub2', 'cms_stat_sub2');
        applyCmsOverride('idxStatNum3', 'cms_stat_num3');
        applyCmsOverride('idxStatLabel3', 'cms_stat_label3');
        applyCmsOverride('idxStatSub3', 'cms_stat_sub3');
        applyCmsOverride('idxStatNum4', 'cms_stat_num4');
        applyCmsOverride('idxStatLabel4', 'cms_stat_label4');
        applyCmsOverride('idxStatSub4', 'cms_stat_sub4');

        applyCmsOverride('idxSeasonTitle1', 'cms_season_title1');
        applyCmsOverride('idxSeasonDesc1', 'cms_season_desc1');
        applyCmsOverride('idxSeasonTitle2', 'cms_season_title2');
        applyCmsOverride('idxSeasonDesc2', 'cms_season_desc2');
        applyCmsOverride('idxSeasonTitle3', 'cms_season_title3');
        applyCmsOverride('idxSeasonDesc3', 'cms_season_desc3');
        applyCmsOverride('idxSeasonTitle4', 'cms_season_title4');
        applyCmsOverride('idxSeasonDesc4', 'cms_season_desc4');

        applyCmsOverride('idxMissionTitle1', 'cms_mission_title1');
        applyCmsOverride('idxMissionDesc1', 'cms_mission_desc1');
        applyCmsOverride('idxMissionTitle2', 'cms_mission_title2');
        applyCmsOverride('idxMissionDesc2', 'cms_mission_desc2');
        applyCmsOverride('idxMissionTitle3', 'cms_mission_title3');
        applyCmsOverride('idxMissionDesc3', 'cms_mission_desc3');
    }

    fetch('header.html')
        .then(response => {
            if (!response.ok) throw new Error('網路回應不成功');
            return response.text();
        })
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            
            const userRole = localStorage.getItem('userRole');
            const userName = localStorage.getItem('userName');
            
            const navHome = document.getElementById('navHome');
            const navMap = document.getElementById('navMap');
            const navItinerary = document.getElementById('navItinerary');
            const navProfile = document.getElementById('navProfile');
            
            const navMerchantGame = document.getElementById('navMerchantGame');
            const navMerchantProfile = document.getElementById('navMerchantProfile');
            
            const navSuperAdmin = document.getElementById('navSuperAdmin');
            const navAdminCms = document.getElementById('navAdminCms');
            const navAdminMap = document.getElementById('navAdminMap');
            const navAdminUsers = document.getElementById('navAdminUsers');
            
            const userInfoArea = document.getElementById('userInfoArea');
            const headerUserName = document.getElementById('headerUserName');
            const headerLoginLink = document.getElementById('headerLoginLink');
            const logoutBtn = document.getElementById('logoutBtn');

            if (userRole && userName) {
                if (userInfoArea) userInfoArea.style.setProperty('display', 'flex', 'important'); 
                if (headerUserName) headerUserName.innerText = `${userName}`;
                if (headerLoginLink) headerLoginLink.style.setProperty('display', 'none', 'important');

                if (userRole === 'admin') {
                    if (navHome) navHome.style.setProperty('display', 'none', 'important');
                    if (navMap) navMap.style.setProperty('display', 'inline-flex', 'important');
                    if (navItinerary) navItinerary.style.setProperty('display', 'none', 'important');
                    if (navProfile) navProfile.style.setProperty('display', 'none', 'important');
                    
                    if (navMerchantGame) navMerchantGame.style.setProperty('display', 'none', 'important');
                    if (navMerchantProfile) navMerchantProfile.style.setProperty('display', 'none', 'important');
                    
                    if (navSuperAdmin) navSuperAdmin.style.setProperty('display', 'inline-flex', 'important');
                    if (navAdminCms) navAdminCms.style.setProperty('display', 'inline-flex', 'important');
                    if (navAdminMap) navAdminMap.style.setProperty('display', 'inline-flex', 'important');
                    if (navAdminUsers) navAdminUsers.style.setProperty('display', 'inline-flex', 'important');
                } 
                else if (userRole === 'merchant') {
                    if (navHome) navHome.style.setProperty('display', 'none', 'important');
                    if (navMap) navMap.style.setProperty('display', 'inline-flex', 'important');
                    if (navItinerary) navItinerary.style.setProperty('display', 'none', 'important');
                    if (navProfile) navProfile.style.setProperty('display', 'none', 'important');
                    
                    if (navMerchantGame) navMerchantGame.style.setProperty('display', 'inline-flex', 'important');
                    if (navMerchantProfile) navMerchantProfile.style.setProperty('display', 'inline-flex', 'important');
                    
                    if (navSuperAdmin) navSuperAdmin.style.setProperty('display', 'none', 'important');
                    if (navAdminCms) navAdminCms.style.setProperty('display', 'none', 'important');
                    if (navAdminMap) navAdminMap.style.setProperty('display', 'none', 'important');
                    if (navAdminUsers) navAdminUsers.style.setProperty('display', 'none', 'important');
                }
                else {
                    if (navHome) navHome.style.setProperty('display', 'inline-flex', 'important');
                    if (navMap) navMap.style.setProperty('display', 'inline-flex', 'important');
                    if (navItinerary) navItinerary.style.setProperty('display', 'inline-flex', 'important');
                    if (navProfile) navProfile.style.setProperty('display', 'inline-flex', 'important');
                    
                    if (navMerchantGame) navMerchantGame.style.setProperty('display', 'none', 'important');
                    if (navMerchantProfile) navMerchantProfile.style.setProperty('display', 'none', 'important');
                    
                    if (navSuperAdmin) navSuperAdmin.style.setProperty('display', 'none', 'important');
                    if (navAdminCms) navAdminCms.style.setProperty('display', 'none', 'important');
                    if (navAdminMap) navAdminMap.style.setProperty('display', 'none', 'important');
                    if (navAdminUsers) navAdminUsers.style.setProperty('display', 'none', 'important');
                }
            } 
            else {
                if (userInfoArea) userInfoArea.style.setProperty('display', 'none', 'important');
                if (headerLoginLink) headerLoginLink.style.setProperty('display', 'inline-flex', 'important');
                
                if (navHome) navHome.style.setProperty('display', 'inline-flex', 'important');
                if (navMap) navMap.style.setProperty('display', 'inline-flex', 'important');
                if (navItinerary) navItinerary.style.setProperty('display', 'inline-flex', 'important');
                if (navProfile) navProfile.style.setProperty('display', 'none', 'important');
                
                if (navMerchantGame) navMerchantGame.style.setProperty('display', 'none', 'important');
                if (navMerchantProfile) navMerchantProfile.style.setProperty('display', 'none', 'important');
                
                if (navSuperAdmin) navSuperAdmin.style.setProperty('display', 'none', 'important');
                if (navAdminCms) navAdminCms.style.setProperty('display', 'none', 'important');
                if (navAdminMap) navAdminMap.style.setProperty('display', 'none', 'important');
                if (navAdminUsers) navAdminUsers.style.setProperty('display', 'none', 'important');
            }

            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('jwt_token');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userName');
                    alert('您已成功登出系統！');
                    window.location.href = 'auth.html';
                });
            }
            
            const navItems = document.querySelectorAll('.nav-item');
            const currentPath = window.location.pathname; 
            
            const urlParams = new URLSearchParams(window.location.search);
            const currentShopId = urlParams.get('shopId') || urlParams.get('merchantId');
            const currentUserId = localStorage.getItem('userId');

            let isTouristViewingShop = false;
            if (currentPath.includes('shop-profile.html') || currentPath.includes('index34.html')) {
                let isOwner = false;
                if (userRole === 'merchant' && (!currentShopId || String(currentShopId) === String(currentUserId))) {
                    isOwner = true;
                }
                if (!isOwner) {
                    isTouristViewingShop = true;
                }
            }

            navItems.forEach(item => {
                item.classList.remove('active'); 
                item.style.backgroundColor = '';
                item.style.color = '';
                
                const itemHref = item.getAttribute('href') || ''; 
                let isActive = currentPath.endsWith(itemHref) || (currentPath === '/' && itemHref === 'index.html');

                if (isTouristViewingShop) {
                    if (item.innerText.includes('個人成就') || itemHref.includes('shop-profile.html')) {
                        isActive = false;
                    }
                    if (item.innerText.includes('地圖導覽') || itemHref.includes('mapping.html')) {
                        isActive = true;
                    }
                }

                if (isActive) {
                    item.classList.add('active');
                    if (isTouristViewingShop && (item.innerText.includes('地圖導覽') || itemHref.includes('mapping.html'))) {
                        item.style.backgroundColor = '#1E5E3A';
                        item.style.color = '#FFFFFF';
                        item.style.borderRadius = '9999px';
                        item.style.padding = '6px 16px';
                    }
                } else if (isTouristViewingShop && (item.innerText.includes('個人成就') || itemHref.includes('shop-profile.html'))) {
                    item.style.backgroundColor = 'transparent';
                    item.style.color = '#4A5568';
                }
            });
        })
        .catch(error => console.error(error));
});