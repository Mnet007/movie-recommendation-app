import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return apiRequest("POST", "/api/auth/login", { email, password });
  },

  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    return apiRequest("POST", "/api/auth/register", { username, email, password });
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  },

  getToken: (): string | null => {
    return localStorage.getItem("auth_token");
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  setAuth: (token: string, user: User) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  isAuthenticated: (): boolean => {
    return !!authApi.getToken();
  }
};