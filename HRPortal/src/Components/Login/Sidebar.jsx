import React, { useState } from "react";
import {
    IconHome,
    IconGridDots,
    IconSettings,
    IconUser,
    IconLogout,
    IconChevronDown,
    IconChevronUp,
} from "@tabler/icons-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isAppsOpen, setIsAppsOpen] = useState(false); // State for Apps dropdown
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); // State for User Management dropdown

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const toggleAppsDropdown = () => {
        setIsAppsOpen(!isAppsOpen);
    };

    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen);
    };

    const handleLogout = async () => {
        try{
        const response = await axios.post(`${API_BASE_URL}/api/auth/logout`, null,{
            withCredentials: true,
        });
        if(response.status === 200){
            Navigate('/');
        }
        else{
            console.error("logout failed:",response.data.message ||response.statusText);
            alert("Logout failed. Please try again");
        }
        localStorage.clear();
        localStorage.setItem("user2", "!@#")

    }
    catch (error){
        console.error("Logout error:", error);
        alert("An error occurred during logout."); 
    }
}


    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div
                className={`bg-gray-800 overflow-auto pb-4 text-white ${isOpen ? "w-64" : "w-16"} duration-300 flex flex-col`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
                    <h1 className={`text-lg font-bold ${isOpen ? "block" : "hidden"} duration-300`}>Insansa</h1>
                    <button
                        className="text-gray-400 hover:text-white"
                        onClick={toggleSidebar}
                    >
                        ☰
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="mt-4 flex-1">
                    <ul className="space-y-2">
                        <SidebarItem
                            icon={<IconHome />}
                            label="Home"
                            isOpen={isOpen}
                            to="/home"
                        />

                        {/* Dropdown Menu for Apps */}
                        <li>
                            <button
                                onClick={toggleAppsDropdown}
                                className={`flex items-center justify-between w-full px-4 py-3 rounded-md ${isAppsOpen ? "bg-gray-700" : "hover:bg-gray-700"}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-xl">
                                        <IconGridDots />
                                    </span>
                                    <span className={`${isOpen ? "block" : "hidden"} duration-300`}>
                                        Apps
                                    </span>
                                </div>
                                {isOpen && (
                                    <span>
                                        {isAppsOpen ? <IconChevronUp /> : <IconChevronDown />}
                                    </span>
                                )}
                            </button>
                            {isAppsOpen && (
                                <ul className={`${isOpen ? "ml-8" : "ml-4"} mt-2 space-y-2`}>
                                    <SidebarItem
                                        icon={<IconGridDots />}
                                        label="Employee Docs Management"
                                        isOpen={isOpen}
                                        to="/docs"
                                    />
                                    <SidebarItem
                                        icon={<IconGridDots />}
                                        label="Post Current Job Openings"
                                        isOpen={isOpen}
                                        to="/post-job"
                                    />
                                    <SidebarItem
                                        icon={<IconGridDots />}
                                        label="Job Application Management"
                                        isOpen={isOpen}
                                        to="/application"
                                    />
                                    <SidebarItem
                                        icon={<IconGridDots />}
                                        label="Leave Tracker"
                                        isOpen={isOpen}
                                        to="/leave-tracker"
                                    />
                                </ul>
                            )}
                        </li>

                        {/* Dropdown for User Management */}
                        <li>
                            <button
                                onClick={toggleUserDropdown}
                                className={`flex items-center justify-between w-full px-4 py-3 rounded-md ${isUserDropdownOpen ? "bg-gray-700" : "hover:bg-gray-700"}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-xl">
                                        <IconUser />
                                    </span>
                                    <span className={`${isOpen ? "block" : "hidden"} duration-300`}>
                                        Talent Management
                                    </span>
                                </div>
                                {isOpen && (
                                    <span>
                                        {isUserDropdownOpen ? <IconChevronUp /> : <IconChevronDown />}
                                    </span>
                                )}
                            </button>
                            {isUserDropdownOpen && (
                                <ul className={`${isOpen ? "ml-8" : "ml-4"} mt-2 space-y-2`}>
                                    <SidebarItem
                                        icon={<IconUser />}
                                        label="Register Candidate"
                                        isOpen={isOpen}
                                        to="/register-candidate"
                                    />
                                    <SidebarItem
                                        icon={<IconUser />}
                                        label="Candidate Roster"
                                        isOpen={isOpen}
                                        to="/candidate-detail"
                                    />
                                </ul>
                            )}
                        </li>

                        <SidebarItem
                            icon={<IconSettings />}
                            label="Authentication Management"
                            isOpen={isOpen}
                            to="/auth"
                        />
                    </ul>
                </nav>

                {/* Logout Button at Bottom */}
                <div className="mt-auto">
                    <ul>
                        <button onClick={handleLogout}>Logout</button>
                        <SidebarItem
                            onClick={handleLogout}
                            icon={<IconLogout />}
                            label="Logout"
                            isOpen={isOpen}
                            to="/"
                        />
                    </ul>
                </div>
            </div>
        </div>

    );
};

const SidebarItem = ({ icon, label, isOpen, to }) => {
    return (
        <li>
            <NavLink
                to={to}
                className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-md ${isActive ? "bg-indigo-600 text-white" : "hover:bg-gray-700"}`
                }
            >
                <span className="text-xl">{icon}</span>
                <span className={`${isOpen ? "block" : "hidden"} duration-300`}>
                    {label}
                </span>
            </NavLink>
        </li>
    );
};

export default Sidebar;
