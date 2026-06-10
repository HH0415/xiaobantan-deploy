document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("jwt_token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
        alert('請先登入系統才能挑戰任務喔！');
        window.location.href = 'auth.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const merchantId = urlParams.get('merchantId') || urlParams.get('shopId');

    if (!merchantId) {
        alert('無效的商家！');
        window.location.href = 'mapping.html';
        return;
    }

    const btnReturnShop = document.getElementById('btnReturnShop');
    if (btnReturnShop) {
        btnReturnShop.addEventListener('click', () => {
            window.location.href = `shop-profile.html?shopId=${merchantId}`;
        });
    }

    const showSection = (id) => {
        ['loading-screen', 'puzzle-section', 'quiz-section', 'success-section'].forEach(sec => {
            const el = document.getElementById(sec);
            if (el) el.classList.add('hidden');
        });
        const targetEl = document.getElementById(id);
        if (targetEl) targetEl.classList.remove('hidden');
    };

    const taskDataStr = localStorage.getItem('currentTaskData');
    let currentTask = null;

    if (taskDataStr) {
        try {
            currentTask = JSON.parse(taskDataStr);
        } catch (e) {}
    }

    if (!currentTask) {
        alert("找不到任務資料，請回商家頁面重新掃描 QR Code！");
        window.location.href = `shop-profile.html?shopId=${merchantId}`;
        return;
    }

    setTimeout(() => {
        const taskType = currentTask.taskType || currentTask.type || 'quiz';

        if (taskType === 'puzzle') {
            initPuzzleGame(currentTask);
            showSection('puzzle-section');
        } else if (taskType === 'quiz') {
            initQuizGame(currentTask);
            showSection('quiz-section');
        } else {
            alert('未知的任務類型！');
            window.location.href = `shop-profile.html?shopId=${merchantId}`;
        }
    }, 800);

    async function submitTaskSuccess(answer) {
        try {
            const res = await fetch('/api/tasks/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: parseInt(userId),
                    taskId: currentTask.taskId || currentTask.id,
                    answer: answer
                })
            });
            const result = await res.json();
            
            if (result.status === 200 || result.code === 200) {
                localStorage.setItem(`unlocked_${merchantId}`, 'true');
                showSection('success-section');
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert("網路連線異常，請稍後再試");
        }
    }

    let puzzlePieces = [];
    let moves = 0;
    let draggingSlotIdx = null;

    window.resetPuzzle = () => {
        if (currentTask && (currentTask.taskType === 'puzzle' || currentTask.type === 'puzzle')) {
            initPuzzleGame(currentTask);
        }
    };

    function initPuzzleGame(taskData) {
        moves = 0;
        document.getElementById('move-count').innerText = '0';
        
        const imageUrl = taskData.puzzleImage || taskData.imageUrl || 'https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=300&h=300&auto=format&fit=crop';
        
        const targetImgDiv = document.getElementById('target-img');
        if (targetImgDiv) {
            targetImgDiv.style.backgroundImage = `url('${imageUrl}')`;
        }

        puzzlePieces = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        for (let i = puzzlePieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [puzzlePieces[i], puzzlePieces[j]] = [puzzlePieces[j], puzzlePieces[i]];
        }
        
        renderPuzzleGrid(imageUrl);
    }

    function renderPuzzleGrid(base64Image) {
        const grid = document.getElementById('puzzle-grid');
        if (!grid) return;
        grid.innerHTML = '';

        puzzlePieces.forEach((pieceOriginIdx, currentSlotIdx) => {
            const pieceDiv = document.createElement('div');
            pieceDiv.className = 'cursor-pointer transition-opacity';
            pieceDiv.style.backgroundImage = `url('${base64Image}')`;

            pieceDiv.style.backgroundSize = '304px 304px';

            const originCol = pieceOriginIdx % 3;
            const originRow = Math.floor(pieceOriginIdx / 3);
            const bgX = originCol * 102;
            const bgY = originRow * 102;
            
            pieceDiv.style.backgroundPosition = `-${bgX}px -${bgY}px`;

            pieceDiv.draggable = true;
            pieceDiv.ondragstart = () => {
                draggingSlotIdx = currentSlotIdx;
                pieceDiv.style.opacity = '0.5';
            };
            pieceDiv.ondragend = () => {
                pieceDiv.style.opacity = '1';
            };
            pieceDiv.ondragover = (e) => e.preventDefault();
            pieceDiv.ondrop = () => handlePuzzleDrop(currentSlotIdx, base64Image);

            pieceDiv.onclick = () => {
                if (draggingSlotIdx === null) {
                    draggingSlotIdx = currentSlotIdx;
                    pieceDiv.style.border = '4px solid #1E5E3A';
                } else {
                    handlePuzzleDrop(currentSlotIdx, base64Image);
                }
            };

            grid.appendChild(pieceDiv);
        });
    }

    function handlePuzzleDrop(targetSlotIdx, base64Image) {
        if (draggingSlotIdx === null || draggingSlotIdx === targetSlotIdx) {
            draggingSlotIdx = null;
            renderPuzzleGrid(base64Image);
            return;
        }

        [puzzlePieces[draggingSlotIdx], puzzlePieces[targetSlotIdx]] = 
        [puzzlePieces[targetSlotIdx], puzzlePieces[draggingSlotIdx]];
        
        moves++;
        const moveCountEl = document.getElementById('move-count');
        if (moveCountEl) moveCountEl.innerText = moves;
        
        draggingSlotIdx = null;
        renderPuzzleGrid(base64Image);
        checkPuzzleWin();
    }

    function checkPuzzleWin() {
        const isWin = puzzlePieces.every((val, index) => val === index);
        if (isWin) {
            setTimeout(() => {
                submitTaskSuccess("PUZZLE_DONE");
            }, 300);
        }
    }

    function initQuizGame(taskData) {
        const question = taskData.question || taskData.quizQuestion || '小半天最有名的特產是什麼？';
        const qEl = document.getElementById('quiz-question');
        if (qEl) qEl.innerText = question;
        
        let optionsObj = { "A": "選項A", "B": "選項B", "C": "選項C" };
        try {
            if (taskData.optionsJson) {
                optionsObj = JSON.parse(taskData.optionsJson);
            } else if (taskData.optionA) {
                optionsObj = { "A": taskData.optionA, "B": taskData.optionB, "C": taskData.optionC };
            }
        } catch (e) {}

        const optionsContainer = document.getElementById('quiz-options');
        if (!optionsContainer) return;
        optionsContainer.innerHTML = '';

        Object.keys(optionsObj).forEach(key => {
            const btn = document.createElement('button');
            btn.className = "w-full text-left px-6 py-4 rounded-theme border border-theme-border bg-card hover:border-primary hover:bg-secondary/20 transition-all font-medium text-foreground flex items-center gap-4 shadow-sm";
            
            btn.innerHTML = `
                <span class="w-8 h-8 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-sm shrink-0">${key}</span> 
                <span>${optionsObj[key]}</span>
            `;

            btn.onclick = () => handleQuizSelect(key, btn);
            optionsContainer.appendChild(btn);
        });
    }

    function handleQuizSelect(selectedKey, clickedBtn) {
        const optionsContainer = document.getElementById('quiz-options');
        const allBtns = optionsContainer.querySelectorAll('button');
        
        allBtns.forEach(b => {
            b.disabled = true;
            if (b !== clickedBtn) b.classList.add('opacity-50');
        });

        clickedBtn.style.border = '2px solid #1E5E3A';
        clickedBtn.style.backgroundColor = '#E6F4EA';

        fetch('/api/tasks/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: parseInt(userId),
                taskId: currentTask.taskId || currentTask.id,
                answer: selectedKey
            })
        })
        .then(res => res.json())
        .then(result => {
            if (result.status === 200 || result.code === 200) {
                setTimeout(() => {
                    localStorage.setItem(`unlocked_${merchantId}`, 'true');
                    showSection('success-section');
                }, 800);
            } else {
                clickedBtn.style.border = '2px solid #E53E3E';
                clickedBtn.style.backgroundColor = '#FFF5F5';
                
                setTimeout(() => {
                    alert('哎呀，答案不對喔！再想想看！');
                    allBtns.forEach(b => {
                        b.disabled = false;
                        b.classList.remove('opacity-50');
                        b.style.border = '';
                        b.style.backgroundColor = '';
                    });
                }, 800);
            }
        })
        .catch(err => {
            alert("網路異常，請稍後再試。");
            allBtns.forEach(b => b.disabled = false);
        });
    }
});