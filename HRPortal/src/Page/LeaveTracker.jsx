import React, { useState } from 'react';

// Sample initial employee data
const initialEmployees = [
    {
        id: 1,
        name: 'John Doe',
        department: 'Engineering',
        totalLeaves: 20,
        takenLeaves: 5,
        remainingLeaves: 15,
        leaveHistory: [
            {
                type: 'Vacation',
                startDate: '2024-03-15',
                endDate: '2024-03-20',
                status: 'Approved'
            },
            {
                type: 'Sick Leave',
                startDate: '2024-02-10',
                endDate: '2024-02-11',
                status: 'Approved'
            }
        ]
    },
    {
        id: 2,
        name: 'Jane Smith',
        department: 'Marketing',
        totalLeaves: 18,
        takenLeaves: 8,
        remainingLeaves: 10,
        leaveHistory: [
            {
                type: 'Personal',
                startDate: '2024-01-05',
                endDate: '2024-01-07',
                status: 'Approved'
            }
        ]
    }
];

const LeaveTracker = () => {
    const [employees, setEmployees] = useState(initialEmployees);
    const [newLeaveRequest, setNewLeaveRequest] = useState({
        employeeId: '',
        type: '',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const handleLeaveRequestChange = (e) => {
        const { name, value } = e.target;
        setNewLeaveRequest(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitLeaveRequest = () => {
        if (!newLeaveRequest.employeeId || !newLeaveRequest.type ||
            !newLeaveRequest.startDate || !newLeaveRequest.endDate) {
            alert('Please fill in all required fields');
            return;
        }

        const selectedEmployee = employees.find(
            emp => emp.id === parseInt(newLeaveRequest.employeeId)
        );

        if (!selectedEmployee) {
            alert('Invalid employee selected');
            return;
        }

        const startDate = new Date(newLeaveRequest.startDate);
        const endDate = new Date(newLeaveRequest.endDate);
        const leaveDuration = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;

        if (leaveDuration > selectedEmployee.remainingLeaves) {
            alert('Not enough leaves available');
            return;
        }

        const leaveRequest = {
            type: newLeaveRequest.type,
            startDate: newLeaveRequest.startDate,
            endDate: newLeaveRequest.endDate,
            status: 'Pending'
        };

        const updatedEmployees = employees.map(emp => {
            if (emp.id === selectedEmployee.id) {
                return {
                    ...emp,
                    takenLeaves: emp.takenLeaves + leaveDuration,
                    remainingLeaves: emp.remainingLeaves - leaveDuration,
                    leaveHistory: [...emp.leaveHistory, leaveRequest]
                };
            }
            return emp;
        });

        setEmployees(updatedEmployees);

        setNewLeaveRequest({
            employeeId: '',
            type: '',
            startDate: '',
            endDate: '',
            reason: ''
        });
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {/* Leave Request Form */}
                <div style={{ flex: 1, border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                    <h2>Submit Leave Request</h2>
                    <div style={{ marginBottom: '10px' }}>
                        <label>
                            Employee:
                            <select
                                name="employeeId"
                                value={newLeaveRequest.employeeId}
                                onChange={handleLeaveRequestChange}
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} - {emp.department}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>
                            Leave Type:
                            <select
                                name="type"
                                value={newLeaveRequest.type}
                                onChange={handleLeaveRequestChange}
                            >
                                <option value="">Select Type</option>
                                <option value="Vacation">Vacation</option>
                                <option value="Sick Leave">Sick Leave</option>
                                <option value="Personal">Personal</option>
                            </select>
                        </label>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>
                            Start Date:
                            <input
                                type="date"
                                name="startDate"
                                value={newLeaveRequest.startDate}
                                onChange={handleLeaveRequestChange}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>
                            End Date:
                            <input
                                type="date"
                                name="endDate"
                                value={newLeaveRequest.endDate}
                                onChange={handleLeaveRequestChange}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>
                            Reason (Optional):
                            <input
                                type="text"
                                name="reason"
                                value={newLeaveRequest.reason}
                                onChange={handleLeaveRequestChange}
                                placeholder="Enter reason"
                            />
                        </label>
                    </div>
                    <button onClick={handleSubmitLeaveRequest} style={{ padding: '10px', background: '#007BFF', color: '#fff', border: 'none', borderRadius: '5px' }}>
                        Submit
                    </button>
                </div>

                {/* Employee Leave Summary */}
                <div style={{ flex: 1, border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                    <h2>Employee Leave Summary</h2>
                    {employees.map(employee => (
                        <div key={employee.id} style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                            <h3>{employee.name} ({employee.department})</h3>
                            <p>Total Leaves: {employee.totalLeaves}</p>
                            <p>Taken Leaves: {employee.takenLeaves}</p>
                            <p>Remaining Leaves: {employee.remainingLeaves}</p>
                            <h4>Leave History:</h4>
                            <ul>
                                {employee.leaveHistory.map((leave, index) => (
                                    <li key={index}>
                                        {leave.type}: {leave.startDate} to {leave.endDate} ({leave.status})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LeaveTracker;
