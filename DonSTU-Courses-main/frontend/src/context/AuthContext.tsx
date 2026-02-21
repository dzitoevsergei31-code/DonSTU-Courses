import axios from "axios";
import React, { createContext, useEffect, useState, type PropsWithChildren } from "react";
import toast from "react-hot-toast";
import type { AuthContextType, AuthUser } from "../@types";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthProvider: React.FC<PropsWithChildren> = ({children}) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = async (): Promise<void> => {
    try {
      const {data} = await axios.get("/api/auth/check");
      if(data.success){
        setAuthUser(data.user);
      }
    } catch (error: unknown) {
      const message = (error as Error).message || 'Произошла ошибка';
      toast.error(message);
      console.error(message);
    } finally {
      setLoading(false);
    }
  }

  const login = async (state: string, formData: {fullName?: string, email: string, password: string}): Promise<boolean> => {
    try {
      const {data} = await axios.post(`/api/auth/${state}`, formData);
      console.log(data)

      if(data.success){
        setAuthUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
      return data.success;
    } catch (error: unknown) {
      const message = (error as Error).message || 'Произошла ошибка';
      toast.error(message);
      console.error(message);
      return false;
    }
  }

  const logout = (): void => {
    try {
      setAuthUser(null);
      setToken(null);
      localStorage.removeItem('token');
    } catch (error: unknown) {
      const message = (error as Error).message || 'Произошла ошибка';
      toast.error(message);
      console.error(message);
    }
  }

  useEffect(() => {
    if(token){
      axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  }, [])

  const value: AuthContextType = {
    axios,
    token,
    authUser,
    loading,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}