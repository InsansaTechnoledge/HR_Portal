// LeaveTracker.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Calendar as CalendarIcon, Clock, Users, Plus, X } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../config";
import { userContext } from "../Context/userContext";
import Loader from "../Components/Loader/Loader";
import SuccessToast from "../Components/Toaster/SuccessToaser";
import ErrorToast from "../Components/Toaster/ErrorToaster";

/**
 * Behavior summary:
 * - Employee and User dropdowns are mutually exclusive (selecting one clears the other)
 * - Dropdowns include a "Select ..." placeholder as first option
 * - Clicking "Add Leave" resets both dropdowns to placeholder and opens modal
 * - On Save: leave posted to selectedUserId || selectedEmployeeId || current logged-in user._id
 * - Months and calendar derive from the currently selected "person" (unified structure)
 */

const leaveTypes = [
  "Vacation",
  "Sick Leave",
  "Personal",
  "Maternity",
  "Paternity",
  "Unpaid Leave",
];

const LeaveTypeColors = {
  Vacation: "bg-blue-100 text-blue-800",
  "Sick Leave": "bg-red-100 text-red-800",
  Personal: "bg-green-100 text-green-800",
  Maternity: "bg-purple-100 text-purple-800",
  "Unpaid Leave": "bg-gray-100 text-gray-800",
};

const initialForm = { type: "", startDate: "", endDate: "" };

const LeaveTracker = () => {
  const { user } = useContext(userContext);

  // lists
  const [employees, setEmployees] = useState([]); // from employee collection (admin view)
  const [users, setUsers] = useState([]); // from user collection

  // selection: placeholders are empty strings
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  // unified "current person" object used for months/calendar
  const [currentPerson, setCurrentPerson] = useState(null); // { empId, name, email, department, leaveHistory }

  // UI state
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);
  const [oneDayLeave, setOneDayLeave] = useState(false);
  const [newLeave, setNewLeave] = useState(initialForm);
  const [activeFilterOnlyApplied, setActiveFilterOnlyApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  // toasts
  const [toastSuccessVisible, setToastSuccessVisible] = useState(false);
  const [toastErrorVisible, setToastErrorVisible] = useState(false);
  const [toastSuccessMessage, setToastSuccessMessage] = useState("");
  const [toastErrorMessage, setToastErrorMessage] = useState("");

  // --- Fetch lists on mount / when user changes ---
  useEffect(() => {
    let cancelled = false;

    const fetchLists = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch users collection for admin view / for mapping
        const userResp = await axios.get(`${API_BASE_URL}/api/user`);
        // Expect userResp.data to be an array of users
        const formattedUsers = (userResp?.data || []).map((u) => ({
          empId: u._id || u.userId || u.empId,
          name: u.userName || u.name,
          email: u.userEmail || u.email,
          department: u.role || "User",
          leaveHistory: u.leaveHistory || [],
        }));
        if (!cancelled) setUsers(formattedUsers);

        // Fetch employees (separate collection) if admin
        if (user.role === "admin" || user.role === "superAdmin") {
          const empResp = await axios.get(`${API_BASE_URL}/api/employee`);
          // Expect empResp.data.employees
          const empList = empResp?.data?.employees || [];
          const formattedEmployees = empList.map((e) => ({
            empId: e._id || e.empId,
            name: e.name || e.userName,
            email: e.email || e.userEmail,
            department: e.department || e.role || "User",
            leaveHistory: e.leaveHistory || [],
          }));
          if (!cancelled) {
            setEmployees(formattedEmployees);
          }
        } else {
          // For normal user role, show only their entry in employees (single)
          // We'll attempt to find in user list by email
          const match = formattedUsers.find((u) => u.email === user.userEmail);
          if (!cancelled) {
            if (match) {
              setEmployees([match]);
              setCurrentPerson(match);
              setSelectedEmployeeId(match.empId);
            } else {
              setEmployees([]);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching lists:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLists();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // --- Unified fetch for details when a selection changes ---
  // Whenever selectedEmployeeId or selectedUserId changes, we should fetch details for that person
  useEffect(() => {
    // If both are empty -> clear current person and months
    if (!selectedEmployeeId && !selectedUserId) {
      setCurrentPerson(null);
      setSelectedMonth(null);
      return;
    }

    // If both somehow set, prefer selectedUserId (but we keep mutual exclusion in handlers)
    const id = selectedUserId || selectedEmployeeId;
    const isUser = Boolean(selectedUserId);

    let cancelled = false;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        if (isUser) {
          const resp = await axios.get(`${API_BASE_URL}/api/user/${id}`);
          // Expect resp.data.user
          const u = resp?.data?.user;
          const person = u
            ? {
                empId: u._id || u.userId,
                name: u.userName || u.name,
                email: u.userEmail || u.email,
                department: u.role || "User",
                leaveHistory: u.leaveHistory || [],
              }
            : null;
          if (!cancelled) setCurrentPerson(person);
        } else {
          const resp = await axios.get(`${API_BASE_URL}/api/employee/${id}`);
          // Expect resp.data.employee[0] or resp.data.employee
          const e = resp?.data?.employee;
          const person = e
            ? {
                empId: e._id,
                name: e.name,
                email: e.email,
                department: e.department || "User",
                leaveHistory: e.leaveHistory,
                }
            : null;

          if (!cancelled) setCurrentPerson(person);
        }
      } catch (err) {
        console.error("Error fetching details:", err);
        if (!cancelled) setCurrentPerson(null);
      } finally {
        if (!cancelled) setLoading(false);
        if (!cancelled) setSelectedMonth(null); // reset month when selection changes
      }
    };

    fetchDetails();
    return () => {
      cancelled = true;
    };
  }, [selectedEmployeeId, selectedUserId]);

  // --- Helper to compute available months from currentPerson.leaveHistory ---
  const availableLeaveMonths = useMemo(() => {
    if (!currentPerson || !Array.isArray(currentPerson.leaveHistory)) return [];
    const months = new Set();
    currentPerson.leaveHistory.forEach((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      for (
        let d = new Date(start.getFullYear(), start.getMonth(), 1);
        d <= new Date(end.getFullYear(), end.getMonth(), 1);
        d.setMonth(d.getMonth() + 1)
      ) {
        months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      }
    });
    // convert to sorted array (newest last)
    return Array.from(months).sort();
  }, [currentPerson]);

  // --- get leave dates for selected month ---
  const getLeaveDatesForMonth = (month) => {
    if (!currentPerson || !month || !Array.isArray(currentPerson.leaveHistory)) return [];
    const [yearStr, monthStr] = month.split("-");
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10); // 1-based
    const dates = [];
    currentPerson.leaveHistory.forEach((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getFullYear() === year && d.getMonth() + 1 === monthNum) {
          dates.push({ date: new Date(d), type: leave.type });
        }
      }
    });
    return dates;
  };

  const isLeaveDate = (date) => {
    if (!selectedMonth) return false;
    const leaveDates = getLeaveDatesForMonth(selectedMonth);
    return leaveDates.some((ld) => ld.date.toDateString() === date.toDateString());
  };

  const getLeaveTypeForDate = (date) => {
    if (!selectedMonth) return null;
    const leaveDates = getLeaveDatesForMonth(selectedMonth);
    const found = leaveDates.find((ld) => ld.date.toDateString() === date.toDateString());
    return found ? found.type : null;
  };

  // --- Handlers to ensure mutual exclusivity ---
  const handleEmployeeSelect = (empId) => {
    setSelectedEmployeeId(empId || "");
    // reset user selection
    if (empId) {
      setSelectedUserId("");
    }
  };

  const handleUserSelect = (uId) => {
    setSelectedUserId(uId || "");
    // reset employee selection
    if (uId) {
      setSelectedEmployeeId("");
    }
  };

  // --- Add Leave flow ---
  // Clicking the Add Leave button resets both dropdowns to placeholders (per requirement)
  const handleOpenAddLeave = () => {
    setSelectedEmployeeId("");
    setSelectedUserId("");
    setSelectedMonth(null);
    setNewLeave(initialForm);
    setOneDayLeave(false);
    setShowAddLeaveModal(true);
  };

  // Save a leave: determine target ID and endpoint, post, then refresh lists & show success
  const handleSaveLeave = async () => {
    // basic validation
    if (!newLeave.type || !newLeave.startDate || !newLeave.endDate) {
      setToastErrorMessage("Please fill all details");
      setToastErrorVisible(true);
      setTimeout(() => setToastErrorVisible(false), 3000);
      return;
    }
    if (new Date(newLeave.startDate) > new Date(newLeave.endDate)) {
      setToastErrorMessage("End date can't be before start date");
      setToastErrorVisible(true);
      setTimeout(() => setToastErrorVisible(false), 3000);
      return;
    }

    // Choose target: user selection -> employee selection -> fallback logged-in user
    const targetId = selectedUserId || selectedEmployeeId || (user && user._id);
    if (!targetId) {
      setToastErrorMessage("No target user/employee to add leave");
      setToastErrorVisible(true);
      setTimeout(() => setToastErrorVisible(false), 3000);
      return;
    }

    // Decide path: if selectedUserId used or fallback to logged-in user, call user API
    // otherwise call employee API
    const useUserApi = Boolean(selectedUserId) || (!selectedEmployeeId && (!selectedUserId || user?.role === "user"));

    // console.log("Adding leave for ID:", targetId, "via", useUserApi ? "User API" : "Employee API");
    // Build endpoint names (update names if your backend uses different endpoints)
    const userEndpoint = `${API_BASE_URL}/api/user/addLeave/${targetId}`; // adjust if your backend path differs
    const employeeEndpoint = `${API_BASE_URL}/api/employee/addLeave/${targetId}`;

    const apiEndpoint = useUserApi ? userEndpoint : employeeEndpoint;

    try {
      const resp = await axios.post(apiEndpoint, newLeave);
      if (resp.status === 201 || resp.status === 200) {
        setToastSuccessMessage("Leave added successfully!");
        setToastSuccessVisible(true);
        setTimeout(() => setToastSuccessVisible(false), 3500);
        // Refresh lists & current person:
        await refreshAfterSave(targetId, useUserApi);
      } else {
        throw new Error("Unexpected response while adding leave");
      }
    } catch (err) {
      console.error("Error adding leave", err);
      setToastErrorMessage("Error adding leave. Please try again.");
      setToastErrorVisible(true);
      setTimeout(() => setToastErrorVisible(false), 3500);
    } finally {
      setShowAddLeaveModal(false);
      setNewLeave(initialForm);
      setOneDayLeave(false);
    }
  };

  // helper to refresh data after save: refetch updated person and lists
  const refreshAfterSave = async (targetId, wasUser) => {
    setLoading(true);
    try {
      // Refresh user list always (useful for admins)
      const userResp = await axios.get(`${API_BASE_URL}/api/user`);
      const formattedUsers = (userResp?.data || []).map((u) => ({
        empId: u._id || u.userId || u.empId,
        name: u.userName || u.name,
        email: u.userEmail || u.email,
        department: u.role || "User",
        leaveHistory: u.leaveHistory || [],
      }));
      setUsers(formattedUsers);

      if (user.role === "admin" || user.role === "superAdmin") {
        // refresh employees list
        const empResp = await axios.get(`${API_BASE_URL}/api/employee`);
        const empList = empResp?.data?.employees || [];
        setEmployees(
          empList.map((e) => ({
            empId: e._id || e.empId,
            name: e.name || e.userName,
            email: e.email || e.userEmail,
            department: e.department || e.role || "User",
            leaveHistory: e.leaveHistory || [],
          }))
        );
      }

      // refetch details for the person we updated (so months show the newly-added leave)
      if (wasUser) {
        const det = await axios.get(`${API_BASE_URL}/api/user/${targetId}`);
        const u = det?.data?.user;
        if (u) {
          setCurrentPerson({
            empId: u._id || u.userId,
            name: u.userName || u.name,
            email: u.userEmail || u.email,
            department: u.role || "User",
            leaveHistory: u.leaveHistory || [],
          });
          // set selection to that person so months show
          setSelectedUserId(u._id || u.userId);
          setSelectedEmployeeId("");
        }
      } else {
        // employee path
        const det = await axios.get(`${API_BASE_URL}/api/employee/${targetId}`);
        const e = det?.data?.employee ? det.data.employee[0] : det?.data;
        if (e) {
          setCurrentPerson({
            empId: e._id || e.empId,
            name: e.name || e.userName,
            email: e.email || e.userEmail,
            department: e.department || e.role || "User",
            leaveHistory: e.leaveHistory || [],
          });
          setSelectedEmployeeId(e._id || e.empId);
          setSelectedUserId("");
        }
      }
      setSelectedMonth(null);
    } catch (err) {
      console.error("Error refreshing after save:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add leave modal open/reset behavior already handled in handleOpenAddLeave
  // small UI helpers:
  const handleToggleOneDay = () => {
    setOneDayLeave((v) => !v);
    setNewLeave((p) => ({ ...p, startDate: "", endDate: "" }));
  };

  // When an admin checks "only applied leaves", filter employee list accordingly
  useEffect(() => {
    if (!activeFilterOnlyApplied) {
      // restore full list (we keep original list in `employees` state)
      return;
    }
    // if active, filter employees to those having leaveHistory
    setEmployees((prev) => prev.filter((emp) => emp.leaveHistory && emp.leaveHistory.length > 0));
  }, [activeFilterOnlyApplied]);

  // Loading state
  if (loading) return <Loader />;

  return (
    <>
      {toastSuccessVisible ? <SuccessToast message={toastSuccessMessage} /> : null}
      {toastErrorVisible ? <ErrorToast error={toastErrorMessage} /> : null}

      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg p-6 border-r">
          <div className="flex items-center mb-8">
            <Users className="mr-3 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Leave Tracker</h2>
          </div>

          {/* Employee Selector (admins only) */}
          <div className="mb-6">
            {user && user.role !== "user" && user.role !== 'employee' && (
              <>
                <div className="flex justify-start space-x-1 mb-3">
                  <input
                    type="checkbox"
                    id="activeLeave"
                    className="hover:cursor-pointer"
                    onChange={() => setActiveFilterOnlyApplied((v) => !v)}
                    checked={activeFilterOnlyApplied}
                  />
                  <label htmlFor="activeLeave" className="text-sm hover:cursor-pointer">
                    Only applied leaves
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => handleEmployeeSelect(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Select Employee</option>
                    {employees.length === 0 && <option value="">No employees available</option>}
                    {employees.map((emp) => (
                      <option key={emp.empId} value={String(emp.empId)}>
                        {emp.name} - {emp.department}
                      </option>
                    ))}
                  </select>
                </div>

              {/* USER SELECTOR */}
              <div className="mt-4 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => handleUserSelect(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="">Select User</option>
                  {users.length === 0 && <option value="">No users available</option>}
                  {users.map((u) => (
                    <option key={u.empId} value={String(u.empId)}>
                      {u.name} — {u.department}
                    </option>
                  ))}
                </select>
            </div>
            </>
        )}
      </div>


          {/* Add Leave Button */}
          <button
            onClick={handleOpenAddLeave}
            className="w-full flex items-center justify-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            <Plus className="mr-2" /> Add Leave
          </button>

          {/* Leave Months */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Leave Months</h3>
            <div className="space-y-2">
              {availableLeaveMonths.length === 0 && <div className="text-sm text-gray-500">No months available</div>}
              {availableLeaveMonths.map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition flex items-center ${
                    selectedMonth === month ? "bg-gray-100" : ""
                  }`}
                >
                  <Clock className="mr-2 text-gray-500" size={16} />
                  {new Date(`${month}-01`).toLocaleString("default", { month: "long", year: "numeric" })}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {selectedMonth ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {new Date(`${selectedMonth}-01`).toLocaleString("default", { month: "long", year: "numeric" })}
                </h2>
                <button onClick={() => setSelectedMonth(null)} className="text-gray-600 hover:text-gray-900 transition">
                  <X />
                </button>
              </div>

              {/* Calendar */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <Calendar
                  value={selectedMonth ? new Date(`${selectedMonth}-01`) : null}
                  tileClassName={({ date }) => (isLeaveDate(date) ? "bg-blue-100 rounded-full text-blue-800 font-bold" : "")}
                  tileContent={({ date }) => {
                    const leaveType = getLeaveTypeForDate(date);
                    return leaveType ? (
                      <div className="text-[10px] text-center mt-1">
                        <span className={`px-1 rounded ${LeaveTypeColors[leaveType]} text-[8px]`}>{leaveType}</span>
                      </div>
                    ) : null;
                  }}
                />
              </div>

              {/* Leave Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {currentPerson?.leaveHistory
                  ?.filter((leave) => {
                    const start = new Date(leave.startDate);
                    const [year, month] = selectedMonth.split("-");
                    return start.getFullYear() === parseInt(year) && start.getMonth() + 1 === parseInt(month);
                  })
                  .map((leave, idx) => (
                    <div key={idx} className={`p-4 rounded-lg shadow-md ${LeaveTypeColors[leave.type] || ""}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{leave.type}</span>
                        <CalendarIcon size={16} />
                      </div>
                      <div className="mt-2 text-sm">
                        {leave.startDate === leave.endDate
                          ? new Date(leave.startDate).toLocaleDateString()
                          : new Date(leave.startDate).toLocaleDateString() + " - " + new Date(leave.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16">Select a month to view leave details</div>
          )}
        </div>

        {/* Add Leave Modal */}
        {showAddLeaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Leave</h3>
                <button onClick={() => setShowAddLeaveModal(false)}>
                  <X className="text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                  <select
                    value={newLeave.type}
                    onChange={(e) => setNewLeave((p) => ({ ...p, type: e.target.value }))}
                    className="w-full rounded-md border-gray-300"
                  >
                    <option value="" disabled>
                      Select Leave Type
                    </option>
                    {leaveTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-start space-x-1 mb-3">
                    <input type="checkbox" id="oneDayLeave" checked={oneDayLeave} onChange={handleToggleOneDay} />
                    <label htmlFor="oneDayLeave" className="text-sm">
                      One day leave
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{oneDayLeave ? "Leave Date" : "Start Date"}</label>
                  <input
                    id="startDate"
                    type="date"
                    value={newLeave.startDate}
                    onChange={(e) =>
                      setNewLeave((p) =>
                        oneDayLeave ? { ...p, startDate: e.target.value, endDate: e.target.value } : { ...p, startDate: e.target.value }
                      )
                    }
                    className="w-full rounded-md border-gray-300"
                  />
                </div>

                {!oneDayLeave && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input id="endDate" type="date" value={newLeave.endDate} onChange={(e) => setNewLeave((p) => ({ ...p, endDate: e.target.value }))} className="w-full rounded-md border-gray-300" />
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <button onClick={() => setShowAddLeaveModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">
                    Cancel
                  </button>
                  <button onClick={handleSaveLeave} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LeaveTracker;
