// ============================================================
// ChronoHub - Authentication SPA Logic (auth.js)
// Handles: Validation, Form Submissions, API connection, JWT Session
// ============================================================

const API = "http://127.0.0.1:8000/api/v1";

let pendingVerifyEmail = "";
let resendTimer = null;

function switchView(fromCard, toCard) {
    // Clear forms on switch
    fromCard.querySelectorAll("form").forEach(f => f.reset());
    fromCard.querySelectorAll(".form-group").forEach(el => el.classList.remove("has-error"));
    fromCard.querySelectorAll(".error-msg").forEach(el => {
        el.textContent = "";
        el.style.display = "none";
    });

    fromCard.classList.remove("active");
    setTimeout(() => {
        toCard.classList.add("active");
    }, 150);
}

document.addEventListener("DOMContentLoaded", () => {
    // Si ya hay un token válido, redirigir al dashboard
    if (localStorage.getItem("chrono_token")) {
        window.location.href = "index.html";
        return;
    }

    initViewToggles();
    initPasswordToggles();
    initFormSubmissions();
    initVerifyForm();
    initTermsModal();
});

// ============================================================
// 1. VIEW TOGGLES (ANIMATIONS & TRANSITIONS)
// ============================================================
function initViewToggles() {
    const cardLogin = document.getElementById("card-login");
    const cardRegister = document.getElementById("card-register");
    const cardForgot = document.getElementById("card-forgot");

    const toRegister = document.getElementById("to-register");
    const toLogin = document.getElementById("to-login");
    const toForgot = document.getElementById("to-forgot-pwd");
    const forgotBack = document.getElementById("forgot-back-to-login");

    toRegister.addEventListener("click", (e) => {
        e.preventDefault();
        switchView(cardLogin, cardRegister);
    });

    toLogin.addEventListener("click", (e) => {
        e.preventDefault();
        switchView(cardRegister, cardLogin);
    });

    toForgot.addEventListener("click", (e) => {
        e.preventDefault();
        switchView(cardLogin, cardForgot);
    });

    forgotBack.addEventListener("click", (e) => {
        e.preventDefault();
        switchView(cardForgot, cardLogin);
    });
}

// ============================================================
// 2. PASSWORD VISIBILITY TOGGLE
// ============================================================
function initPasswordToggles() {
    document.querySelectorAll(".btn-toggle-password").forEach(btn => {
        btn.addEventListener("click", () => {
            const input = btn.previousElementSibling;
            const eyeIcon = btn.querySelector("svg");

            if (input.type === "password") {
                input.type = "text";
                btn.style.color = "var(--primary-color)";
            } else {
                input.type = "password";
                btn.style.color = "var(--text-muted)";
            }
        });
    });
}

// ============================================================
// 3. TOAST NOTIFICATIONS SYSTEM
// ============================================================
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icons = {
        success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
        error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    };

    toast.innerHTML = `${icons[type] || icons.success} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "slideInRight 0.3s reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============================================================
// 4. CLIENT SIDE VALIDATION
// ============================================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
}

function setFieldError(inputEl, errorElId, message) {
    const errorEl = document.getElementById(errorElId);
    const formGroup = inputEl.closest(".form-group");

    if (message) {
        errorEl.textContent = message;
        errorEl.style.display = "block";
        formGroup.classList.add("has-error");
        return false;
    } else {
        errorEl.textContent = "";
        errorEl.style.display = "none";
        formGroup.classList.remove("has-error");
        return true;
    }
}

// ============================================================
// 5. SAVE SESSION (JWT)
// ============================================================
function saveSession(data) {
    localStorage.setItem("chrono_token", data.access_token);
    localStorage.setItem("chrono_user_id", data.user.id);
    localStorage.setItem("chrono_user_name", data.user.name);
    localStorage.setItem("chrono_user_email", data.user.email);
    localStorage.setItem("chrono_user_avatar", data.user.avatar_url || "");
}

// ============================================================
// 6. FORM SUBMISSIONS
// ============================================================
function initFormSubmissions() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const forgotForm = document.getElementById("forgot-form");

    // --- LOGIN ---
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById("login-email");
        const passwordInput = document.getElementById("login-password");
        const submitBtn = document.getElementById("btn-login-submit");
        const spinner = submitBtn.querySelector(".btn-spinner");
        const btnText = submitBtn.querySelector("span");

        let isValid = true;

        if (!emailInput.value.trim()) {
            isValid = setFieldError(emailInput, "login-email-error", "El correo electrónico es requerido.");
        } else if (!validateEmail(emailInput.value.trim())) {
            isValid = setFieldError(emailInput, "login-email-error", "Por favor ingresa un correo electrónico válido.");
        } else {
            setFieldError(emailInput, "login-email-error", "");
        }

        if (!passwordInput.value) {
            isValid = setFieldError(passwordInput, "login-password-error", "La contraseña es requerida.");
        } else {
            setFieldError(passwordInput, "login-password-error", "");
        }

        if (!isValid) return;

        try {
            setBtnLoading(submitBtn, spinner, btnText, true);
            const response = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: emailInput.value.trim(),
                    password: passwordInput.value
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 403) {
                    // Cuenta no verificada
                    pendingVerifyEmail = emailInput.value.trim();
                    const verifySubtitle = document.getElementById("verify-subtitle");
                    if (verifySubtitle) {
                        verifySubtitle.innerHTML = `Enviamos un código de 6 dígitos a <strong style="color:var(--text-color);">${pendingVerifyEmail}</strong>. Ingrésalo a continuación.`;
                    }
                    showToast(errorData.detail || "Debes verificar tu correo.", "error");
                    const cardLogin = document.getElementById("card-login");
                    const cardVerify = document.getElementById("card-verify");
                    switchView(cardLogin, cardVerify);
                    startResendTimer();
                    return;
                }
                throw new Error(errorData.detail || "Error al iniciar sesión.");
            }

            const data = await response.json();
            saveSession(data);

            showToast("¡Inicio de sesión exitoso! Redirigiendo...", "success");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        } catch (error) {
            const msg = error.message === "Failed to fetch"
                ? "No se pudo conectar al servidor. Verifica que el backend esté corriendo."
                : error.message;
            showToast(msg, "error");
        } finally {
            setBtnLoading(submitBtn, spinner, btnText, false);
        }
    });

    // --- REGISTER ---
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById("register-name");
        const emailInput = document.getElementById("register-email");
        const passwordInput = document.getElementById("register-password");
        const confirmInput = document.getElementById("register-confirm-password");
        const termsInput = document.getElementById("register-terms");
        const submitBtn = document.getElementById("btn-register-submit");
        const spinner = submitBtn.querySelector(".btn-spinner");
        const btnText = submitBtn.querySelector("span");

        let isValid = true;

        if (!nameInput.value.trim()) {
            isValid = setFieldError(nameInput, "register-name-error", "El nombre completo es requerido.");
        } else {
            setFieldError(nameInput, "register-name-error", "");
        }

        if (!emailInput.value.trim()) {
            isValid = setFieldError(emailInput, "register-email-error", "El correo electrónico es requerido.");
        } else if (!validateEmail(emailInput.value.trim())) {
            isValid = setFieldError(emailInput, "register-email-error", "Ingresa un correo electrónico válido.");
        } else {
            setFieldError(emailInput, "register-email-error", "");
        }

        if (!passwordInput.value) {
            isValid = setFieldError(passwordInput, "register-password-error", "La contraseña es requerida.");
        } else if (passwordInput.value.length < 6) {
            isValid = setFieldError(passwordInput, "register-password-error", "La contraseña debe tener al menos 6 caracteres.");
        } else {
            setFieldError(passwordInput, "register-password-error", "");
        }

        if (passwordInput.value !== confirmInput.value) {
            isValid = setFieldError(confirmInput, "register-confirm-password-error", "Las contraseñas no coinciden.");
        } else {
            setFieldError(confirmInput, "register-confirm-password-error", "");
        }

        const termsError = document.getElementById("register-terms-error");
        if (!termsInput.checked) {
            termsError.textContent = "Debes aceptar los términos y condiciones.";
            termsError.style.display = "block";
            isValid = false;
        } else {
            termsError.textContent = "";
            termsError.style.display = "none";
        }

        if (!isValid) return;

        try {
            setBtnLoading(submitBtn, spinner, btnText, true);
            const response = await fetch(`${API}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: nameInput.value.trim(),
                    email: emailInput.value.trim(),
                    password: passwordInput.value
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Error al crear la cuenta.");
            }

            const data = await response.json();
            pendingVerifyEmail = data.email || emailInput.value.trim();

            const verifySubtitle = document.getElementById("verify-subtitle");
            if (verifySubtitle) {
                verifySubtitle.innerHTML = `Enviamos un código de 6 dígitos a <strong style="color:var(--text-color);">${pendingVerifyEmail}</strong>. Ingrésalo a continuación.`;
            }

            showToast("¡Cuenta creada! Revisa tu correo para verificar tu cuenta.", "success");
            const cardRegister = document.getElementById("card-register");
            const cardVerify = document.getElementById("card-verify");
            switchView(cardRegister, cardVerify);
            startResendTimer();
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setBtnLoading(submitBtn, spinner, btnText, false);
        }
    });

    // --- FORGOT PASSWORD ---
    forgotForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById("forgot-email");
        const submitBtn = document.getElementById("btn-forgot-submit");
        const spinner = submitBtn.querySelector(".btn-spinner");
        const btnText = submitBtn.querySelector("span");

        if (!emailInput.value.trim()) {
            setFieldError(emailInput, "forgot-email-error", "El correo electrónico es requerido.");
            return;
        } else if (!validateEmail(emailInput.value.trim())) {
            setFieldError(emailInput, "forgot-email-error", "Ingresa un correo electrónico válido.");
            return;
        }

        setFieldError(emailInput, "forgot-email-error", "");
        setBtnLoading(submitBtn, spinner, btnText, true);

        // TODO: Implementar endpoint real de recuperación de contraseña con envío de email
        // Por ahora muestra un mensaje informativo (funcionalidad pendiente de email service)
        setTimeout(() => {
            setBtnLoading(submitBtn, spinner, btnText, false);
            showToast("Si el correo está registrado, recibirás instrucciones en breve.", "success");
            emailInput.value = "";
            setTimeout(() => {
                document.getElementById("forgot-back-to-login").click();
            }, 2000);
        }, 1500);
    });
}

function setBtnLoading(btn, spinner, textSpan, isLoading) {
    if (isLoading) {
        btn.disabled = true;
        spinner.classList.remove("hidden");
        textSpan.style.opacity = "0.7";
    } else {
        btn.disabled = false;
        spinner.classList.add("hidden");
        textSpan.style.opacity = "1";
    }
}

// ============================================================
// 7. VERIFY EMAIL FORM LOGIC
// ============================================================
function initVerifyForm() {
    const cardVerify = document.getElementById("card-verify");
    const cardRegister = document.getElementById("card-register");
    const verifyForm = document.getElementById("verify-form");
    const backToRegister = document.getElementById("verify-back-to-register");
    const btnResend = document.getElementById("btn-resend-code");
    const otpInputs = document.querySelectorAll(".otp-input");

    // Switch view back to register
    backToRegister.addEventListener("click", (e) => {
        e.preventDefault();
        if (resendTimer) clearInterval(resendTimer);
        switchView(cardVerify, cardRegister);
    });

    // Handle inputs keyboard/paste navigation
    otpInputs.forEach((input, index) => {
        input.addEventListener("input", (e) => {
            const val = e.target.value;
            if (val) {
                input.classList.add("filled");
                // Focus next
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            } else {
                input.classList.remove("filled");
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace") {
                if (!input.value && index > 0) {
                    // Empty the previous one first and focus it
                    otpInputs[index - 1].value = "";
                    otpInputs[index - 1].classList.remove("filled");
                    otpInputs[index - 1].focus();
                } else if (input.value) {
                    // Clear current value
                    input.value = "";
                    input.classList.remove("filled");
                }
            }
        });

        input.addEventListener("paste", (e) => {
            e.preventDefault();
            const data = (e.clipboardData || window.clipboardData).getData("text").trim();
            if (/^\d{6}$/.test(data)) {
                for (let i = 0; i < otpInputs.length; i++) {
                    otpInputs[i].value = data[i];
                    otpInputs[i].classList.add("filled");
                }
                otpInputs[otpInputs.length - 1].focus();
            }
        });
    });

    // Form submission
    verifyForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById("btn-verify-submit");
        const spinner = submitBtn.querySelector(".btn-spinner");
        const btnText = submitBtn.querySelector("span");
        const errorCode = document.getElementById("verify-code-error");

        // Collect code
        let code = "";
        otpInputs.forEach(input => code += input.value.trim());

        if (code.length < 6) {
            errorCode.textContent = "Por favor ingresa los 6 dígitos del código.";
            errorCode.style.display = "block";
            return;
        }
        errorCode.textContent = "";
        errorCode.style.display = "none";

        try {
            setBtnLoading(submitBtn, spinner, btnText, true);
            const response = await fetch(`${API}/auth/verify-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: pendingVerifyEmail,
                    code: code
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Código inválido o expirado.");
            }

            const data = await response.json();
            saveSession(data);

            showToast("¡Cuenta verificada y acceso concedido! Redirigiendo...", "success");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        } catch (error) {
            errorCode.textContent = error.message;
            errorCode.style.display = "block";
        } finally {
            setBtnLoading(submitBtn, spinner, btnText, false);
        }
    });

    // Resend code button click
    btnResend.addEventListener("click", async () => {
        try {
            const response = await fetch(`${API}/auth/resend-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: pendingVerifyEmail })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Error al reenviar el código.");
            }

            showToast("Se ha enviado un nuevo código de verificación.", "success");
            startResendTimer();
        } catch (error) {
            showToast(error.message, "error");
        }
    });
}

function startResendTimer() {
    const countdownEl = document.getElementById("resend-countdown");
    const timerTextEl = document.getElementById("resend-timer-text");
    const btnResend = document.getElementById("btn-resend-code");

    if (resendTimer) clearInterval(resendTimer);

    let count = 60;
    countdownEl.textContent = count;
    timerTextEl.classList.remove("hidden");
    btnResend.classList.add("hidden");

    resendTimer = setInterval(() => {
        count--;
        countdownEl.textContent = count;
        if (count <= 0) {
            clearInterval(resendTimer);
            timerTextEl.classList.add("hidden");
            btnResend.classList.remove("hidden");
        }
    }, 1000);
}

// ============================================================
// 8. TERMS & CONDITIONS MODAL
// ============================================================
function initTermsModal() {
    const overlay   = document.getElementById("terms-overlay");
    const openBtn   = document.getElementById("open-terms");
    const closeBtn  = document.getElementById("close-terms");
    const acceptBtn = document.getElementById("accept-terms-btn");
    const checkbox  = document.getElementById("register-terms");

    function openModal(e) {
        e.preventDefault();
        overlay.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        overlay.classList.remove("open");
        document.body.style.overflow = "";
    }

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);

    // "Entendido" cierra el modal y marca el checkbox
    acceptBtn.addEventListener("click", () => {
        checkbox.checked = true;
        closeModal();
    });

    // Clic en el fondo oscuro cierra el modal
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
    });

    // Escape también cierra
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
    });
}
