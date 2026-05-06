import React, { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import useSendSound from "../hooks/useSendSound";
import toast from "react-hot-toast";
import { CircleMinus, Paperclip, PaperclipIcon, SendIcon, SmilePlusIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import EmojiPicker from 'emoji-picker-react';
import { useEffect } from "react";
const MessageInput = () => {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]); // múltiples imágenes
  const fileInputRef = useRef(null);
  const {authUser,socket} = useAuthStore();
  const {selectedChat} = useChatStore();
  const typingTimeoutRef = useRef(null);
  
  const { sendMessage, isSoundEnabled, isSendingMessage } = useChatStore();
  const { play } = useSendSound();
   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const pickerRef = useRef(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    console.log("Sending message:", { text, images });

    if (!text.trim() && images.length === 0) return;

    await sendMessage({
      message: text,
      images, // enviar array
    });

    if (isSoundEnabled) play();



  socket.emit("new-message", {
  chatId: selectedChat._id,
  message: { text, images }
});
    // limpiar
    setText("");
    setImages([]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    if (images.length + files.length > 5) {
      toast.error("Máximo 5 imágenes");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    const validFiles = files.filter((file) => {
      if (!validTypes.includes(file.type)) {
        toast.error(`Formato no válido: ${file.name}`);
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Imagen muy pesada: ${file.name}`);
        return false;
      }

      return true;
    });

    setImages((prev) => [...prev, ...validFiles].slice(0, 5));

    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };


  const handleTyping = (e) => {
    const value = e.target.value;
    setText(value);

    if (!selectedChat?._id) return;
    console.log("Emitiendo evento typing para chatId:", selectedChat._id);
    socket.emit("typing", {
      chatId: selectedChat._id,
    });

    // limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // esperar para stopTyping
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        chatId: selectedChat._id,
      });
    }, 1200);
  };
useEffect(() => {
  const handleClickOutside = (event) => {
    if (pickerRef.current && !pickerRef.current.contains(event.target)) {
      setShowEmojiPicker(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  return (
    <form
      onSubmit={handleSendMessage}
      className="p-4 border-t border-slate-700"
    >
      {/* PREVIEW */}
      {images.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {images.map((img, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(img)}
                alt="preview"
                className="w-16 h-16 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full px-1"
              >
                <CircleMinus />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* INPUT */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={handleTyping}

           

          
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 outline-none"
        />

        {/* BOTÓN IMAGEN */}
        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="px-3 py-2 bg-slate-700 rounded-lg"
        >
          <PaperclipIcon></PaperclipIcon>
        </button>

        <button onClick={()=>setShowEmojiPicker(prev=>!prev)}>
          <SmilePlusIcon></SmilePlusIcon>
        </button>
        {
          showEmojiPicker && (
            <div className="absolute bottom-16 right-4 bg-slate-800 p-2 rounded-lg shadow-lg z-50"   ref={pickerRef}
 >
              <EmojiPicker theme={"dark"} emojiStyle={"native"} onEmojiClick={(emojiObject) =>
                setText((prev) => prev + emojiObject.emoji)
                } ></EmojiPicker>
            </div>
          )

        }



        {/* BOTÓN ENVIAR */}
        <button
          type="submit"
          className={
            `px-4 py-2 bg-cyan-500 text-white rounded-lg` +
            (isSendingMessage ? "disabled" : "")
          }
        >
          <SendIcon />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
