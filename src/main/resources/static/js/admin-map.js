document.addEventListener("DOMContentLoaded", () => {
    
    const token = localStorage.getItem('jwt_token');
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
        window.location.href = "index.html";
        return;
    }

    const tbody = document.getElementById('spotsTableBody');
    const addForm = document.getElementById('addSpotForm');
    const editForm = document.getElementById('editSpotForm');
    const editModal = document.getElementById('editModal');
    
    let spotImageBase64 = null;
    let editSpotImageBase64 = null;
    let currentSpots = [];

    const spotImageInput = document.getElementById('spotImage');
    const previewSpotImg = document.getElementById('previewSpotImg');
    
    const editSpotImageInput = document.getElementById('editSpotImage');
    const editPreviewSpotImg = document.getElementById('editPreviewSpotImg');

    spotImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                spotImageBase64 = event.target.result;
                previewSpotImg.src = spotImageBase64;
                previewSpotImg.style.display = 'block';
                spotImageInput.previousElementSibling.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    editSpotImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                editSpotImageBase64 = event.target.result;
                editPreviewSpotImg.src = editSpotImageBase64;
                editPreviewSpotImg.style.display = 'block';
                editSpotImageInput.previousElementSibling.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    async function fetchOfficialSpots() {
        try {
            const res = await fetch("/api/map/locations");
            const result = await res.json();
            
            tbody.innerHTML = ''; 

            if (result.status === 200 && result.data.length > 0) {
                currentSpots = result.data.filter(spot => spot.merchantId === null);
                
                if (currentSpots.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-500">目前尚無官方景點</td></tr>';
                    return;
                }

                currentSpots.forEach(spot => {
                    let statusHtml = '';
                    if (spot.status === 'maintenance') {
                        statusHtml = '<span class="status-badge status-maintenance">維護整修中</span>';
                    } else {
                        statusHtml = '<span class="status-badge status-open">正常開放</span>';
                    }

                    // 💡 在 action-btns 裡面加入 generateAttractionQR 的按鈕
                    const row = `
                        <tr>
                            <td class="font-bold">${spot.name}</td>
                            <td>${spot.address || '未設定'}</td>
                            <td>${statusHtml}</td>
                            <td>
                                <div class="action-btns" style="display: flex; gap: 8px;">
                                    <button class="btn-qr" style="background: #2B6CB0; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;" onclick="generateAttractionQR(${spot.attractionId}, '${spot.name}')">QR Code</button>
                                    <button class="btn-edit" onclick="openEditModal(${spot.attractionId})">修改</button>
                                    <button class="btn-delete" onclick="deleteSpot(${spot.attractionId})">刪除</button>
                                </div>
                            </td>
                        </tr>
                    `;
                    tbody.insertAdjacentHTML('beforeend', row);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-500">目前尚無景點資料</td></tr>';
            }
        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-red-500">無法連線至伺服器</td></tr>';
        }
    }

    addForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const payload = {
            name: document.getElementById('spotName').value.trim(),
            address: document.getElementById('spotAddress').value.trim(),
            latitude: document.getElementById('spotLat').value ? parseFloat(document.getElementById('spotLat').value) : null,
            longitude: document.getElementById('spotLng').value ? parseFloat(document.getElementById('spotLng').value) : null,
            status: document.getElementById('spotStatus').value,
            description: document.getElementById('spotDesc').value.trim(),
            imageUrl: spotImageBase64 
        };

        try {
            const res = await fetch("/api/admin/attractions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (result.status === 200) {
                addForm.reset(); 
                spotImageBase64 = null;
                previewSpotImg.style.display = 'none';
                spotImageInput.previousElementSibling.style.display = 'inline';
                fetchOfficialSpots(); 
            }
        } catch (error) {
        }
    });

    window.openEditModal = function(id) {
        const spot = currentSpots.find(s => s.attractionId === id);
        if (!spot) return;

        document.getElementById('editSpotId').value = spot.attractionId;
        document.getElementById('editSpotName').value = spot.name || '';
        document.getElementById('editSpotAddress').value = spot.address || '';
        document.getElementById('editSpotLat').value = spot.latitude || '';
        document.getElementById('editSpotLng').value = spot.longitude || '';
        document.getElementById('editSpotStatus').value = spot.status || 'open';
        document.getElementById('editSpotDesc').value = spot.description || '';

        editSpotImageBase64 = spot.imageUrl || null;
        if (editSpotImageBase64) {
            editPreviewSpotImg.src = editSpotImageBase64;
            editPreviewSpotImg.style.display = 'block';
            editSpotImageInput.previousElementSibling.style.display = 'none';
        } else {
            editPreviewSpotImg.style.display = 'none';
            editSpotImageInput.previousElementSibling.style.display = 'inline';
        }

        editModal.style.display = 'flex';
    };

    window.closeEditModal = function() {
        editModal.style.display = 'none';
        editForm.reset();
    };

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('editSpotId').value;
        const payload = {
            name: document.getElementById('editSpotName').value.trim(),
            address: document.getElementById('editSpotAddress').value.trim(),
            latitude: document.getElementById('editSpotLat').value ? parseFloat(document.getElementById('editSpotLat').value) : null,
            longitude: document.getElementById('editSpotLng').value ? parseFloat(document.getElementById('editSpotLng').value) : null,
            status: document.getElementById('editSpotStatus').value,
            description: document.getElementById('editSpotDesc').value.trim(),
            imageUrl: editSpotImageBase64
        };

        try {
            const res = await fetch(`/api/admin/attractions/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                closeEditModal();
                fetchOfficialSpots();
            }
        } catch (error) {
        }
    });

    window.deleteSpot = async function(id) {
        if (!confirm("確定要刪除此景點嗎？")) return;
        try {
            const res = await fetch(`/api/admin/attractions/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                fetchOfficialSpots(); 
            }
        } catch (error) {
        }
    };

    // ==========================================
    // 💡 官方景點 QR Code 生成邏輯
    // ==========================================
    window.generateAttractionQR = function(id, name) {
        const modal = document.getElementById('adminQrModal');
        const container = document.getElementById('adminQrcodeContainer');
        const titleText = document.getElementById('adminQrModalTitle');

        if (!modal || !container) {
            alert("找不到 QR Code 視窗元件，請確認 HTML 中是否有對應的 modal！");
            return;
        }

        // 清除舊的 QR Code
        container.innerHTML = '';
        
        // 設定標題與內容
        titleText.innerText = `${name} - 專屬 QR Code`;
        new QRCode(container, {
            text: `attraction_${id}`, // 官方景點格式
            width: 200,
            height: 200
        });

        // 顯示視窗
        modal.style.display = 'flex';
    };

    window.closeAdminQrModal = function() {
        document.getElementById('adminQrModal').style.display = 'none';
    };

    const btnDownloadAdminQR = document.getElementById('btnDownloadAdminQR');
    if (btnDownloadAdminQR) {
        btnDownloadAdminQR.addEventListener('click', () => {
            const qrcodeContainer = document.getElementById('adminQrcodeContainer');
            const canvas = qrcodeContainer.querySelector('canvas');
            const spotName = document.getElementById('adminQrModalTitle').innerText.split(' - ')[0];

            if (canvas) {
                const url = canvas.toDataURL("image/png");
                const a = document.createElement('a');
                a.href = url;
                a.download = `QR_${spotName}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                const img = qrcodeContainer.querySelector('img');
                if (img && img.src) {
                    const a = document.createElement('a');
                    a.href = img.src;
                    a.download = `QR_${spotName}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
            }
        });
    }

    fetchOfficialSpots();
});