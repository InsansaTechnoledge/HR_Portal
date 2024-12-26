import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';

const EmployeeList = ({ employees = [] }) => {
    const [expandedRows, setExpandedRows] = useState(new Set());

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const renderDetailSection = (title, data) => (
        <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">{title}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm text-gray-900">{value || 'N/A'}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    if (!employees || employees.length === 0) {
        return <p className="text-center text-gray-500 py-6">No employees found.</p>;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-100 border-b border-gray-300">
                    <h2 className="text-xl font-semibold text-gray-800">Employee Directory</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Expand
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Designation
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {employees.map((employee) => (
                                <React.Fragment key={employee.id}>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleRow(employee.id)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                {expandedRows.has(employee.id) ? (
                                                    <ChevronUp className="w-5 h-5" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {employee.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {employee.employeeId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {employee.department}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {employee.designation}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{employee.email}</div>
                                        </td>
                                    </tr>
                                    {expandedRows.has(employee.id) && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 bg-gray-50">
                                                <div className="space-y-6">
                                                    {renderDetailSection('Personal Information', {
                                                        Phone: employee.phone,
                                                        'Date of Birth': employee.dateOfBirth,
                                                        Gender: employee.gender,
                                                        'Marital Status': employee.maritalStatus,
                                                        Nationality: employee.nationality
                                                    })}

                                                    {renderDetailSection('Address Information', {
                                                        'Current Address': employee.currentAddress,
                                                        'Permanent Address': employee.permanentAddress,
                                                        City: employee.city,
                                                        State: employee.state,
                                                        Pincode: employee.pincode
                                                    })}

                                                    {renderDetailSection('Employment Details', {
                                                        'Date of Joining': employee.dateOfJoining,
                                                        'Reporting Manager': employee.reportingManager
                                                    })}

                                                    {renderDetailSection('Financial Information', {
                                                        'Bank Name': employee.bankName,
                                                        'Account Number': employee.accountNumber,
                                                        'IFSC Code': employee.ifscCode,
                                                        'PAN Number': employee.panNumber,
                                                        'Aadhar Number': employee.aadharNumber,
                                                        'UAN Number': employee.uanNumber
                                                    })}

                                                    {renderDetailSection('Emergency Contact', {
                                                        'Contact Name': employee.emergencyContactName,
                                                        'Contact Relation': employee.emergencyContactRelation,
                                                        'Contact Phone': employee.emergencyContactPhone
                                                    })}

                                                    <div className="mt-4">
                                                        <h3 className="text-lg font-semibold text-blue-600 mb-2">
                                                            Documents
                                                        </h3>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            {['PAN Card', 'Aadhar Card', 'Degree Certificate', 'Experience Certificate'].map((doc) => (
                                                                <button
                                                                    key={doc}
                                                                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                                >
                                                                    <Download className="w-4 h-4 mr-2" />
                                                                    {doc}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Dummy data for testing
const dummyEmployees = [
    {
        id: '1',
        name: 'John Doe',
        employeeId: 'EMP001',
        department: 'Engineering',
        designation: 'Software Engineer',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        maritalStatus: 'Single',
        nationality: 'American',
        currentAddress: '123 Main St, Cityville',
        permanentAddress: '456 Elm St, Hometown',
        city: 'Cityville',
        state: 'Stateville',
        pincode: '123456',
        dateOfJoining: '2020-06-15',
        reportingManager: 'Jane Smith',
        bankName: 'Bank of America',
        accountNumber: '1234567890',
        ifscCode: 'BOFA12345',
        panNumber: 'ABCDE1234F',
        aadharNumber: '1234-5678-9101',
        uanNumber: '101234567890',
        emergencyContactName: 'Michael Doe',
        emergencyContactRelation: 'Brother',
        emergencyContactPhone: '987-654-3210'
    },
    {
        id: '3',
        name: 'Alice Johnson',
        employeeId: 'EMP003',
        department: 'Finance',
        designation: 'Financial Analyst',
        email: 'alice.johnson@example.com',
        phone: '555-123-4567',
        dateOfBirth: '1992-07-10',
        gender: 'Female',
        maritalStatus: 'Single',
        nationality: 'American',
        currentAddress: '321 Oak St, Metropolis',
        permanentAddress: '789 Birch St, Smalltown',
        city: 'Metropolis',
        state: 'Stateline',
        pincode: '789123',
        dateOfJoining: '2019-08-01',
        reportingManager: 'Sarah Connor',
        bankName: 'Wells Fargo',
        accountNumber: '9876543210',
        ifscCode: 'WELLS12345',
        panNumber: 'QRSTU6789V',
        aadharNumber: '5678-9101-1121',
        uanNumber: '102345678901',
        emergencyContactName: 'Emma Johnson',
        emergencyContactRelation: 'Sister',
        emergencyContactPhone: '456-789-1230'
    },
    {
        id: '4',
        name: 'Robert Brown',
        employeeId: 'EMP004',
        department: 'Sales',
        designation: 'Sales Manager',
        email: 'robert.brown@example.com',
        phone: '444-555-6666',
        dateOfBirth: '1980-12-25',
        gender: 'Male',
        maritalStatus: 'Married',
        nationality: 'British',
        currentAddress: '987 Spruce St, Urbania',
        permanentAddress: '654 Cedar Ave, Hamletville',
        city: 'Urbania',
        state: 'Provinceville',
        pincode: '654987',
        dateOfJoining: '2015-04-15',
        reportingManager: 'James Watson',
        bankName: 'HSBC',
        accountNumber: '1234509876',
        ifscCode: 'HSBC56789',
        panNumber: 'VWXYZ1234K',
        aadharNumber: '1234-9876-5432',
        uanNumber: '103456789012',
        emergencyContactName: 'Linda Brown',
        emergencyContactRelation: 'Wife',
        emergencyContactPhone: '789-654-3210'
    },
    {
        id: '5',
        name: 'Sophia Davis',
        employeeId: 'EMP005',
        department: 'Marketing',
        designation: 'Marketing Specialist',
        email: 'sophia.davis@example.com',
        phone: '333-222-1111',
        dateOfBirth: '1995-05-15',
        gender: 'Female',
        maritalStatus: 'Single',
        nationality: 'Canadian',
        currentAddress: '456 Maple Ave, Downtown',
        permanentAddress: '123 Aspen Blvd, Suburbia',
        city: 'Downtown',
        state: 'Regionville',
        pincode: '321654',
        dateOfJoining: '2021-01-10',
        reportingManager: 'Olivia Martin',
        bankName: 'Royal Bank of Canada',
        accountNumber: '7654321098',
        ifscCode: 'RBC12345',
        panNumber: 'ABCDE9876P',
        aadharNumber: '9101-1121-3142',
        uanNumber: '104567890123',
        emergencyContactName: 'Emily Davis',
        emergencyContactRelation: 'Mother',
        emergencyContactPhone: '321-654-9870'
    },
    {
        id: '6',
        name: 'Arjun Mehta',
        employeeId: 'EMP005',
        department: 'Marketing',
        designation: 'Marketing Specialist',
        email: 'arjun.mehta@example.com',
        phone: '987-654-3210',
        dateOfBirth: '1993-03-21',
        gender: 'Male',
        maritalStatus: 'Single',
        nationality: 'Indian',
        currentAddress: 'Flat 502, Orchid Apartments, Andheri, Mumbai',
        permanentAddress: 'C-123, Shanti Vihar, New Delhi',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400058',
        dateOfJoining: '2020-07-15',
        reportingManager: 'Neha Sharma',
        bankName: 'HDFC Bank',
        accountNumber: '567890123456',
        ifscCode: 'HDFC0005678',
        panNumber: 'ABCDE5678F',
        aadharNumber: '1234-5678-9101',
        uanNumber: '105678901234',
        emergencyContactName: 'Rohit Mehta',
        emergencyContactRelation: 'Brother',
        emergencyContactPhone: '998-877-6655'
    }
];

// Usage example for testing
export default () => <EmployeeList employees={dummyEmployees} />;
