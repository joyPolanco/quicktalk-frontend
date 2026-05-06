import { Users, LogOut, LinkIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import LeaveChatModal from "./LeaveChatModal";

const GroupOptionsMenu = ({ onClose }) => {
  const ref = useRef(null);

  const { setIsShareLinkOpen, selectedChat,setIsLeaveChatOpen, setAnyPopupOpen,setIsGroupInfoOpen } = useChatStore();

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <>
      <div
        ref={ref}
        className="absolute right-6 top-14 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-50"
        onMouseLeave={() => onClose()}
      >
        <div className="flex flex-col text-sm text-slate-200">

          <button
            className="flex items-center gap-2 px-4 py-3 hover:bg-slate-700 transition"
            onClick={()=>setIsGroupInfoOpen(true)}
          >
            <Users size={16} />
            Ver info
          </button>

          <button
            className="flex items-center gap-2 px-4 py-3 hover:bg-slate-700 transition"
            onClick={() => setIsShareLinkOpen(true)}
          >
            <LinkIcon size={16} />
            Compartir link
          </button>

          <button
            className="flex items-center gap-2 px-4 py-3 hover:bg-slate-700 transition text-red-400"
            onClick={() => {
          setIsLeaveChatOpen(true)
          setAnyPopupOpen(true)
            }}
          >
            <LogOut size={16} />
            Salir del grupo
          </button>

        </div>
      </div>

   
    </>
  );
};

export default GroupOptionsMenu;