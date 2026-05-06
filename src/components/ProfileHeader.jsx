import React from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
import { useRef } from "react";
import avatar from "../assets/avatar.png";
import { Settings2Icon, SettingsIcon } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
const ProfileHeader = () => {
  const { logout, authUser, updateProfile ,selectedImg, setSelectedImg } = useAuthStore();
  const { isSoundEnabled, toggleSound,setConfigurationOpen } = useChatStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fileInputRef = useRef(null);



 const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validar tipo de archivo
  const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!validTypes.includes(file.type)) {
    toast.error("Formato de imagen no válido");
    return;
  }

  // Validar tamaño (máx 5MB antes de comprimir)
  if (file.size > 5 * 1024 * 1024) {
    toast.error("La imagen es muy pesada (máx 5MB)");
    return;
  }

  const img = new Image();
  const reader = new FileReader();

  reader.readAsDataURL(file);

  reader.onload = () => {
    img.src = reader.result;
  };

  img.onload = async () => {
    // Crear canvas para comprimir
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Tamaño recomendado para perfil
    const MAX_WIDTH = 300;
    const MAX_HEIGHT = 300;

    let width = img.width;
    let height = img.height;

    // Mantener proporción
    if (width > height) {
      if (width > MAX_WIDTH) {
        height = height * (MAX_WIDTH / width);
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width = width * (MAX_HEIGHT / height);
        height = MAX_HEIGHT;
      }
    }

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    // Comprimir imagen (calidad 0.7 = balance calidad/peso)
    const compressedImage = canvas.toDataURL("image/jpeg", 0.7);

    // Mostrar preview
    setSelectedImg(compressedImage);

    
      await updateProfile({ profilePic: compressedImage });
    
  };
};

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
  }
const menuRef = useRef();

useEffect(() => {
  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setIsMenuOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-2">
          {/*AVATAR*/}
          <div className="relative" >
            <button
              className="size-14 rounded-full overflow-hidden relative group"
              onClick={() => fileInputRef.current.click()}
            >
              <img
                src={selectedImg || authUser?.profilePic || avatar}
                alt="Profile"
                className="object-cover w-full h-full bg-slate-700/50 rounded-full"
              />

              <div
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
            flex items-center justify-center text-white text-xs transition-opacity rounded-full"
              >
                Cambiar foto
              </div>
            </button>

            {/* 🔵 Indicador activo */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></span>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* USER INFO */}
          <div>
            
              <h3 className="text-slate-200 font-medium  text-base max-w-[180px] truncate">

 {authUser?.fullName || "Usuario"}
            
              </h3>
             
          </div>
          
        </div>
     <div className="relative" ref={menuRef}>
  
  {/* MENÚ */}
  {isMenuOpen && (
    <div className="absolute right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg p-2 shadow-lg z-50 min-w-[200px]">
      <button 
        onClick={logout}
        className="block w-full text-left px-3 py-1 hover:bg-slate-700 rounded text-white"
      >
        Cerrar sesión
      </button>


   <button 
        onClick={()=>setConfigurationOpen(true)}
        className="block w-full text-left px-3 py-1 hover:bg-slate-700 rounded text-white"
      >
Ajustes      </button>

    </div>
  )}

  {/* BOTÓN */}
  <button onClick={handleMenuToggle}>
    <SettingsIcon />
  </button>

</div>
      </div>
    </div>
  );
};

export default ProfileHeader;
