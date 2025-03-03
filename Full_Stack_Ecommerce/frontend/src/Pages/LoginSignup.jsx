import React, { useState } from "react";
import "./CSS/LoginSignup.css";

const LoginSignup = () => {
<<<<<<< HEAD

  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const login = async () => {
    let dataObj;
    await fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: {
        Accept: 'application/form-data',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((resp) => resp.json())
      .then((data) => { dataObj = data });
    console.log(dataObj);
    if (dataObj.success) {
      localStorage.setItem('auth-token', dataObj.token);
      window.location.replace("/");
    }
    else {
      alert(dataObj.errors)
    }
  }

  const signup = async () => {
    let dataObj;
    await fetch('http://localhost:4000/signup', {
      method: 'POST',
      headers: {
        Accept: 'application/form-data',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((resp) => resp.json())
      .then((data) => { dataObj = data });

    if (dataObj.success) {
      localStorage.setItem('auth-token', dataObj.token);
      window.location.replace("/");
    }
    else {
      alert(dataObj.errors)
    }
  }
=======
  const [state, setState] = useState("Login");
  
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    address: "",
    loginIdentifier: "" // 新增用于登录的统一字段
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      userName: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      address: "",
      loginIdentifier: ""
    });
  };

  // 修改状态切换函数
  const switchMode = (newState) => {
    setState(newState);
    resetForm();
  };

  const login = async () => {
    try {
      // 验证输入
      if (!formData.loginIdentifier || !formData.password) {
        alert("请输入用户名/电子邮箱和密码");
        return;
      }

      const loginData = {
        password: formData.password
      };
      
      // 根据输入判断是邮箱还是用户名
      if (formData.loginIdentifier.includes('@')) {
        loginData.email = formData.loginIdentifier;
      } else {
        loginData.userName = formData.loginIdentifier;
      }
      
      console.log("登录数据:", loginData); // 调试用
      
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const dataObj = await response.json();
      console.log("登录响应:", dataObj); // 调试用
      
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
      
      console.log("注册数据:", formData); // 调试用
      
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
      console.log("注册响应:", dataObj); // 调试用
      
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
>>>>>>> d7069964b49e8e1ef6498dd8437c24e94e55b43e

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
<<<<<<< HEAD
          {state === "Sign Up" ?
            <>
              <input type="text" placeholder="First Name" name="firstName" value={formData.firstName} onChange={changeHandler} />
              <input type="text" placeholder="Last Name" name="lastName" value={formData.lastName} onChange={changeHandler} />
              <input type="text" placeholder="Shipping Address" name="shippingAddress" value={formData.shippingAddress} onChange={changeHandler} />
            </>
            : <></>}
          <input type="email" placeholder="Email address" name="email" value={formData.email} onChange={changeHandler} />
          <input type="password" placeholder="Password" name="password" value={formData.password} onChange={changeHandler} />
        </div>

        <button onClick={() => { state === "Login" ? login() : signup() }}>Continue</button>

        {state === "Login" ?
          <p className="loginsignup-login">Create an account? <span onClick={() => { setState("Sign Up") }}>Click here</span></p>
          : <p className="loginsignup-login">Already have an account? <span onClick={() => { setState("Login") }}>Login here</span></p>}
=======
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
            </>
          ) : (
            // 使用单一字段处理登录
            <input 
              type="text" 
              placeholder="用户名或电子邮箱" 
              name="loginIdentifier" 
              value={formData.loginIdentifier} 
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
            还没有账号? <span onClick={() => switchMode("Sign Up")}>点击这里注册</span>
          </p>
        ) : (
          <p className="loginsignup-login">
            已有账号? <span onClick={() => switchMode("Login")}>点击这里登录</span>
          </p>
        )}
>>>>>>> d7069964b49e8e1ef6498dd8437c24e94e55b43e

        <div className="loginsignup-agree">
          <input type="checkbox" name="agree" id="agree" />
          <p>继续操作即表示您同意我们的使用条款和隐私政策</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;