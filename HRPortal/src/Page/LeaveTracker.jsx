// LeaveTracker.jsx
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Calendar as CalendarIcon, Clock, Users, Plus, X, User2, User as UserIcon, Filter, User, Loader2 } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../config";
import { userContext } from "../Context/userContext";
import Loader from "../Components/Loader/Loader";

import { Briefcase, ChevronDown } from "lucide-react";
import { Button } from "../Components/ui/button";
import { Checkbox } from "../Components/ui/checkbox";
import { Label } from "../Components/ui/label";
import { Input } from "../Components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../Components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { toast } from "../hooks/useToast";
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

  const authUser = user;

  const role = authUser?.role;

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Which view is active: my | employee | user
  const [leaveViewMode, setLeaveViewMode] = useState("my");

  // My leaves (logged-in user)
  const myLeaves = useMemo(() => {
    if (!authUser) return [];
    return currentPerson && leaveViewMode === "my"
      ? currentPerson.leaveHistory || []
      : [];
  }, [authUser, currentPerson, leaveViewMode]);


  const leavesForView = useMemo(() => {
    if (leaveViewMode === "my") {
      return currentPerson?.leaveHistory || [];
    }

    if ((leaveViewMode === "employee" || leaveViewMode === "user") && currentPerson) {
      return currentPerson.leaveHistory || [];
    }

    return [];
  }, [leaveViewMode, currentPerson]);

  // Calculates number of leave days within a month (inclusive)
  const getDaysInMonthRange = (startDate, endDate, monthStart, monthEnd) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // normalize time (CRITICAL)
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const effectiveStart = new Date(
      Math.max(start.getTime(), monthStart.getTime())
    );
    const effectiveEnd = new Date(
      Math.min(end.getTime(), monthEnd.getTime())
    );

    if (effectiveStart > effectiveEnd) return 0;

    return (
      Math.floor(
        (effectiveEnd - effectiveStart) / (1000 * 60 * 60 * 24)
      ) + 1
    );
  };


  // Normalize leave type by removing " Leave" suffix
  const normalizeLeaveType = (type) => {
    if (!type) return type;
    return type.replace(" Leave", "").trim();
  };


  // Calculate number of leave days between two dates (inclusive)
  const calculateLeaveDays = (from, to) => {
    if (!from || !to) return 0;

    const start = new Date(from);
    const end = new Date(to);

    // Remove time component (VERY IMPORTANT)
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffInMs = end - start;

    return diffInMs >= 0
      ? Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1
      : 0;
  };


  const displayedLeaves = useMemo(() => {
    if (!selectedMonth) return [];

    const [year, month] = selectedMonth.split("-").map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    monthStart.setHours(0, 0, 0, 0);
    monthEnd.setHours(0, 0, 0, 0);

    return leavesForView
      .map((leave) => {
        const days = getDaysInMonthRange(
          leave.startDate,
          leave.endDate,
          monthStart,
          monthEnd
        );

        if (days === 0) return null;

        return {
          ...leave,
          days,
        };
      })
      .filter(Boolean);
  }, [leavesForView, selectedMonth]);

  // Leave statistics calculation
  const leaveStats = useMemo(() => {
    const leaves = leavesForView;
    const calc = (types) =>
      leaves
        .filter((l) => types.includes(l.type))
        .reduce(
          (sum, l) => sum + calculateLeaveDays(l.startDate, l.endDate),
          0
        );

    return [
      {
        label: "Annual Leave",
        total: 20,
        used: calc(["Annual Leave", "Vacation"]),
        color: "bg-primary",
      },
      {
        label: "Sick Leave",
        total: 12,
        used: calc(["Sick Leave"]),
        color: "bg-hr-amber",
      },
      {
        label: "Personal Leave",
        total: 15,
        used: calc(["Personal"]),
        color: "bg-hr-purple",
      },
      {
        label: "Work from Home",
        total: 24,
        used: calc(["Work from Home"]),
        color: "bg-info",
      },
    ];
  }, [leavesForView]);

  const overallUsedLeaves = useMemo(() => {
    return leavesForView.reduce(
      (sum, l) => sum + calculateLeaveDays(l.startDate, l.endDate),
      0
    );
  }, [leavesForView]);

  // --- Fetch minimal data on mount / user change ---
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchLists = async () => {
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

          // IF ADMIN, set self as default selection
          const selfUser = formattedUsers.find(
            (u) => String(u.empId) === String(user._id)
          );

          if (selfUser) {
            setLeaveViewMode("my");
            setSelectedUserId(String(selfUser.empId));
            setSelectedEmployeeId("");
            setCurrentPerson(selfUser);

            localStorage.setItem(
              "leaveTracker:lastSelection",
              JSON.stringify({ type: "user", id: selfUser.empId })
            );
          }


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
  }, [authUser]);

  // --- Unified fetch for details when a selection changes ---
  // Whenever selectedEmployeeId or selectedUserId changes, we should fetch details for that person
  useEffect(() => {
    if (!selectedEmployeeId && !selectedUserId) {
      setCurrentPerson(null);
      setSelectedMonth(null);
      return;
    }

    const id = selectedUserId || selectedEmployeeId;
    const isUser = Boolean(selectedUserId);

    const controller = new AbortController();
    const { signal } = controller;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        if (isUser) {
          const resp = await axios.get(`${API_BASE_URL}/api/user/${id}`, { signal });
          const u = resp?.data?.user;
          if (u) {
            setCurrentPerson({
              empId: u._id || u.userId,
              name: u.userName || u.name,
              email: u.userEmail || u.email,
              department: u.role || "User",
              leaveHistory: u.leaveHistory || [],
            });
          }
        } else {
          const resp = await axios.get(`${API_BASE_URL}/api/employee/${id}`, { signal });
          const e = resp?.data?.employee;
          if (e) {
            setCurrentPerson({
              empId: e._id,
              name: e.name,
              email: e.email,
              department: e.department || "User",
              leaveHistory: e.leaveHistory || [],
            });
          }
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Error fetching details:", err);
        }
      } finally {
        setLoading(false);
        setSelectedMonth(null);
      }
    };

    fetchDetails();
    return () => controller.abort();
  }, [selectedEmployeeId, selectedUserId]);

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

  // --- Auto-select first available month when currentPerson or available months change ---
  useEffect(() => {
    if (
      availableLeaveMonths.length > 0 &&
      !selectedMonth
    ) {
      setSelectedMonth(availableLeaveMonths[0]);
    }
  }, [availableLeaveMonths, selectedMonth]);

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
    // Note: The UI resets the dropdowns, but the saving logic must target the logged-in user.
    if (authUser.role === 'admin') {
      setSelectedEmployeeId("");
      setSelectedUserId("");
    }
    // setSelectedEmployeeId("");
    // setSelectedUserId("");
    // setSelectedMonth(null);
    setNewLeave(initialForm);
    setOneDayLeave(false);
    setShowAddLeaveModal(true);
  };

  // Save a leave: NOW ALWAYS TARGETS THE LOGGED-IN USER (user._id)
  const handleSaveLeave = async () => {
    // Validation
    if (!newLeave.type || !newLeave.startDate || !newLeave.endDate) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    if (new Date(newLeave.startDate) > new Date(newLeave.endDate)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "End date can't be before start date.",
      });
      return;
    }

    // SAFETY CHECK
    if (!authUser._id) {
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Session expired. Please login again.",
      });
      return;
    }

    // ALWAYS USE AUTH USER ID
    const targetId = authUser._id;

    // API DECISION BASED ON AUTH USER ROLE
    let resp;
    try {
      resp =
        authUser.role === 'user' || authUser.role === 'admin' || authUser.role === 'superadmin' || authUser.role === 'accountant' ?
          resp = await axios.post(`${API_BASE_URL}/api/user/addLeave/${targetId}`, newLeave)
          :
          resp = await axios.post(`${API_BASE_URL}/api/employee/addLeave/${targetId}`, newLeave);

      try {
        // const resp = await axios.post(apiEndpoint, newLeave);
        if (resp.status === 201 || resp.status === 200) {
          toast({
            variant: "success",
            title: "Leave Added Successfully",
            description: "Your leave has been added successfully.",
          });

          // Optimistically merge the new leave into current view so previous leaves stay visible
          setCurrentPerson((prev) => {
            if (!prev) return prev;
            const merged = [...(prev.leaveHistory || []), { ...newLeave }];
            return { ...prev, leaveHistory: merged };
          });

          // Refresh lists & current person:
          // await refreshAfterSave(targetId, useUserApi);
        } else {
          throw new Error("Unexpected response while adding leave");
        }
      } catch (err) {
        console.error("Error adding leave", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.response?.data?.message || "Error adding leave. Please try again.",
        });
      } finally {
        setShowAddLeaveModal(false);
      }
    } catch (err) {
      console.error("Error adding leave:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Error adding leave. Please try again.",
      });
      setLoading(false);
    } finally {
      setNewLeave(initialForm);
      setOneDayLeave(false);
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
  { loading && <Loader /> }

  const getStatusBadge = (status = "pending") => {
    const styles = {
      approved: "bg-success/10 text-success border-success/20",
      pending: "bg-warning/10 text-warning border-warning/20",
      rejected: "bg-destructive/10 text-destructive border-destructive/20",
    };

    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${styles[status] || styles.pending
          }`}
      >
        {status}
      </span>
    );
  }

  // Date formatting helper
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
    // change locale if needed
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="flex flex-col lg:flex-row">
          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden p-4 border-b flex justify-between items-center bg-card">
            <h2 className="font-semibold text-lg">Leave Tracker</h2>
            <Button variant="outline" size="sm" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
              <Filter className="w-4 h-4 mr-2" />
              {mobileSidebarOpen ? "Hide Filters" : "Filters & Employees"}
            </Button>
          </div>

          {/* Admin Sidebar - Only visible for admin/superAdmin */}
          {authUser && (
            <div className={`w-full lg:w-72 xl:w-80 bg-card border-b lg:border-b-0 lg:border-r border-border p-4 lg:p-6 lg:min-h-screen shadow-md ${mobileSidebarOpen ? 'block' : 'hidden lg:block'}`}>
              {authUser.role === "admin" &&
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Leave Management</h2>
                    <p className="text-xs text-muted-foreground">Track employee leaves</p>
                  </div>
                </div>
              }
              {authUser.role === "admin" && (
                <Button
                  variant={leaveViewMode === "my" ? "default" : "outline"}
                  className="w-full mb-4 gap-2"
                  onClick={() => {
                    setLeaveViewMode("my");
                    setSelectedEmployeeId("");
                    setSelectedUserId(user._id);
                    setSelectedMonth(null);
                  }}
                >
                  <UserIcon className="w-4 h-4" />
                  My Leaves
                </Button>

              )}

              {/* Filter checkbox */}
              {authUser.role === 'admin' && (
                <>
                  <div className="flex items-center space-x-2 mb-4 p-3 rounded-lg bg-muted/50">
                    <Checkbox
                      id="activeLeave"
                      checked={activeFilterOnlyApplied}
                      onCheckedChange={() => setActiveFilterOnlyApplied(!activeFilterOnlyApplied)}
                    />
                    <Label htmlFor="activeLeave" className="text-sm cursor-pointer">
                      Show only with leaves
                    </Label>
                  </div>

                  {/* Employee Selector */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Briefcase className="w-4 h-4" />
                        Select Employee
                      </Label>
                      <div className="relative">
                        <Select
                          value={selectedEmployeeId}
                          onValueChange={(val) => {
                            handleEmployeeSelect(val);
                            setLeaveViewMode("employee");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose employee" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectGroup>
                              {employees.map((emp) => (
                                <SelectItem key={emp.empId} value={emp.empId}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <User className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{emp.name}</p>
                                      <p className="text-xs text-muted-foreground">{emp.department}</p>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>

                        <ChevronDown className="absolute right-3 top-4 h-4 w-4 opacity-50 pointer-events-none" />
                      </div>
                    </div>

                    {/* User Selector */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <UserIcon className="w-4 h-4" />
                        Select User
                      </Label>
                      <div className="relative">
                        <Select
                          value={selectedUserId} // currently selected user ID
                          onValueChange={(val) => {
                            handleUserSelect(val);
                            setLeaveViewMode("user");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose user" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectGroup>
                              {users.map((u) => (
                                <SelectItem key={u.empId} value={u.empId}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <User className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{u.name}</p>
                                      <p className="text-xs text-muted-foreground">{u.role}</p>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <ChevronDown className="absolute right-3 top-4 h-4 w-4 opacity-50 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </>
              )}
              {/* Header for Employees */}
              {authUser.role !== "admin" &&
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Employee Leaves</h2>
                    <p className="text-xs text-muted-foreground">Track your leaves</p>
                  </div>
                </div>
              }
              {/* Leave Months for selected person */}
              {currentPerson && availableLeaveMonths.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Leave Months
                  </h3>
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {availableLeaveMonths.map((month) => (
                      <button
                        key={month}
                        onClick={() => setSelectedMonth(month)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-2 text-sm ${selectedMonth === month
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                          }`}
                      >
                        <Clock className="w-4 h-4" />
                        {new Date(`${month}-01`).toLocaleString("default", { month: "long", year: "numeric" })}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Person Info */}
              {currentPerson && (
                <Card className="mt-6 border-dashed">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-2">{currentPerson.name}</h4>
                    <p className="text-xs text-muted-foreground">{currentPerson.email}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">{currentPerson.department}</p>
                    <div className="mt-3 pt-3 border-t border-border">
                      <span className="text-xs font-medium">
                        Total Leaves: {overallUsedLeaves || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 p-4 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Leave Tracker</h1>
                  <p className="text-muted-foreground">
                    {authUser.role === 'admin' ? 'Manage and track all leave requests' : 'Manage your leave requests and balance'}
                  </p>
                </div>
                <Button onClick={handleOpenAddLeave} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Request Leave
                </Button>
              </div>

              {/* Leave Balance - Always visible */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {leaveStats.map((leave, i) => (
                  <Card key={i} className="border-0 shadow-card overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{leave.label}</p>
                          <p className="text-2xl font-bold">{Math.max(0, leave.total - leave.used)}</p>
                          <p className="text-xs text-muted-foreground">days remaining</p>
                        </div>
                        <div className="p-2 rounded-lg bg-secondary">
                          <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Used</span>
                          <span>{leave.used} / {leave.total}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full ${leave.color} rounded-full transition-all duration-500`}
                            style={{
                              width: leave.total
                                ? `${Math.min(100, Math.round((leave.used / leave.total) * 100))}%`
                                : "0%",
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* My Leave Requests */}
              <Card className="border-0 shadow-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">
                    {leaveViewMode === "my"
                      ? "My Leave Requests"
                      : `${currentPerson?.name}'s Leave Requests`}
                  </CardTitle>

                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">From</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">To</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Days</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedLeaves.map((request, idx) => (
                          <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${LeaveTypeColors[request.type] || 'bg-secondary'}`}>
                                  <Clock className="w-4 h-4" />
                                </div>
                                <span className="font-medium">{request.type}</span>
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground">{formatDate(request.startDate)}</td>
                            <td className="p-4 text-muted-foreground">{formatDate(request.endDate)}</td>
                            <td className="p-4">
                              <span className="font-semibold">{request.days}</span>
                            </td>
                            <td className="p-4">{getStatusBadge(request.status || 'pending')}</td>
                            <td className="p-4 text-muted-foreground hidden lg:table-cell">{request.reason || '-'}</td>
                          </tr>
                        ))}
                        {displayedLeaves.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                              No leave requests found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Add Leave Dialog */}
        <Dialog open={showAddLeaveModal} onOpenChange={(open) => {
          if (!loading) {
            setShowAddLeaveModal(open);
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Request Leave
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Leave Type */}
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type *</Label>
                <div className="relative">
                  <Select
                    value={newLeave.type}
                    onValueChange={(val) =>
                      setNewLeave({ ...newLeave, type: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        {leaveTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <ChevronDown className="absolute right-3 top-4 h-4 w-4 opacity-50" />
                </div>
              </div>

              {/* One Day Leave Toggle */}
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50">
                <Checkbox
                  id="oneDayLeave"
                  checked={oneDayLeave}
                  onCheckedChange={handleToggleOneDay}
                />
                <Label htmlFor="oneDayLeave" className="text-sm cursor-pointer">
                  One day leave
                </Label>
              </div>

              {/* Start Date / Leave Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">{oneDayLeave ? "Leave Date *" : "Start Date *"}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newLeave.startDate}
                  onChange={(e) =>
                    setNewLeave(prev =>
                      oneDayLeave
                        ? { ...prev, startDate: e.target.value, endDate: e.target.value }
                        : { ...prev, startDate: e.target.value }
                    )
                  }
                  className="w-full"
                />
              </div>

              {/* End Date - Only show if not one day leave */}
              {!oneDayLeave && (
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full"
                    min={newLeave.startDate}
                  />
                </div>
              )}

              {/* Reason */}
              {/* <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Input
                  id="reason"
                  type="text"
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Brief description..."
                  className="w-full"
                />
              </div> */}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowAddLeaveModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveLeave}
                disabled={loading}
              > {loading ?
                <Loader size="sm" /> + "Requesting..." : "Request Leave"
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default LeaveTracker;
