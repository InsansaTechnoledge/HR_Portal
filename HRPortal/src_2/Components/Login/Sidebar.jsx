import React, { useContext, useState, useEffect } from "react";
import {
    IconHome,
    IconGridDots,
    IconSettings,
    IconUser,
    IconLogout,
    IconChevronDown,
    IconChevronUp,
    IconCrown,
} from "@tabler/icons-react";
import { NavLink } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { userContext } from "../../Context/userContext";
// import useLogout from "../../Context/useLogout";
import axios from 'axios';
import API_BASE_URL from '../../config';

const handleLogout = async (setUser) => {

    try {

        const response = await axios.post(`${API_BASE_URL}/api/auth/logout`, null, {
            withCredentials: true,
        });

        if (response.status === 201) {
            setUser(null);
        } else {
            console.error("Logout failed:", response.data.message || response.statusText);
            alert("Logout failed. Please try again");
        }

    } catch (error) {
        console.error("Logout error:", error);
        alert("An error occurred during logout.");
    }
};

const Sidebar = () => {


    const [isOpen, setIsOpen] = useState(true);
    const [dropdowns, setDropdowns] = useState({
        apps: false,
        user: false,
    });
    const { user,setUser } = useContext(userContext);

    const Name = user?.userName; // fetching the name of user


    const toggleSidebar = () => setIsOpen(!isOpen);

    const toggleDropdown = (name) => {
        setDropdowns((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    const navigate = useNavigate();
    // const { handleLogout } = useLogout();

    useEffect(() => {
        if (user === null) {
            navigate('/', { replace: true });  // Redirect to login after user is null
        }
    }, [user, navigate]);

    return (
        <div className="flex h-screen">
            <aside
                className={`bg-gray-800 overflow-auto text-white transition-width duration-300 ${isOpen ? "w-64" : "w-16"} flex flex-col`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
                    {isOpen && <h1 className="text-lg font-bold">Hey, {Name}</h1>}
                    <button className="text-gray-400 hover:text-white" onClick={toggleSidebar}>
                        ☰
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 mt-4">
                    <ul className="space-y-2">
                        <SidebarItem icon={<IconHome />} label="Home" isOpen={isOpen} to="/" />

                        {/* Apps Dropdown for User */}
                        {user && user.role === 'user' && (
                            <SidebarDropdown
                                icon={<IconGridDots />}
                                label="Apps"
                                isOpen={isOpen}
                                isExpanded={dropdowns.apps}
                                toggleDropdown={() => toggleDropdown("apps")}
                            >
                                <SidebarItem icon={<IconGridDots />} label="Employee Docs Management" isOpen={isOpen} to="/docs" />
                                <SidebarItem icon={<IconGridDots />} label="Leave Tracker" isOpen={isOpen} to="/leave-tracker" />
                            </SidebarDropdown>
                        )}

                        {/* Apps Dropdown for Admin/SuperAdmin */}
                        {user && (user.role === 'admin' || user.role === 'superAdmin') && (
                    <>
                        <SidebarDropdown
                            icon={<IconGridDots />}
                            label="Apps"
                            isOpen={isOpen}
                            isExpanded={dropdowns.apps}
                            toggleDropdown={() => toggleDropdown("apps")}
                        >
                            <SidebarItem icon={<IconGridDots />} label="Employee Docs Management" isOpen={isOpen} to="/docs" />
                            <SidebarItem icon={<IconGridDots />} label="Post Current Job Openings" isOpen={isOpen} to="/post-job" />
                            <SidebarItem icon={<IconGridDots />} label="Job Application Management" isOpen={isOpen} to="/application" />
                            <SidebarItem icon={<IconGridDots />} label="Leave Tracker" isOpen={isOpen} to="/leave-tracker" />
                            <SidebarItem icon={<IconGridDots />} label="Add Employee" isOpen={isOpen} to="/add-employee" />
                        </SidebarDropdown>

                        <SidebarDropdown
                            icon={<IconUser />}
                            label="Talent Management"
                            isOpen={isOpen}
                            isExpanded={dropdowns.user}
                            toggleDropdown={() => toggleDropdown("user")}
                        >
                            <SidebarItem icon={<IconUser />} label="Register Candidate" isOpen={isOpen} to="/register-candidate" />
                            <SidebarItem icon={<IconUser />} label="Candidate Roster" isOpen={isOpen} to="/candidate-detail" />
                        </SidebarDropdown>
                    </>
                        )}


                        {/* Super Admin Page for SuperAdmin */}
                        {user && user.role === 'superAdmin' && (
                        <SidebarItem icon={<IconSettings />} label="Authentication Management" isOpen={isOpen} to="/auth" />

                        )}

                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="mt-auto px-4 py-4">
                    <button
                        onClick={()=>handleLogout(setUser)}
                        className="flex items-center w-full px-4 py-3 text-red-500 rounded-md hover:bg-red-700 hover:text-white"
                    >
                        <IconLogout className="text-xl" />
                        {isOpen && <span className="ml-3">Logout</span>}
                    </button>
                </div>
            </aside>
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

const SidebarDropdown = ({ icon, label, isOpen, isExpanded, toggleDropdown, children }) => (
    <li>
        <button
            onClick={toggleDropdown}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-md ${isExpanded ? "bg-gray-700" : "hover:bg-gray-700"}`}
        >
            <div className="flex items-center space-x-3">
                {icon}
                {isOpen && <span>{label}</span>}
            </div>
            {isOpen && (isExpanded ? <IconChevronUp /> : <IconChevronDown />)}
        </button>
        {isExpanded && <ul className="ml-8 mt-2 space-y-2">{children}</ul>}
    </li>
);

export default Sidebar;
export {handleLogout};