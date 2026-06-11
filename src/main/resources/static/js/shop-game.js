document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('jwt_token');
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');

    if (userRole !== 'merchant') {
        window.location.href = "index.html";
        return;
    }

    const sidebarMerchantName = document.getElementById('sidebarMerchantName');
    if (sidebarMerchantName && userName) {
        sidebarMerchantName.innerText = userName;
    }

    const typeRadios = document.querySelectorAll('input[name="taskType"]');
    const typePuzzleCard = document.getElementById('typePuzzleCard');
    const typeQuizCard = document.getElementById('typeQuizCard');
    const puzzleConfigArea = document.getElementById('puzzleConfigArea');
    const quizConfigArea = document.getElementById('quizConfigArea');

    typeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'puzzle') {
                typePuzzleCard.classList.add('active');
                typeQuizCard.classList.remove('active');
                puzzleConfigArea.classList.remove('hidden');
                quizConfigArea.classList.add('hidden');
            } else {
                typeQuizCard.classList.add('active');
                typePuzzleCard.classList.remove('active');
                quizConfigArea.classList.remove('hidden');
                puzzleConfigArea.classList.add('hidden');
            }
        });
    });

    const puzzleUploadTrigger = document.getElementById('puzzleUploadTrigger');
    const puzzleImageInput = document.getElementById('puzzleImageInput');
    const imagePreview = document.getElementById('imagePreview');
    let currentImageBase64 = null;

    if (puzzleUploadTrigger) {
        puzzleUploadTrigger.addEventListener('click', () => puzzleImageInput.click());
    }

    if (puzzleImageInput) {
        puzzleImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const MAX_WIDTH = 1200;
                        let scaleSize = 1;
                        
                        if (img.width > MAX_WIDTH) {
                            scaleSize = MAX_WIDTH / img.width;
                        }
                        
                        canvas.width = img.width * scaleSize;
                        canvas.height = img.height * scaleSize;
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        
                        const base64 = canvas.toDataURL('image/jpeg', 0.7);
                        currentImageBase64 = base64;
                        imagePreview.style.backgroundImage = `url('${currentImageBase64}')`;
                        imagePreview.style.backgroundSize = 'contain';
                        imagePreview.style.backgroundPosition = 'center';
                        imagePreview.style.backgroundRepeat = 'no-repeat';
                        imagePreview.style.height = '200px';
                        imagePreview.classList.remove('hidden');
                        puzzleUploadTrigger.classList.add('hidden');
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    async function fetchExistingConfig() {
        try {
            const res = await fetch("/api/tasks/merchant-task", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const result = await res.json();
            
            if (result.status === 200 && result.data) {
                const data = result.data;
                if (data.taskType === 'quiz' || data.type === 'quiz') {
                    document.querySelector('input[value="quiz"]').checked = true;
                    document.querySelector('input[value="quiz"]').dispatchEvent(new Event('change'));
                    document.getElementById('quizQuestion').value = data.question || '';
                    
                    if (data.optionsJson) {
                        try {
                            const opts = JSON.parse(data.optionsJson);
                            document.getElementById('optionA').value = opts.A || '';
                            document.getElementById('optionB').value = opts.B || '';
                            document.getElementById('optionC').value = opts.C || '';
                        } catch(e) {}
                    }
                    
                    document.getElementById('quizAnswer').value = data.answer || data.correctAnswer || 'A';
                } else {
                    document.querySelector('input[value="puzzle"]').checked = true;
                    document.querySelector('input[value="puzzle"]').dispatchEvent(new Event('change'));
                    if (data.puzzleImage) {
                        currentImageBase64 = data.puzzleImage;
                        imagePreview.style.backgroundImage = `url('${currentImageBase64}')`;
                        imagePreview.style.backgroundSize = 'contain';
                        imagePreview.style.backgroundPosition = 'center';
                        imagePreview.style.backgroundRepeat = 'no-repeat';
                        imagePreview.style.height = '200px';
                        imagePreview.classList.remove('hidden');
                        puzzleUploadTrigger.classList.add('hidden');
                    }
                }
            }
        } catch (error) {}
    }

    const btnSaveTask = document.getElementById('btnSaveTask');
    const qrModal = document.getElementById('qrModal');
    const closeQrModal = document.getElementById('closeQrModal');
    const qrcodeContainer = document.getElementById('qrcodeContainer');

    if (btnSaveTask) {
        btnSaveTask.addEventListener('click', async () => {
            const type = document.querySelector('input[name="taskType"]:checked').value;
            const payload = { 
                merchantId: parseInt(userId),
                taskType: type
            };

            if (type === 'puzzle') {
                if (!currentImageBase64) {
                    alert("請上傳圖片");
                    return;
                }
                payload.puzzleImage = currentImageBase64;
            } else {
                const qValue = document.getElementById('quizQuestion').value.trim();
                const optA = document.getElementById('optionA').value.trim();
                const optB = document.getElementById('optionB').value.trim();
                const optC = document.getElementById('optionC').value.trim();
                const ans = document.getElementById('quizAnswer').value;

                if (!qValue || !optA || !optB) {
                    alert("請填寫完整問答資訊");
                    return;
                }

                payload.quizData = {
                    question: qValue,
                    answer: ans,
                    options: {
                        "A": optA,
                        "B": optB,
                        "C": optC
                    }
                };
            }

            try {
                const res = await fetch("/api/tasks/merchant-task", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    alert("設定已發布！");
                    qrcodeContainer.innerHTML = '';
                    new QRCode(qrcodeContainer, {
                        text: `shop_${userId}`,
                        width: 200,
                        height: 200
                    });
                    qrModal.classList.remove('hidden');
                } else {
                    alert("儲存失敗");
                }
            } catch (error) {
                alert("連線錯誤");
            }
        });
    }

    if (closeQrModal) {
        closeQrModal.addEventListener('click', () => {
            qrModal.classList.add('hidden');
        });
    }

    const btnDownloadQR = document.getElementById('btnDownloadQR');
    if (btnDownloadQR) {
        btnDownloadQR.addEventListener('click', () => {
            const canvas = qrcodeContainer.querySelector('canvas');
            if (canvas) {
                const url = canvas.toDataURL("image/png");
                const a = document.createElement('a');
                a.href = url;
                a.download = 'shop_task_qrcode.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                const img = qrcodeContainer.querySelector('img');
                if (img && img.src) {
                    const a = document.createElement('a');
                    a.href = img.src;
                    a.download = 'shop_task_qrcode.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
            }
        });
    }

    fetchExistingConfig();
});