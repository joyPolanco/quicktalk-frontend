import React, { useEffect, useRef, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import NoMessagesPlaceHolder from "./NoMessagesPlaceHolder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import Linkify from "linkify-react";
import GroupInfoPanel from "./GroupInfoPanel";
import { EllipsisIcon } from "lucide-react";
import MessageMenu from "./MessageMenu";

const ChatWindow = () => {
  const {
    selectedChat,
    getMessagesByChat,
    getChatEvents,
    messages,
    isMessagesLoading,
    allContacts,
    setMessages,
    updateChatInfo
  } = useChatStore();

  const { authUser, socket } = useAuthStore();
  const { typingUser, isTyping, setIsTyping, setTypingUser , isGroupInfoOpen, setIsGroupInfoOpen} = useChatStore();
  const messageEndRef = useRef(null);

const getDisplayName = (userId) => {
  if (!userId) return "Usuario";

  // 1. Buscar en contactos
  const contact = allContacts.find(
    (c) => String(c.recipient?._id) === String(userId)
  );

  if (contact?.saveAs) return contact.saveAs;

  // 2. Buscar en usersInfo del chat
  const userFromChat = selectedChat?.usersInfo?.find(
    (u) => String(u._id) === String(userId)
  );

  if (userFromChat) {
    return (
      userFromChat.fullName ||
      userFromChat.username ||
      userFromChat.phone ||
      "Usuario"
    );
  }

  return "Usuario";
};
  // 🔹 Función para formatear fechas (Hoy, Ayer, o fecha completa)
  const formatDateGroup = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (inputDate.getTime() === today.getTime()) {
      return "Hoy";
    } else if (inputDate.getTime() === yesterday.getTime()) {
      return "Ayer";
    } else {
      return inputDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  };

  // 🔹 Agrupar mensajes y eventos por fecha
  const groupedMessages = useMemo(() => {
    if (!messages.length) return {};

    const groups = {};
    
    messages.forEach((item) => {
      const dateKey = new Date(item.createdAt).toDateString();
      const displayDate = formatDateGroup(item.createdAt);
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          displayDate,
          items: []
        };
      }
      groups[dateKey].items.push(item);
    });

    return groups;
  }, [messages]);

  // 🔹 cargar mensajes + eventos
  useEffect(() => {
    if (!selectedChat?._id || !socket) return;

    const loadData = async () => {
      setMessages([]); // Limpiar mensajes al cambiar de chat
      
      const msgs = await getMessagesByChat(selectedChat._id);
      const events = await getChatEvents(selectedChat._id);

      const formattedMessages = (msgs || []).map((m) => ({
        ...m,
        type: "message",
      }));

     const formattedEvents = (events || []).map((e) => {
  const fromUser = e.from?._id ? e.from : { _id: e.from, fullName: "Usuario" };
  const toUser = e.to?._id ? e.to : (e.to ? { _id: e.to, fullName: "Usuario" } : null);

  const fromName = String(fromUser._id) === String(authUser._id) ? "Tú" : getDisplayName(fromUser._id);
  const toName = toUser
    ? String(toUser._id) === String(authUser._id)
      ? "ti"
      : getDisplayName(toUser._id)
    : null;

  let text = "";

  switch (e.type) {
    case "enter":
      text =
        String(fromUser._id) === String(authUser._id)
          ? "Te uniste al grupo"
          : `${fromName} se unió al grupo`;
      break;
    case "leave":
      text =
        String(fromUser._id) === String(authUser._id)
          ? "Saliste del grupo"
          : `${fromName} salió del grupo`;
      break;
    case "add":
      text =
        String(fromUser._id) === String(authUser._id)
          ? `Agregaste a ${toName}`
          : `${fromName} agregó a ${toName}`;
      break;
    case "delete":
      text =
        String(fromUser._id) === String(authUser._id)
          ? `Eliminaste a ${toName}`
          : `${fromName} eliminó a ${toName}`;
      break;
    case "update":
      text =
        String(fromUser._id) === String(authUser._id)
          ? "Cambiaste la información del grupo"
          : `${fromName} cambió la información del grupo`;
      break;
    default:
      text =
        String(fromUser._id) === String(authUser._id)
          ? "Realizaste una acción"
          : `${fromName} realizó una acción`;
  }

  return {
    _id: e._id || `event_${Date.now()}_${Math.random()}`,
    type: "event",
    text,
    createdAt: e.createdAt,
  };
});

      const combined = [...formattedMessages, ...formattedEvents].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      setMessages(combined);
    };

    loadData();

    socket.emit("join-chat", selectedChat._id);

    return () => {
      socket.emit("leave-chat", selectedChat._id);
    };
  }, [selectedChat, socket]);

  // 🔹 scroll automático
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Eventos de socket en tiempo real
  useEffect(() => {
    if (!selectedChat || !socket) return;

    const currentUserId = authUser?._id || authUser?.id;

    const handleTyping = ({ user }) => {
      if (String(user._id) !== String(currentUserId)) {
        setIsTyping(true);
        setTypingUser(user.fullName);
      }
    };

    const handleStopTyping = ({ user }) => {
      if (String(user._id) !== String(currentUserId)) {
        setIsTyping(false);
        setTypingUser(null);
      }
    };

    const handleNewMessage = ({ chatId, message }) => {
      if (chatId !== selectedChat._id) return;

      setMessages((prev) => [...prev, { ...message, type: "message" }]);
    };

    const handleDeleteMessage = ({ messageId }) => {
  setMessages((prev) =>
    prev.map((msg) =>
      msg._id === messageId
        ? { ...msg, isDeleted: true, text: "", images: [] }
        : msg
    )
  );
};


    const handleUserJoined = ({ chatId, user }) => {
      if (chatId !== selectedChat._id) return;

      const name = getDisplayName(user);

      const newEvent = {
        _id: `event_${Date.now()}_${Math.random()}`,
        type: "event",
        text: `${name} se unió al grupo`,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newEvent]);
    };

    const handleUserLeft = ({ chatId, user }) => {
      if (chatId !== selectedChat._id) return;

      const name = getDisplayName(user || user._id);

      const newEvent = {
        _id: `event_${Date.now()}_${Math.random()}`,
        type: "event",
        text: `${name} salió del grupo`,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newEvent]);
    };

   const handleUserUpdatedInfo = ({ chatId, user, displayName, profilePic }) => {
     updateChatInfo(chatId,displayName,profilePic)
      

         const name = getDisplayName( user._id|| user);

        const eventMessage = {
          _id: `event_${Date.now()}_${Math.random()}`,
          type: "event",
          text: `${name} actualizó la información del grupo`,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, eventMessage]);
      };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("new-message", handleNewMessage);
    socket.on("user-joined-group", handleUserJoined);
    socket.on("user-left-group", handleUserLeft);
    socket.on("delete-message", handleDeleteMessage);
   socket.on("user-updated-info", handleUserUpdatedInfo);
    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("new-message", handleNewMessage);
      socket.off("user-joined-group", handleUserJoined);
      socket.off("user-left-group", handleUserLeft);
      socket.off("delete-message", handleDeleteMessage);
      socket.off("user-updated-info", handleUserUpdatedInfo);

    };
  }, [selectedChat, socket, authUser, allContacts]);

  return (
    <>
      <div className="flex flex-col h-135">
        <ChatHeader />

        <div className="flex-1 px-4 sm:px-6 overflow-y-auto py-6">
          {isMessagesLoading ? (
            <MessagesLoadingSkeleton />
          ) : messages.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {Object.entries(groupedMessages).map(([dateKey, group]) => (
                <div key={dateKey}>
                  {/* Separador de fecha */}
                  <div className="flex justify-center my-4">
                    <div className="bg-slate-700/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-slate-300">
                      {group.displayDate}
                    </div>
                  </div>

                  {/* Mensajes y eventos de esa fecha */}
                  <div className="space-y-4">
                    {group.items.map((item) => {
                      // 🔹 EVENTO
                      if (item.type === "event") {
                        return (
                          <div
                            key={item._id}
                            className="text-center text-xs text-slate-400 my-2"
                          >
                            {item.text}
                          </div>
                        );
                      }

                      // 🔹 MENSAJE
                      const senderId =
                        typeof item.sender === "object"
                          ? item.sender?._id
                          : item.sender;

                      const userId = authUser?._id || authUser?.id;
                      const isMine = String(senderId) === String(userId);

                      return (
                        <div
                          key={item._id}
                          className={`flex ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div className="relative max-w-[80%]">
                           
                            <div
                            
                              className={`rounded-2xl p-3 shadow-sm ${
                                isMine
                                  ? "bg-cyan-600 text-white"
                                  : "bg-slate-800 text-slate-200"
                              }`}
                            >
                              {!isMine && (
                                <div className="text-xs text-slate-400 mb-1">
                                  {getDisplayName(senderId)}
                                </div>
                              )}                             
      

                            {isMine && (
                        <div className="absolute top-1 right-1">
                          <MessageMenu text={item.text} id={item._id} />
                        </div>
)}
                           {item.isDeleted ? (
  <p className="italic text-sm text-slate-400">
    {isMine ? "Eliminaste este mensaje" : "Este mensaje fue eliminado"}
  </p>
                              ) : (
                                <>
                                  {item.text && (
                                    <p className="mb-2 break-words whitespace-pre-wrap">
                                      <Linkify
                                        options={{
                                          target: "_blank",
                                          rel: "noopener noreferrer",
                                          className: "text-blue-300 underline break-all",
                                        }}
                                      >
                                        {item.text}
                                      </Linkify>
                                    </p>
                                  )}

                                  {item.images?.length > 0 && (
                                    <div className="grid gap-2 grid-cols-2">
                                      {item.images.map((img, i) => (
                                        <img
                                          key={i}
                                          src={img}
                                          alt="shared"
                                          className="rounded-lg object-cover w-full h-32"
                                        />
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                              <p className="text-xs mt-1 opacity-75 text-right">
                                {new Date(item.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>

                            <div
                              className={`absolute top-3 w-0 h-0 border-y-[6px] border-y-transparent ${
                                isMine
                                  ? "right-[-5px] border-l-[6px] border-l-cyan-600"
                                  : "left-[-6px] border-r-[6px] border-r-slate-800"
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* typing */}
              {isTyping && (
                <div className="text-sm text-slate-400 italic">
                  {selectedChat?.type === "group"
                    ? `${typingUser} está escribiendo...`
                    : "Escribiendo..."}
                </div>
              )}
                 {console.log(messages)}
              <div ref={messageEndRef} />
            </div>
          ) : (
            <NoMessagesPlaceHolder name={selectedChat?.displayName} />
          )}
        </div>
      </div>

      <MessageInput />
    <GroupInfoPanel></GroupInfoPanel>
    </>
  );
};

export default ChatWindow;