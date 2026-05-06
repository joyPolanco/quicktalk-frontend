import React, { useState } from "react";
import { MessageCircle, MoreVertical } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const ContactCard = ({ contact }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { createChat, isChatCreating } = useChatStore();

  const handleCreateChat = async () => {
    if (isChatCreating) return;

    await createChat(contact.recipient?._id);
    setIsMenuOpen(false);
  };

  const displayName =
    contact.saveAs ||
    contact.recipient?.fullName ||
    contact.recipient?.username ||
    "Sin nombre";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <li className="flex items-center justify-between p-3 hover:bg-slate-900 rounded-xl transition relative">

      {/* Info contacto */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-white font-semibold">
          {initial}
        </div>

        <span className="text-slate-300 font-medium">
          {displayName}
        </span>
      </div>

      {/* Menú */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1 hover:bg-slate-700 rounded"
        >
          <MoreVertical size={18} />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border z-10">

            <button
              onClick={handleCreateChat}
              disabled={isChatCreating}
              className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
            >
              <MessageCircle size={16} />
              {isChatCreating ? "Creando..." : "Mensaje"}
            </button>

          </div>
        )}
      </div>
    </li>
  );
};

export default ContactCard;