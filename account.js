
// =======================================
// BEEJA.LK ACCOUNT SYSTEM
// =======================================



// =======================================
// GOOGLE SHEETS CONNECTION
// =======================================

const GOOGLE_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbz6qf-zbJnKgY6Xk7QlRsIlR8a8CO5LDAq1ix5Gw9D7I7yZWkZlH03-0XUYyvqOuS22/exec";


// SEND DATA TO GOOGLE SHEETS

function sendToGoogleSheets(data) {

    const formData = new URLSearchParams();

    Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
    });

    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData
    })
    .catch(error => {
        console.error("Google Sheets error:", error);
    });

}




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

    
// SAVE CUSTOMER REGISTRATION TO GOOGLE SHEETS

sendToGoogleSheets({
    action: "register",
    name: name,
    email: email,
    phone: phone
});


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

    
// SAVE SUCCESSFUL LOGIN TO GOOGLE SHEETS

sendToGoogleSheets({
    action: "login",
    email: user.email
});


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
// BEEJA.LK EMAIL OTP PASSWORD RESET
// =======================================

const forgotForm = document.getElementById("forgotForm");

const forgotPasswordLink =
    document.getElementById("forgotPassword");

const backToLogin =
    document.getElementById("backToLogin");

let verifiedEmail = "";


// =======================================
// OPEN FORGOT PASSWORD
// =======================================

forgotPasswordLink.addEventListener("click", function(e) {

    e.preventDefault();

    loginForm.hidden = true;
    registerForm.hidden = true;
    forgotForm.hidden = false;

    document.getElementById("otpEmailStep").hidden = false;
    document.getElementById("otpVerifyStep").hidden = true;
    document.getElementById("newPasswordStep").hidden = true;

    document.getElementById("forgotEmail").value = "";
    document.getElementById("otpCode").value = "";

    formTitle.textContent = "Forgot Password";
    formDescription.textContent = "Verify your email to reset your password";

    verifiedEmail = "";

    showMessage("");

});


// =======================================
// SEND OTP
// =======================================

async function sendPasswordOtp() {

    const email = document
        .getElementById("forgotEmail")
        .value.trim()
        .toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        showMessage("Please enter a valid email address.");

        return;

    }

    const button = document.getElementById("sendOtpBtn");

    button.disabled = true;
    button.textContent = "Sending OTP...";

    try {

        const formData = new URLSearchParams();

        formData.append("action", "sendOtp");
        formData.append("email", email);

        await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            body: formData
        });

        // no-cors cannot read the Apps Script response.
        // Show a generic message to avoid revealing account existence.

        document.getElementById("otpEmailStep").hidden = true;

        document.getElementById("otpVerifyStep").hidden = false;

        document.getElementById("forgotDescription").textContent =
            "If this email is registered, an OTP will arrive shortly.";

        showMessage(
            "Check your email for the 6-digit OTP.",
            "#278b45"
        );

        startOtpResendTimer();

    } catch (error) {

        console.error(error);

        showMessage("Unable to send OTP. Please try again.");

        button.disabled = false;
        button.textContent = "Send OTP";

    }

}


// =======================================
// SEND OTP BUTTON
// =======================================

document.getElementById("sendOtpBtn")
    .addEventListener("click", sendPasswordOtp);


// =======================================
// RESEND OTP TIMER
// =======================================

function startOtpResendTimer() {

    const button = document.getElementById("resendOtpBtn");

    button.disabled = true;

    let seconds = 60;

    button.textContent = "Resend OTP (" + seconds + "s)";

    const timer = setInterval(function() {

        seconds--;

        button.textContent = "Resend OTP (" + seconds + "s)";

        if (seconds <= 0) {

            clearInterval(timer);

            button.disabled = false;

            button.textContent = "Resend OTP";

        }

    }, 1000);

}


// =======================================
// RESEND OTP
// =======================================

document.getElementById("resendOtpBtn")
    .addEventListener("click", function() {

        document.getElementById("otpVerifyStep").hidden = true;

        document.getElementById("otpEmailStep").hidden = false;

        showMessage("");

        sendPasswordOtp();

    });


// =======================================
// VERIFY OTP USING GOOGLE APPS SCRIPT
// =======================================

document.getElementById("verifyOtpBtn")
    .addEventListener("click", function() {

        const email = document
            .getElementById("forgotEmail")
            .value.trim()
            .toLowerCase();

        const otp = document
            .getElementById("otpCode")
            .value.trim();

        if (!/^[0-9]{6}$/.test(otp)) {

            showMessage("Enter a valid 6-digit OTP.");

            return;

        }

        const button = document.getElementById("verifyOtpBtn");

        button.disabled = true;
        button.textContent = "Verifying...";

        const callbackName =
            "beejaOtpCallback_" + Date.now();

        const params = new URLSearchParams();

        params.append("action", "verifyOtp");
        params.append("email", email);
        params.append("otp", otp);
        params.append("callback", callbackName);

        const script = document.createElement("script");

        script.src = GOOGLE_SCRIPT_URL + "?" + params.toString();

        let completed = false;

        function cleanup() {

            delete window[callbackName];

            script.remove();

            button.disabled = false;
            button.textContent = "Verify OTP";

        }

        window[callbackName] = function(result) {

            completed = true;

            cleanup();

            if (result.success) {

                verifiedEmail = email;

                document.getElementById("otpVerifyStep").hidden = true;

                document.getElementById("newPasswordStep").hidden = false;

                document.getElementById("forgotDescription").textContent =
                    "OTP verified. Create your new password.";

                showMessage(
                    "Email verified successfully!",
                    "#278b45"
                );

            } else {

                showMessage("Invalid or expired OTP.");

            }

        };

        script.onerror = function() {

            if (completed) return;

            cleanup();

            showMessage(
                "OTP verification failed. Please try again."
            );

        };

        document.body.appendChild(script);

    });


// =======================================
// SAVE NEW PASSWORD
// =======================================

document.getElementById("saveNewPasswordBtn")
    .addEventListener("click", function() {

        const newPassword =
            document.getElementById("newPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        if (!verifiedEmail) {

            showMessage("Please verify your email first.");

            return;

        }

        if (newPassword.length < 8) {

            showMessage("Password must contain at least 8 characters.");

            return;

        }

        if (newPassword !== confirmPassword) {

            showMessage("Passwords do not match.");

            return;

        }

        // Find account in this browser

        let users = getUsers();

        const user = users.find(item =>
            item.email === verifiedEmail
        );

        if (!user) {

            showMessage(
                "This demo account is not available in this browser."
            );

            return;

        }

        // Update demo password

        user.password = newPassword;

        saveUsers(users);

        // Log out old session

        localStorage.removeItem(CURRENT_USER_KEY);

        // Clear form

        document.getElementById("newPassword").value = "";

        document.getElementById("confirmPassword").value = "";

        verifiedEmail = "";

        showLoginPage();

        alert("Password changed successfully! Please login.");

    });


// =======================================
// BACK TO LOGIN
// =======================================

backToLogin.addEventListener("click", function(e) {

    e.preventDefault();

    verifiedEmail = "";

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
    forgotForm.hidden = true;

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
