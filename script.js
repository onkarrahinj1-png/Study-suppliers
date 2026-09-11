const ADMIN_SECRET_KEY = "admin2020";

// Syllabus Object
const bcomCaSyllabus = {
    fy: {
        title: "FY BCom CA",
        semesters: {
            sem1: {
                title: "Semester 1",
                subjects: [
                    { name: "C Programming", isPractical: true },
                    { name: "OAT (Office Automation Tools)", isPractical: true },
                    { name: "Financial Accounting", isPractical: false },
                    { name: "Business Communication", isPractical: false },
                    { name: "Principles of Management", isPractical: false }
                ]
            },
            sem2: {
                title: "Semester 2",
                subjects: [
                    { name: "TPA", isPractical: true },
                    { name: "DBMS", isPractical: true },
                    { name: "Financial Accounting II", isPractical: false },
                    { name: "Business Economics", isPractical: false },
                    { name: "Principles of Marketing", isPractical: false }
                ]
            }
        }
    },
    sy: {
        title: "SY BCom CA",
        semesters: {
            sem3: {
                title: "Semester 3",
                subjects: [
                    { name: "Data Structure (DS)", isPractical: true },
                    { name: "PHP Programming", isPractical: true },
                    { name: "Cyber Security", isPractical: false },
                    { name: "Web Development", isPractical: true },
                    { name: "Cost Accounting", isPractical: false }
                ]
            },
            sem4: {
                title: "Semester 4",
                subjects: [
                    { name: "SY Project", isPractical: true },
                    { name: "Advanced Web Tech", isPractical: true },
                    { name: "Corporate Accounting", isPractical: false },
                    { name: "Computer Networks", isPractical: false },
                    { name: "MIS", isPractical: false }
                ]
            }
        }
    },
    ty: {
        title: "TY BCom CA",
        semesters: {
            sem5: {
                title: "Semester 5",
                subjects: [
                    { name: "Java Programming", isPractical: true },
                    { name: "Python Programming", isPractical: true },
                    { name: "SE (Software Engineering)", isPractical: true },
                    { name: "Cyber Law", isPractical: false },
                    { name: "E-Commerce", isPractical: false }
                ]
            },
            sem6: {
                title: "Semester 6",
                subjects: [
                    { name: "Cloud Computing", isPractical: true },
                    { name: "Main Project", isPractical: true },
                    { name: "Software Testing", isPractical: false },
                    { name: "Digital Marketing", isPractical: false },
                    { name: "Entrepreneurship", isPractical: false }
                ]
            }
        }
    }
};

// Storage Utilities
function getLocalData(key) {
    return JSON.parse(localStorage.getItem(key) || "[]");
}

function setLocalData(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
}

let currentUser = JSON.parse(localStorage.getItem("active_user") || "null");
let currentSelectedYear = "";
let currentSelectedSem = "";
let currentSelectedSubject = "";

document.addEventListener("DOMContentLoaded", function () {
    checkInitialAuthFlow();
    setupAuthAndFormEvents();
    renderHistoryList();
    updateDownloadBadgeCount();
});

function checkInitialAuthFlow() {
    const landingOverlay = document.getElementById("landingAuthOverlay");
    const portalContent = document.getElementById("portalMainContent");

    if (currentUser) {
        landingOverlay.classList.add("hidden");
        portalContent.classList.remove("hidden");
        updateUserStatusUI();
    } else {
        portalContent.classList.add("hidden");
        landingOverlay.classList.remove("hidden");

        const registeredUsers = getLocalData("app_users");
        if (registeredUsers.length > 0) {
            switchAuthMode('login');
        } else {
            switchAuthMode('register');
        }
    }
}

function switchAuthMode(mode) {
    document.getElementById("tabRegisterBtn").classList.toggle("active", mode === 'register');
    document.getElementById("tabLoginBtn").classList.toggle("active", mode === 'login');
    document.getElementById("tabForgotBtn").classList.toggle("active", mode === 'forgot');

    document.getElementById("registerForm").classList.toggle("hidden", mode !== 'register');
    document.getElementById("loginForm").classList.toggle("hidden", mode !== 'login');
    document.getElementById("forgotForm").classList.toggle("hidden", mode !== 'forgot');
}

function toggleAdminKeyInput() {
    const role = document.getElementById("regRole").value;
    const keyWrapper = document.getElementById("adminKeyWrapper");
    if (role === "admin") {
        keyWrapper.classList.remove("hidden");
    } else {
        keyWrapper.classList.add("hidden");
    }
}

function updateUserStatusUI() {
    const greeting = document.getElementById("userGreeting");
    const adminNavBtn = document.getElementById("adminNavBtn");

    if (currentUser) {
        greeting.textContent = `Logged in: ${currentUser.name} (${currentUser.role.toUpperCase()})`;
        if (currentUser.role === "admin") {
            adminNavBtn.classList.remove("hidden");
        } else {
            adminNavBtn.classList.add("hidden");
        }
    }
}

function setupAuthAndFormEvents() {
    // 1. Registration Event
    document.getElementById("registerForm").onsubmit = function (e) {
        e.preventDefault();
        const name = document.getElementById("regName").value;
        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;
        const role = document.getElementById("regRole").value;

        if (role === "admin") {
            const enteredKey = document.getElementById("adminSecretKey").value;
            if (enteredKey !== ADMIN_SECRET_KEY) {
                alert("Incorrect Admin Key! Access Denied.");
                return;
            }
        }

        const users = getLocalData("app_users");
        if (users.some(u => u.email === email)) {
            alert("Email already registered! Switching to Login page.");
            switchAuthMode('login');
            return;
        }

        const newUser = { name, email, password, role };
        users.push(newUser);
        setLocalData("app_users", users);

        currentUser = newUser;
        localStorage.setItem("active_user", JSON.stringify(currentUser));
        alert("Registration Successful!");
        checkInitialAuthFlow();
    };

    // 2. Login Event
    document.getElementById("loginForm").onsubmit = function (e) {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const users = getLocalData("app_users");
        const found = users.find(u => u.email === email && u.password === password);

        if (found) {
            currentUser = found;
            localStorage.setItem("active_user", JSON.stringify(currentUser));
            alert("Login Successful!");
            checkInitialAuthFlow();
        } else {
            alert("Invalid Email or Password!");
        }
    };

    // 3. Forgot Password Event
    document.getElementById("forgotForm").onsubmit = function (e) {
        e.preventDefault();
        const email = document.getElementById("forgotEmail").value;
        alert("Password reset instructions sent to: " + email);
        switchAuthMode('login');
    };

    // Form Submissions
    document.getElementById("userShareForm").onsubmit = function (e) {
        e.preventDefault();
        handleSaveMaterial("userMatYear", "userMatSem", "userMatSubject", "userMatCategory", "userMatTitle", "userMatUrl");
        document.getElementById("userShareForm").reset();
    };

    document.getElementById("addMaterialForm").onsubmit = function (e) {
        e.preventDefault();
        handleSaveMaterial("adminMatYear", "adminMatSem", "adminMatSubject", "adminMatCategory", "adminMatTitle", "adminMatUrl");
        document.getElementById("addMaterialForm").reset();
        renderAdminMaterialsList();
    };

    document.getElementById("clearHistoryBtn").onclick = function() {
        setLocalData("activity_logs", []);
        renderHistoryList();
    };
}

function logoutUser() {
    localStorage.removeItem("active_user");
    currentUser = null;
    checkInitialAuthFlow();
}

// Dropdown Dynamic Logic
function populateFormSemesters(yId, sId, subjId) {
    const yVal = document.getElementById(yId).value;
    const semSelect = document.getElementById(sId);
    document.getElementById(subjId).innerHTML = '<option value="">3. Select Subject</option>';

    semSelect.innerHTML = '<option value="">2. Select Semester</option>';
    if (!yVal || !bcomCaSyllabus[yVal]) return;

    Object.keys(bcomCaSyllabus[yVal].semesters).forEach(sKey => {
        const opt = document.createElement("option");
        opt.value = sKey;
        opt.textContent = bcomCaSyllabus[yVal].semesters[sKey].title;
        semSelect.appendChild(opt);
    });
}

function populateFormSubjects(yId, sId, subjId) {
    const yVal = document.getElementById(yId).value;
    const sVal = document.getElementById(sId).value;
    const subjSelect = document.getElementById(subjId);

    subjSelect.innerHTML = '<option value="">3. Select Subject</option>';
    if (!yVal || !sVal || !bcomCaSyllabus[yVal].semesters[sVal]) return;

    bcomCaSyllabus[yVal].semesters[sVal].subjects.forEach(subj => {
        const opt = document.createElement("option");
        opt.value = subj.name;
        opt.textContent = subj.name + (subj.isPractical ? " [Practical]" : "");
        subjSelect.appendChild(opt);
    });
}

function populateCategories(yId, sId, subjId, catId) {
    const yVal = document.getElementById(yId).value;
    const sVal = document.getElementById(sId).value;
    const subjVal = document.getElementById(subjId).value;
    const catSelect = document.getElementById(catId);

    catSelect.innerHTML = '<option value="">4. Select Category</option>';
    if (!yVal || !sVal || !subjVal) return;

    const subjObj = bcomCaSyllabus[yVal].semesters[sVal].subjects.find(s => s.name === subjVal);

    catSelect.appendChild(new Option("Textbooks / Notes", "Textbooks & Notes"));
    catSelect.appendChild(new Option("Question Papers", "Question Papers"));
    catSelect.appendChild(new Option("Reference PDFs", "Reference PDFs"));

    if (subjObj && subjObj.isPractical) {
        catSelect.appendChild(new Option("Practical Files", "Practical Files"));
    }
}

function handleSaveMaterial(yId, sId, subjId, catId, titleId, urlId) {
    const year = document.getElementById(yId).value;
    const sem = document.getElementById(sId).value;
    const subject = document.getElementById(subjId).value;
    const category = document.getElementById(catId).value;
    const title = document.getElementById(titleId).value.trim();
    const url = document.getElementById(urlId).value.trim();

    let mats = getLocalData("materials_data");
    mats.unshift({ id: Date.now().toString(), year, sem, subject, category, title, url });
    setLocalData("materials_data", mats);

    alert("PDF Uploaded Successfully!");
    addActivityLog(`Shared PDF: ${title} (${subject})`);
}

// Interface Navigation
function showHome() {
    hideAllViews();
    document.getElementById("courseSelectionView").classList.remove("hidden");
}

function openYear(yearKey) {
    currentSelectedYear = yearKey;
    hideAllViews();
    document.getElementById("semesterSelectionView").classList.remove("hidden");
    const yearData = bcomCaSyllabus[yearKey];
    document.getElementById("selectedYearTitle").textContent = `${yearData.title} - Select Semester`;

    const grid = document.getElementById("semesterGrid");
    grid.innerHTML = "";
    Object.keys(yearData.semesters).forEach(sKey => {
        const sem = yearData.semesters[sKey];
        const card = document.createElement("div");
        card.className = "course-card";
        card.onclick = function() { openSemester(yearKey, sKey); };
        card.innerHTML = `<i class="fa-solid fa-book-bookmark course-icon"></i><h3>${sem.title}</h3><p>${sem.subjects.length} Subjects Included</p><button class="explore-btn">Open Semester</button>`;
        grid.appendChild(card);
    });
}

function backToSemesters() {
    if (currentSelectedYear) openYear(currentSelectedYear);
    else showHome();
}

function openSemester(yearKey, semKey) {
    currentSelectedYear = yearKey;
    currentSelectedSem = semKey;
    hideAllViews();
    document.getElementById("subjectSelectionView").classList.remove("hidden");

    const semData = bcomCaSyllabus[yearKey].semesters[semKey];
    document.getElementById("selectedSemTitle").textContent = `${semData.title} - Select Subject`;

    const grid = document.getElementById("subjectGrid");
    grid.innerHTML = "";
    semData.subjects.forEach(subj => {
        const card = document.createElement("div");
        card.className = "subject-card";
        card.onclick = function() { openSubjectMaterials(yearKey, semKey, subj.name); };
        card.innerHTML = `<i class="fa-solid ${subj.isPractical ? 'fa-laptop-code' : 'fa-book'} subject-icon"></i><h3>${subj.name}</h3><p>${subj.isPractical ? 'Theory & Practical' : 'Theory Subject'}</p><button class="explore-btn">View PDFs</button>`;
        grid.appendChild(card);
    });
}

function backToSubjects() {
    if (currentSelectedYear && currentSelectedSem) openSemester(currentSelectedYear, currentSelectedSem);
    else showHome();
}

function openSubjectMaterials(yearKey, semKey, subjectName) {
    currentSelectedYear = yearKey;
    currentSelectedSem = semKey;
    currentSelectedSubject = subjectName;

    hideAllViews();
    document.getElementById("materialsDetailView").classList.remove("hidden");
    document.getElementById("selectedSubjectTitle").textContent = `${subjectName} - Study Materials`;

    renderSubjectMaterials(yearKey, semKey, subjectName);
}

function processPdfUrls(rawUrl) {
    let previewUrl = rawUrl;
    let downloadUrl = rawUrl;
    if (rawUrl.includes("drive.google.com")) {
        const match = rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/id=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            previewUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
            downloadUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
    }
    return { previewUrl, downloadUrl };
}

function renderSubjectMaterials(yearKey, semKey, subjectName) {
    const grid = document.getElementById("materialsGrid");
    grid.innerHTML = "";

    const allMaterials = getLocalData("materials_data");
    const filtered = allMaterials.filter(m => m.year === yearKey && m.sem === semKey && m.subject === subjectName);

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="text-align:center; padding:30px;"><b>No PDFs uploaded for ${subjectName} yet.</b></div>`;
        return;
    }

    filtered.forEach(item => {
        const { previewUrl, downloadUrl } = processPdfUrls(item.url);
        const card = document.createElement("div");
        card.className = "pdf-item-card";
        card.innerHTML = `
            <div class="pdf-item-header">
                <div><i class="fa-solid fa-file-pdf" style="color:#e11d48;"></i> <b>${item.title}</b> (${item.category})</div>
                <div class="pdf-action-btns">
                    <a href="${previewUrl}" target="_blank" class="action-btn btn-open" onclick="trackAndSaveDownload('${item.title}', '${item.url}', 'view')">View</a>
                    <a href="${downloadUrl}" target="_blank" class="action-btn btn-download" onclick="trackAndSaveDownload('${item.title}', '${item.url}', 'download')">Download</a>
                </div>
            </div>
            <iframe src="${previewUrl}" width="100%" height="300" style="margin-top:10px; border-radius:6px; border:1px solid #cbd5e1;"></iframe>
        `;
        grid.appendChild(card);
    });
}

function trackAndSaveDownload(title, url, action) {
    let downloads = getLocalData("user_saved_downloads");
    if (!downloads.some(d => d.pdfTitle === title)) {
        downloads.push({ pdfTitle: title, pdfUrl: url });
        setLocalData("user_saved_downloads", downloads);
    }
    addActivityLog(`${action === 'download' ? 'Downloaded' : 'Viewed'} ${title}`);
    updateDownloadBadgeCount();
}

function updateDownloadBadgeCount() {
    const badge = document.getElementById("dlNavBadge");
    if (badge) badge.textContent = getLocalData("user_saved_downloads").length;
}

function openUserDownloads() {
    hideAllViews();
    document.getElementById("userDownloadsView").classList.remove("hidden");
    const grid = document.getElementById("userDownloadsGrid");
    grid.innerHTML = "";
    const downloads = getLocalData("user_saved_downloads");

    if (downloads.length === 0) {
        grid.innerHTML = `<div style="text-align:center; padding:30px;">No saved PDFs yet.</div>`;
        return;
    }

    downloads.forEach(item => {
        const { previewUrl, downloadUrl } = processPdfUrls(item.pdfUrl);
        const card = document.createElement("div");
        card.className = "pdf-item-card";
        card.innerHTML = `
            <div class="pdf-item-header">
                <div><b>${item.pdfTitle}</b></div>
                <div class="pdf-action-btns">
                    <a href="${previewUrl}" target="_blank" class="action-btn btn-open">View</a>
                    <a href="${downloadUrl}" target="_blank" class="action-btn btn-download">Download</a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function openUserUploadPanel() {
    hideAllViews();
    document.getElementById("userUploadView").classList.remove("hidden");
}

function openAdminPanel() {
    hideAllViews();
    document.getElementById("adminPanelView").classList.remove("hidden");
    renderAdminMaterialsList();
}

function hideAllViews() {
    ["courseSelectionView", "semesterSelectionView", "subjectSelectionView", "materialsDetailView", "userUploadView", "userDownloadsView", "adminPanelView"]
    .forEach(id => document.getElementById(id)?.classList.add("hidden"));
}

function renderAdminMaterialsList() {
    const list = document.getElementById("adminMaterialList");
    const mats = getLocalData("materials_data");
    list.innerHTML = mats.length === 0 ? "<li>No materials found.</li>" : "";

    mats.forEach(m => {
        const li = document.createElement("li");
        li.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #e2e8f0;";
        li.innerHTML = `<span><b>[${m.subject}]</b> ${m.title}</span><button onclick="deleteMaterial('${m.id}')" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Delete</button>`;
        list.appendChild(li);
    });
}

function deleteMaterial(id) {
    let mats = getLocalData("materials_data").filter(m => m.id !== id);
    setLocalData("materials_data", mats);
    renderAdminMaterialsList();
}

function addActivityLog(text) {
    let logs = getLocalData("activity_logs");
    logs.unshift({ text, date: new Date().toLocaleTimeString() });
    setLocalData("activity_logs", logs);
    renderHistoryList();
}

function renderHistoryList() {
    const historyList = document.getElementById("historyList");
    const logs = getLocalData("activity_logs");
    document.getElementById("downloadCount").textContent = logs.length;
    historyList.innerHTML = logs.length === 0 ? `<li class="empty-msg">No activity yet.</li>` : "";
    logs.forEach(l => {
        historyList.innerHTML += `<li style="padding:4px 0; border-bottom:1px solid #f1f5f9;"><i class="fa-solid fa-angle-right"></i> ${l.text}</li>`;
    });
}
