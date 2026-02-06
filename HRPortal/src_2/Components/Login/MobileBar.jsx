import React, { useState, memo, useCallback, useContext } from 'react';
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
// import useLogout from '../../Context/useLogout';
import { handleLogout } from './Sidebar';
import { userContext } from '../../Context/userContext';

// Configuration for navigation items
const NAV_ITEMS = [
    { icon: IconHome, label: 'Home', to: '/' },
    { icon: IconUser, label: 'Talent', to: '/register-candidate' },
    { icon: IconSettings, label: 'Auth', to: '/auth' },
    // { icon: IconLogout, label: 'Logout', to: '/' },
];

const DROPDOWN_ITEMS = [
    { label: 'Employee Docs', to: '/docs' },
    { label: 'Post Job', to: '/post-job' },
    { label: 'Job Applications', to: '/application' },
    { label: 'Leave Tracker', to: '/leave-tracker' },
];

// const { handleLogout } = useLogout();
const handleClick = (setUser) => {
    // alert("AAA"+typeof(setUser));
    handleLogout(setUser);
};
// Memoized component to prevent unnecessary re-renders
const BottomBarItem = memo(({ icon: Icon, label, to }) => (
    <NavLink
        // to={to}
        className={({ isActive }) => `
            flex flex-col items-center space-y-1 text-sm 
            ${isActive ? "text-indigo-500" : "hover:text-gray-400"}
        `}
    >
        <span className="text-xl"><Icon /></span>
        <span>{label}</span>
    </NavLink>
));

// Memoized dropdown item component
const BottomBarDropdownItem = memo(({ label, to }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
            block px-4 py-2 rounded-md text-sm 
            ${isActive ? "bg-indigo-600 text-white" : "hover:bg-gray-600"}
        `}
    >
        {label}
    </NavLink>
));

// Memoized dropdown component
const BottomBarDropdown = memo(({ icon: Icon, label, isOpen, toggleDropdown, children }) => (
    <div className="relative">
        <button
            onClick={toggleDropdown}
            className="flex flex-col items-center space-y-1 text-sm hover:text-gray-400"
            aria-expanded={isOpen}
            aria-controls="apps-dropdown"
        >
            <span className="text-xl"><Icon /></span>
            <span>{label}</span>
            {isOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </button>
        {isOpen && (
            <div
                id="apps-dropdown"
                className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white p-2 rounded-lg shadow-md w-48"
            >
                {children}
            </div>
        )}
    </div>
));

// Main BottomBar component
const BottomBar = () => {
    const [isAppsOpen, setIsAppsOpen] = useState(false);

    // Memoized toggle function to prevent unnecessary re-creation
    const toggleAppsDropdown = React.useCallback(() => {
        setIsAppsOpen(prev => !prev);
    }, []);

    const {setUser} = useContext(userContext);
    return (
        <nav
            className="fixed bottom-0 left-0 w-full bg-gray-800 text-white shadow-lg z-50"
            aria-label="Bottom Navigation"
        >
            <div className="flex justify-between items-center px-4 py-2">
                {/* Regular Navigation Items */}
                {NAV_ITEMS.map((item) => (
                    <BottomBarItem
                        key={item.to}
                        icon={item.icon}
                        label={item.label}
                        to={item.to}
                    />
                ))}
                <div onClick={()=> (handleClick(setUser))}>
                <BottomBarItem
                    icon={IconLogout}
                    label="Logout"
                />
                </div>


                {/* Apps Dropdown */}
                <BottomBarDropdown
                    icon={IconGridDots}
                    label="Apps"
                    isOpen={isAppsOpen}
                    toggleDropdown={toggleAppsDropdown}
                >
                    {DROPDOWN_ITEMS.map((item) => (
                        <BottomBarDropdownItem
                            key={item.to}
                            label={item.label}
                            to={item.to}
                        />
                    ))}
                </BottomBarDropdown>
            </div>
        </nav>
    );
};

export default React.memo(BottomBar);