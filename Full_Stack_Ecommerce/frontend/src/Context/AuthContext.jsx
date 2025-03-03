import React, { createContext, useState, useEffect, useCallback } from 'react';

// 创建上下文
export const AuthContext = createContext();

// API基础URL - 根据你的环境调整
const API_URL = 'http://localhost:4000/api';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 验证令牌并获取用户信息
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/user`, {
        headers: {
          'auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Token verification failed');
      }
      
      const userData = await response.json();
      setIsAuthenticated(true);
      setUser(userData);
    } catch (err) {
      console.error('加载用户信息失败', err);
      localStorage.removeItem('auth-token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 组件挂载时加载用户信息
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // 登录函数 - 支持邮箱或用户名
  const login = async (emailOrUsername, password) => {
    setError(null);
    try {
      // 根据是否包含@符号判断是邮箱还是用户名
      const isEmail = emailOrUsername.includes('@');
      
      const requestBody = {
        password
      };
      
      if (isEmail) {
        requestBody.email = emailOrUsername;
      } else {
        requestBody.userName = emailOrUsername;
      }
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();

      if (data.success) {
        const { token, user } = data;
        localStorage.setItem('auth-token', token);
        setIsAuthenticated(true);
        setUser(user);
        return { success: true };
      } else {
        setError(data.errors || '登录失败');
        return { success: false, error: data.errors };
      }
    } catch (err) {
      const errorMsg = '登录过程中出错';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // 登出函数
  const logout = () => {
    localStorage.removeItem('auth-token');
    setIsAuthenticated(false);
    setUser(null);
    window.location.replace("/"); // 保持与你原来的逻辑一致
  };

  // 提供上下文数据和函数
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        logout,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};