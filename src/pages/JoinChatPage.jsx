import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import noImage from "../assets/groupAvatar.svg";
import { axiosInstance } from "../lib/axios.js";

const JoinChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = new URLSearchParams(location.search).get("token");

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [status, setStatus] = useState("loading");
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const validateToken = async () => {
      try {
        if (!token) {
          setStatus("invalid");
          setMessage("Token no proporcionado");
          return;
        }

        const res = await axiosInstance.get(
          `/chats/invite/${token}/validate`
        );

        if (!res.data.valid) {
          setStatus(res.data.status || "invalid");
          setMessage(res.data.message);
          return;
        }

        setChat(res.data.chat);
        setStatus("valid");
      } catch (error) {
        setStatus("error");
        setMessage("Error validando enlace");
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleJoin = async () => {
    try {
      setJoining(true);

      const res = await axiosInstance.post(
        `/chats/invite/${token}/join`
      );

      if (res.data.success) {
        navigate("/");
      }
    } catch (error) {
      setMessage("No se pudo unir al chat");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
        
      <div className="h-screen flex items-center justify-center text-slate-400">
        Validando invitación...
      </div>
    );
  }

  if (status !== "valid") {
    return (

    <div>
      <div className="h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-red-400 text-xl font-semibold">
          Invitación no válida
        </h1>

        <p className="text-slate-400 mt-2">{message}</p>

        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-slate-700 px-4 py-2 rounded-lg text-white"
        >
          Volver
        </button>

   
      </div>

      </div>
    );
  }

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 pointer-events-auto">
    
    <div className="relative z-50 flex flex-col items-center text-center px-4">
      
      {/* Avatar */}
      <img
        src={chat?.profilePic || noImage}
        alt="group"
        className="w-24 h-24 rounded-full object-cover mb-4 border border-slate-700"
      />

      {/* Nombre */}
      <h1 className="text-xl font-semibold">
        Invitación a: {chat?.name}
      </h1>

      <p className="text-slate-400 text-sm mt-1">
        Grupo de chat
      </p>

      {/* Error */}
      {message && (
        <p className="text-red-400 mt-2 text-sm">{message}</p>
      )}

      {/* Botón */}
      <button
        onClick={handleJoin}
        disabled={joining}
        className={`mt-6 px-6 py-2 rounded-lg text-white transition
        ${joining ? "bg-cyan-800" : "bg-cyan-600 hover:bg-cyan-700"}`}
      >
        {joining ? "Uniéndose..." : "Unirse al chat"}
      </button>

    </div>
  </div>
);
};

export default JoinChatPage;