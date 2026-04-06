import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { ChevronDown, User } from 'lucide-react';

const EmployeeInfoTab = ({
    formData,
    isReadOnly,
    propReadOnly,
    user,
    employees,
    employeesLoading,
    handleInputChange,
    handleEmployeeSelect,
    normalizeGender,
    selfEmployee
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Financial Year + Employee Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Financial Year Selection */}
                    <div className="">
                        <div>
                            <label className="block text-sm text-card-foreground font-semibold mb-2">
                                Select Financial Year
                            </label>
                            <div className='relative'>
                                <Select
                                    disabled={propReadOnly}
                                    value={formData.financialYear}
                                    onValueChange={(value) => handleInputChange("financialYear", value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select financial year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2023-24">2023-24</SelectItem>
                                        <SelectItem value="2024-25">2024-25</SelectItem>
                                        <SelectItem value="2025-26">2025-26</SelectItem>
                                        <SelectItem value="2026-27">2026-27</SelectItem>
                                    </SelectContent>
                                </Select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {(user && (user.role === 'accountant' || user.role === 'superAdmin')) ? (
                        <div>
                            {/* Employee Selection (accountant / superAdmin only) */}
                            <label className="block text-sm text-card-foreground font-semibold mb-2">
                                Select Employee
                            </label>
                            <div className='relative'>
                                <Select
                                    disabled={propReadOnly}
                                    value={formData.employeeName || ""}
                                    onValueChange={handleEmployeeSelect}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue
                                            placeholder={
                                                employeesLoading
                                                    ? "Loading employees..."
                                                    : "Select an employee"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp) => (
                                            <SelectItem key={emp.empId} value={emp.name}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{emp.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {emp.empId} • {emp.details?.department}
                                                        </p>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Select an employee to auto-populate the details below.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm text-card-foreground font-semibold mb-2">Employee</label>
                            <div className="p-2 rounded-md border bg-white">
                                <p className="font-medium">
                                    {selfEmployee?.name || user?.userName}
                                    <span className="text-xs text-muted-foreground"> • {selfEmployee?.department || user?.department}</span>
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 pl-1">You are filling this form for yourself. Details have been auto-populated.</p>
                        </div>
                    )}
                </div>

                {/* Tax Scheme Selection */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <label className="block text-sm text-card-foreground font-semibold mb-2">Select Tax Scheme for FY {formData.financialYear}</label>
                    <div className="relative">
                        <Select
                            disabled={isReadOnly}
                            value={formData.taxScheme}
                            onValueChange={(value) => handleInputChange('taxScheme', value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Old Tax Scheme">Old Tax Scheme (With Deductions)</SelectItem>
                                <SelectItem value="New Tax Scheme">New Tax Scheme (Without Deductions)</SelectItem>
                            </SelectContent>
                        </Select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Note: All tax reliefs and deductions are available only under the Old Tax Scheme.
                    </p>
                </div>

                {/* Employee Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-semibold">Employee ID</label>
                        <Input
                            disabled={isReadOnly}
                            value={formData.empId}
                            placeholder="Employee ID (Auto-filled)"
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">Employee Name</label>
                        <Input
                            disabled={isReadOnly}
                            value={formData.employeeName}
                            onChange={(e) => handleInputChange('employeeName', e.target.value)}
                            placeholder="Full Name"
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">Designation</label>
                        <Input
                            disabled={isReadOnly}
                            value={formData.designation}
                            onChange={(e) => handleInputChange('designation', e.target.value)}
                            placeholder="Designation"
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">PAN</label>
                        <Input
                            disabled={isReadOnly}
                            value={formData.pan}
                            onChange={(e) => handleInputChange('pan', e.target.value)}
                            placeholder="PAN Number"
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">Date of Joining</label>
                        <Input
                            disabled={isReadOnly}
                            type="date"
                            value={formData.dateOfJoining}
                            onChange={(e) => handleInputChange('dateOfJoining', e.target.value)}
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">Date of Birth</label>
                        <Input
                            disabled={isReadOnly}
                            type="date"
                            value={formData.dob}
                            onChange={(e) => handleInputChange('dob', e.target.value)}
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">Gender</label>
                        <div className='relative'>
                            <Select
                                disabled={isReadOnly}
                                value={normalizeGender(formData.gender)}
                                onValueChange={(value) => handleInputChange('gender', value)}
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default EmployeeInfoTab;
