document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetId = parseInt(urlParams.get('id'));
    const token = localStorage.getItem('jwt_token');
    const userId = localStorage.getItem('userId');

    if (!targetId) {
        alert("找不到景點 ID，將返回地圖！");
        window.location.href = "mapping.html";
        return;
    }

    try {
        const response = await fetch("/api/map/locations");
        const result = await response.json();

        if (result.status === 200) {
            const locations = result.data;
            const currentSpot = locations.find(loc => loc.attractionId === targetId);

            if (currentSpot) {
                document.getElementById('pageTitle').innerText = currentSpot.name;
                document.getElementById('pageAddress').innerText = currentSpot.address || '南投縣鹿谷鄉小半天';
                
                const formattedDesc = (currentSpot.description || '暫無介紹').replace(/\n/g, '<br>');
                document.getElementById('pageDesc').innerHTML = formattedDesc;

                const heroImage = document.getElementById('heroImage');
                if (heroImage && currentSpot.imageUrl) {
                    heroImage.style.backgroundImage = `url('${currentSpot.imageUrl}')`;
                    heroImage.style.backgroundSize = 'cover';
                    heroImage.style.backgroundPosition = 'center';
                }

                document.getElementById('loadingState').style.display = 'none';
                document.getElementById('attractionContent').style.display = 'block';
            } else {
                document.getElementById('loadingState').innerText = "找不到該景點的資料。";
            }
        } else {
            document.getElementById('loadingState').innerText = "取得資料失敗：" + result.message;
        }
    } catch (error) {
        document.getElementById('loadingState').innerText = "連線失敗，請檢查網路狀態。";
    }

    const lockedState = document.getElementById('lockedState');
    const unlockedState = document.getElementById('unlockedState');
    const isUnlocked = localStorage.getItem(`unlocked_${targetId}`) === 'true';

    if (isUnlocked) {
        if (lockedState) lockedState.classList.add('hidden');
        if (unlockedState) unlockedState.classList.remove('hidden');
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
            if (!userId) {
                alert("請先登入系統才能解鎖景點！");
                window.location.href = "auth.html";
                return;
            }
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
        scanDataText.innerText = `讀取到的景點憑證：${decodedText}`;
        document.getElementById('reader').innerHTML = ''; 
        scanResultDiv.classList.remove('hidden');
    }

    function onScanFailure(error) {
    }

    if (btnConfirmScan) {
        btnConfirmScan.addEventListener('click', async () => {
            if (currentDecodedText === `attraction_${targetId}`) {
                alert("恭喜！成功解鎖此景點的專屬成就！");
                localStorage.setItem(`unlocked_${targetId}`, 'true');
                
                try {
                    await fetch('/api/tasks/submit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            userId: parseInt(userId),
                            taskId: targetId,
                            answer: "ATTRACTION_VISIT"
                        })
                    });
                } catch (e) {}

                scannerModal.classList.add('hidden');
                if (lockedState) lockedState.classList.add('hidden');
                if (unlockedState) unlockedState.classList.remove('hidden');
            } else {
                alert("無效的 QR Code，這好像不是這個景點的專屬條碼喔！");
            }
        });
    }
});