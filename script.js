// LocalStorage based DB Management
let usersDB = JSON.parse(localStorage.getItem("app_users")) || [];
let materialsDB = JSON.parse(localStorage.getItem("app_materials")) || [
    { id: 1, title: "DBMS Unit 1 Notes.pdf" },
    { id: 2, title: "Java Programming Question Bank.pdf" }
];
let currentUser = JSON.parse(localStorage.getItem("active_user")) || null;

document.addEventListener("DOMContentLoaded", function () {
    checkInitialAuthFlow();
    setupFormEvents();
});

// Auth state handling
function checkInitialAuthFlow() {
    const authOverlay = document.getElementById("authOverlay");
    const portalContent = document.getElementById("portalMainContent");

    if (currentUser) {
        authOverlay.classList.add("hidden");
        portalContent.classList.remove("hidden");
        updateUserStatusUI();
    } else {
        portalContent.classList.add("hidden");
        authOverlay.classList.remove("hidden");
    }
}

function switchAuthMode(mode) {
    document.getElementById("mainAuthTabs").classList.remove("hidden");
    document.getElementById("adminLoginForm").classList.add("hidden");

    if (mode === 'register') {
        document.getElementById("tabRegisterBtn").classList.add("active");
        document.getElementById("tabLoginBtn").classList.remove("active");
        document.getElementById("registerForm").classList.remove("hidden");
        document.getElementById("loginForm").classList.add("hidden");
    } else {
        document.getElementById("tabLoginBtn").classList.add("active");
        document.getElementById("tabRegisterBtn").classList.remove("active");
        document.getElementById("loginForm").classList.remove("hidden");
        document.getElementById("registerForm").classList.add("hidden");
    }
}

function openAdminModal(e) {
    if (e) e.preventDefault();
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("mainAuthTabs").classList.add("hidden");
    document.getElementById("adminLoginForm").classList.remove("hidden");
}

function closeAdminModal(e) {
    if (e) e.preventDefault();
    switchAuthMode('login');
}

// Upper Header and Status Fix
function updateUserStatusUI() {
    const greeting = document.getElementById("userGreeting");
    const adminNavBtn = document.getElementById("adminNavBtn");

    if (currentUser) {
        greeting.innerHTML = `Welcome <b>${currentUser.name}</b> (@${currentUser.username}) &nbsp;|&nbsp; Role: <span style="text-transform:uppercase; color:#0284c7;">${currentUser.role}</span>`;
        
        if (currentUser.role === "admin") {
            adminNavBtn.classList.remove("hidden");
        } else {
            adminNavBtn.classList.add("hidden");
        }
    }
}

// Registration, Username/Email Login & Secret Key Validation
function setupFormEvents() {
    // 1. User Registration
    document.getElementById("registerForm").onsubmit = function (e) {
        e.preventDefault();
        const name = document.getElementById("regName").value.trim();
        const username = document.getElementById("regUsername").value.trim().toLowerCase();
        const studentId = document.getElementById("regStudentId").value.trim();
        const email = document.getElementById("regEmail").value.trim().toLowerCase();
        const password = document.getElementById("regPassword").value;

        // Check Duplicate User
        const exists = usersDB.some(u => u.username === username || u.email === email);
        if (exists) {
            alert("Username or Email already exists!");
            return;
        }

        const newUser = { id: Date.now(), name, username, studentId, email, password, role: "student" };
        usersDB.push(newUser);
        localStorage.setItem("app_users", JSON.stringify(usersDB));

        alert("Registration Successful! Now you can Login.");
        this.reset();
        switchAuthMode('login');
    };

    // 2. User Login (Supports Username OR Email)
    document.getElementById("loginForm").onsubmit = function (e) {
        e.preventDefault();
        const input = document.getElementById("loginIdentifier").value.trim().toLowerCase();
        const pwd = document.getElementById("loginPassword").value;

        // Match against both Username or Email
        const user = usersDB.find(u => (u.username === input || u.email === input) && u.password === pwd);

        if (user) {
            currentUser = user;
            localStorage.setItem("active_user", JSON.stringify(currentUser));
            checkInitialAuthFlow();
        } else {
            alert("Invalid Username/Email or Password!");
        }
    };

    // 3. Secret Key Admin Login Validation
    document.getElementById("adminLoginForm").onsubmit = function (e) {
        e.preventDefault();
        const email = document.getElementById("adminEmail").value.trim().toLowerCase();
        const pwd = document.getElementById("adminPassword").value;
        const key = document.getElementById("adminKeyInput").value.trim();

        if (key !== "admin2020") {
            alert("Invalid Secret Admin Key!");
            return;
        }

        // Validate Account credentials
        let user = usersDB.find(u => u.email === email && u.password === pwd);

        if (user) {
            // Give Admin role session access even if registered as student
            currentUser = { ...user, role: "admin" };
            localStorage.setItem("active_user", JSON.stringify(currentUser));
            checkInitialAuthFlow();
        } else {
            alert("No user found with these Email & Password details!");
        }
    };
}

function logoutUser() {
    localStorage.removeItem("active_user");
    currentUser = null;
    checkInitialAuthFlow();
}

// Admin Panel View and Deletions
function openAdminPanel() {
    hideAllViews();
    document.getElementById("adminPanelView").classList.remove("hidden");
    renderUsersList();
    renderMaterialsList();
}

function renderUsersList() {
    const tbody = document.getElementById("registeredUsersBody");
    tbody.innerHTML = "";

    if (usersDB.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No Users Registered Yet</td></tr>`;
        return;
    }

    usersDB.forEach(user => {
        tbody.innerHTML += `
            <tr>
                <td>${user.name}</td>
                <td>@${user.username}</td>
                <td>${user.studentId}</td>
                <td>${user.email}</td>
                <td>
                    <button onclick="deleteUser(${user.id})" style="background:#e11d48; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Delete</button>
                </td>
            </tr>
        `;
    });
}

function deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user registration?")) {
        usersDB = usersDB.filter(u => u.id !== userId);
        localStorage.setItem("app_users", JSON.stringify(usersDB));
        renderUsersList();
    }
}

function renderMaterialsList() {
    const list = document.getElementById("adminMaterialList");
    list.innerHTML = "";

    materialsDB.forEach(mat => {
        list.innerHTML += `
            <li style="display:flex; justify-content:space-between; margin-top:8px; background:#f1f5f9; padding:8px; border-radius:4px;">
                <span>${mat.title}</span>
                <button onclick="deleteMaterial(${mat.id})" style="background:#e11d48; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Delete File</button>
            </li>
        `;
    });
}

function deleteMaterial(matId) {
    if (confirm("Are you sure you want to delete this file?")) {
        materialsDB = materialsDB.filter(m => m.id !== matId);
        localStorage.setItem("app_materials", JSON.stringify(materialsDB));
        renderMaterialsList();
    }
}

function hideAllViews() {
    document.getElementById("courseSelectionView").classList.add("hidden");
    document.getElementById("adminPanelView").classList.add("hidden");
}

function showHome() {
    hideAllViews();
    document.getElementById("courseSelectionView").classList.remove("hidden");
}
