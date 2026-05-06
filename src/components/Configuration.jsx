
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { ChevronLeftIcon, StepBackIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import PhoneModal from "./PhoneModal";

const Configuration = ({  }) => {
  const fileInputRef = useRef(null);
  const { authUser, updateProfile,uploadProfilePic } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [username, setUsername] = useState(authUser?.username || "");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const { setConfigurationOpen } = useChatStore();


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

    
      await uploadProfilePic(  compressedImage );
    
  };
};

const handleSave = async () => {
  const updates = {};

  // Validaciones
  if (fullName.length > 40) {
    return toast.error("Máximo 40 caracteres en nombre");
  }

  if (username.length > 12) {
    return toast.error("Máximo 12 caracteres en username");
  }

  if (fullName !== authUser?.fullName) {
    updates.fullName = fullName;
  }

  if (username !== authUser?.username) {
    updates.username = username;
  }

  if (Object.keys(updates).length === 0) {
    return toast("No hay cambios para guardar");
  }

  try {
    await updateProfile(updates);
    toast.success("Perfil actualizado");
  } catch (error) {
    toast.error("Error al actualizar perfil");
  }
};

  return (
<div className="relative flex items-center justify-center h-full p-6">  <button
  onClick={() => setConfigurationOpen(false)}
  className="absolute top-6 left-6 p-2 rounded-full hover:bg-slate-800 transition text-slate-300 hover:text-white"
>
  <ChevronLeftIcon size={20} />
</button>
      {/* CARD */}
      <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-xl border border-slate-700 p-6 space-y-6">

        <h2 className="text-xl font-semibold text-white text-center">
          Configuración
        </h2>

        {/* FOTO */}
        <div className="flex justify-center">
          <button
            className="size-24 rounded-full overflow-hidden relative group ring-2 ring-slate-600 hover:ring-blue-500 transition"
            onClick={() => fileInputRef.current.click()}
          >
            <img
              src={selectedImg || authUser?.profilePic}
              alt="Profile"
              className="object-cover w-full h-full hover:scale-105 transition-transform bg-slate-700/50 rounded-full"
            />

           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
    <span className="text-white text-sm">Cambiar</span>
  </div>
          </button>

          <input
            type="file"
            hidden
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
        </div>

        {/* INPUTS */}
        <div className="space-y-4">

          {/* FULL NAME */}
          <div>
            <input
              type="text"
              placeholder="Nombre completo"
              value={fullName}
              maxLength={40}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 text-white outline-none border border-slate-700 focus:border-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1 text-right">
              {fullName.length}/40
            </p>
          </div>

          {/* USERNAME */}
          <div>
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              maxLength={12}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 text-white outline-none border border-slate-700 focus:border-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1 text-right">
              {username.length}/12
            </p>
          </div>

        </div>

        {/* TELÉFONO (MODAL) */}
        <div className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700">
          <span className="text-slate-300 text-sm">  {authUser?.phone ? authUser.phone : "Número telefónico"}</span>
          <button
            onClick={() => setIsPhoneModalOpen(true)}
            className="text-blue-400 text-sm hover:underline"
          >
            {authUser?.phone ? "Editar" : "Agregar"}
          </button>
        </div>

        {/* TOGGLE SONIDO */}
        <div className="flex justify-between items-center">
          <span className="text-slate-300">Sonido</span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
              soundEnabled ? "bg-green-500" : "bg-gray-600"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                soundEnabled ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>

        {/* GUARDAR */}
        <button
          onClick={handleSave}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
        >
          Guardar cambios
        </button>
      </div>

      {/* MODAL TELÉFONO */}
      {isPhoneModalOpen && (
        <PhoneModal onClose={() => setIsPhoneModalOpen(false)} />
      )}
    </div>
  );
};

export default Configuration;

