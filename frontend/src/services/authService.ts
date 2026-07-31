import api from "@/lib/axios";

export const authService = {
  signUp: async (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
  ) => {
    const res = await api.post(
      "auth/signup",
      { username, password, email, firstName, lastName },
      { withCredentials: true },
    );

    return res.data;
  },

  signIn: async (username: string, password: string) => {
    const res = await api.post(
      "/auth/signin",
      { username, password },
      { withCredentials: true },
    );

    if (res.data.refreshToken) {
      localStorage.setItem("refreshToken", res.data.refreshToken);
    }

    return res.data;
  },
  signOut: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    localStorage.removeItem("refreshToken");
    return api.post("/auth/signout", { refreshToken }, { withCredentials: true });
  },

  fetchMe: async () => {
    const res = await api.get("users/me", { withCredentials: true });
    return res.data.user;
  },

  refresh: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const res = await api.post(
      "/auth/refresh",
      { refreshToken },
      { withCredentials: true },
    );
    return res.data.accessToken;
  },
};
