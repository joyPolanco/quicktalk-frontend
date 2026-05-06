import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";

const ShareLinkModal = () => {
  const { 
    generateInviteLink, 
    isShareLinkOpen, 
    setIsShareLinkOpen, 
    setAnyPopupOpen ,
    selectedChat
  } = useChatStore();

  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!selectedChat._id) return;

    console.log("epaa")
    const getLink = async () => {
      setLoading(true);
      const res = await generateInviteLink(selectedChat._id);
     console.log("link",res)
      if (res?.link) setLink(res.link);

      setLoading(false);
    };

    getLink();
  }, [selectedChat, isShareLinkOpen]);

  const handleCopy = async () => {
    if (!link) return;

    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setIsShareLinkOpen(false);
    setAnyPopupOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 p-5 rounded-xl w-full max-w-md">

        <h2 className="text-white font-semibold mb-4">
          Compartir grupo
        </h2>

        {loading ? (
          <p className="text-slate-400 text-sm">Generando link...</p>
        ) : (
          <>
            <div className="bg-slate-800 p-3 rounded-lg text-sm text-slate-300 break-all">
              {link || "No disponible"}
            </div>

            <button
              onClick={handleCopy}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
            >
              {copied ? "Copiado ✓" : "Copiar enlace"}
            </button>
          </>
        )}

        <button
          onClick={handleClose}
          className="mt-3 w-full text-slate-400 hover:text-white text-sm"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ShareLinkModal;