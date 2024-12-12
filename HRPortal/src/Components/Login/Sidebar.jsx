import React, { useState } from "react";
import {
    IconHome,
    IconGridDots,
    IconSettings,
    IconUser,
    IconLogout,
} from "@tabler/icons-react";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div
            className={`flex flex-col ${isOpen ? "w-64" : "w-16"
                } h-full bg-gray-800 text-white duration-300`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
                <h1
                    className={`text-lg font-bold ${isOpen ? "block" : "hidden"
                        } duration-300`}
                >
                    MyApp
                </h1>
                <button
                    className="text-gray-400 hover:text-white"
                    onClick={toggleSidebar}
                >
                    ☰
                </button>
            </div>
            {/* Navigation */}
            <nav className="mt-4 flex-1">
                <ul className="space-y-2">
                    <SidebarItem icon={<IconHome />} label="Home" isOpen={isOpen} />
                    <SidebarItem
                        icon={<IconGridDots />}
                        label="Dashboard"
                        isOpen={isOpen}
                    />
                    <SidebarItem icon={<IconUser />} label="Profile" isOpen={isOpen} />
                    <SidebarItem
                        icon={<IconSettings />}
                        label="Settings"
                        isOpen={isOpen}
                    />
                    <SidebarItem icon={<IconLogout />} label="Logout" isOpen={isOpen} />
                </ul>
            </nav>
        </div>
    );
};

const SidebarItem = ({ icon, label, isOpen }) => (
    <li>
        <a
            href="#"
            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 rounded-md"
        >
            <span className="text-xl">{icon}</span>
            <span className={`${isOpen ? "block" : "hidden"} duration-300`}>
                {label}
            </span>
        </a>
    </li>
);

export default Sidebar;
