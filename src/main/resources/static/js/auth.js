document.addEventListener("DOMContentLoaded", () => {
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');
    const forgotBox = document.getElementById('forgotBox');

    const toRegister = document.getElementById('toRegister');
    const toLogin = document.getElementById('toLogin');
    const forgotPassword = document.getElementById('forgotPassword');
    const backToLogin = document.getElementById('backToLogin');

    const loginEmail = document.getElementById('loginEmail');
    const forgotEmail = document.getElementById('forgotEmail');
    const forgotForm = document.getElementById('forgotForm');
    const loginForm = document.getElementById('loginForm');
    
    const identityRadios = document.querySelectorAll('input[name="identity"]');
    const addressField = document.getElementById('addressField');
    const regAddressInput = document.getElementById('regAddress');

    if (toRegister) {
        toRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginBox.classList.add('hidden');
            if(forgotBox) forgotBox.classList.add('hidden');
            registerBox.classList.remove('hidden');
        });
    }

    if (toLogin) {
        toLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerBox.classList.add('hidden');
            if(forgotBox) forgotBox.classList.add('hidden');
            loginBox.classList.remove('hidden');
        });
    }

    if (forgotPassword) {
        forgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginEmail && loginEmail.value && forgotEmail) {
                forgotEmail.value = loginEmail.value;
            }
            loginBox.classList.add('hidden');
            registerBox.classList.add('hidden');
            if(forgotBox) forgotBox.classList.remove('hidden');
        });
    }

    if (backToLogin) {
        backToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerBox.classList.add('hidden');
            if(forgotBox) forgotBox.classList.add('hidden');
            loginBox.classList.remove('hidden');
        });
    }

    if (identityRadios && addressField && regAddressInput) {
        identityRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'merchant') {
                    addressField.classList.remove('hidden');
                    regAddressInput.setAttribute('required', 'required');
                } else {
                    addressField.classList.add('hidden');
                    regAddressInput.removeAttribute('required');
                    regAddressInput.value = '';
                }
            });
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const selectedRole = document.querySelector('input[name="identity"]:checked').value === 'merchant' ? 'MERCHANT' : 'USER';
            const addressValue = regAddressInput ? regAddressInput.value.trim() : "";
            
            let latitude = 0.0;
            let longitude = 0.0;

            if (selectedRole === 'MERCHANT' && addressValue !== "") {
                try {
                    const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressValue)}`);
                    const geoData = await geoResponse.json();

                    if (geoData && geoData.length > 0) {
                        latitude = parseFloat(geoData[0].lat);
                        longitude = parseFloat(geoData[0].lon);
                    } else {
                        alert("提醒：免費地圖圖資較少，找不到此精確地址。系統將為您標記在小半天中心點。");
                    }
                } catch (err) {
                    console.error(err);
                }
            }

            const payload = {
                role: selectedRole,
                username: document.getElementById("regName").value,
                email: document.getElementById("regEmail").value,
                password: document.getElementById("regPassword").value,
                address: addressValue,
                latitude: latitude,
                longitude: longitude
            };

            try {
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();

                if (result.status === 200) {
                    alert("註冊成功！請重新登入。");
                    if (toLogin) toLogin.click(); 
                } else {
                    alert(result.message || "註冊失敗，請檢查資料");
                }
            } catch (err) {
                console.error(err);
                alert("網路錯誤，無法連線至伺服器");
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            const email = loginEmail ? loginEmail.value : "";
            const passwordElement = document.getElementById('loginPassword');
            const password = passwordElement ? passwordElement.value : "";

            localStorage.removeItem('jwt_token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');

            try {
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email, password: password })
                });
                
                const result = await res.json();

                if (result.status === 200) {
                    const token = result.data.token;
                    const user = result.data.user;
                    
                    localStorage.setItem("jwt_token", token);
                    localStorage.setItem("userId", user.userId);
                    const roleStr = user.role.toLowerCase();
                    localStorage.setItem("userRole", roleStr); 
                    if(user.username) localStorage.setItem("userName", user.username);
                    
                    alert("登入成功！");
                    
                    if (roleStr === "admin") {
                        window.location.href = "admin-master.html"; 
                    } else if (roleStr === "merchant") {
                        window.location.href = "shop-profile.html"; 
                    } else {
                        window.location.href = "mapping.html"; 
                    }
                } else {
                    alert(result.message || "登入失敗，請檢查帳號密碼");
                }
            } catch (err) {
                console.error(err);
                alert("網路連線失敗，請確認後端伺服器是否已啟動");
            }
        });
    }

    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const targetEmail = forgotEmail ? forgotEmail.value : "";
            
            if (!targetEmail) {
                alert("請輸入您的 Gmail 信箱！");
                return;
            }

            try {
                const res = await fetch("/api/auth/forgot-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: targetEmail })
                });
                
                const result = await res.json();

                if (result.status === 200) {
                    alert(`密碼重設鏈結已成功發送至：\n${targetEmail}\n\n請前往您的 Gmail 信箱收信確認。`);
                    
                    if (forgotBox) forgotBox.classList.add('hidden');
                    if (loginBox) loginBox.classList.remove('hidden');
                    forgotEmail.value = ""; 
                } else {
                    alert(result.message || "發送失敗，請確認信箱是否正確。");
                }
            } catch (err) {
                console.error(err);
                alert("網路連線失敗，請確認後端伺服器是否已啟動");
            }
        });
    }
});