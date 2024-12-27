import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';

const EmployeeList = () => {
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            const response = await axios.get(`${API_BASE_URL}/api/employee`);
            if(response.status===201){
                const allEmployees = response.data.employees;
                const filteredEmployees = allEmployees.filter(emp => emp.details!==undefined);
                setEmployees(filteredEmployees);
                console.log(filteredEmployees);
            }
        }

        fetchEmployees();
    },[]);

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

    const handleDownload = (employee,doc) => {
        'PAN Card', 'Aadhar Card', 'Degree Certificate', 'Experience Certificate'
        if(doc==='PAN Card'){
            console.log(employee.details.documentsPanCard.data);
            downloadDocument(employee.name, doc , employee.details.documentsPanCard.data);
        }
        else if(doc==='Aadhar Card'){
            alert("adhaar");
            
        }
        else if(doc==='Degree Certificate'){
            alert("deg");

        }
        else if(doc==='Experience Certificate'){
            alert("exp");

        }
    }

    function downloadDocument(name,doc,arrayBuffer) {
        // Convert the ArrayBuffer to a Blob (you might know the MIME type, e.g., 'application/pdf')
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      
        // Create a link element to download the Blob
        const link = document.createElement('a');
        
        // Create an Object URL for the Blob
        const url = window.URL.createObjectURL(blob);
        
        // Set the download attribute with the desired filename
        link.href = url;
        link.download = `${name}-${doc}.pdf`; // Set the desired file name
        
        // Append the link to the DOM and trigger a click to start the download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup by removing the link from the DOM
        document.body.removeChild(link);
      
        // Optional: Release the Object URL after download to avoid memory leaks
        window.URL.revokeObjectURL(url);
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
                                <React.Fragment key={employee.details.employeeDetailId}>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleRow(employee.details.employeeDetailId)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                {expandedRows.has(employee.details.employeeDetailId) ? (
                                                    <ChevronUp className="w-5 h-5" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {employee.details.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {employee.details.employeeDetailId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {employee.details.department}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {employee.details.designation}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{employee.details.email}</div>
                                        </td>
                                    </tr>
                                    {expandedRows.has(employee.details.employeeDetailId) && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 bg-gray-50">
                                                <div className="space-y-6">
                                                    {renderDetailSection('Personal Information', {
                                                        Phone: employee.details.phone,
                                                        'Date of Birth': employee.details.dateOfBirth,
                                                        Gender: employee.details.gender,
                                                        'Marital Status': employee.details.maritalStatus,
                                                        Nationality: employee.details.nationality
                                                    })}

                                                    {renderDetailSection('Address Information', {
                                                        'Current Address': employee.details.currentAddress,
                                                        'Permanent Address': employee.details.permanentAddress,
                                                        City: employee.details.city,
                                                        State: employee.details.state,
                                                        Pincode: employee.details.pincode
                                                    })}

                                                    {renderDetailSection('Employment Details', {
                                                        'Date of Joining': employee.details.dateOfJoining,
                                                        'Reporting Manager': employee.details.reportingManager
                                                    })}

                                                    {renderDetailSection('Financial Information', {
                                                        'Bank Name': employee.details.bankName,
                                                        'Account Number': employee.details.accountNumber,
                                                        'IFSC Code': employee.details.ifscCode,
                                                        'PAN Number': employee.details.panNumber,
                                                        'Aadhar Number': employee.details.aadharNumber,
                                                        'UAN Number': employee.details.uanNumber
                                                    })}

                                                    {renderDetailSection('Emergency Contact', {
                                                        'Contact Name': employee.details.emergencyContactName,
                                                        'Contact Relation': employee.details.emergencyContactRelation,
                                                        'Contact Phone': employee.details.emergencyContactPhone
                                                    })}

                                                    <div className="mt-4">
                                                        <h3 className="text-lg font-semibold text-blue-600 mb-2">
                                                            Documents
                                                        </h3>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            {['PAN Card', 'Aadhar Card', 'Degree Certificate', 'Experience Certificate'].map((doc) => (
                                                                <button
                                                                    onClick={() => handleDownload(employee,doc)}
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

// Usage example for testing
export default () => <EmployeeList />;
