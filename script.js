// Script for navigation bar
document.addEventListener('DOMContentLoaded', function () {
    // 处理注册表单提交
    document.getElementById('registration-form').addEventListener('submit', function (event) {
        event.preventDefault();  // 阻止表单的默认提交

        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const address = document.getElementById('address').value;

        // 创建用户数据对象
        const userData = {
            fullName,
            email,
            password,
            address
        };

        // 将用户数据存储到 localStorage（模拟注册）
        localStorage.setItem('user', JSON.stringify(userData));

        // 提示注册成功，并跳转到登录页面
        alert('Registration successful! Please log in.');
        window.location.href = 'signin.html'; // 跳转到登录页面
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // 处理登录表单提交
    document.getElementById('signin-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // 假设的用户名和密码（你可以根据需求进行修改）
        const validEmail = 'user@example.com';
        const validPassword = 'password123';

        // 检查输入的邮箱和密码是否正确
        if (email === validEmail && password === validPassword) {
            // 存储登录状态到 localStorage
            localStorage.setItem('user', JSON.stringify({ email: email }));

            // 登录成功后跳转到主页
            alert('Login successful!');
            window.location.href = 'index.html'; // 跳转到主页
        } else {
            alert('Login failed: Invalid email or password');
        }
    });
});
