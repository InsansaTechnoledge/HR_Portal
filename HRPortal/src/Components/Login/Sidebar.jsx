import React, { useState, useContext, useEffect } from "react";
import {
  IconHome,
  IconGridDots,
  IconSettings,
  IconUser,
  IconLogout,
  IconChevronDown,
  IconChevronUp,
  IconBriefcase,
  IconUsers,
  IconFolder,
  IconCalendar,
  IconId,
  IconFilePlus,
  IconFileText,
  IconKey,
} from "@tabler/icons-react";
import { NavLink, useNavigate } from "react-router-dom";
import { userContext } from "../../Context/userContext";
import axios from "axios";
import API_BASE_URL from "../../config";
import { use } from "react";
import ErrorToast from "../Toaster/ErrorToaster";
import SuccessToast from "../Toaster/SuccessToaser";
import UserProfile from "../../Page/UserProfile";
import { ReceiptIndianRupee } from "lucide-react";

// Logout function to handle user logout
const handleLogout = async (setUser) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/logout`, null, {
      withCredentials: true,
    });

    if (response.status === 201) {
      setUser(null);
    } else {
      // console.error("Logout failed:", response.data.message || response.statusText);
      // alert("Logout failed. Please try again");
      setToastErrorMessage("Logout failed. Please try again");
      setToastErrorVisible(true);
      setTimeout(() => setToastErrorVisible(false), 3500);
    }
  } catch (error) {
    // console.error("Logout error:", error);
    // alert("An error occurred during logout.");
    setToastErrorMessage("An error occurred during logout.");
    setToastErrorVisible(true);
    setTimeout(() => setToastErrorVisible(false), 3500);
  }
};

// Sidebar component
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [dropdowns, setDropdowns] = useState({
    apps: false,
    user: false,
    job: false,
    talent: false,
    payslip: false,
  });
  const { user, setUser } = useContext(userContext);
  const Name = user?.userName; // fetching the name of user
  const [toastSuccessMessage, setToastSuccessMessage] = useState();
  const [toastErrorMessage, setToastErrorMessage] = useState();
  const [toastSuccessVisible, setToastSuccessVisible] = useState(false);
  const [toastErrorVisible, setToastErrorVisible] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prevState) => {
      const newIsOpen = !prevState;
      if (!newIsOpen) {
        // Close all dropdowns when sidebar is closed
        setDropdowns({
          apps: false,
          user: false,
          job: false,
          talent: false,
          payslip: false,
        });
      }
      return newIsOpen;
    });
  };

  const toggleDropdown = (name) => {
    setIsOpen(true);
    setDropdowns((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) {
      navigate("/", { replace: true }); // Redirect to login after user is null
    }
  }, [user, navigate]);

  return (
    <>
      {toastSuccessVisible ? (
        <SuccessToast message={toastSuccessMessage} />
      ) : null}
      {toastErrorVisible ? <ErrorToast error={toastErrorMessage} /> : null}
      <div className="flex h-screen">
        <aside
          className={`bg-gray-800 overflow-auto text-white transition-width duration-300 ${
            isOpen ? "w-64" : "w-16"
          } flex flex-col`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            {isOpen && (
              <h1 className="text-sm font-semibold text-white">
                {`Hey, ${Name}`}
              </h1>
            )}
            <button
              className="text-gray-400 hover:text-white"
              onClick={toggleSidebar}
            >
              ☰
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 mt-6">
            <ul className="space-y-2">
              <SidebarItem
                icon={<IconHome />}
                label="Home"
                isOpen={isOpen}
                to="/"
              />

              {/* Apps Dropdown for User */}
              {user && user.role === "user" && (
                <SidebarDropdown
                  icon={<IconGridDots />}
                  label="Management"
                  isOpen={isOpen}
                  isExpanded={dropdowns.user}
                  toggleDropdown={() => toggleDropdown("user")}
                >
                  <SidebarItem
                    icon={<IconFolder />}
                    label="Docs Management"
                    isOpen={isOpen}
                    to="/docs"
                  />
                  <SidebarItem
                    icon={<IconUser />}
                    label="Profile"
                    isOpen={isOpen}
                    to="/user-profile"
                  />
                  <SidebarItem
                    icon={<IconCalendar />}
                    label="Leave Tracker"
                    isOpen={isOpen}
                    to="/leave-tracker"
                  />
                  <SidebarItem
                    icon={<IconKey />}
                    label="Payslip Tracker"
                    isOpen={isOpen}
                    to="/payslip-tracker"
                  />

                  <SidebarItem
                    icon={<ReceiptIndianRupee />}
                    label="Add Expense"
                    isOpen={isOpen}
                    to="/add-expense"
                  />

                  <SidebarItem
                    icon={<IconSettings />}
                    label="Expense Tracker"
                    isOpen={isOpen}
                    to="/expense-tracker"
                  />

                  <SidebarItem
                    icon={<IconKey />}
                    label="Change Password"
                    isOpen={isOpen}
                    to="/change-password"
                  />
                  {/* <SidebarItem icon={<IconId />} label="Employee Registration" isOpen={isOpen} to="/emp-info" />   */}
                </SidebarDropdown>
              )}

              {/* Apps Dropdown for Admin/SuperAdmin */}
              {user &&
                (user.role === "admin" || user.role === "superAdmin") && (
                  <>
                    {(user && user.role === "admin") ||
                    user.role === "superAdmin" ? (
                      <SidebarItem
                        icon={<IconId />}
                        label="Employee Registration"
                        isOpen={isOpen}
                        to="/emp-info-register"
                      />
                    ) : null}

                    <SidebarDropdown
                      icon={<IconGridDots />}
                      label="Apps"
                      isOpen={isOpen}
                      isExpanded={dropdowns.apps}
                      toggleDropdown={() => toggleDropdown("apps")}
                    >
                      {/* Employee Management Dropdown */}
                      <SidebarDropdown
                        icon={<IconUsers />}
                        label="Employee Management"
                        isOpen={isOpen}
                        isExpanded={dropdowns.user}
                        toggleDropdown={() => toggleDropdown("user")}
                      >
                        <SidebarItem
                          icon={<IconFolder />}
                          label="Employee Docs Management"
                          isOpen={isOpen}
                          to="/docs"
                        />
                        <SidebarItem
                          icon={<IconCalendar />}
                          label="Leave Tracker"
                          isOpen={isOpen}
                          to="/leave-tracker"
                        />
                        <SidebarItem
                          icon={<IconUsers />}
                          label="Add Employee"
                          isOpen={isOpen}
                          to="/add-employee"
                        />
                        {user && user.role === "superAdmin" ? (
                          <SidebarItem
                            icon={<IconId />}
                            label="Employee Details"
                            isOpen={isOpen}
                            to="/emp-list"
                          />
                        ) : null}
                      </SidebarDropdown>

                      {/* Job Management Dropdown */}
                      <SidebarDropdown
                        icon={<IconBriefcase />}
                        label="Job Management"
                        isOpen={isOpen}
                        isExpanded={dropdowns.job}
                        toggleDropdown={() => toggleDropdown("job")}
                      >
                        <SidebarItem
                          icon={<IconBriefcase />}
                          label="Post Current Job Openings"
                          isOpen={isOpen}
                          to="/post-job"
                        />
                        <SidebarItem
                          icon={<IconBriefcase />}
                          label="Job Application Management"
                          isOpen={isOpen}
                          to="/application"
                        />
                      </SidebarDropdown>
                    </SidebarDropdown>

                    {/* Talent Management */}
                    <SidebarDropdown
                      icon={<IconUser />}
                      label="Talent Management"
                      isOpen={isOpen}
                      isExpanded={dropdowns.talent}
                      toggleDropdown={() => toggleDropdown("talent")}
                    >
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
                    </SidebarDropdown>

                    <SidebarDropdown
                      icon={<IconUsers />}
                      label="Payslip Management"
                      isOpen={isOpen}
                      isExpanded={dropdowns.payslip}
                      toggleDropdown={() => toggleDropdown("payslip")}
                    >
                      <SidebarItem
                        icon={<IconFileText />}
                        label="PaySlip Tracker"
                        isOpen={isOpen}
                        to="/payslip-tracker"
                      />
                      {user && user.role === "superAdmin" ? (
                        <SidebarItem
                          icon={<IconFilePlus />}
                          label="PaySlip Generator"
                          isOpen={isOpen}
                          to="/payslip"
                        />
                      ) : null}
                    </SidebarDropdown>

                    {user && user.role === "superAdmin" && (
                      <SidebarItem
                        icon={<IconSettings />}
                        label="Expense Tracker"
                        isOpen={isOpen}
                        to="/expense-tracker"
                      />
                    )}

                    <SidebarItem
                      label="Resume Analyzer"
                      icon={<IconFilePlus />}
                      isOpen={isOpen}
                      to="/resume-analyze"
                    />

                    {/* Authentication Management */}
                    <SidebarItem
                      icon={<IconSettings />}
                      label="Authentication Management"
                      isOpen={isOpen}
                      to="/auth"
                    />
                  </>
                )}
              {user && user.role === "accountant" && (
                <>
                  <SidebarItem
                    icon={<IconId />}
                    label="Employee Details"
                    isOpen={isOpen}
                    to="/emp-list"
                  />
                  <SidebarDropdown
                    icon={<IconUsers />}
                    label="Payslip Management"
                    isOpen={isOpen}
                    isExpanded={dropdowns.payslip}
                    toggleDropdown={() => toggleDropdown("payslip")}
                  >
                    <SidebarItem
                      icon={<IconFileText />}
                      label="PaySlip Tracker"
                      isOpen={isOpen}
                      to="/payslip-tracker"
                    />

                    <SidebarItem
                      icon={<IconFilePlus />}
                      label="PaySlip Generator"
                      isOpen={isOpen}
                      to="/payslip"
                    />
                  </SidebarDropdown>

                  <SidebarDropdown
                    icon={<IconUsers />}
                    label="Expense Management"
                    isOpen={isOpen}
                    isExpanded={dropdowns.expense}
                    toggleDropdown={() => toggleDropdown("expense")}
                  >

                    <SidebarItem
                      icon={<IconFileText />}
                      label="Expense Tracker"
                      isOpen={isOpen}
                      to="/expense-tracker"
                    />

                    <SidebarItem
                      icon={<IconFilePlus />}
                      label="Expense Generator" 
                      isOpen={isOpen}
                      to="/expense"
                    />
                  </SidebarDropdown>
                </>
              )}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="mt-auto px-6 py-4">
            <button
              onClick={() => handleLogout(setUser)}
              className="flex items-center w-full px-4 py-2 text-red-500 rounded-md hover:bg-red-700 hover:text-white"
            >
              <IconLogout className="text-lg" />
              {isOpen && <span className="ml-3 text-sm">Logout</span>}
            </button>
          </div>
        </aside>
      </div>
    </>
  );
};

// Sidebar item component
const SidebarItem = ({ icon, label, isOpen, to }) => {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center space-x-4 px-6 py-2 rounded-md ${
            isActive ? "bg-indigo-600 text-white" : "hover:bg-gray-700"
          }`
        }
      >
        <span className="text-xl">{icon}</span>
        <span
          className={`${
            isOpen ? "block" : "hidden"
          } text-sm font-medium duration-300`}
        >
          {label}
        </span>
      </NavLink>
    </li>
  );
};

// Sidebar dropdown component
const SidebarDropdown = ({
  icon,
  label,
  isOpen,
  isExpanded,
  toggleDropdown,
  children,
}) => (
  <li>
    <button
      onClick={toggleDropdown}
      className={`flex items-center justify-between w-full px-6 py-2 rounded-md ${
        isExpanded ? "bg-gray-700" : "hover:bg-gray-700"
      }`}
    >
      <div className="flex items-center space-x-4">
        {icon}
        {isOpen && <span className="text-sm font-medium">{label}</span>}
      </div>
      {isOpen && (isExpanded ? <IconChevronUp /> : <IconChevronDown />)}
    </button>
    {isExpanded && <ul className="ml-6 mt-2 space-y-2">{children}</ul>}
  </li>
);

export default Sidebar;
export { handleLogout };
