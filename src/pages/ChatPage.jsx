import React from "react";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import { useChatStore } from "../store/useChatStore.js";
import ChatList from "../components/ChatList.jsx";
import ContactsList from "../components/ContactsList.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import NoConversationSelected from "../components/NoConversationSelected.jsx";
import AddContactModal from "../components/AddContactModal.jsx";
import Configuration from "../components/Configuration.jsx";
import PhoneModal from "../components/PhoneModal.jsx";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import CreateChatWindow from "../components/CreateChatWindow.jsx";
import CreateGroupModal from "../components/CreateGroupModal.jsx";
import ShareLinkModal from "../components/ShareLinkModal.jsx";
import LeaveChatModal from "../components/LeaveChatModal.jsx";

const ChatPage = () => {
  const {
    logout,
    getAllChats,
    getAllContacts,
    activeTab,
    selectedChat,
    isAnyPopupOpen,
    isConfigurationOpen,
    isCreateChatWindowOpen,
    isShareLinkOpen,
    isLeaveChatOpen,
     isPhoneModalOpen  } = useChatStore();
  const { socket, authUser, setOnlineUsers } = useAuthStore();

  useEffect(() => {
    getAllChats();
    getAllContacts();
  }, [authUser]);

  useEffect(() => {
    if (!socket) return;
    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
      console.log("Usuarios online actualizados:", users);
    });
  }, [socket]);

  return (
    <div className="relative w-full max-w-5xl h-[100]">
      <AddContactModal />
     { isPhoneModalOpen&&<PhoneModal />}
      <CreateGroupModal />
      {isShareLinkOpen? <ShareLinkModal/>: ""} 
       {isLeaveChatOpen && <LeaveChatModal />}    
  <div
        className={`relative w-full max-w-6xl h-[700px] ${
          isAnyPopupOpen ? "blur-[2px]" : ""
        }`}
      >
        <BorderAnimatedContainer>
          {/*LEFT SIDE */}

         {isCreateChatWindowOpen ? (
  <CreateChatWindow />
) : (
  <>
    <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
      <ProfileHeader />
      <ActiveTabSwitch />

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {activeTab === "chats" ? <ChatList /> : <ContactsList />}
      </div>
    </div>


  </>
  
)}

              <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
      {selectedChat ? (
        <ChatWindow />
      ) : isConfigurationOpen ? (
        <Configuration />
      ) : (
        <NoConversationSelected />
      )}
    </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
};

export default ChatPage;
