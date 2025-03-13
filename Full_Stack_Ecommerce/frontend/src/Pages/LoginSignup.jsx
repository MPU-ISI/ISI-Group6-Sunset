import React, { useState } from "react";
import "./CSS/LoginSignup.css";

const LoginSignup = () => {
  const [state, setState] = useState("Login");

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    address: "",
    loginIdentifier: ""
  });

  const [passwordError, setPasswordError] = useState("");

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "password" || e.target.name === "confirmPassword") {
      if (e.target.name === "password") {
        setPasswordError(formData.confirmPassword && e.target.value !== formData.confirmPassword
          ? "两次输入的密码不一致"
          : "");
      } else {
        setPasswordError(e.target.value !== formData.password
          ? "两次输入的密码不一致"
          : "");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      address: "",
      loginIdentifier: ""
    });
    setPasswordError("");
  };

  const switchMode = (newState) => {
    setState(newState);
    resetForm();
  };

  const login = async () => {
    try {
      if (!formData.loginIdentifier || !formData.password) {
        alert("请输入用户名/电子邮箱和密码");
        return;
      }

      const loginData = {
        password: formData.password
      };

      if (formData.loginIdentifier.includes('@')) {
        loginData.email = formData.loginIdentifier;
      } else {
        loginData.userName = formData.loginIdentifier;
      }

      console.log("登录数据:", loginData);

      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const dataObj = await response.json();
      console.log("登录响应:", dataObj);

      if (dataObj.success) {
        localStorage.setItem('auth-token', dataObj.token);
        if (dataObj.user) {
          localStorage.setItem('user-info', JSON.stringify(dataObj.user));
        }
        window.location.replace("/");
      } else {
        alert(dataObj.errors);
      }
    } catch (error) {
      console.error("登录出错:", error);
      alert("登录失败，请稍后再试");
    }
  };

  const signup = async () => {
    try {
      if (!formData.userName || !formData.email || !formData.password || !formData.confirmPassword) {
        alert("用户名、电子邮箱、密码和确认密码为必填项");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setPasswordError("两次输入的密码不一致");
        return;
      }

      console.log("注册数据:", formData);

      const response = await fetch('http://localhost:4000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: formData.userName,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address
        }),
      });

      const dataObj = await response.json();
      console.log("注册响应:", dataObj);

      if (dataObj.success) {
        localStorage.setItem('auth-token', dataObj.token);
        if (dataObj.user) {
          localStorage.setItem('user-info', JSON.stringify(dataObj.user));
        }
        window.location.replace("/");
      } else {
        alert(dataObj.errors);
      }
    } catch (error) {
      console.error("注册出错:", error);
      alert("注册失败，请稍后再试");
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state === "Sign Up" ? (
            <>
              <input
                type="text"
                placeholder="用户名"
                name="userName"
                value={formData.userName}
                onChange={changeHandler}
                required
              />
              <input
                type="text"
                placeholder="名字"
                name="firstName"
                value={formData.firstName}
                onChange={changeHandler}
              />
              <input
                type="text"
                placeholder="姓氏"
                name="lastName"
                value={formData.lastName}
                onChange={changeHandler}
              />
              <input
                type="email"
                placeholder="电子邮箱"
                name="email"
                value={formData.email}
                onChange={changeHandler}
                required
              />
              <input
                type="password"
                placeholder="密码"
                name="password"
                value={formData.password}
                onChange={changeHandler}
                required
              />
              <input
                type="password"
                placeholder="确认密码"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={changeHandler}
                required
              />
              {passwordError && <div className="password-error">{passwordError}</div>}
            </>
          ) : (
            <input
              type="text"
              placeholder="用户名或电子邮箱"
              name="loginIdentifier"
              value={formData.loginIdentifier}
              onChange={changeHandler}
              required
            />
          )}

          {state === "Login" && (
            <input
              type="password"
              placeholder="密码"
              name="password"
              value={formData.password}
              onChange={changeHandler}
              required
            />
          )}

          {state === "Sign Up" && (
            <input
              type="text"
              placeholder="地址"
              name="address"
              value={formData.address}
              onChange={changeHandler}
            />
          )}
        </div>

        <button onClick={() => { state === "Login" ? login() : signup() }}>
          {state === "Login" ? "登录" : "注册"}
        </button>

        {state === "Login" ? (
          <p className="loginsignup-login">
            还没有账号? <span onClick={() => switchMode("Sign Up")}>点击这里注册</span>
          </p>
        ) : (
          <p className="loginsignup-login">
            已有账号? <span onClick={() => switchMode("Login")}>点击这里登录</span>
          </p>
        )}

        <div className="loginsignup-agree">
          <input type="checkbox" name="agree" id="agree" />
          <p>继续操作即表示您同意我们的使用条款和隐私政策</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;