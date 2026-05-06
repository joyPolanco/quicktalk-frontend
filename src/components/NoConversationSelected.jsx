import React from 'react'
import { MessageCircleIcon } from "lucide-react";

const NoConversationSelected = () => {
   return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="size-20 bg-cyan-500/20 rounded-full flex items-center justify-center mb-6">
        <MessageCircleIcon className="size-10 text-cyan-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-200 mb-2">Selecciona una conversación</h3>
      <p className="text-slate-400 max-w-md">
        Elige un chat en la barra lateral para comenzar a chatear o continuar una conversación anterior.
      </p>
    </div>
  );
}

export default NoConversationSelected
