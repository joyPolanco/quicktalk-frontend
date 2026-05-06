import { MessagesSquare } from "lucide-react";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    isAnyPopupOpen: false,
    isAddContactPopupOpen: false,
    isConfigurationOpen: false,
    setConfigurationOpen: (value) => {
        set({ isConfigurationOpen: value });
    },
    setAddContactPopupOpen: (value) => {
        set({ isAddContactPopupOpen: value });
    },
    setAnyPopupOpen: (value) => {
        set({ isAnyPopupOpen: value });
    },
    setMessages: (messages) => {
        if (typeof messages === "function") {
            set((state) => ({ messages: messages(state.messages) }));
        } else {
            set({ messages });
        }
    },
    allContacts: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedChat: null,
    isContactsLoading: false,
    isChatsLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === "true" || false,
    
    
    toggleSound: () => {
        localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
        set({ isSoundEnabled: !get().isSoundEnabled });
    },
    setActiveTab: (tab) => {
        set({ activeTab: tab });
    },
    setSelectedChat: (chat) => {
        set({ selectedChat: chat });
    },

    getAllContacts: async () => {
        set({ isContactsLoading: true });
        try {
            const res = await axiosInstance.get("/contacts/");
            console.log("Contacts fetched:", res.data);
            set({ allContacts: res.data });
        } catch (error) {
            console.log("Error fetching contacts", error);
        } finally {
            set({ isContactsLoading: false });
        }
    },
    setContacts: (contacts) => {
        set({ allContacts: contacts });
    },
    getAllChats: async () => {
        set({ isChatsLoading: true });
        try {
            const authUser = useAuthStore.getState().authUser;
            const res = await axiosInstance.get(`/chats`);
            set({ chats: res.data });
            console.log("Chats fetched for user", authUser.username, res.data);
        } catch (error) {
            console.log("Error fetching chats", error);
        } finally {
            set({ isChatsLoading: false });
        }
    },
    getMessagesByChat: async (chatId) => {
        try {
            set({ isMessagesLoading: true });
            const res = await axiosInstance.get(`/chats/${chatId}/messages`);
            set({ messages: res.data });
            return res.data; // ✅ RETORNAR los mensajes
        } catch (error) {
            console.log("Error fetching messages", error);
            return []; // ✅ Retornar array vacío en caso de error
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    isChatCreating: false,

    createChat: async (recipientId) => {
        if (get().isChatCreating) return;

        try {
            set({ isChatCreating: true });

            const res = await axiosInstance.post("/chats", {
                userId: recipientId,
            });

            set({ selectedChat: res.data });
            return res.data; // ✅ Opcional: retornar el chat creado

        } catch (error) {
            console.log("Error creating chat", error);
        } finally {
            set({ isChatCreating: false });
        }
    },
    createGroup: async ({ participants, groupName }) => {
        if (get().isChatCreating) return;

        try {
            set({ isChatCreating: true });

            const res = await axiosInstance.post("/chats/groups", {
                participants,
                groupName
            });

            set((state) => ({
                chats: [res.data, ...state.chats]
            }));

            set({ selectedChat: res.data });

            return res.data; // ✅ Opcional: retornar el grupo creado

        } catch (error) {
            console.log("Error creating group", error);
        } finally {
            set({ isChatCreating: false });
        }
    },

    isSendingMessage: false,
    sendMessage: async ({ message, images }) => {
        const { selectedChat } = get();

        const formData = new FormData();
        formData.append("message", message || "");

        images.forEach((img) => {
            formData.append("images", img);
        });

        const tempMessage = {
            _id: Date.now().toString(),
            sender: useAuthStore.getState().authUser.id || useAuthStore.getState().authUser._id,
            text: message,
            images: [],
            createdAt: new Date().toISOString(),
            isTemp: true,
        };

    
        try {
            const response = await axiosInstance.post(
                `/chats/${selectedChat._id}/messages`,
                formData,
                { withCredentials: true }
            );

            const realMessage = response.data.data;

            set((state) => ({
                messages: state.messages.map((msg) =>
                    msg._id === tempMessage._id ? realMessage : msg
                ),
            }));

            return realMessage;

        } catch (error) {
            console.log("Error enviando mensaje", error);

            set((state) => ({
                messages: state.messages.filter((m) => m._id !== tempMessage._id),
            }));
            
            throw error;
        }
    },
    isTyping: false,
    typingUser: null,
    setTypingUser: (user) => {
        set({ typingUser: user });
    },
    setIsTyping: (value) => {
        set({ isTyping: value });
    },
    isCreateChatWindowOpen: false,
    setCreateChatWindowOpen: (value) => {
        set({ isCreateChatWindowOpen: value });
    },
    isCreateGroupChatWindowOpen: false,
    setCreateGroupChatWindowOpen: (value) => {
        set({ isCreateGroupChatWindowOpen: value });
    },

    generateInviteLink: async (chatId) => {
        try {
            const res = await axiosInstance.get(`/chats/${chatId}/invite-link`);
            return res.data;
        } catch (error) {
            console.log("Error generating invite link", error);
            return null;
        }
    },
    isShareLinkOpen: false,
    setIsShareLinkOpen: (value) => {
        set({ isShareLinkOpen: value });
    },

    chatEvents: null,
    getChatEvents: async (id) => {
        try {
            const res = await axiosInstance.get(`/chats/${id}/events`);
            set({ chatEvents: res.data });
            return res.data;
        } catch (error) {
            console.log("Error obteniendo los eventos:", error);
            return []; 
        }
    }

    ,

    isLeaveChatOpen: false,
    setIsLeaveChatOpen: (value)=>{

      set({
        isLeaveChatOpen: value
      })
    },
    isGroupInfoOpen: false,
    setIsGroupInfoOpen: (value)=>{
    set({isGroupInfoOpen:value})
    },


  updateChatInfo: (chatId, displayName, profilePic) => {
  set((state) => {
    // Actualizar la lista de chats
    const updatedChats = state.chats.map((chat) =>
      chat._id === chatId
        ? { ...chat, displayName, ...(profilePic && { profilePic }) }
        : chat
    );

    const updatedSelectedChat =
      state.selectedChat?._id === chatId
        ? { ...state.selectedChat, displayName, ...(profilePic && { profilePic }) }
        : state.selectedChat;

    return {
      chats: updatedChats,
      selectedChat: updatedSelectedChat,
    };
  });
},
}));