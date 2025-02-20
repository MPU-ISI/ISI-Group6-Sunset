document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const authLink = document.getElementById("auth-link");

    // 获取密码输入框
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");

    // 实时检查密码是否匹配
    if (confirmPassword) {
        confirmPassword.addEventListener("input", validatePassword);
    }

    function validatePassword() {
        if (confirmPassword.value !== password.value) {
            confirmPassword.style.border = "2px solid red";
        } else {
            confirmPassword.style.border = "2px solid green"; // 可选：匹配时变绿
        }
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            let firstName = document.getElementById("firstName").value.trim();
            let lastName = document.getElementById("lastName").value.trim();
            let email = document.getElementById("email").value.trim();
            let password = document.getElementById("password").value;
            let confirmPassword = document.getElementById("confirmPassword").value;
            let shippingAddress = document.getElementById("shippingAddress").value.trim();


            // 验证输入
            if (!firstName || !lastName || !email || !password || !confirmPassword || !shippingAddress) {
                alert("All fields are required.");
                return;
            }
            if (!email.includes("@")) {
                alert("Invalid email address.");
                return;
            }
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            try {
                const response = await fetch("http://localhost:5001/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ firstName, lastName, email, password, shippingAddress }),
                });


                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    window.location.href = "login.html";
                } else {
                    alert(data.error);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Registration failed. Please try again.");
            }
        });
    }


    // 登录逻辑
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            let loginEmail = document.getElementById("loginEmail").value.trim();
            let loginPassword = document.getElementById("loginPassword").value;

            try {
                const response = await fetch("http://localhost:5001/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: loginEmail, password: loginPassword }),
                });

                const data = await response.json();
                if (response.ok) {
                    // 保存 firstName 和 lastName
                    localStorage.setItem("user", JSON.stringify({ firstName: data.firstName, lastName: data.lastName, token: data.token }));
                    alert("Login successful!");
                    window.location.href = "index.html";
                } else {
                    alert(data.error);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Login failed. Please try again.");
            }
        });
    }

    // 处理前端登录状态（主页 `index.html`）
    if (authLink) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            authLink.textContent = user.firstName + " " + user.lastName + " (Logout)";
            authLink.href = "#";
            authLink.addEventListener("click", () => {
                localStorage.removeItem("user");
                alert("You have logged out.");
                window.location.reload();
            });
        }
    }
});
