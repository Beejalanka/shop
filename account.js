
// =======================================
// BEEJA.LK ACCOUNT SYSTEM
// =======================================

// Demo front-end account storage
const USERS_KEY = "beejaUsers";
const CURRENT_USER_KEY = "beejaCurrentUser";


// HTML ELEMENTS

const authBox = document.getElementById("authBox");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const formTitle = document.getElementById("formTitle");
const formDescription = document.getElementById("formDescription");

const authMessage = document.getElementById("authMessage");


// GET USERS

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}


// SAVE USERS

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}


// GET CURRENT USER

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}


// SHOW MESSAGE

function showMessage(message, color = "#d93025") {
    authMessage.textContent = message;
    authMessage.style.color = color;
}


// SWITCH TO REGISTER

document.getElementById("showRegister").addEventListener("click", function(e) {

    e.preventDefault();

    loginForm.hidden = true;
    registerForm.hidden = false;

    formTitle.textContent = "Create Account";
    formDescription.textContent = "Join Beeja.LK today";

    showMessage("");

});


// SWITCH TO LOGIN

document.getElementById("showLogin").addEventListener("click", function(e) {

    e.preventDefault();

    registerForm.hidden = true;
    loginForm.hidden = false;

    formTitle.textContent = "Welcome Back!";
    formDescription.textContent = "Login to your Beeja.LK account";

    showMessage("");

});


// =======================================
// CUSTOMER REGISTRATION
// =======================================

registerForm.addEventListener("submit", function(e) {

    e.preventDefault();

    const name = document.getElementById("registerName").value.trim();

    const email = document.getElementById("registerEmail").value.trim().toLowerCase();

    const phone = document.getElementById("registerPhone").value.trim();

    const password = document.getElementById("registerPassword").value;

    if (!name || !email || !phone || !password) {
        showMessage("Please fill all fields.");
        return;
    }

    if (password.length < 8) {
        showMessage("Password must contain at least 8 characters.");
        return;
    }

    let users = getUsers();

    // CHECK EXISTING EMAIL

    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        showMessage("This email is already registered.");
        return;
    }

    // CREATE NEW USER

    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password
    };

    users.push(newUser);

    saveUsers(users);

    // LOGIN AFTER REGISTRATION

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        id: newUser.id
    }));

    registerForm.reset();

    showDashboard();

});


// =======================================
// CUSTOMER LOGIN
// =======================================

loginForm.addEventListener("submit", function(e) {

    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();

    const password = document.getElementById("loginPassword").value;

    const users = getUsers();

    // FIND USER

    const user = users.find(function(item) {

        return item.email === email &&
               item.password === password;

    });

    if (!user) {

        showMessage("Invalid email or password.");

        return;

    }

    // SAVE LOGIN SESSION

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        id: user.id
    }));

    loginForm.reset();

    showDashboard();

});


// =======================================
// SHOW CUSTOMER DASHBOARD
// =======================================

function showDashboard() {

    const currentUser = getCurrentUser();

    if (!currentUser) {
        showLoginPage();
        return;
    }

    const user = getUsers().find(item => item.id === currentUser.id);

    if (!user) {
        localStorage.removeItem(CURRENT_USER_KEY);
        showLoginPage();
        return;
    }

    authBox.hidden = true;
    dashboard.hidden = false;

    document.getElementById("customerName").textContent = user.name;

    document.getElementById("profileName").textContent = user.name;

    document.getElementById("profileEmail").textContent = user.email;

    document.getElementById("profilePhone").textContent = user.phone;

}


// =======================================
// LOGOUT
// =======================================

document.getElementById("logoutBtn").addEventListener("click", function() {

    localStorage.removeItem(CURRENT_USER_KEY);

    showLoginPage();

});


// =======================================
// SHOW LOGIN PAGE
// =======================================

function showLoginPage() {

    dashboard.hidden = true;
    authBox.hidden = false;

    registerForm.hidden = true;
    loginForm.hidden = false;

    loginForm.reset();

    formTitle.textContent = "Welcome Back!";
    formDescription.textContent = "Login to your Beeja.LK account";

    showMessage("");

}


// =======================================
// EDIT PROFILE
// =======================================

document.getElementById("editProfileBtn").addEventListener("click", function() {

    const currentUser = getCurrentUser();

    const user = getUsers().find(item => item.id === currentUser.id);

    if (!user) return;

    document.getElementById("editName").value = user.name;

    document.getElementById("editPhone").value = user.phone;

    document.getElementById("editProfile").hidden = false;

    document.getElementById("editProfile").scrollIntoView({
        behavior: "smooth"
    });

});


// SAVE PROFILE CHANGES

document.getElementById("editForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const currentUser = getCurrentUser();

    if (!currentUser) return;

    let users = getUsers();

    const user = users.find(item => item.id === currentUser.id);

    if (!user) return;

    user.name = document.getElementById("editName").value.trim();

    user.phone = document.getElementById("editPhone").value.trim();

    saveUsers(users);

    document.getElementById("editProfile").hidden = true;

    showDashboard();

    alert("Profile updated successfully!");

});


// CANCEL EDIT

document.getElementById("cancelEdit").addEventListener("click", function() {

    document.getElementById("editProfile").hidden = true;

});


// =======================================
// CHECK LOGIN WHEN PAGE LOADS
// =======================================

document.addEventListener("DOMContentLoaded", function() {

    showDashboard();

});
