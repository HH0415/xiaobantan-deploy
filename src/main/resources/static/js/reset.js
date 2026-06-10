document.addEventListener("DOMContentLoaded", () => {
    const resetForm = document.getElementById("resetForm");
    
    if (resetForm) {
        resetForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const newPassword = document.getElementById("newPassword").value;
            
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');

            if (!token) {
                alert("無效的重設連結，請重新申請忘記密碼。");
                window.location.href = "auth.html";
                return;
            }

            try {
                const res = await fetch("/api/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        token: token, 
                        newPassword: newPassword 
                    })
                });

                const result = await res.json();

                if (result.status === 200) {
                    alert("密碼重設成功！請使用新密碼重新登入。");
                    window.location.href = "auth.html"; 
                } else {
                    alert("重設失敗：" + result.message);
                }
            } catch (err) {
                console.error("重設密碼 API 錯誤:", err);
                alert("網路連線失敗，請確認伺服器狀態。");
            }
        });
    }
});