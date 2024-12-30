import React, { useState } from 'react';
import { Search, Download, ChevronDown, User } from 'lucide-react';

const PayslipTracker = () => {
    const [userRole, setUserRole] = useState('employee'); // 'employee' or 'accountant'
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('2024');
    const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const [error, setError] = useState(null);

    // Mock data - In a real app, this would come from an API
    const mockPayslips = [
        {
            id: 1,
            employeeId: 'EMP001',
            employeeName: 'John Doe',
            department: 'Engineering',
            month: '2024-03',
            basicSalary: 50000,
            totalEarnings: 75000,
            totalDeductions: 15000,
            netSalary: 60000,
            status: 'Paid',
        },
        {
            id: 2,
            employeeId: 'EMP002',
            employeeName: 'Jane Smith',
            department: 'Marketing',
            month: '2024-03',
            basicSalary: 45000,
            totalEarnings: 65000,
            totalDeductions: 13000,
            netSalary: 52000,
            status: 'Paid',
        },
    ];

    const currentUserPayslips = mockPayslips.filter(
        (payslip) => payslip.employeeId === 'EMP002' // This would be the logged-in user's ID
    );

    const displayPayslips = userRole === 'accountant' ? mockPayslips : currentUserPayslips;

    const filteredPayslips = displayPayslips.filter((payslip) => {
        const matchesSearch = payslip.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payslip.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMonth = filterMonth ? payslip.month === filterMonth : true;
        return matchesSearch && matchesMonth;
    });

    // Handle potential errors
    const handleError = (message) => {
        setError(message);
        setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6 bg-white text-black">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-500">Payslip Manager</h1>
                    <p className="text-gray-500">
                        {userRole === 'accountant' ? 'Manage all employee payslips' : 'View your payslip history'}
                    </p>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 text-blue-500"
                    >
                        <User className="h-5 w-5" />
                        <span>{userRole === 'accountant' ? 'Accountant View' : 'Employee View'}</span>
                        <ChevronDown className="h-4 w-4" />
                    </button>

                    {isRoleDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <button
                                onClick={() => {
                                    setUserRole('employee');
                                    setIsRoleDropdownOpen(false);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-black"
                            >
                                Employee View
                            </button>
                            <button
                                onClick={() => {
                                    setUserRole('accountant');
                                    setIsRoleDropdownOpen(false);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-black"
                            >
                                Accountant View
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-black"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    {/* Month Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 text-blue-500"
                        >
                            <span>{filterMonth || 'Select Month'}</span>
                            <ChevronDown className="h-4 w-4" />
                        </button>

                        {isMonthDropdownOpen && (
                            <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                <button
                                    onClick={() => {
                                        setFilterMonth('');
                                        setIsMonthDropdownOpen(false);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-black"
                                >
                                    All Months
                                </button>
                                {['2024-03', '2024-02', '2024-01'].map((month) => (
                                    <button
                                        key={month}
                                        onClick={() => {
                                            setFilterMonth(month);
                                            setIsMonthDropdownOpen(false);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-black"
                                    >
                                        {month}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Year Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 text-blue-500"
                        >
                            <span>{selectedYear}</span>
                            <ChevronDown className="h-4 w-4" />
                        </button>

                        {isYearDropdownOpen && (
                            <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                {['2024', '2023'].map((year) => (
                                    <button
                                        key={year}
                                        onClick={() => {
                                            setSelectedYear(year);
                                            setIsYearDropdownOpen(false);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-black"
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payslips Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                {error && (
                    <div className="text-red-500 text-center py-4">
                        {error}
                    </div>
                )}
                {filteredPayslips.length === 0 ? (
                    <div className="text-gray-500 text-center py-6">
                        No payslips found. Please adjust your filters or try again.
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Basic Salary</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Earnings</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPayslips.map((payslip) => (
                                <tr key={payslip.id} className="hover:bg-gray-100">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payslip.employeeId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payslip.employeeName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payslip.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payslip.month}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{payslip.basicSalary.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{payslip.totalEarnings.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{payslip.totalDeductions.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">₹{payslip.netSalary.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {payslip.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100">
                                            <Download className="h-5 w-5 text-blue-500" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PayslipTracker;
