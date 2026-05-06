import React, { useState } from "react";
import { axiosInstance } from "../lib/axios.js";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";

const LeaveChatModal = ({onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const {setIsLeaveChatOpen,setSelectedChat, setMessages,setAnyPopupOpen, selectedChat, getAllChats} = useChatStore()
  const {disconnectSocket} = useAuthStore()
   const handleLeave = async () => {
    try {
      setLoading(true);
      setError("");
    console.log(selectedChat._id,"isss")

      await axiosInstance.post(`/chats/${selectedChat._id}/leave`);
      if (onSuccess) onSuccess();

      onClose();
    } catch (err) {
        console.log(err)
      setError("No se pudo salir del chat");
    } finally {
      setLoading(false);
    }
  };

  const onSuccess = ()=>{
    setAnyPopupOpen(false)
    setIsLeaveChatOpen(false)
    setMessages([]);
    setSelectedChat(null);
    getAllChats()

  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 p-6 rounded-xl w-full max-w-sm text-center">

        <h2 className="text-lg font-semibold text-white">
          Salir del grupo
        </h2>

        <p className="text-slate-400 mt-2">
          ¿Seguro que quieres salir de{" "}
          <span className="text-white font-medium">
            {selectedChat.displayName || "este chat"}
          </span>
          ?
        </p>

        {error && (
          <p className="text-red-400 text-sm mt-3">{error}</p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={()=>{setIsLeaveChatOpen(false)
   

                setAnyPopupOpen(false)
            }}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg"
          >
            Cancelar
          </button>

          <button
            onClick={handleLeave}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg text-white ${
              loading
                ? "bg-red-800"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Saliendo..." : "Salir"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveChatModal;