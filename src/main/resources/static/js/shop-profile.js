document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('jwt_token');
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');
    const API_SCAN_URL = "/api/tasks/scan";

    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        const observer = new MutationObserver(() => {
            const navLinks = headerPlaceholder.querySelectorAll('a');
            if (navLinks.length > 0) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    link.style.backgroundColor = 'transparent';
                    link.style.color = '#4A5568'; 
                    
                    if (link.innerText.includes('商家個人化')) {
                        link.classList.add('active');
                        link.style.backgroundColor = '#1E5E3A'; 
                        link.style.color = '#FFFFFF';
                        link.style.borderRadius = '9999px';
                        link.style.padding = '6px 16px';
                    }
                });
                observer.disconnect();
            }
        });
        observer.observe(headerPlaceholder, { childList: true, subtree: true });
    }

    const urlParams = new URLSearchParams(window.location.search);
    let shopId = urlParams.get('shopId');
    const queryShopName = urlParams.get('name');

    let isOwner = false;
    if (userRole === 'merchant' && (!shopId || String(shopId) === String(userId))) {
        isOwner = true;
        shopId = userId; 
    }

    async function loadShopData() {
        const savedData = JSON.parse(localStorage.getItem(`shop_profile_${shopId}`)) || {
            title: queryShopName ? decodeURIComponent(queryShopName) : (isOwner ? (userName || "載入中...") : "載入中..."),
            address: "南投縣鹿谷鄉小半天",
            description: "小半天在地優質商家。",
            bgImage: "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=1000&auto=format&fit=crop",
            status: "open"
        };

        const editShopTitle = document.getElementById('editShopTitle');
        const editShopAddress = document.getElementById('editShopAddress');
        const editShopDesc = document.getElementById('editShopDesc');
        const editShopStatus = document.getElementById('editShopStatus');
        const shopHeroBg = document.getElementById('shopHeroBg');

        if (editShopTitle) editShopTitle.value = savedData.title;
        if (editShopAddress) editShopAddress.value = savedData.address;
        if (editShopDesc) editShopDesc.value = savedData.description;
        if (editShopStatus) editShopStatus.value = savedData.status || "open";

        if (savedData.bgImage && shopHeroBg) {
            shopHeroBg.style.backgroundImage = `url('${savedData.bgImage}')`;
        }
    }
    
    loadShopData();

    if (!isOwner) {
        const ownerActionFooter = document.getElementById('ownerActionFooter');
        const bgUploadLabel = document.querySelector('.change-bg-btn');
        const statusControl = document.querySelector('.status-control');
        const taskPreviewContainer = document.getElementById('taskPreviewContainer');
        
        if (ownerActionFooter) ownerActionFooter.style.display = 'none';
        if (bgUploadLabel) bgUploadLabel.style.display = 'none';
        if (statusControl) statusControl.style.display = 'none';
        if (taskPreviewContainer) taskPreviewContainer.style.display = 'none';

        const tagBadge = document.querySelector('.tag-badge');
        if (tagBadge) {
            tagBadge.innerText = '在地優質商家';
            tagBadge.style.background = '#EBF8FF';
            tagBadge.style.color = '#2B6CB0';
        }

        ['editShopTitle', 'editShopAddress', 'editShopDesc'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.readOnly = true;
                el.classList.add('readonly-mode');
            }
        });

        const touristActionSection = document.getElementById('touristActionSection');
        const lockedState = document.getElementById('lockedState');
        const unlockedState = document.getElementById('unlockedState');

        if (touristActionSection) touristActionSection.classList.remove('hidden');

        const isUnlocked = localStorage.getItem(`unlocked_${shopId}`) === 'true';
        if (isUnlocked) {
            if (lockedState) lockedState.classList.add('hidden');
            if (unlockedState) unlockedState.classList.remove('hidden');
        } else {
            if (lockedState) lockedState.classList.remove('hidden');
            if (unlockedState) unlockedState.classList.add('hidden');
        }

    } else {
        const taskPreview = document.getElementById('taskPreview');
        if (taskPreview) {
            taskPreview.innerHTML = `
                <div class="activity-card">
                    <div class="activity-info">
                        <h4>打卡任務</h4>
                        <p>系統自動帶入您在小遊戲設定中的內容</p>
                    </div>
                </div>
            `;
        }

        const bgUpload = document.getElementById('bgUpload');
        if (bgUpload) {
            bgUpload.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const base64 = event.target.result;
                        const shopHeroBg = document.getElementById('shopHeroBg');
                        if (shopHeroBg) shopHeroBg.style.backgroundImage = `url('${base64}')`;
                        
                        const currentData = JSON.parse(localStorage.getItem(`shop_profile_${shopId}`)) || {};
                        currentData.bgImage = base64;
                        localStorage.setItem(`shop_profile_${shopId}`, JSON.stringify(currentData));
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        const btnSaveProfile = document.getElementById('btnSaveProfile');
        if (btnSaveProfile) {
            btnSaveProfile.addEventListener('click', () => {
                const editShopTitle = document.getElementById('editShopTitle');
                const editShopAddress = document.getElementById('editShopAddress');
                const editShopDesc = document.getElementById('editShopDesc');
                const editShopStatus = document.getElementById('editShopStatus');
                const currentData = JSON.parse(localStorage.getItem(`shop_profile_${shopId}`)) || {};

                const updatedData = {
                    title: editShopTitle ? editShopTitle.value.trim() : "",
                    address: editShopAddress ? editShopAddress.value.trim() : "",
                    description: editShopDesc ? editShopDesc.value.trim() : "",
                    bgImage: currentData.bgImage || "",
                    status: editShopStatus ? editShopStatus.value : "open"
                };

                localStorage.setItem(`shop_profile_${shopId}`, JSON.stringify(updatedData));
                localStorage.setItem('userName', updatedData.title); 

                alert('資料已成功更新！');
                location.reload();
            });
        }
    }

    const btnTouristUnlock = document.getElementById('btnTouristUnlock');
    const scannerModal = document.getElementById('scannerModal');
    const closeScannerModal = document.getElementById('closeScannerModal');
    const scanResultDiv = document.getElementById('scanResult');
    const scanDataText = document.getElementById('scanData');
    const btnConfirmScan = document.getElementById('btnConfirmScan');
    
    let html5QrcodeScanner = null;
    let currentDecodedText = "";

    if (btnTouristUnlock) {
        btnTouristUnlock.addEventListener('click', () => {
            scannerModal.classList.remove('hidden');
            scanResultDiv.classList.add('hidden');
            
            html5QrcodeScanner = new Html5QrcodeScanner(
                "reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false
            );
            html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        });
    }

    if (closeScannerModal) {
        closeScannerModal.addEventListener('click', () => {
            scannerModal.classList.add('hidden');
            if (html5QrcodeScanner) html5QrcodeScanner.clear();
        });
    }

    function onScanSuccess(decodedText, decodedResult) {
        html5QrcodeScanner.clear();
        currentDecodedText = decodedText;
        scanDataText.innerText = `讀取到的店家憑證：${decodedText}`;
        document.getElementById('reader').innerHTML = ''; 
        scanResultDiv.classList.remove('hidden');
    }

    function onScanFailure(error) {
    }

    if (btnConfirmScan) {
        btnConfirmScan.addEventListener('click', async () => {
            if (!userId) {
                alert("請先登入小半天系統再進行解鎖！");
                window.location.href = "auth.html";
                return;
            }

            btnConfirmScan.disabled = true;
            btnConfirmScan.innerText = "處理中...";

            try {
                const response = await fetch(API_SCAN_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        userId: parseInt(userId), 
                        qrSecret: currentDecodedText 
                    })
                });
                
                const result = await response.json();
                
                if (result.status === 200 || result.code === 200) {
                    alert('準備進入任務挑戰！');
                    localStorage.setItem('currentTaskData', JSON.stringify(result.data));
                    window.location.href = `index34.html?taskId=${result.data.taskId}&shopId=${shopId}`;
                } else {
                    alert(`解鎖失敗：${result.message}`);
                    btnConfirmScan.disabled = false;
                    btnConfirmScan.innerText = "確認並進入挑戰";
                }
            } catch (error) {
                alert("網路連線錯誤，請確認條碼是否正確並稍後再試！");
                btnConfirmScan.disabled = false;
                btnConfirmScan.innerText = "確認並進入挑戰";
            }
        });
    }
});