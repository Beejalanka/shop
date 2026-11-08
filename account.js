// =======================================
// BEEJA.LK ACCOUNT SYSTEM
// =======================================


// =======================================
// GOOGLE SHEETS CONNECTION
// =======================================

const GOOGLE_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbz6qf-zbJnKgY6Xk7QlRsIlR8a8CO5LDAq1ix5Gw9D7I7yZWkZlH03-0XUYyvqOuS22/exec";


// =======================================
// LOCAL STORAGE KEYS
// =======================================

const USERS_KEY = "beejaUsers";
const CURRENT_USER_KEY = "beejaCurrentUser";


// =======================================
// HTML ELEMENTS
// =======================================

const authBox = document.getElementById("authBox");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const forgotForm = document.getElementById("forgotForm");

const formTitle = document.getElementById("formTitle");
const formDescription = document.getElementById("formDescription");
const authMessage = document.getElementById("authMessage");

const forgotEmail = document.getElementById("forgotEmail");
const otpCode = document.getElementById("otpCode");

const otpEmailStep = document.getElementById("otpEmailStep");
const otpVerifyStep = document.getElementById("otpVerifyStep");
const newPasswordStep = document.getElementById("newPasswordStep");

const sendOtpBtn = document.getElementById("sendOtpBtn");
const resendOtpBtn = document.getElementById("resendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const saveNewPasswordBtn = document.getElementById("saveNewPasswordBtn");


// =======================================
// VARIABLES
// =======================================

let verifiedEmail = "";
let resendTimer = null;


// =======================================
// GOOGLE SHEETS POST
// =======================================

function sendToGoogleSheets(data) {

    const formData = new URLSearchParams();

    Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
    });

    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData
    }).catch(error => {
        console.error("Google Sheets error:", error);
    });

}


// =======================================
// GET USERS
// =======================================

function getUsers() {

    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (error) {
        console.error("Unable to read users:", error);
        return [];
    }

}


// =======================================
// SAVE USERS
// =======================================

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}


// =======================================
// GET CURRENT USER
// =======================================

function getCurrentUser() {

    try {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    } catch (error) {
        return null;
    }

}


// =======================================
// SHOW MESSAGE
// =======================================

function showMessage(message, color = "#d93025") {

    authMessage.textContent = message;
    authMessage.style.color = color;

}


// =======================================
// STOP OTP TIMER
// =======================================

function stopOtpResendTimer() {

    if (resendTimer !== null) {
        clearInterval(resendTimer);
        resendTimer = null;
    }

    resendOtpBtn.disabled = true;
    resendOtpBtn.textContent = "Resend OTP";

}


// =======================================
// SHOW LOGIN PAGE
// =======================================

function showLoginPage() {

    stopOtpResendTimer();

    dashboard.hidden = true;
    authBox.hidden = false;

    loginForm.hidden = false;
    registerForm.hidden = true;
    forgotForm.hidden = true;

    document.getElementById("editProfile").hidden = true;

    loginForm.reset();
    registerForm.reset();
    forgotForm.reset();

    otpEmailStep.hidden = false;
    otpVerifyStep.hidden = true;
    newPasswordStep.hidden = true;

    formTitle.textContent = "Welcome Back!";
    formDescription.textContent =
        "Login to your Beeja.LK account";

    document.getElementById("forgotDescription").textContent =
        "Enter your registered email address.";

    verifiedEmail = "";

    showMessage("");

}


// =======================================
// SWITCH TO REGISTER
// =======================================

document.getElementById("showRegister")
    .addEventListener("click", function(event) {

        event.preventDefault();

        loginForm.hidden = true;
        forgotForm.hidden = true;
        registerForm.hidden = false;

        formTitle.textContent = "Create Account";
        formDescription.textContent = "Join Beeja.LK today";

        showMessage("");

    });


// =======================================
// SWITCH TO LOGIN
// =======================================

document.getElementById("showLogin")
    .addEventListener("click", function(event) {

        event.preventDefault();

        registerForm.hidden = true;
        forgotForm.hidden = true;
        loginForm.hidden = false;

        formTitle.textContent = "Welcome Back!";
        formDescription.textContent =
            "Login to your Beeja.LK account";

        showMessage("");

    });


// =======================================
// CUSTOMER REGISTRATION
// =======================================

registerForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = document.getElementById("registerName")
        .value.trim();

    const email = document.getElementById("registerEmail")
        .value.trim().toLowerCase();

    const phone = document.getElementById("registerPhone")
        .value.trim();

    const password = document.getElementById("registerPassword")
        .value;

    if (!name || !email || !phone || !password) {
        showMessage("Please fill all fields.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage("Please enter a valid email address.");
        return;
    }

    if (password.length < 8) {
        showMessage("Password must contain at least 8 characters.");
        return;
    }

    const users = getUsers();

    const existingUser = users.find(user =>
        user.email.toLowerCase() === email
    );

    if (existingUser) {
        showMessage("This email is already registered.");
        return;
    }

    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password
    };

    users.push(newUser);

    saveUsers(users);


    // SAVE REGISTRATION TO GOOGLE SHEETS

    sendToGoogleSheets({
        action: "register",
        name: name,
        email: email,
        phone: phone
    });


    // AUTOMATIC LOGIN AFTER REGISTRATION

    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify({ id: newUser.id })
    );

    registerForm.reset();

    showDashboard();

});


// =======================================
// CUSTOMER LOGIN
// =======================================

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const email = document.getElementById("loginEmail")
        .value.trim().toLowerCase();

    const password = document.getElementById("loginPassword")
        .value;

    const users = getUsers();

    const user = users.find(item =>
        item.email.toLowerCase() === email &&
        item.password === password
    );

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

    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify({ id: user.id })
    );

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

    const user = getUsers().find(item =>
        item.id === currentUser.id
    );

    if (!user) {
        localStorage.removeItem(CURRENT_USER_KEY);
        showLoginPage();
        return;
    }

    authBox.hidden = true;
    dashboard.hidden = false;

    document.getElementById("customerName").textContent =
        user.name;

    document.getElementById("profileName").textContent =
        user.name;

    document.getElementById("profileEmail").textContent =
        user.email;

    document.getElementById("profilePhone").textContent =
        user.phone;

}


// =======================================
// LOGOUT
// =======================================

document.getElementById("logoutBtn")
    .addEventListener("click", function() {

        localStorage.removeItem(CURRENT_USER_KEY);

        showLoginPage();

    });


// =======================================
// OPEN FORGOT PASSWORD
// =======================================

document.getElementById("forgotPassword")
    .addEventListener("click", function(event) {

        event.preventDefault();

        stopOtpResendTimer();

        loginForm.hidden = true;
        registerForm.hidden = true;
        forgotForm.hidden = false;

        otpEmailStep.hidden = false;
        otpVerifyStep.hidden = true;
        newPasswordStep.hidden = true;

        forgotForm.reset();

        verifiedEmail = "";

        formTitle.textContent = "Forgot Password";
        formDescription.textContent =
            "Verify your email to reset your password";

        document.getElementById("forgotDescription").textContent =
            "Enter your registered email address.";

        showMessage("");

    });


// =======================================
// JSONP REQUEST HELPER
// =======================================

function jsonpRequest(params, callbackPrefix, onResult, onError) {

    const callbackName =
        callbackPrefix + "_" + Date.now() + "_" +
        Math.floor(Math.random() * 100000);

    params.set("callback", callbackName);

    const script = document.createElement("script");

    script.src =
        GOOGLE_SCRIPT_URL + "?" + params.toString();

    let completed = false;

    const timeout = setTimeout(function() {

        finish();

        onError("Request timed out. Please try again.");

    }, 20000);


    function finish() {

        if (completed) return;

        completed = true;

        clearTimeout(timeout);

        delete window[callbackName];

        script.remove();

    }


    window[callbackName] = function(result) {

        if (completed) return;

        finish();

        onResult(result);

    };


    script.onerror = function() {

        if (completed) return;

        finish();

        onError("Google Apps Script connection failed.");

    };


    document.body.appendChild(script);

}


// =======================================
// SEND PASSWORD RESET OTP
// =======================================

function sendPasswordOtp(button = sendOtpBtn) {

    const email = forgotEmail.value.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        showMessage("Please enter a valid email.");

        return;

    }

    button.disabled = true;

    const originalText =
        button.id === "resendOtpBtn"
            ? "Resending..."
            : "Sending OTP...";

    button.textContent = originalText;


    const params = new URLSearchParams();

    params.set("action", "sendOtp");
    params.set("email", email);


    jsonpRequest(
        params,
        "beejaSendOTP",

        function(result) {

            button.disabled = false;

            button.textContent =
                button.id === "resendOtpBtn"
                    ? "Resend OTP"
                    : "Send OTP";


            if (result.success) {

                otpEmailStep.hidden = true;
                otpVerifyStep.hidden = false;
                newPasswordStep.hidden = true;

                document.getElementById("forgotDescription")
                    .textContent =
                    "Enter the OTP sent to your email address.";

                showMessage(
                    "OTP sent successfully! Check your inbox.",
                    "#278b45"
                );

                otpCode.value = "";

                startOtpResendTimer();

            } else {

                showMessage(
                    result.message || "Unable to send OTP."
                );

            }

        },

        function(errorMessage) {

            button.disabled = false;

            button.textContent =
                button.id === "resendOtpBtn"
                    ? "Resend OTP"
                    : "Send OTP";

            showMessage(errorMessage);

        }
    );

}


// SEND OTP BUTTON

sendOtpBtn.addEventListener("click", function() {

    sendPasswordOtp(sendOtpBtn);

});


// =======================================
// OTP RESEND TIMER
// =======================================

let otpResendTimer = null;

function startOtpResendTimer() {

    const resendBtn = document.getElementById("resendOtpBtn");

    if (!resendBtn) return;

    // Clear previous timer
    if (otpResendTimer) {
        clearInterval(otpResendTimer);
    }

    let remaining = 60;

    // Keep button visible
    resendBtn.style.display = "block";
    resendBtn.hidden = false;

    resendBtn.disabled = true;
    resendBtn.textContent = `Resend OTP (${remaining}s)`;

    otpResendTimer = setInterval(() => {

        remaining--;

        if (remaining > 0) {

            resendBtn.textContent = `Resend OTP (${remaining}s)`;

        } else {

            clearInterval(otpResendTimer);
            otpResendTimer = null;

            // Enable button after 60 seconds
            resendBtn.style.display = "block";
            resendBtn.hidden = false;
            resendBtn.disabled = false;
            resendBtn.textContent = "Resend OTP";
        }

    }, 1000);
}

// =======================================
// RESEND OTP
// =======================================

resendOtpBtn.addEventListener("click", function() {

    if (resendOtpBtn.disabled) return;

    sendPasswordOtp(resendOtpBtn);

});


// =======================================
// VERIFY OTP
// =======================================

verifyOtpBtn.addEventListener("click", function() {

    const email = forgotEmail.value.trim().toLowerCase();
    const otp = otpCode.value.trim();

    if (!/^[0-9]{6}$/.test(otp)) {

        showMessage("Enter a valid 6-digit OTP.");

        return;

    }

    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = "Verifying...";


    const params = new URLSearchParams();

    params.set("action", "verifyOtp");
    params.set("email", email);
    params.set("otp", otp);


    jsonpRequest(
        params,
        "beejaVerifyOTP",

        function(result) {

            verifyOtpBtn.disabled = false;
            verifyOtpBtn.textContent = "Verify OTP";


            if (result.success) {

                verifiedEmail = email;

                stopOtpResendTimer();

                otpVerifyStep.hidden = true;
                newPasswordStep.hidden = false;

                document.getElementById("forgotDescription")
                    .textContent =
                    "OTP verified. Create your new password.";

                showMessage(
                    "Email verified successfully!",
                    "#278b45"
                );

            } else {

                showMessage(
                    result.message || "Invalid or expired OTP."
                );

            }

        },

        function(errorMessage) {

            verifyOtpBtn.disabled = false;
            verifyOtpBtn.textContent = "Verify OTP";

            showMessage(errorMessage);

        }
    );

});


// =======================================
// SAVE NEW PASSWORD
// =======================================

saveNewPasswordBtn.addEventListener("click", function() {

    const newPassword =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;


    if (!verifiedEmail) {

        showMessage("Please verify your email first.");

        return;

    }

    if (newPassword.length < 8) {

        showMessage(
            "Password must contain at least 8 characters."
        );

        return;

    }

    if (newPassword !== confirmPassword) {

        showMessage("Passwords do not match.");

        return;

    }


    // FIND ACCOUNT IN THIS BROWSER

    const users = getUsers();

    const user = users.find(item =>
        item.email.toLowerCase() === verifiedEmail
    );


    if (!user) {

        showMessage(
            "This account is not available in this browser."
        );

        return;

    }


    // UPDATE LOCAL PASSWORD

    user.password = newPassword;

    saveUsers(users);


    // LOG OUT CURRENT SESSION

    localStorage.removeItem(CURRENT_USER_KEY);


    // RESET PASSWORD FORM

    document.getElementById("newPassword").value = "";
    document.getElementById("confirmPassword").value = "";

    verifiedEmail = "";

    showLoginPage();

    showMessage(
        "Password changed successfully. Please login.",
        "#278b45"
    );

});


// =======================================
// BACK TO LOGIN
// =======================================

document.getElementById("backToLogin")
    .addEventListener("click", function(event) {

        event.preventDefault();

        verifiedEmail = "";

        showLoginPage();

    });


// =======================================
// EDIT PROFILE
// =======================================

document.getElementById("editProfileBtn")
    .addEventListener("click", function() {

        const currentUser = getCurrentUser();

        if (!currentUser) return;

        const user = getUsers().find(item =>
            item.id === currentUser.id
        );

        if (!user) return;

        document.getElementById("editName").value =
            user.name;

        document.getElementById("editPhone").value =
            user.phone;

        document.getElementById("editProfile").hidden = false;

        document.getElementById("editProfile")
            .scrollIntoView({
                behavior: "smooth"
            });

    });


// =======================================
// SAVE PROFILE CHANGES
// =======================================

document.getElementById("editForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const currentUser = getCurrentUser();

        if (!currentUser) return;

        const users = getUsers();

        const user = users.find(item =>
            item.id === currentUser.id
        );

        if (!user) return;

        const name =
            document.getElementById("editName").value.trim();

        const phone =
            document.getElementById("editPhone").value.trim();

        if (!name || !phone) {

            alert("Please fill all fields.");

            return;

        }

        user.name = name;
        user.phone = phone;

        saveUsers(users);

        document.getElementById("editProfile").hidden = true;

        showDashboard();

        alert("Profile updated successfully!");

    });


// =======================================
// CANCEL EDIT
// =======================================

document.getElementById("cancelEdit")
    .addEventListener("click", function() {

        document.getElementById("editProfile").hidden = true;

    });


// =======================================
// CHECK LOGIN WHEN PAGE LOADS
// =======================================

document.addEventListener("DOMContentLoaded", function() {

    showDashboard();

});


// =================================
// SHOW / HIDE PASSWORD
// =================================

function togglePassword(inputId, button) {

    const passwordInput = document.getElementById(inputId);
    const icon = button.querySelector("i");

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");

        button.setAttribute("aria-label", "Hide password");
        button.title = "Hide password";

    } else {

        passwordInput.type = "password";

        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");

        button.setAttribute("aria-label", "Show password");
        button.title = "Show password";
    }
}

