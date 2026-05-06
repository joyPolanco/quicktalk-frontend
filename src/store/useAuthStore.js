import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";
import {io} from "socket.io-client"


export const useAuthStore = create((set,get) => ({
  authUser: null,
  isLoggingIn: false,
  isCheckingAuth: true,
  selectedImg: null,
  socket: null,
  onlineUsers: [],
isSetPhoneOpen:false,
setIsSetPhoneOpen:(value)=>{
  set({isSetPhoneOpen:value})
},
  setSelectedImg: (img) => set({ selectedImg: img }),
   setOnlineUsers:(users)=>{
    set({onlineUsers:users})
   },
  checkAuth: async () => {
  try {
    const res = await axiosInstance.get("/auth/check");
    set({ authUser: res.data });

    get().connectSocket();

  } catch (error) {
    set({ authUser: null });
  } finally {
    set({ isCheckingAuth: false });
  }
},
  isSigningUp: false,

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });

      toast.success("Account created successfully!");
            get().connectSocket();

    } catch (error) {
      const data = error.response?.data;
      if (data?.errors?.length) {
        data.errors.forEach((err) => toast.error(`${err.message}`));
      } else {
        toast.error(data?.message || "Error");
      }
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      console.log("Login successful, user data:", res.data);
      toast.success("Logged in successfully!");
      get().connectSocket();
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors?.length) {
        data.errors.forEach((err) => toast.error(`${err.message}`));
      } else {
        toast.error(data?.message || "Error");
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully!");
      get().disconnectSocket();

    } catch (error) {
      console.log("Error logging out:", error);
      toast.error("Error logging out");
    }
  },
  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.log("Error updating profile:", error.response?.data || error);
      toast.error("Error updating profile");
      set({ selectedImg: null });
    }
    
  },
uploadProfilePic: async (image) => {
  try {
    const res = await axiosInstance.put("/auth/profile-picture", {
      profilePic: image,
    });

    set({ authUser: res.data });

    toast.success("Foto actualizada");
  } catch (error) {
    toast.error("Error subiendo imagen");
  }
}
  ,
  connectSocket : ()=>{
    const {authUser} = get();
    if(!authUser|| get().socket?.connected) return

    const socket= io(import.meta.env.VITE_CLIENT_URL, {withCredentials:true})
     socket.connect();

     set({socket:socket})
     console.log("Socket conectado:", socket);

     //list for events

     socket.on("getOnlineUsers", (userIds)=>
      set({onlineUsers:userIds})
    )
  },
  disconnectSocket: ()=>{
    if(get().socket?.connected)get().socket.disconnect()
  },

verifyPhone: async (token) => {
  try {
    const res = await axiosInstance.post("/auth/verify-phone", { token });
          console.log(token)
    set({ authUser: res.data.user });

    toast.success("Número verificado correctamente");

  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Error al verificar el número";

    console.log("Error verifying phone:", error.response?.data || error);

    if (message.includes("ya está registrado")) {
      toast.error("Ese número ya está en uso");
    } else if (message.includes("Token inválido")) {
      toast.error("El código expiró o es inválido");
    } else if (message.includes("no contiene número")) {
      toast.error("Error con la verificación del número");
    } else {
      toast.error(message);
    }
  }
}
}));
