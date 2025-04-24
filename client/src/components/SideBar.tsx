import React from "react";
import { Delete, DeleteIcon, X } from "lucide-react";
import logo from "../assets/img/logo.png";

interface SideBarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  activeWebsite: { name?: string; id?: string };
  setActiveWebsite: (website: any) => void;
  savedWebsites: { id: string; name: string }[];
  clearSingleChat: (id: string) => void;
  clearAllChats: () => void;
}

const SideBar: React.FC<SideBarProps> = ({
  sidebarOpen,
  toggleSidebar,
  savedWebsites,
  activeWebsite,
  setActiveWebsite,
  clearSingleChat,
  clearAllChats,
}) => {
  return (
    <aside
      className={`md:relative absolute md:w-[300px] w-full transition-all duration-300 ease-in-out ${
        sidebarOpen ? "w-[260px]" : "w-0 hidden overflow-hidden"
      } bg-[#121212] p-4 border-r border-gray-700`}
    >
      <div className="flex justify-between items-center mb-4">
        <img src={logo} alt="Xavia" className="w-[100px] h-[50px]" />
        <X
          className="cursor-pointer text-gray-400 hover:text-white"
          onClick={toggleSidebar}
        />
      </div>

      <div className="mb-3 text-sm text-gray-300">Saved Websites</div>
      <div className="flex flex-col gap-2 text-sm">
        {savedWebsites.map((site) => (
          <div key={site.id} className="flex items-center justify-between gap-3">
            <button
              onClick={() => setActiveWebsite(site)}
              className={`text-left px-3 py-2 rounded w-full ${
                site.id === activeWebsite?.id
                  ? "bg-[#1f6feb] text-white"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              {site.name}
            </button>
            <button
              onClick={() => clearSingleChat(site.id)}
              className="text-left flex items-center justify-center cursor-pointer text-red-500 text-xs w-full  py-2 rounded hover:bg-gray-800"
            >
              <Delete/>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-300">
        <button
          onClick={clearAllChats}
          className="text-red-500 text-xs w-full px-3 py-2 rounded hover:bg-gray-800"
        >
          Clear All Chats
        </button>
      </div>
    </aside>
  );
};

export default SideBar;
