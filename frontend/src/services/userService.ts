import api from "@/lib/axios";

export const userService = {
  uploadAvatar: async (formData: FormData) => {
    const res = await api.post("/users/uploadAvatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.status === 400) {
      throw new Error(res.data.message);
    }

    return res.data;
  },

  addPassword: async (password: string) => {
    const res = await api.post("/users/add-password", { password });

    return res.data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const res = await api.post("/users/change-password", {
      oldPassword,
      newPassword,
    });
    return res.data;
  },

  updateProfile: async (displayName: string, phone: string, bio: string) => {
    const res = await api.put("/users/update-profile", {
      displayName,
      phone,
      bio,
    });

    return res.data;
  },
};
