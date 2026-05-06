import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import UsersLoadingSkeleton from "./UserLoadingSkeleton";
import { useChatStore } from "../store/useChatStore";
import avatar from "../assets/avatar.png";
import groupAvatar from "../assets/groupAvatar.svg";

import { MessageCirclePlusIcon } from "lucide-react";
import { useState } from "react";
import { useMemo } from "react";

function ChatsList() {
  const { getAllChats, chats, isChatsLoading, setSelectedChat,setCreateChatWindowOpen } =
    useChatStore();

  const { onlineUsers, authUser, socket } = useAuthStore();

  const currentUserId = String(authUser?.id || authUser?._id);
   const [filter, setFilter] = useState("all"); 

   // "all", "groups", "private"
  // 🔹 cargar chats
  useEffect(() => {
    getAllChats();
  
  
  
  }, []);

const filteredChats = useMemo(() => {
  return chats.filter(chat =>{
    if(filter === "groups") return chat.type === "group";
    if(filter === "private") return chat.type === "private";
    return true; // all 
  }
  );
}, [chats, filter]);


  // 🔹 escuchar mensajes en vivo (solo actualizar chats)
  useEffect(() => {
    if (!socket) return;

    socket.on("new-message", ({ chatId, message }) => {
      useChatStore.setState((state) => {
        const updatedChats = state.chats.map((chat) =>
          chat._id === chatId
            ? { ...chat, lastMessage: message }
            : chat
        );

        updatedChats.sort(
          (a, b) =>
            new Date(b.lastMessage?.createdAt || 0) -
            new Date(a.lastMessage?.createdAt || 0)
        );

        return { chats: updatedChats };
      });
    });

    return () => {
      socket.off("new-message");
    };
  }, [socket]);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!authUser) return null;
  if (isChatsLoading) return <UsersLoadingSkeleton />;

  if (!chats?.length) {
    return (
      <p className="text-slate-400 text-center mt-4">
        No hay chats disponibles
      </p>
    );
  }

  return (
    <>
 <div className="flex justify-center items-center border-b border-slate-700/50 gap-3 py-2">
  <div className="flex gap-2 bg-slate-800/50 p-1 rounded-full">

    <button
      onClick={() => setFilter("all")}
      className={`px-4 py-1.5 rounded-full text-sm transition ${
        filter === "all"
          ? "bg-cyan-500 text-white shadow"
          : "text-slate-400 hover:bg-slate-700"
      }`}
    >
      Todos
    </button>

    <button
      onClick={() => setFilter("groups")}
      className={`px-4 py-1.5 rounded-full text-sm transition ${
        filter === "groups"
          ? "bg-cyan-500 text-white shadow"
          : "text-slate-400 hover:bg-slate-700"
      }`}
    >
      Grupos
    </button>

    <button
      onClick={() => setFilter("private")}
      className={`px-4 py-1.5 rounded-full text-sm transition ${
        filter === "private"
          ? "bg-cyan-500 text-white shadow"
          : "text-slate-400 hover:bg-slate-700"
      }`}
    >
      Privados
    </button>

  </div>

<button onClick={() => setCreateChatWindowOpen(true)} >
    <MessageCirclePlusIcon className="text-slate-300"></MessageCirclePlusIcon>

</button>
    

</div>

      {filteredChats.map((chat) => {
        const isGroup = chat.type === "group";

        let otherUser = null;

        if (!isGroup) {
          const otherParticipant = chat.participants?.find(
            (p) => String(p.userId) !== currentUserId
          );

          otherUser = chat.usersInfo?.find(
            (u) => String(u._id) === String(otherParticipant?.userId)
          );
        }
        const isOnline =
          !isGroup && otherUser
            ? onlineUsers.map(String).includes(String(otherUser._id))
            : false;

      
        const displayName = isGroup
          ? chat.displayName || "Grupo"
          : otherUser?.fullName || "Usuario";

        const profilePic = isGroup
          ? chat.profilePic || groupAvatar
          : otherUser?.profilePic || avatar;

        // 🔹 lógica del último mensaje
        const lastMessage = chat.lastMessage;

        const isMyLastMessage =
          lastMessage &&
          String(lastMessage.sender) === currentUserId;

        return (
          <div
            key={chat._id}
            onClick={() => setSelectedChat(chat)}
            className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={profilePic}
                  className="size-12 rounded-full object-cover"
                />

                {isOnline && !isGroup && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-slate-200 truncate">
                  {displayName}
                </h4>

                {/* 🔹 Último mensaje + hora */}
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-xs truncate ${
                      isMyLastMessage
                        ? "text-cyan-400"
                        : "text-slate-400"
                    }`}
                  >
                    {lastMessage
                      ? `${isMyLastMessage ? "Tú: " : ""}${
                          lastMessage.text || "[imagen]"
                        }`
                      : "Sin mensajes"}
                  </p>

                  {lastMessage && (
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {formatTime(lastMessage.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default ChatsList;