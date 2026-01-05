// import React, { useState, memo, useContext, useCallback } from 'react';
// import {
//     IconHome,
//     IconGridDots,
//     IconSettings,
//     IconUser,
//     IconLogout,
//     IconChevronUp,
//     IconChevronDown,
// } from "@tabler/icons-react";
// import { NavLink } from "react-router-dom";
// import { handleLogout } from './Sidebar';
// import { userContext } from '../../Context/userContext';
// import { DROPDOWN_ITEMS } from '../../Constant/constant';

// // Configuration for navigation items
// const NAV_ITEMS = [
//     { icon: IconHome, label: 'Home', to: '/' },
//     { icon: IconUser, label: 'Talent', to: '/register-candidate' },
//     { icon: IconSettings, label: 'Auth', to: '/auth' },
// ];


// // Handle Logout function
// const handleClick = (setUser) => {
//     handleLogout(setUser);
// };

// // Memoized component to prevent unnecessary re-renders
// const BottomBarItem = memo(({ icon: Icon, label, to }) => (
//     <NavLink
//         to={to}
//         className={({ isActive }) => `flex flex-col items-center space-y-1 text-sm 
//             ${isActive ? "text-indigo-500" : "hover:text-gray-400"}`}
//     >
//         <span className="text-xl"><Icon /></span>
//         <span>{label}</span>
//     </NavLink>
// ));

// // Memoized dropdown item component
// const BottomBarDropdownItem = memo(({ label, to, onClick }) => (
//     <NavLink
//         to={to}
//         className={({ isActive }) => `block px-4 py-2 rounded-md text-sm 
//             ${isActive ? "bg-indigo-600 text-white" : "hover:bg-gray-600"}`}
//         onClick={onClick}  // Call the onClick function to close dropdown
//     >
//         {label}
//     </NavLink>
// ));

// // Memoized dropdown component
// const BottomBarDropdown = memo(({ icon: Icon, label, isOpen, toggleDropdown, children }) => (
//     <div className="relative">
//         <button
//             onClick={toggleDropdown}
//             className="flex flex-col items-center space-y-1 text-sm hover:text-gray-400"
//             aria-expanded={isOpen}
//             aria-controls="apps-dropdown"
//         >
//             <span className="text-xl"><Icon /></span>
//             <span>{label}</span>
//             {isOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
//         </button>
//         {isOpen && (
//             <div
//                 id="apps-dropdown"
//                 className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white p-2 rounded-lg shadow-md w-48"
//             >
//                 {children}
//             </div>
//         )}
//     </div>
// ));

// // Main BottomBar component
// const BottomBar = () => {
//     const [isAppsOpen, setIsAppsOpen] = useState(false);

//     // Memoized toggle function to prevent unnecessary re-creation
//     const toggleAppsDropdown = useCallback(() => {
//         setIsAppsOpen(prev => !prev);
//     }, []);

//     const { user, setUser } = useContext(userContext);

//     // Handle click on a dropdown item
//     const handleDropdownItemClick = () => {
//         setIsAppsOpen(false);  
//     };

//     return (
//         <nav
//             className="fixed bottom-0 left-0 w-full bg-gray-800 text-white shadow-lg z-50"
//             aria-label="Bottom Navigation"
//         >
//             <div className="flex justify-between items-center px-4 py-2">
//                 {/* Regular Navigation Items */}
//                 {NAV_ITEMS.map((item) => {
//                     if ((item.label === 'Talent' || item.label === 'Auth') && (user.role === 'user' ||user.role==='accountant') ) {
//                         return null; 
//                     }
                    
//                     return (
//                         <BottomBarItem
//                             key={item.to}
//                             icon={item.icon}
//                             label={item.label}
//                             to={item.to}
//                         />
//                     );
//                 })}

//                 {/* Apps Dropdown */}
//                 <BottomBarDropdown
//                     icon={IconGridDots}
//                     label="Apps"
//                     isOpen={isAppsOpen}
//                     toggleDropdown={toggleAppsDropdown}
//                 >
//                     {DROPDOWN_ITEMS.map((item) => {
//                         if((user.role === 'superAdmin' || user.role==='accountant' )&& (item.label==='User Details'|| item.label==='PaySlip Generator')){
//                             <BottomBarDropdownItem
//                                     key={item.to}
//                                     label={item.label}
//                                     to={item.to}
//                                     onClick={handleDropdownItemClick}  // Close the dropdown on click
//                                 />
//                         }
//                         else if(item.label==='User Details' || item.label==='PaySlip Generator'){
//                             return null;
//                         }
//                         else if((user.role === 'superAdmin' || user.role==='accountant') && item.label==='Employee Registration'){
//                             return (
//                                null
//                             );
//                         }
//                         else if (
//                             ((item.label === 'Post Job' || item.label === 'Job Applications' || item.label === 'Add Employee') &&
//                             (user.role === 'user' ||user.role==='accountant'))
//                         ) {
//                             return null;  // Hide for regular users
//                         }
//                         else if (user.role==='accountant' && (item.label==='Leave Tracker' || item.label==='Employee Docs')){
//                             return null;
//                         }
//                         return (
//                             <BottomBarDropdownItem
//                                 key={item.to}
//                                 label={item.label}
//                                 to={item.to}
//                                 onClick={handleDropdownItemClick}  // Close the dropdown on click
//                             />
//                         );
//                     })}
//                 </BottomBarDropdown>

//                 <button
//                     onClick={() => handleClick(setUser)}
//                     className="flex flex-col items-center space-y-1 text-sm text-white hover:text-gray-400"
//                 >
//                     <span className="text-xl"><IconLogout /></span>
//                     <span>Logout</span>
//                 </button>
//             </div>
//         </nav>
//     );
// };

// export default React.memo(BottomBar);
