import React, { useContext, useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
    Calendar as CalendarIcon,
    Clock,
    Users,
    Plus,
    X
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { userContext } from '../Context/userContext';
import Loader from '../Components/Loader/Loader';
import SuccessToast from '../Components/Toaster/SuccessToaser';
import ErrorToast from '../Components/Toaster/ErrorToaster';

const initialEmployees = [];

const leaveTypes = ['Vacation', 'Sick Leave', 'Personal', 'Maternity', 'Paternity', 'Unpaid Leave'];

const LeaveTypeColors = {
    'Vacation': 'bg-blue-100 text-blue-800',
    'Sick Leave': 'bg-red-100 text-red-800',
    'Personal': 'bg-green-100 text-green-800',
    'Maternity': 'bg-purple-100 text-purple-800',
    'Unpaid Leave': 'bg-gray-100 text-gray-800'
};

const LeaveTracker = () => {
    const [employees, setEmployees] = useState(initialEmployees);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState(false);
    const [filteredEmployees, setFilteredEmployees] = useState(employees);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState();
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [newLeave, setNewLeave] = useState({
        type: '',
        startDate: '',
        endDate: '',
    });
    const { user } = useContext(userContext);
    const [oneDayLeave, setOneDayLeave] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toastSuccessMessage, setToastSuccessMessage] = useState();
    const [toastErrorMessage, setToastErrorMessage] = useState();
    const [toastSuccessVisible, setToastSuccessVisible] = useState(false);
    const [toastErrorVisible, setToastErrorVisible] = useState(false);

    const fetchEmployeeData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/employee`);

            if (response.status === 201) {
                const employees = response.data.employees;

                if (user && user.role === "user") {
                    const filteredEmployees = employees.filter(emp => emp.email === user.userEmail);
                    setEmployees(filteredEmployees);
                    setFilteredEmployees(filteredEmployees);
                    setSelectedEmployeeId(filteredEmployees[0]?.empId);
                    setSelectedEmployee(filteredEmployees[0]);
                } else {
                    setEmployees(employees);
                    setFilteredEmployees(employees);
                    setSelectedEmployeeId(employees[0]?.empId);
                    setSelectedEmployee(employees[0]);
                }
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching employee data:", error);
        }
    };

    useEffect(() => {
        fetchEmployeeData();
    }, [user]);

    useEffect(() => {
        setLoading(true);
        const updateSelectedEmployee = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/employee/${selectedEmployeeId}`);
                if (response.status === 201) {
                    const updatedEmployee = response.data.employee[0];
                    setSelectedEmployee(updatedEmployee);

                    setEmployees(prev =>
                        prev.map(emp => emp.empId === selectedEmployeeId ? updatedEmployee : emp)
                    );
                    setFilteredEmployees(prev =>
                        prev.map(emp => emp.empId === selectedEmployeeId ? updatedEmployee : emp)
                    );
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching employee details:", error);
            }
        };

        if (selectedEmployeeId) {
            updateSelectedEmployee();
            setSelectedMonth(null);
        }
    }, [selectedEmployeeId]);

    const handleLeaveMonths = () => {
        if (!selectedEmployee || !selectedEmployee.leaveHistory) return [];

        const availableLeaveMonths = Array.from(
            new Set(
                selectedEmployee?.leaveHistory.flatMap((leave) => {
                    const start = new Date(leave.startDate);
                    const end = new Date(leave.endDate);
                    const months = [];
        
                    // Generate all months between start and end
                    for (
                        let date = new Date(start.getFullYear(), start.getMonth(), 1);
                        date <= new Date(end.getFullYear(), end.getMonth(), 1);
                        date.setMonth(date.getMonth() + 1)
                    ) {
                        months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
                    }
        
                    return months;
                }) || []
            )
        );
        

        return availableLeaveMonths;
    };

    const getLeaveDatesForMonth = (month) => {
        if (!selectedEmployee || !month || !selectedEmployee.leaveHistory) return [];

        const [year, monthNum] = month.split('-');
        const leaveDates = selectedEmployee.leaveHistory.flatMap((leave) => {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const dates = [];

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                if (d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(monthNum)) {
                    dates.push({
                        date: new Date(d),
                        type: leave.type,
                    });
                }
            }
            return dates;
        });

        return leaveDates;
    };

    const isLeaveDate = (date) => {
        const leaveDates = getLeaveDatesForMonth(selectedMonth);
        return leaveDates.some((leaveDate) =>
            leaveDate.date.toDateString() === date.toDateString()
        );
    };

    const getLeaveTypeForDate = (date) => {
        const leaveDates = getLeaveDatesForMonth(selectedMonth);
        const leave = leaveDates.find((leaveDate) =>
            leaveDate.date.toDateString() === date.toDateString()
        );
        return leave ? leave.type : null;
    };

    const handleAddLeave = async () => {
        if (newLeave.type !== "" && newLeave.startDate!=="" && newLeave.endDate!=="") {
            if(new Date(newLeave.startDate) <= new Date(newLeave.endDate)){

            
            try {
                const response = await axios.post(
                    `${API_BASE_URL}/api/employee/addLeave/${selectedEmployeeId}`,
                    newLeave,
                    {
                        headers: {
                            'content-type': 'application/json'
                        }
                    }
                );

                if (response.status === 201) {
                    // alert("Leave added successfully!");
                    setToastSuccessMessage("Leave added successfully!");
                    setToastSuccessVisible(true);
                    setTimeout(() => setToastSuccessVisible(false), 3500);

                    const updatedEmployeeResponse = await axios.get(`${API_BASE_URL}/api/employee/${selectedEmployeeId}`);
                    if (updatedEmployeeResponse.status === 201) {
                        const updatedEmployee = updatedEmployeeResponse.data.employee[0];

                        setSelectedEmployee(updatedEmployee);
                        setSelectedEmployeeId(updatedEmployee.empId);

                        setEmployees(prev =>
                            prev.map(emp => emp.empId === selectedEmployeeId ? updatedEmployee : emp)
                        );
                        setFilteredEmployees(prev =>
                            prev.map(emp => emp.empId === selectedEmployeeId ? updatedEmployee : emp)
                        );
                    }
                }
            } catch (error) {
                // console.error("Error adding leave:", error);
                // alert("Error adding leave. Please try again.");
                setToastErrorMessage("Error adding leave. Please try again.");
                setToastErrorVisible(true);
                setTimeout(() => setToastErrorVisible(false), 3500);
            }


            setShowAddLeaveModal(false);
            setNewLeave({ type: '', startDate: '', endDate: '' });
            setOneDayLeave(false);
            }
            else{
                // alert("end date can't be before start date");
                setToastErrorMessage("End date can't be before start date");
                setToastErrorVisible(true);
                setTimeout(() => setToastErrorVisible(false), 3500);
            }
        } else {
            // alert("Please fill all details");
            setToastErrorMessage("Please fill all details");
                setToastErrorVisible(true);
                setTimeout(() => setToastErrorVisible(false), 3500);
        }
    };

    const filterActiveLeaveEmployees = () => {
        if (!activeFilter) {
            setFilteredEmployees(employees.filter(emp => emp.leaveHistory && emp.leaveHistory.length !== 0));
        } else {
            setFilteredEmployees(employees);
        }
        setActiveFilter(!activeFilter);
    };

    const filterOneDayLeave = () => {
        setOneDayLeave(!oneDayLeave);
        setNewLeave(prev => ({
            ...prev,
            startDate: '',
            endDate: ''
        }))
        // document.getElementById("startDate").value=null;
        // document.getElementById("endDate").value=null;
    };

    const availableLeaveMonths = handleLeaveMonths();

    if(loading){
        return <Loader/>
    }

    return (
        <>
        {
            toastSuccessVisible ? <SuccessToast message={toastSuccessMessage}/> : null
        }
        {
            toastErrorVisible ? <ErrorToast error={toastErrorMessage}/> : null
        }
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg p-6 border-r">
                <div className="flex items-center mb-8">
                    <Users className="mr-3 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-800">Leave Tracker</h2>
                </div>

                {/* Employee Selector */}
                <div className="mb-6">
                    {user && user.role !== "user" && (
                        <div className='flex justify-start space-x-1 mb-3'>
                            <input type='checkbox' id='activeLeave' className='hover:cursor-pointer' onChange={filterActiveLeaveEmployees}></input>
                            <label htmlFor='activeLeave' className='text-sm hover:cursor-pointer'>Only applied leaves</label>
                        </div>
                    )}
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Employee
                    </label>
                    <select
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm"
                        value={selectedEmployeeId}
                    >
                        {filteredEmployees.map((emp) => (
                            <option key={emp.empId} value={emp.empId}>
                                {emp.name} - {emp.department}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Add Leave Button */}
                <button
                    onClick={() => {
                        setOneDayLeave(false);
                        setShowAddLeaveModal(true)
                    }}
                    className="w-full flex items-center justify-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
                >
                    <Plus className="mr-2" /> Add Leave
                </button>

                {/* Leave Months */}
                <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Leave Months</h3>
                    <div className="space-y-2">
                        {availableLeaveMonths.map((month) => (
                            <button
                                key={month}
                                onClick={() => setSelectedMonth(month)}
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition flex items-center"
                            >
                                <Clock className="mr-2 text-gray-500" size={16} />
                                {new Date(`${month}-01`).toLocaleString('default', { month: 'long', year: 'numeric' })}
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
                                {new Date(`${selectedMonth}-01`).toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                            <button
                                onClick={() => setSelectedMonth(null)}
                                className="text-gray-600 hover:text-gray-900 transition"
                            >
                                <X />
                            </button>
                        </div>

                        {/* Calendar */}
                        <div className="bg-white rounded-lg shadow-md p-6">

                            <Calendar
                                value={new Date(selectedMonth)}
                                tileClassName={({ date }) =>
                                    isLeaveDate(date)
                                        ? 'bg-blue-100 rounded-full text-blue-800 font-bold'
                                        : ''
                                }
                                tileContent={({ date }) => {
                                    const leaveType = getLeaveTypeForDate(date);

                                    return leaveType ? (
                                        <div className="text-[10px] text-center mt-1">
                                            <span className={`px-1 rounded ${LeaveTypeColors[leaveType]} text-[8px]`}>
                                                {leaveType}
                                            </span>
                                        </div>
                                    ) : null;
                                }}
                            />

                        </div>

                        {/* Leave Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                            {selectedEmployee?.leaveHistory
                                ?.filter(leave => {
                                    const start = new Date(leave.startDate);
                                    const [year, month] = selectedMonth.split('-');
                                    return start.getFullYear() === parseInt(year) &&
                                        start.getMonth() + 1 === parseInt(month);
                                })
                                .map((leave, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg shadow-md ${LeaveTypeColors[leave.type]}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">{leave.type}</span>
                                            <CalendarIcon size={16} />
                                        </div>
                                        <div className="mt-2 text-sm">
                                            {new Date(leave.startDate).toLocaleDateString()} -
                                            {new Date(leave.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-16">
                        Select a month to view leave details
                    </div>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Leave Type
                                </label>
                                <select
                                    value={newLeave.type}
                                    onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
                                    className="w-full rounded-md border-gray-300"
                                >
                                    <option value="" disabled>Select Leave Type</option>
                                    {leaveTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div className='flex justify-start space-x-1 mb-3'>
                                    <input type='checkbox' id='oneDayLeave' className='hover:cursor-pointer' onChange={filterOneDayLeave}></input>
                                    <label htmlFor='oneDayLeave' className='text-sm hover:cursor-pointer'>One day leave</label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {
                                        oneDayLeave
                                            ?
                                            "Leave Date"
                                            :
                                            "Start Date"
                                    }
                                </label>
                                <input
                                    id='startDate'
                                    type="date"
                                    value={newLeave.startDate}
                                    onChange={(e) => setNewLeave(oneDayLeave ? { ...newLeave, startDate: e.target.value, endDate: e.target.value } : { ...newLeave, startDate: e.target.value })}
                                    className="w-full rounded-md border-gray-300"
                                />
                            </div>
                            {
                                !oneDayLeave ?
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            id='endDate'
                                            type="date"
                                            value={newLeave.endDate}
                                            onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                                            className="w-full rounded-md border-gray-300"
                                        />
                                    </div>
                                    :
                                    null
                            }
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => {
                                        setShowAddLeaveModal(false)
                                    }}
                                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddLeave}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                >
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
