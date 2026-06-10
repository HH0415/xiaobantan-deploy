document.addEventListener("DOMContentLoaded", () => {
    
    // 1. 權限驗證
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
        alert("權限不足，即將跳轉回首頁。");
        window.location.href = "index.html";
        return;
    }

    // 2. 雙向綁定：打字即時預覽
    const syncInputs = document.querySelectorAll('.sync-input');
    
    syncInputs.forEach(input => {
        const targetId = input.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
        
        // 初始載入
        const savedValue = localStorage.getItem(input.id);
        if (savedValue) {
            input.value = savedValue;
            if (targetElement) {
                targetElement.innerText = savedValue;
            }
        }

        // 監聽輸入
        input.addEventListener('input', (e) => {
            if (targetElement) {
                targetElement.innerText = e.target.value || "預設內容";
            }
        });
    });

    // 其他無預覽的純文字欄位
    const otherInputs = ['cmsEventLink'];
    otherInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = localStorage.getItem(id) || '';
    });

    // 3. 圖片上傳即時預覽
    let heroImageBase64 = localStorage.getItem('cms_img_hero') || "";
    let customImageBase64 = localStorage.getItem('cms_custom_img') || "";

    // -- 主視覺背景圖 --
    const uploadHeroImg = document.getElementById('uploadHeroImg');
    const heroPreview = document.getElementById('heroPreview');
    const heroUploadArea = document.getElementById('heroUploadArea');
    const previewHeroBg = document.getElementById('previewHeroBg');

    if (heroImageBase64) {
        heroPreview.src = heroImageBase64;
        heroPreview.classList.remove('hidden');
        heroUploadArea.querySelector('.upload-text').style.display = 'none';
        
        previewHeroBg.style.backgroundImage = `url('${heroImageBase64}')`;
        previewHeroBg.style.boxShadow = "inset 0 0 0 2000px rgba(0, 0, 0, 0.4)";
        previewHeroBg.querySelector('.preview-hero-title').style.color = "white";
        previewHeroBg.querySelector('.preview-hero-title').style.textShadow = "none";
    }

    heroUploadArea.addEventListener('click', () => uploadHeroImg.click());
    uploadHeroImg.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                heroImageBase64 = event.target.result;
                heroPreview.src = heroImageBase64;
                heroPreview.classList.remove('hidden');
                heroUploadArea.querySelector('.upload-text').style.display = 'none';
                
                previewHeroBg.style.backgroundImage = `url('${heroImageBase64}')`;
                previewHeroBg.style.boxShadow = "inset 0 0 0 2000px rgba(0, 0, 0, 0.4)";
                previewHeroBg.querySelector('.preview-hero-title').style.color = "white";
                previewHeroBg.querySelector('.preview-hero-title').style.textShadow = "none";
            };
            reader.readAsDataURL(file); 
        }
    });

    // -- 自訂圖文宣告圖 --
    const uploadCustomImg = document.getElementById('uploadCustomImg');
    const customPreview = document.getElementById('customPreview');
    const customUploadArea = document.getElementById('customUploadArea');
    const previewCustomImgBox = document.getElementById('previewCustomImgBox');
    const previewCustomImg = document.getElementById('previewCustomImg');

    if (customImageBase64) {
        customPreview.src = customImageBase64;
        customPreview.classList.remove('hidden');
        customUploadArea.querySelector('.upload-text').style.display = 'none';
        
        previewCustomImg.src = customImageBase64;
        previewCustomImgBox.style.display = 'block';
    }

    customUploadArea.addEventListener('click', () => uploadCustomImg.click());
    uploadCustomImg.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                customImageBase64 = event.target.result;
                customPreview.src = customImageBase64;
                customPreview.classList.remove('hidden');
                customUploadArea.querySelector('.upload-text').style.display = 'none';
                
                previewCustomImg.src = customImageBase64;
                previewCustomImgBox.style.display = 'block';
            };
            reader.readAsDataURL(file); 
        }
    });

    // 4. 儲存按鈕
    const btnSaveCms = document.getElementById('btnSaveCms');
    if (btnSaveCms) {
        btnSaveCms.addEventListener('click', () => {
            // 儲存文字
            document.querySelectorAll('.form-input, .form-textarea').forEach(input => {
                localStorage.setItem(input.id, input.value.trim());
            });

            // 儲存圖片
            if (heroImageBase64) localStorage.setItem('cms_img_hero', heroImageBase64);
            if (customImageBase64) localStorage.setItem('cms_custom_img', customImageBase64);

            alert("首頁內容更新成功！");
            window.location.href = "index.html"; 
        });
    }
});