import React, { useEffect, useState, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import LoadingDots from "./LoadingDots";
import ContactCard from "./ContactCard";
import { PlusIcon } from "lucide-react";

const ContactsList = () => {
  const {
    getAllContacts,
    allContacts,
    isContactsLoading,
    setAnyPopupOpen,
    setAddContactPopupOpen,
  } = useChatStore();

  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  const filteredContacts = useMemo(() => {
    if (!allContacts) return [];

    const term = search.toLowerCase();

    return allContacts.filter((contact) => {
      const name =
        contact.saveAs ||
        contact.recipient?.fullName ||
        contact.recipient?.username ||
        "";

      return name.toLowerCase().includes(term);
    });
  }, [search, allContacts]);

  return (
    <div className="h-full flex flex-col p-3">

      {/* Search */}
      <div className="bg-slate-500 px-4 py-2 rounded-3xl mb-3 flex items-center">
        <input
          type="text"
          placeholder="Buscar contacto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-black placeholder-gray-700 outline-none"
        />
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {isContactsLoading ? (
          <LoadingDots />
        ) : (
          <ul className="space-y-1">
            {filteredContacts.map((contact) => (
              <ContactCard key={contact._id} contact={contact} />
            ))}
          </ul>
        )}
      </div>

      {/* Botón */}
      <div className="absolute bottom-6 right-4">
        <button
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition"
          onClick={() => {
            setAddContactPopupOpen(true);
            setAnyPopupOpen(true);
          }}
        >
          <PlusIcon size={20} />
        </button>
      </div>
    </div>
  );
};

export default ContactsList;