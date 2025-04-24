import React from "react";
import { X } from "lucide-react";
import logo from "../assets/img/logo.png";

interface SideBaProps {
  sidebarOpen: boolean;
  toggleSidebar: any;
  activeWebsite: any;
  setActiveWebsite: any;
  savedWebsites: any;
}

const SideBar: React.FC<SideBaProps> = ({
  sidebarOpen,
  toggleSidebar,
  savedWebsites,
  activeWebsite,
  setActiveWebsite,
}) => {
  return (
    <aside
      className={`md:relative absolute md:w-[300px]  w-full transition-all duration-300 ease-in-out ${
        sidebarOpen
          ? "w-[260px] transition-all duration-300 ease-in-out"
          : "w-0 hidden transition-all duration-300 ease-in-out overflow-hidden"
      } bg-[#121212] p-4 overflow-hidden border-r border-gray-700`}
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
        {savedWebsites.map((site: any, i: number) => (
          <button
            key={i}
            onClick={() => setActiveWebsite(activeWebsite)}
            className={`text-left px-3 py-2 rounded ${
              site === activeWebsite?.name
                ? "bg-[#1f6feb] text-white"
                : "hover:bg-gray-800 text-gray-300"
            }`}
          >
            {site}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default SideBar;
