import React from 'react'
import { useChatStore } from '../store/useChatStore';

const ActiveTabSwitch = () => {
    const  {activeTab, setActiveTab} = useChatStore();
    const tabs = ["Chats", "Contactos"];
  return (
    <div className="flex items-center justify-center space-x-4 border-b border-slate-600/30">
        {tabs.map((tab) => (
         <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.toLowerCase()
                ? "text-slate-400 border-b-2 border-gray-500"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            {tab}
          </button>

        ))}
    </div>
  )
}

export default ActiveTabSwitch
