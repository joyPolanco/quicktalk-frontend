import { XIcon, MoreVertical } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
import avatar from "../assets/avatar.png";
import GroupOptionsMenu from "./GroupOptionsMenu";

function ChatHeader() {
  const { selectedChat, setSelectedChat, allContacts } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!selectedChat) return null;

  const currentUserId = authUser?._id || authUser?.id;

  // ----------- USUARIO PRIVADO -----------
  const otherUserId =
    selectedChat.type === "private"
      ? selectedChat.participants?.find(
          (p) => String(p.userId) !== String(currentUserId)
        )?.userId
      : null;

  const otherUser = selectedChat.usersInfo?.find(
    (u) => String(u._id) === String(otherUserId)
  );

  const isOnline =
    selectedChat.type === "private" &&
    otherUser &&
    onlineUsers.includes(otherUser._id);

  // ----------- NOMBRE E IMAGEN -----------
  const imageSrc =
    selectedChat.type === "group"
      ? selectedChat.profilePic || avatar
      : otherUser?.profilePic || avatar;

  const displayName =
    selectedChat.type === "group"
      ? selectedChat.displayName
      : otherUser?.fullName || "Usuario";

  // ----------- MIEMBROS GRUPO -----------
  const groupMembersText =
    selectedChat.type === "group"
      ? (() => {
          const members = selectedChat.usersInfo || [];

          const formatted = members.map((user) => {
            // si es el usuario actual
            if (String(user._id) === String(currentUserId)) return "Tú";

            // buscar en contactos guardados
            const contact = allContacts.find(
              (c) => String(c.recipient?._id) === String(user._id)
            );

            return (
              contact?.saveAs ||
              user.fullName ||
              user.phone ||
              "Sin nombre"
            );
          });

          const firstThree = formatted.slice(0, 3);
          const remaining = formatted.length > 3;

          return `${firstThree.join(", ")}${
            remaining ? "..." : ""
          }`;
        })()
      : null;

  return (
    <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 px-6 py-3 relative">
      
      {/* IZQUIERDA */}
      <div className="flex items-center space-x-3">
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-12 rounded-full">
            <img src={imageSrc} alt={displayName} />
          </div>
        </div>

        <div>
          <h3 className="text-slate-200 font-medium">
            {displayName}
          </h3>

          <p className="text-slate-400 text-sm">
            {selectedChat.type === "private"
              ? isOnline
                ? "En línea"
                : "Fuera de línea"
              : groupMembersText}
          </p>
        </div>
      </div>

      {/* DERECHA */}
      <div className="flex items-center gap-2">
        
          <button onClick={() => setSelectedChat(null)}>
          <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200" />
        </button>
        
        {/* SOLO PARA GRUPOS */}
        {selectedChat.type === "group" && (
          <>
            <button onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(true);
            }}>
              <MoreVertical className="w-5 h-5 text-slate-400 hover:text-white" />
            </button>

            {isMenuOpen && (
              <GroupOptionsMenu onClose={() => setIsMenuOpen(false)} />
            )}
          </>
        )}

      
      </div>
    </div>
  );
}

export default ChatHeader;