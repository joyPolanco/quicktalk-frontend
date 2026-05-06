import React, { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Users } from "lucide-react";

const CreateGroupModal = () => {
  const {
    allContacts,
    isCreateGroupChatWindowOpen,
    setCreateGroupChatWindowOpen,
    setAnyPopupOpen,
    createGroup
  } = useChatStore();

  const [groupName, setGroupName] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const toggleContact = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId],
    );
  };

  if (!isCreateGroupChatWindowOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      {/* MODAL */}
      <div className="w-full max-w-md bg-slate-900 rounded-2xl p-5 shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Users size={18} />
            Crear grupo
          </div>

          <button
            onClick={() => {
              setCreateGroupChatWindowOpen(false);

              setAnyPopupOpen(false);
            }}
            className="text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* INPUT NOMBRE */}
        <input
          type="text"
          placeholder="Nombre del grupo (máx 40 caracteres)"
          maxLength={40}
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg mb-4 outline-none"
        />

        {/* CONTACTOS */}
<div className="flex flex-col gap-2 max-h-64 overflow-y-auto scroll-smooth custom-scroll">          {allContacts.length>0 && allContacts?.map((contact) => {
            const name =
              contact.saveAs ||
              contact.recipient?.fullName ||
              contact.recipient?.username ||
              "Sin nombre";

            const id = contact.recipient?._id;
            const isSelected = selectedContacts.includes(id);

            return (
              <div
                key={contact._id}
                onClick={() => toggleContact(id)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition
                  ${isSelected ? "bg-blue-600" : "bg-slate-800 hover:bg-slate-700"}
                `}
              >
                {/* INFO */}
                <span className="text-white text-sm truncate max-w-[200px]">
                  {name}
                </span>

                {/* CHECK */}
                <div
                  className={`w-4 h-4 rounded-full border ${
                    isSelected ? "bg-white" : "border-slate-500"
                  }`}
                />
              </div>
            );
          })}
          {allContacts?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
              <Users size={32} className="mb-2 opacity-70" />

              <p className="text-sm">No hay contactos disponibles</p>

              <span className="text-xs mt-1">
                Agrega contactos para crear un grupo
              </span>
            </div>
          )}
        </div>

        {/* BOTÓN CREAR */}
        <button 
          onClick={() => {
          createGroup({
            groupName,
            participants: selectedContacts
          });
        }}
          disabled={groupName.length === 0 || selectedContacts.length === 0}
          className="w-full mt-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 rounded-lg transition"
        >
          Crear grupo
        </button>
      </div>
    </div>
  );
};

export default CreateGroupModal;
