import { useState } from "react";
import { X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const AddContactModal = () => {
  const { isAddContactPopupOpen, setAddContactPopupOpen, setAnyPopupOpen,setContacts } = useChatStore();
const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [saveAs, setSaveAs] = useState("");

  if (!isAddContactPopupOpen) return null;

  const handleSubmit = async () => {
  const regex = /^\+[1-9]\d{7,14}$/;

  if (!regex.test(phone)) {
    toast.error("Número inválido. Usa formato +18091234567");
    return;
  }

  try {
    setLoading(true)
    const response = await axiosInstance.post("/contacts/add", {
      phone,
      saveAs: saveAs, 
    });

    if (response.status === 201) {
      toast.success("Contacto agregado correctamente");

      setPhone("");
      setSaveAs("");
       setContacts(response.data.contacts) // Actualiza contactos en el store
      setAddContactPopupOpen(false);
      setAnyPopupOpen(false);
    }

  } catch (error) {

    if (error.response?.status === 404) {
    toast.error("Usuario no encontrado");
  } else {
      const message =
      error.response?.data?.message || "Error al agregar contacto";

    toast.error(message);
  }
  
  }
  finally{
        setLoading(false)

  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      
      <div className="relative w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-6 animate-scaleIn min-h-[200px]">
        
        {/* Botón X */}
        <button
          onClick={() => {
            setAddContactPopupOpen(false);
            setAnyPopupOpen(false);
          }}
          className="absolute top-3 right-3 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Agregar contacto</h2>

        {/* Teléfono */}
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+18091234567"
          className="w-full p-2 rounded bg-slate-700 mb-3"
        />

        {/* Nombre personalizado */}
        <input
          type="text"
          value={saveAs}
          onChange={(e) => setSaveAs(e.target.value)}
          placeholder="Nombre "
          className="w-full p-2 rounded bg-slate-700 mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setAddContactPopupOpen(false)}
            className="px-4 py-2 bg-slate-600 rounded"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 rounded"
          >
         {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;