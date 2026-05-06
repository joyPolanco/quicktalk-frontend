import React, { useEffect, useState, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import LoadingDots from "./LoadingDots";
import { PlusIcon, X, MessageCircle } from "lucide-react";

const CreateChatWindow = () => {
  const {
    getAllContacts,
    allContacts,
    isContactsLoading,
    setAnyPopupOpen,
    setCreateGroupChatWindowOpen,
    setCreateChatWindowOpen,
    createChat,
    isChatCreating
  } = useChatStore();

  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  const filteredContacts = useMemo(() => {
    if (!allContacts) return [];

    const term = search.toLowerCase();

    return allContacts.filter((contact) => {
      const name =
        contact.saveAs ||
        contact.recipient?.fullName ||
        contact.recipient?.username ||
        "";

      return name.toLowerCase().includes(term);
    });
  }, [search, allContacts]);

  const handleCreateChat = async (contact) => {
    if (isChatCreating) return;

    await createChat(contact.recipient?._id);
  };

  return (
    <div className="h-full flex flex-col p-3 w-md relative">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">

        <h2 className="text-lg font-semibold text-white">
          Crear chat
        </h2>

        <button
          onClick={() => {
            setCreateChatWindowOpen(false);
            setAnyPopupOpen(false);
          }}
          className="text-slate-400 hover:text-white transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* BOTÓN CREAR GRUPO */}
      <div className="mb-3">
        <button
          onClick={() => {
            setCreateGroupChatWindowOpen(true);
            setAnyPopupOpen(true);
          }}
          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition flex items-center gap-2 text-sm w-full justify-center"
        >
          <PlusIcon size={16} />
          Crear grupo
        </button>
      </div>

      {/* LISTA DE CONTACTOS */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">

        {isContactsLoading ? (
          <LoadingDots />
        ) : (
          filteredContacts.map((contact) => {
            const displayName =
              contact.saveAs ||
              contact.recipient?.fullName ||
              contact.recipient?.username ||
              "Sin nombre";

            const initial = displayName.charAt(0).toUpperCase();

            return (
              <div
                key={contact._id}
                className="flex items-center justify-between p-3 hover:bg-slate-900 rounded-xl transition"
              >

                {/* INFO */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {initial}
                  </div>

                  <span className="text-slate-300 font-medium">
                    {displayName}
                  </span>
                </div>

                {/* BOTÓN CHAT */}
                <button
                  onClick={() => {handleCreateChat(contact)

                    setCreateChatWindowOpen(false);
                  }}
                  disabled={isChatCreating}
                  className="p-2 hover:bg-slate-700 rounded-lg transition"
                >
                  <MessageCircle size={18} className="text-slate-300" />
                </button>

              </div>
            );
          })
        )}

      </div>
    </div>
  );
};

export default CreateChatWindow;