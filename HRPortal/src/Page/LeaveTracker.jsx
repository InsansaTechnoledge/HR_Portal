// LeaveTracker.jsx
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Calendar as CalendarIcon, Clock, Users, Plus, X } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../config";
import { userContext } from "../Context/userContext";
import Loader from "../Components/Loader/Loader";
import SuccessToast from "../Components/Toaster/SuccessToaser";
import ErrorToast from "../Components/Toaster/ErrorToaster";


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

  // --- Fetch minimal data on mount / user change ---
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchLists = async () => {
      if (!user) return;
      setLoading(true);
      try {
        if (user.role === "admin" || user.role === "superAdmin") {
          const [userResp, empResp] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/user`, {
              params: { fields: "_id,userName,userEmail,role", limit: 200 },
              signal,
            }),
            axios.get(`${API_BASE_URL}/api/employee`, {
              params: { fields: "_id,name,email,department,empId", limit: 200 },
              signal,
            }),
          ]);

          const formattedUsers = (userResp?.data || []).map((u) => ({
            empId: u._id || u.userId || u.empId,
            name: u.userName || u.name,
            email: u.userEmail || u.email,
            department: u.role || "User",
            leaveHistory: u.leaveHistory || [],
          }));
          setUsers(formattedUsers);

          const empList = empResp?.data?.employees || [];
          const formattedEmployees = empList.map((e) => ({
            empId: e._id || e.empId,
            name: e.name || e.userName,
            email: e.email || e.userEmail,
            department: e.department || e.role || "User",
            leaveHistory: e.leaveHistory || [],
          }));
          setEmployees(formattedEmployees);

          // Restore last viewed person for admins
          const lastSelection = localStorage.getItem("leaveTracker:lastSelection");
          if (lastSelection) {
            try {
              const parsed = JSON.parse(lastSelection);
              if (parsed?.type === "employee" && parsed.id) {
                setSelectedEmployeeId(String(parsed.id));
                setSelectedUserId("");
              }
              if (parsed?.type === "user" && parsed.id) {
                setSelectedUserId(String(parsed.id));
                setSelectedEmployeeId("");
              }
            } catch (e) {
              console.warn("Failed to restore leave tracker selection", e);
            }
          }
        } else {
          // Non-admins only need their own details
          const resp = await axios.get(`${API_BASE_URL}/api/user/${user._id}`, { signal });
          const u = resp?.data?.user;
          if (u) {
            const self = {
              empId: u._id || u.userId,
              name: u.userName || u.name,
              email: u.userEmail || u.email,
              department: u.role || "User",
              leaveHistory: u.leaveHistory || [],
            };
            setCurrentPerson(self);
            setSelectedUserId(self.empId ? String(self.empId) : "");
            setSelectedEmployeeId("");
            localStorage.setItem(
              "leaveTracker:lastSelection",
              JSON.stringify({ type: "user", id: self.empId ? String(self.empId) : "" })
            );
          }
        }
      } catch (err) {
        if (axios.isCancel?.(err)) return;
        console.error("Error fetching lists:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
    return () => {
      controller.abort();
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

    // For non-admin roles, default to user API even if selectedEmployeeId was set via restore
    const shouldForceUserApi = !isUser && user && user.role !== "admin" && user.role !== "superAdmin";
    const effectiveIsUser = isUser || shouldForceUserApi;
    const effectiveId = shouldForceUserApi ? (selectedUserId || selectedEmployeeId) : id;

    // Avoid refetching if we already have the same person cached
    if (currentPerson && currentPerson.empId && String(currentPerson.empId) === String(effectiveId)) {
      setSelectedMonth(null);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        if (effectiveIsUser) {
          const resp = await axios.get(`${API_BASE_URL}/api/user/${effectiveId}`, { signal });
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
          setCurrentPerson(person);
        } else {
          const resp = await axios.get(`${API_BASE_URL}/api/employee/${effectiveId}`, { signal });
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

          setCurrentPerson(person);
        }
      } catch (err) {
        if (axios.isCancel?.(err)) return;
        console.error("Error fetching details:", err);
        setCurrentPerson(null);
      } finally {
        setLoading(false);
        setSelectedMonth(null); // reset month when selection changes
      }
    };

    fetchDetails();
    return () => {
      controller.abort();
    };
  }, [selectedEmployeeId, selectedUserId, currentPerson, user]);

  // --- Helper to compute available months and per-month lookup maps ---
  const { availableLeaveMonths, leaveLookupByMonth } = useMemo(() => {
    if (!currentPerson || !Array.isArray(currentPerson.leaveHistory)) {
      return { availableLeaveMonths: [], leaveLookupByMonth: new Map() };
    }

    const months = new Set();
    const monthMap = new Map();

    currentPerson.leaveHistory.forEach((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      for (
        let d = new Date(start.getFullYear(), start.getMonth(), 1);
        d <= new Date(end.getFullYear(), end.getMonth(), 1);
        d.setMonth(d.getMonth() + 1)
      ) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        months.add(key);
      }

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const dateStr = d.toDateString();
        if (!monthMap.has(key)) monthMap.set(key, new Map());
        monthMap.get(key).set(dateStr, leave.type);
      }
    });

    return {
      availableLeaveMonths: Array.from(months).sort(),
      leaveLookupByMonth: monthMap,
    };
  }, [currentPerson]);

  const leaveLookupForSelectedMonth = useMemo(() => {
    if (!selectedMonth) return new Map();
    return leaveLookupByMonth.get(selectedMonth) || new Map();
  }, [leaveLookupByMonth, selectedMonth]);

  const isLeaveDate = useCallback(
    (date) => leaveLookupForSelectedMonth.has(date.toDateString()),
    [leaveLookupForSelectedMonth]
  );

  const getLeaveTypeForDate = useCallback(
    (date) => leaveLookupForSelectedMonth.get(date.toDateString()) || null,
    [leaveLookupForSelectedMonth]
  );

  // --- Handlers to ensure mutual exclusivity ---
  const handleEmployeeSelect = (empId) => {
    const normalized = empId || "";
    setSelectedEmployeeId(normalized);
    if (normalized) {
      setSelectedUserId("");
      localStorage.setItem("leaveTracker:lastSelection", JSON.stringify({ type: "employee", id: normalized }));
    } else {
      localStorage.removeItem("leaveTracker:lastSelection");
    }
  };

  const handleUserSelect = (uId) => {
    const normalized = uId || "";
    setSelectedUserId(normalized);
    if (normalized) {
      setSelectedEmployeeId("");
      localStorage.setItem("leaveTracker:lastSelection", JSON.stringify({ type: "user", id: normalized }));
    } else {
      localStorage.removeItem("leaveTracker:lastSelection");
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

        // Optimistically merge the new leave into current view so previous leaves stay visible
        setCurrentPerson((prev) => {
          if (!prev) return prev;
          const merged = [...(prev.leaveHistory || []), { ...newLeave }];
          return { ...prev, leaveHistory: merged };
        });

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

  // helper to refresh data after save: refetch only the updated person
  const refreshAfterSave = async (targetId, wasUser) => {
    setLoading(true);
    try {
      if (wasUser) {
        const det = await axios.get(`${API_BASE_URL}/api/user/${targetId}`);
        const u = det?.data?.user;
        if (u) {
          const updated = {
            empId: u._id || u.userId,
            name: u.userName || u.name,
            email: u.userEmail || u.email,
            department: u.role || "User",
            leaveHistory: u.leaveHistory || [],
          };
          setCurrentPerson(updated);
          setSelectedUserId(updated.empId);
          setSelectedEmployeeId("");
          setUsers((prev) =>
            prev.length
              ? prev.map((p) => (String(p.empId) === String(updated.empId) ? updated : p))
              : prev
          );
          localStorage.setItem("leaveTracker:lastSelection", JSON.stringify({ type: "user", id: updated.empId }));
        }
      } else {
        const det = await axios.get(`${API_BASE_URL}/api/employee/${targetId}`);
        const e = det?.data?.employee;
        if (e) {
          const updated = {
            empId: e._id || e.empId,
            name: e.name || e.userName,
            email: e.email || e.userEmail,
            department: e.department || e.role || "User",
            leaveHistory: e.leaveHistory || [],
          };
          setCurrentPerson(updated);
          setSelectedEmployeeId(updated.empId);
          setSelectedUserId("");
          setEmployees((prev) =>
            prev.length
              ? prev.map((p) => (String(p.empId) === String(updated.empId) ? updated : p))
              : prev
          );
          localStorage.setItem("leaveTracker:lastSelection", JSON.stringify({ type: "employee", id: updated.empId }));
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

  const filteredEmployees = useMemo(() => {
    if (!activeFilterOnlyApplied) return employees;
    return employees.filter((emp) => emp.leaveHistory && emp.leaveHistory.length > 0);
  }, [activeFilterOnlyApplied, employees]);

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
                    {filteredEmployees.length === 0 && <option value="">No employees available</option>}
                    {filteredEmployees.map((emp) => (
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
