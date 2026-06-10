document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('jwt_token');
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');

    if (userRole !== 'merchant') {
        window.location.href = "index.html";
        return;
    }

    const sidebarMerchantName = document.getElementById('sidebarMerchantName');
    if (sidebarMerchantName && userName) {
        sidebarMerchantName.innerText = userName;
    }

    const shopCoverInput = document.getElementById('shopCoverInput');
    const coverUploadTrigger = document.getElementById('coverUploadTrigger');
    const coverPreview = document.getElementById('coverPreview');
    let currentCoverBase64 = null;

    if (coverUploadTrigger) {
        coverUploadTrigger.addEventListener('click', () => shopCoverInput.click());
    }

    if (shopCoverInput) {
        shopCoverInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    currentCoverBase64 = event.target.result;
                    coverPreview.style.backgroundImage = `url('${currentCoverBase64}')`;
                    coverPreview.classList.remove('hidden');
                    coverUploadTrigger.classList.add('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    async function fetchMerchantProfile() {
        try {
            const res = await fetch("/api/merchant/profile", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const result = await res.json();
            
            if (result.status === 200 && result.data) {
                const data = result.data;
                document.getElementById('shopName').value = data.name || '';
                document.getElementById('shopStatus').value = data.status || 'OPEN';
                document.getElementById('shopPhone').value = data.phone || '';
                document.getElementById('shopCategory').value = data.category || 'TEA';
                document.getElementById('shopAddress').value = data.address || '';
                document.getElementById('shopDescription').value = data.description || '';
                document.getElementById('shopDiscount').value = data.discount || '';

                if (data.coverImage) {
                    currentCoverBase64 = data.coverImage;
                    coverPreview.style.backgroundImage = `url('${currentCoverBase64}')`;
                    coverPreview.classList.remove('hidden');
                    coverUploadTrigger.classList.add('hidden');
                }
            }
        } catch (error) {}
    }

    const merchantForm = document.getElementById('merchantForm');
    if (merchantForm) {
        merchantForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const payload = {
                name: document.getElementById('shopName').value.trim(),
                status: document.getElementById('shopStatus').value,
                phone: document.getElementById('shopPhone').value.trim(),
                category: document.getElementById('shopCategory').value,
                address: document.getElementById('shopAddress').value.trim(),
                description: document.getElementById('shopDescription').value.trim(),
                discount: document.getElementById('shopDiscount').value.trim(),
                coverImage: currentCoverBase64
            };

            try {
                const res = await fetch("/api/merchant/profile", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    alert("基本資料已更新");
                    if (payload.name) {
                        localStorage.setItem('userName', payload.name);
                        if (sidebarMerchantName) sidebarMerchantName.innerText = payload.name;
                        const headerUserName = document.getElementById('headerUserName');
                        if (headerUserName) headerUserName.innerText = payload.name;
                    }
                } else {
                    alert("更新失敗");
                }
            } catch (error) {
                alert("連線錯誤");
            }
        });
    }

    const btnPreviewShop = document.getElementById('btnPreviewShop');
    const previewModal = document.getElementById('previewModal');
    const closePreviewModal = document.getElementById('closePreviewModal');

    if (btnPreviewShop && previewModal) {
        btnPreviewShop.addEventListener('click', () => {
            const name = document.getElementById('shopName').value || '未命名商家';
            const status = document.getElementById('shopStatus').value;
            const phone = document.getElementById('shopPhone').value || '無聯絡電話';
            const category = document.getElementById('shopCategory').value;
            const address = document.getElementById('shopAddress').value || '無地址資訊';
            const desc = document.getElementById('shopDescription').value || '暫無介紹';
            const discount = document.getElementById('shopDiscount').value || '';

            document.getElementById('viewShopName').innerText = name;
            document.getElementById('viewAddress').innerText = address;
            document.getElementById('viewPhone').innerText = phone;
            document.getElementById('viewDescription').innerText = desc;
            
            const viewDiscount = document.getElementById('viewDiscount');
            if (discount.trim() !== '') {
                viewDiscount.innerText = discount;
                viewDiscount.style.display = 'block';
            } else {
                viewDiscount.style.display = 'none';
            }

            const viewStatus = document.getElementById('viewStatus');
            if (status === 'OPEN') {
                viewStatus.innerText = '營業中';
                viewStatus.style.backgroundColor = '#38A169';
            } else {
                viewStatus.innerText = '休息';
                viewStatus.style.backgroundColor = '#E53E3E';
            }

            document.getElementById('viewCategory').innerText = category === 'TEA' ? '茶行' : '餐飲';

            const viewCover = document.getElementById('viewCover');
            if (currentCoverBase64) {
                viewCover.style.backgroundImage = `url('${currentCoverBase64}')`;
            } else {
                viewCover.style.backgroundImage = 'none';
                viewCover.style.backgroundColor = '#A3D9B9';
            }

            previewModal.classList.remove('hidden');
        });
    }

    if (closePreviewModal && previewModal) {
        closePreviewModal.addEventListener('click', () => {
            previewModal.classList.add('hidden');
        });
    }

    fetchMerchantProfile();
});