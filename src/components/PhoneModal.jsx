import React, { useState } from "react";
import { sendCode, verifyCode } from "../firebase/phoneAuth";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const PhoneModal = ({ onClose }) => {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);
  const {verifyPhone}= useAuthStore();
  const handleSend = async () => {
    try {
      await sendCode(phone);
      toast.success("Código enviado");
      setStep(2);
    } catch (err) {
      toast.error("Error al enviar código");
      console.log(err)
    }
  };

  const handleVerify = async () => {
    try {
      const user = await verifyCode(code);
      console.log(user);
      toast.success("Número verificado");

      await verifyPhone(user.token);
      onClose();


    } catch (err) {
      toast.error("Código incorrecto");
    }
  };

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-slate-900 p-6 rounded-xl w-80 space-y-4">

        <h3 className="text-white font-semibold">Verificar número</h3>

        {step === 1 && (
          <>
            <input
              type="text"
              placeholder="+18091234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 rounded bg-slate-800 text-white"
            />

            <button
              onClick={handleSend}
              className="w-full bg-blue-600 py-2 rounded text-white"
            >
              Enviar código
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Código"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 rounded bg-slate-800 text-white"
            />

            <button
              onClick={handleVerify}
              className="w-full bg-green-600 py-2 rounded text-white"
            >
              Verificar
            </button>
          </>
        )}

        <button onClick={onClose} className="text-slate-400 text-sm">
          Cancelar
        </button>

        {/* IMPORTANTE */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default PhoneModal;