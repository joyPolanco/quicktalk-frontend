import React, { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import noImage from "../assets/groupAvatar.svg";
import { X } from "lucide-react";
import { axiosInstance } from "../lib/axios";

const GroupInfoPanel = () => {
  const { selectedChat, isGroupInfoOpen, setIsGroupInfoOpen, setMessages } = useChatStore();
  const [groupName, setGroupName] = useState(selectedChat?.displayName || "");
  const [groupPicPreview, setGroupPicPreview] = useState(selectedChat?.profilePic || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showChange, setShowChange]= useState(false)
  if (!selectedChat) return null;
  const users = selectedChat.usersInfo || [];

  // Detectar cambios
  useEffect(() => {
    if (
      groupName !== (selectedChat.displayName || "") ||
      selectedFile
    ) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [groupName, selectedFile, selectedChat.displayName]);

  const handleFileChange = (file) => {
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setGroupPicPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("displayName", groupName);
    if (selectedFile) formData.append("profilePic", selectedFile);

    try {
      const res = await axiosInstance.put(`/chats/${selectedChat._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.conversation === selectedChat._id ? { ...msg, ...res.data } : msg
        )
      );

      setSelectedFile(null);
      setHasChanges(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {isGroupInfoOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsGroupInfoOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-slate-900 z-50 shadow-xl transform transition-transform duration-300 ${
          isGroupInfoOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-white font-semibold">Info del grupo</h2>
          <button onClick={() => setIsGroupInfoOpen(false)}>
            <X className="text-slate-400 hover:text-white" size={18} />
          </button>
        </div>

        <div className="p-4 flex flex-col items-center" onMouseEnter={()=>setShowChange(true)} onMouseLeave={()=>setShowChange(false)}>
          {/* Avatar editable */}
          <label className="cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="hidden"
            />
            <img
              src={groupPicPreview || noImage}
              alt="group"
              className="w-20 h-20 rounded-full object-cover mb-3 transition-transform duration-200 hover:scale-105"
            />
            {/* Indicador para usuario */}
            {!selectedFile &&showChange&& (
              <div className="absolute bottom-6 right-2 bg-cyan-600 text-white text-xs px-2 py-1 rounded-full opacity-80">
                Cambiar
              </div>
            )}
          </label>

          {/* Nombre editable */}
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full text-center bg-slate-800 text-white px-3 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          {/* Botón aparece solo si hay cambios */}
          {hasChanges && (
            <button
              onClick={handleSave}
              className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition-colors duration-200"
            >
              Guardar cambios
            </button>
          )}
        </div>

        {/* Lista de integrantes */}
        <div className="px-4 pb-4">
          <h4 className="text-slate-400 text-sm mb-2">
            Participantes ({users.length})
          </h4>
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
            {users.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800"
              >
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white">
                    {user.fullName?.charAt(0)?.toUpperCase() ||
                      user.phone?.charAt(0)}
                  </div>
                )}
                <div className="text-sm text-white">
                  {user.fullName || user.username || user.phone}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupInfoPanel;