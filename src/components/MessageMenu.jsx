import React, { useState, useRef, useEffect } from "react";
import { EllipsisVertical } from "lucide-react";
import { axiosInstance } from "../lib/axios";

const MessageMenu = ({id, text }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

const handleMouseLeave = () => {
  ref.current = setTimeout(() => {
    setOpen(false);
  }, 200);
};

const handleMouseEnter = () => {
  clearTimeout(ref.current);
};


  // cerrar al hacer click fuera
  useEffect(() => {
  

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(text || "");
    setOpen(false);
  };

  const handleDelete = async (id)=>{
    try{
    const res= await axiosInstance.delete(`/messages/${id}`)
    }catch (err) {
     console.log(err)
    }
  }

  return (
<div
  className="relative"
  ref={ref}
  onMouseLeave={handleMouseLeave}
  onMouseEnter={handleMouseEnter}
>
          {/* botón */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-1 hover:bg-slate-700 rounded"
      >
        <EllipsisVertical size={14} />
      </button>

      {/* menú */}
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50" >
          <button
            onClick={handleCopy}
            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700"
          >
            Copiar
          </button>


            <button
            onClick={
                ()=>handleDelete(id)
            }
            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700"
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageMenu;