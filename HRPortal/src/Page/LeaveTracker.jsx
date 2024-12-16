import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const initialEmployees = [
    {
        id: 1,
        name: 'John Doe',
        department: 'Engineering',
        leaveHistory: [
            { type: 'Vacation', startDate: '2024-03-15', endDate: '2024-03-20' },
            { type: 'Sick Leave', startDate: '2024-02-10', endDate: '2024-02-11' },
            { type: 'Personal', startDate: '2024-04-05', endDate: '2024-04-07' }
        ]
    },
    {
        id: 2,
        name: 'Jane Smith',
        department: 'Marketing',
        leaveHistory: [
            { type: 'Personal', startDate: '2024-01-05', endDate: '2024-01-07' }
        ]
    }
];

const leaveTypes = ['Vacation', 'Sick Leave', 'Personal', 'Maternity', 'Unpaid Leave'];

const LeaveTracker = () => {
    const [employees, setEmployees] = useState(initialEmployees);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(initialEmployees[0]?.id || 1);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [showAddLeaveForm, setShowAddLeaveForm] = useState(false);
    const [newLeave, setNewLeave] = useState({
        type: '',
        startDate: '',
        endDate: '',
    });

    const handleAddLeave = () => {
        const updatedEmployees = employees.map((emp) => {
            if (emp.id === selectedEmployeeId) {
                return {
                    ...emp,
                    leaveHistory: [...emp.leaveHistory, { ...newLeave }],
                };
            }
            return emp;
        });
        setEmployees(updatedEmployees);
        setShowAddLeaveForm(false);
        setNewLeave({ type: '', startDate: '', endDate: '' });
    };

    const getLeaveDatesForMonth = () => {
        const selectedEmployee = employees.find((emp) => emp.id === selectedEmployeeId);
        if (!selectedEmployee || !selectedMonth) return [];

        const [year, month] = selectedMonth.split('-');
        const leaveDates = selectedEmployee.leaveHistory.flatMap((leave) => {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const dates = [];

            for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
                if (d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(month)) {
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

    const isHighlighted = (date) => {
        const leaveDates = getLeaveDatesForMonth();
        return leaveDates.some((leaveDate) => leaveDate.date.toDateString() === date.toDateString());
    };

    const getLeaveTypeForDate = (date) => {
        const leaveDates = getLeaveDatesForMonth();
        const leave = leaveDates.find((leaveDate) => leaveDate.date.toDateString() === date.toDateString());
        return leave ? leave.type : null;
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Employee Leave Calendar</h2>

                {/* Employee Selector */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Employee
                        <select
                            value={selectedEmployeeId}
                            onChange={(e) => {
                                setSelectedEmployeeId(parseInt(e.target.value));
                                setSelectedMonth(null); // Reset the month selection
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name} - {emp.department}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {/* Add Leave Button */}
                <button
                    onClick={() => setShowAddLeaveForm((prev) => !prev)}
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition duration-200"
                >
                    {showAddLeaveForm ? 'Cancel' : 'Add Leave'}
                </button>

                {/* Add Leave Form */}
                {showAddLeaveForm && (
                    <div className="mb-4 p-4 bg-gray-100 rounded-md shadow">
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Add Leave</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Leave Type
                                    <select
                                        value={newLeave.type}
                                        onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    >
                                        <option value="" disabled>Select Leave Type</option>
                                        {leaveTypes.map((type, index) => (
                                            <option key={index} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Start Date
                                    <input
                                        type="date"
                                        value={newLeave.startDate}
                                        onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    End Date
                                    <input
                                        type="date"
                                        value={newLeave.endDate}
                                        onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                </label>
                            </div>
                            <button
                                onClick={handleAddLeave}
                                className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition duration-200"
                            >
                                Save Leave
                            </button>
                        </div>
                    </div>
                )}

                {/* Display Months with Leaves */}
                {!selectedMonth && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Months with Leaves</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {Array.from(
                                new Set(
                                    employees
                                        .find((emp) => emp.id === selectedEmployeeId)
                                        ?.leaveHistory.map((leave) => {
                                            const startDate = new Date(leave.startDate);
                                            return `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
                                        }) || []
                                )
                            ).map((month, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedMonth(month)}
                                    className="p-2 bg-indigo-100 text-indigo-700 rounded shadow hover:bg-indigo-200 transition duration-200"
                                >
                                    {new Date(`${month}-01`).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Display Calendar for Selected Month */}
                {selectedMonth && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">
                            {new Date(`${selectedMonth}-01`).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button
                            onClick={() => setSelectedMonth(null)}
                            className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition duration-200"
                        >
                            Back to Months
                        </button>
                        <Calendar
                            value={new Date(selectedMonth)}
                            tileClassName={({ date }) =>
                                isHighlighted(date) ? 'bg-red-200 rounded-full' : ''
                            }
                            tileContent={({ date }) => {
                                const leaveType = getLeaveTypeForDate(date);
                                return leaveType ? (
                                    <span className="text-xs text-red-600">{leaveType}</span>
                                ) : null;
                            }}
                            className="rounded-md"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaveTracker;
