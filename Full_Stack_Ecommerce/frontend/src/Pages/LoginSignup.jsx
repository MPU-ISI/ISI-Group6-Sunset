import React, { useState } from "react";
import "./CSS/LoginSignup.css";

const LoginSignup = () => {
  const [state, setState] = useState("Login");
  
  // 更新表单数据以匹配新的用户模型
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    address: ""
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const login = async () => {
    try {
      // 更新 API 端点以匹配新的路由
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // 支持使用电子邮箱或用户名登录
          email: formData.email,
          userName: formData.userName,
          password: formData.password
        }),
      });

      const dataObj = await response.json();
      console.log(dataObj);
      
      if (dataObj.success) {
        localStorage.setItem('auth-token', dataObj.token);
        // 存储用户信息
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
      // 验证必填字段
      if (!formData.userName || !formData.email || !formData.password) {
        alert("用户名、电子邮箱和密码为必填项");
        return;
      }
      
      // 更新 API 端点以匹配新的路由
      const response = await fetch('http://localhost:4000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const dataObj = await response.json();
      
      if (dataObj.success) {
        localStorage.setItem('auth-token', dataObj.token);
        // 存储用户信息
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
            </>
          ) : (
            // 登录时提供用户名或邮箱的选项
            <input 
              type="text" 
              placeholder="用户名或电子邮箱" 
              name={formData.email.includes('@') ? "email" : "userName"} 
              value={formData.email.includes('@') ? formData.email : formData.userName} 
              onChange={changeHandler}
              required
            />
          )}
          
          {state === "Sign Up" && (
            <input 
              type="email" 
              placeholder="电子邮箱" 
              name="email" 
              value={formData.email} 
              onChange={changeHandler}
              required
            />
          )}
          
          <input 
            type="password" 
            placeholder="密码" 
            name="password" 
            value={formData.password} 
            onChange={changeHandler}
            required
          />
          
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
            还没有账号? <span onClick={() => { setState("Sign Up") }}>点击这里注册</span>
          </p>
        ) : (
          <p className="loginsignup-login">
            已有账号? <span onClick={() => { setState("Login") }}>点击这里登录</span>
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