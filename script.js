let usersDB = JSON.parse(localStorage.getItem("app_users")) || [];
let currentUser = JSON.parse(localStorage.getItem("active_user")) || null;

document.addEventListener("DOMContentLoaded", function () {
    checkInitialAuthFlow();
    setupFormEvents();
});

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

function updateUserStatusUI() {
    const greeting = document.getElementById("userGreeting");
    const adminNavBtn = document.getElementById("adminNavBtn");

    if (currentUser) {
        greeting.innerHTML = `Logged in as: <b>${currentUser.name}</b> (@${currentUser.username}) &nbsp;|&nbsp; Role: <span style="text-transform:uppercase; font-weight:700;">${currentUser.role}</span>`;
        
        if (currentUser.role === "admin") {
            adminNavBtn.classList.remove("hidden");
        } else {
            adminNavBtn.classList.add("hidden");
        }
    }
}

function setupFormEvents() {
    // 1. Registration Logic
    document.getElementById("registerForm").onsubmit = function (e) {
        e.preventDefault();
        const name = document.getElementById("regName").value.trim();
        const username = document.getElementById("regUsername").value.trim().toLowerCase();
        const studentId = document.getElementById("regStudentId").value.trim();
        const email = document.getElementById("regEmail").value.trim().toLowerCase();
        const password = document.getElementById("regPassword").value;

        // Duplicate Username or Email check
        const exists = usersDB.some(u => u.username === username || u.email === email);
        if (exists) {
            alert("Username or Email already registered!");
            return;
        }

        const newUser = { id: Date.now(), name, username, studentId, email, password, role: "student" };
        usersDB.push(newUser);
        localStorage.setItem("app_users", JSON.stringify(usersDB));

        alert("Registration Successful! Now login with your Username or Email.");
        this.reset();
        switchAuthMode('login');
    };

    // 2. Dual Login (Username OR Email)
    document.getElementById("loginForm").onsubmit = function (e) {
        e.preventDefault();
        const input = document.getElementById("loginIdentifier").value.trim().toLowerCase();
        const pwd = document.getElementById("loginPassword").value;

        // Check against either Username or Email
        const user = usersDB.find(u => (u.username === input || u.email === input) && u.password === pwd);

        if (user) {
            currentUser = user;
            localStorage.setItem("active_user", JSON.stringify(currentUser));
            checkInitialAuthFlow();
        } else {
            alert("Invalid Username/Email or Password!");
        }
    };

    // 3. Secret Admin Login Validation (Key: admin2020)
    document.getElementById("adminLoginForm").onsubmit = function (e) {
        e.preventDefault();
        const email = document.getElementById("adminEmail").value.trim().toLowerCase();
        const pwd = document.getElementById("adminPassword").value;
        const key = document.getElementById("adminKeyInput").value.trim();

        if (key !== "admin2020") {
            alert("Invalid Secret Key!");
            return;
        }

        let user = usersDB.find(u => u.email === email && u.password === pwd);

        if (user) {
            // Upgrade role to 'admin' because of correct key
            currentUser = { ...user, role: "admin" };
            localStorage.setItem("active_user", JSON.stringify(currentUser));
            checkInitialAuthFlow();
        } else {
            alert("Account not found! Please register or check Email/Password.");
        }
    };
}

function logoutUser() {
    localStorage.removeItem("active_user");
    currentUser = null;
    checkInitialAuthFlow();
}

function showHome() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
