// js/scanner.js

document.addEventListener("DOMContentLoaded", () => {
    const startScanBtn = document.getElementById('startScanBtn');
    const closeScanBtn = document.getElementById('closeScanBtn');
    const scanModal = document.getElementById('scanModal');
    
    let html5QrCode = null;

    if (!startScanBtn || !closeScanBtn || !scanModal) return;

    // 1. 點擊「掃描」：打開視窗並啟動相機
    startScanBtn.addEventListener('click', () => {
        // 💡 霸道總裁式開啟：直接修改 style
        scanModal.style.display = 'flex'; 
        
        if (html5QrCode) {
            try { html5QrCode.clear(); } catch(e){}
        }

        html5QrCode = new Html5Qrcode("reader");
        
        html5QrCode.start(
            { facingMode: "environment" }, 
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            (decodedText, decodedResult) => {
                alert(`掃描成功！內容為：${decodedText}`);
                stopScanner();
            },
            (errorMessage) => {
                // 忽略尋找中的正常提示
            }
        ).catch((err) => {
            alert("無法啟動相機，請確認是否允許相機權限！");
            console.error(err);
            scanModal.style.display = 'none';
        });
    });

    // 2. 點擊「關閉 X」
    closeScanBtn.addEventListener('click', () => {
        stopScanner();
    });

    // 3. 終極強制關閉控制
    function stopScanner() {
        // 🚀 不管三七二十一，第一時間【先把白色視窗隱藏】，絕對不卡畫面！
        scanModal.style.display = 'none';

        // 就算 html5QrCode 還沒被 new 出來 (是 null)，上面那行關閉視窗也已經執行完了，X 按鈕再也不會失靈！
        if (html5QrCode) {
            try { 
                html5QrCode.clear(); 
            } catch (e) {
                console.log("節點已清理");
            }

            if (html5QrCode.isScanning) {
                html5QrCode.stop()
                    .then(() => {
                        console.log("相機已成功關閉");
                    })
                    .catch((err) => {
                        console.warn("背景關閉相機異常：", err);
                    });
            }
        }
    }
});