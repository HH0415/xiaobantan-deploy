document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('jwt_token');
    const userRole = localStorage.getItem('userRole');
    
    if (userRole !== 'admin') {
        window.location.href = "index.html";
        return;
    }

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const editModal = document.getElementById('editUserModal');
    const editForm = document.getElementById('editUserForm');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    const pendingBody = document.getElementById('pendingTableBody');
    const allUsersBody = document.getElementById('allUsersTableBody');
    const pendingCountBadge = document.getElementById('pendingCount');
    let allUsersData = [];

    async function fetchUsers() {
        try {
            const res = await fetch("/api/admin/users", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const result = await res.json();
            
            if (result.status === 200) {
                allUsersData = result.data;
                renderPendingMerchants();
                renderAllUsers(document.getElementById('roleFilter').value, document.getElementById('searchUser').value.toLowerCase().trim());
            } else {
                pendingBody.innerHTML = '<tr><td colspan="5" class="text-center text-red-500 py-4">連線失敗</td></tr>';
            }
        } catch (error) {
            pendingBody.innerHTML = '<tr><td colspan="5" class="text-center text-red-500 py-4">連線失敗</td></tr>';
        }
    }

    function renderPendingMerchants() {
        const pendingMerchants = allUsersData.filter(u => {
            const r = (u.role || '').toLowerCase();
            const s = (u.status || '').toLowerCase();
            return r.includes('merchant') && s === 'pending';
        });
        
        pendingCountBadge.innerText = pendingMerchants.length;
        pendingBody.innerHTML = '';
        
        if (pendingMerchants.length === 0) {
            pendingBody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500 py-8">目前沒有待審核的商家申請</td></tr>';
            return;
        }

        pendingMerchants.forEach(m => {
            const dateStr = m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '最近申請';
            const row = `
                <tr>
                    <td class="text-gray-500">${dateStr}</td>
                    <td class="font-bold">${m.username || '未命名'}</td>
                    <td>${m.email || ''}</td>
                    <td><span class="status-badge status-pending">等待審核</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-approve" onclick="reviewMerchant(${m.userId}, 'approve')">核准</button>
                            <button class="btn-action btn-reject" onclick="reviewMerchant(${m.userId}, 'reject')">駁回</button>
                        </div>
                    </td>
                </tr>
            `;
            pendingBody.insertAdjacentHTML('beforeend', row);
        });
    }

    function renderAllUsers(filterRole = 'all', searchQuery = '') {
        allUsersBody.innerHTML = '';
        
        const filteredUsers = allUsersData.filter(u => {
            const r = (u.role || '').toLowerCase();
            let normalizedRole = 'tourist';
            if (r.includes('merchant')) normalizedRole = 'merchant';
            else if (r.includes('admin')) normalizedRole = 'admin';

            if (normalizedRole === 'admin') return false;

            const matchRole = filterRole === 'all' || normalizedRole === filterRole;
            const matchSearch = (u.username || '').toLowerCase().includes(searchQuery) || (u.email || '').toLowerCase().includes(searchQuery);
            return matchRole && matchSearch;
        });

        if (filteredUsers.length === 0) {
            allUsersBody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500 py-8">找不到符合條件的使用者</td></tr>';
            return;
        }

        filteredUsers.forEach(u => {
            const r = (u.role || '').toLowerCase();
            let roleStr = '遊客';
            
            if (r.includes('merchant')) {
                roleStr = '商家';
            }
            
            let statusBadge = '';
            let actionBtns = '';
            
            const s = (u.status || 'active').toLowerCase();

            const editBtn = `<button class="btn-action btn-edit" onclick="openUserEditModal(${u.userId})">修改</button>`;

            if (s === 'active' || s === 'normal') {
                statusBadge = '<span class="status-badge status-active">正常啟用</span>';
                actionBtns = editBtn + `<button class="btn-action btn-reject" onclick="toggleUserStatus(${u.userId}, 'banned', '${u.username || ''}')">停權</button>`;
            } else if (s === 'banned') {
                statusBadge = '<span class="status-badge status-banned">已停權</span>';
                actionBtns = editBtn + `<button class="btn-action btn-approve" onclick="toggleUserStatus(${u.userId}, 'active', '${u.username || ''}')">恢復權限</button>`;
            } else if (s === 'pending') {
                statusBadge = '<span class="status-badge status-pending">審核中</span>';
                actionBtns = editBtn + `<button class="btn-action btn-approve" onclick="reviewMerchant(${u.userId}, 'approve')">核准</button>`;
            } else {
                statusBadge = '<span class="status-badge status-active">正常啟用</span>';
                actionBtns = editBtn + `<button class="btn-action btn-reject" onclick="toggleUserStatus(${u.userId}, 'banned', '${u.username || ''}')">停權</button>`;
            }

            const row = `
                <tr>
                    <td class="text-gray-500">${u.userId}</td>
                    <td class="font-bold">${u.username || '未命名'}</td>
                    <td>${u.email || ''}</td>
                    <td>${roleStr}</td>
                    <td>${statusBadge}</td>
                    <td><div class="action-buttons">${actionBtns}</div></td>
                </tr>
            `;
            allUsersBody.insertAdjacentHTML('beforeend', row);
        });
    }

    document.getElementById('searchUser').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const role = document.getElementById('roleFilter').value;
        renderAllUsers(role, query);
    });

    document.getElementById('roleFilter').addEventListener('change', (e) => {
        const role = e.target.value;
        const query = document.getElementById('searchUser').value.toLowerCase().trim();
        renderAllUsers(role, query);
    });

    window.reviewMerchant = async function(userId, action) {
        const actionStr = action === 'approve' ? '核准' : '駁回';
        if (!confirm(`確定要${actionStr}該商家的申請嗎？`)) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}/review`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ action: action })
            });
            
            const result = await res.json();
            
            if (res.ok && result.status === 200) {
                alert(`已成功${actionStr}該商家！`);
                fetchUsers(); 
            } else {
                alert(`操作失敗：${result.message || '後端未成功更新資料'}`);
            }
        } catch (error) {
            alert("操作失敗，請確認伺服器連線狀態。");
        }
    }

    window.toggleUserStatus = async function(userId, newStatus, username) {
        const actionStr = newStatus === 'banned' ? '停權' : '恢復';
        if (!confirm(`確定要將使用者「${username}」設為「${actionStr}」嗎？`)) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}/status`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ status: newStatus }) 
            });
            
            const result = await res.json();
            
            if (res.ok && result.status === 200) {
                alert(`已成功${actionStr}帳號！`);
                fetchUsers();
            } else {
                alert(`操作失敗：${result.message || '後端未成功更新資料'}`);
            }
        } catch (error) {
            alert("操作失敗，請確認伺服器連線狀態。");
        }
    }

    window.openUserEditModal = function(userId) {
        const user = allUsersData.find(u => u.userId === userId);
        if (!user) return;

        document.getElementById('editUserId').value = user.userId;
        document.getElementById('editUserName').value = user.username || '';
        document.getElementById('editUserEmail').value = user.email || '';
        
        let normalizedRole = 'tourist';
        const r = (user.role || '').toLowerCase();
        if (r.includes('merchant')) normalizedRole = 'merchant';
        document.getElementById('editUserRole').value = normalizedRole;

        editModal.style.display = 'flex';
    };

    window.closeUserEditModal = function() {
        editModal.style.display = 'none';
        editForm.reset();
    };

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editUserId').value;
        const payload = {
            username: document.getElementById('editUserName').value.trim(),
            email: document.getElementById('editUserEmail').value.trim(),
            role: document.getElementById('editUserRole').value
        };

        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (res.ok && result.status === 200) {
                closeUserEditModal();
                fetchUsers();
            } else {
                alert(`修改失敗：${result.message || '後端未成功更新資料'}`);
            }
        } catch (error) {
            alert("連線錯誤，請確認伺服器連線狀態。");
        }
    });

    fetchUsers();
});