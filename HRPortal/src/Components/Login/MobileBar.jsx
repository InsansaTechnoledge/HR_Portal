import React, { useState } from "react";
import {
    IconHome,
    IconGridDots,
    IconSettings,
    IconUser,
    IconLogout,
    IconChevronUp,
    IconChevronDown,
} from "@tabler/icons-react";
import { NavLink } from "react-router-dom";

const BottomBar = () => {
    const [isAppsOpen, setIsAppsOpen] = useState(false); // State for Apps dropdown

    const toggleAppsDropdown = () => {
        setIsAppsOpen(!isAppsOpen);
    };

    return (
        <div className="fixed bottom-0 left-0 w-full bg-gray-800 text-white shadow-lg z-50">
            <div className="flex justify-between items-center px-4 py-2">
                {/* Navigation Links */}
                <BottomBarItem icon={<IconHome />} label="Home" to="/home" />
                <BottomBarDropdown
                    icon={<IconGridDots />}
                    label="Apps"
                    isOpen={isAppsOpen}
                    toggleDropdown={toggleAppsDropdown}
                >
                    {/* Dropdown Items */}
                    <BottomBarDropdownItem label="Employee Docs" to="/docs" />
                    <BottomBarDropdownItem label="Post Job" to="/post-job" />
                    <BottomBarDropdownItem label="Job Applications" to="/application" />
                </BottomBarDropdown>
                <BottomBarItem icon={<IconUser />} label="Talent" to="/register-candidate" />
                <BottomBarItem icon={<IconSettings />} label="Auth" to="/auth" />
                <BottomBarItem icon={<IconLogout />} label="Logout" to="/" />
            </div>
        </div>
    );
};

const BottomBarItem = ({ icon, label, to }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex flex-col items-center space-y-1 text-sm ${isActive ? "text-indigo-500" : "hover:text-gray-400"}`
            }
        >
            <span className="text-xl">{icon}</span>
            <span>{label}</span>
        </NavLink>
    );
};

const BottomBarDropdown = ({ icon, label, isOpen, toggleDropdown, children }) => {
    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                className="flex flex-col items-center space-y-1 text-sm hover:text-gray-400"
            >
                <span className="text-xl">{icon}</span>
                <span>{label}</span>
                {isOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </button>
            {isOpen && (
                <div className="absolute bottom-12 left-0 bg-gray-700 text-white p-2 rounded-lg shadow-md w-48">
                    {children}
                </div>
            )}
        </div>
    );
};

const BottomBarDropdownItem = ({ label, to }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `block px-4 py-2 rounded-md text-sm ${isActive ? "bg-indigo-600 text-white" : "hover:bg-gray-600"}`
            }
        >
            {label}
        </NavLink>
    );
};

export default BottomBar;
