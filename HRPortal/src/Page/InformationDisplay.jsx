import React, { useContext, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Download, Pencil } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { userContext } from '../Context/userContext';
import Loader from '../Components/Loader/Loader';

const EmployeeList = () => {
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [employees, setEmployees] = useState([]);
    const [toggleEditsalary, setToggleEditSalary] = useState(false);
    const {user} = useContext(userContext);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);

        const fetchEmployees = async () => {
            const response = await axios.get(`${API_BASE_URL}/api/employee`);
            if (response.status === 201) {
                const allEmployees = response.data.employees;
                const filteredEmployees = allEmployees.filter(emp => emp.details !== undefined);
                setEmployees(filteredEmployees);
                setIsLoading(false);
            }
        }

        fetchEmployees();
    }, []);

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const updateSalary = async (emp) => {
        if (toggleEditsalary) {

            const updatedSalary = document.getElementById("salary").value;


            if (updatedSalary) {
                setEmployees((prevEmployees) =>
                    prevEmployees.map((employee) =>
                        employee.id === emp.id
                            ? {
                                ...employee,
                                details: { ...employee.details, salary: updatedSalary },
                            }
                            : employee
                    )
                );

                const sal = {
                    "salary": updatedSalary
                }

                const response = await axios.post(`${API_BASE_URL}/api/employee/updateSalary/${emp._id}`, sal,
                    {
                        headers: {
                            'content-type': 'application/json'
                        }
                    });

                if (response.status === 201) {
                    alert(response.data.message);
                }
            }
        }
        else{
            setTimeout(()=>{
                document.getElementById("salary").value=emp.details.salary || "Enter salary";   

            },1);
        }

    }

    const renderDetailSection = (title, data, employee) => (
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
                {
                    title === "Financial Information" && employee
                        ?
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-600">
                                basic salary
                            </p>
                            <div className='flex items-center'>
                                {
                                    toggleEditsalary
                                        ?
                                        <input
                                            type='text' id='salary' className='w-1/3 border-gray-400 border-2 rounded p-1' placeholder={'Enter salary'} />
                                        :
                                        <p className="text-sm text-gray-900">{employee.details.salary || 'N/A'}</p>
                                }
                                {
                                    user && user.role==='superAdmin' || user.role==='accountant'
                                    ?
                                    <Pencil className='inline w-4 ml-2 hover:cursor-pointer' onClick={() => {
                                        updateSalary(employee)
                                        setToggleEditSalary(!toggleEditsalary);
                                    }} />
                                    
                                    :
                                    null
                                }
                            </div>
                        </div>
                        :
                        null
                }

            </div>
        </div>
    );

    const handleDownload = (employee, doc) => {
        'PAN Card', 'Aadhar Card', 'Degree Certificate', 'Experience Certificate'
        if (doc === 'PAN Card') {
            downloadDocument(employee.name, doc, employee.details.documentsPanCard);
        }
        else if (doc === 'Aadhar Card') {
            downloadDocument(employee.name, doc, employee.details.documentsAadhar);

        }
        else if (doc === 'Degree Certificate') {
            downloadDocument(employee.name, doc, employee.details.documentsDegree);

        }
        else if (doc === 'Experience Certificate') {
            downloadDocument(employee.name, doc, employee.details.documentsExperience);


        }
    }

    function downloadDocument(name, doc, buffer) {
        // Check if we have a valid Buffer and convert it to ArrayBuffer
        if (buffer && buffer.data instanceof Array) {
            // Convert Buffer (Node.js) to ArrayBuffer
            const arrayBuffer = new Uint8Array(buffer.data).buffer; // Create an ArrayBuffer from Buffer data

            // Convert the ArrayBuffer to a Blob (ensure MIME type is correct for the document)
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' }); // Adjust MIME type as needed (e.g., 'application/pdf')

            // Ensure Blob is created correctly
            if (!blob.size) {
                console.error('Failed to create Blob from ArrayBuffer.');
                return;
            }

            // Create a link element to download the Blob
            const link = document.createElement('a');
            const url = window.URL.createObjectURL(blob);

            // Ensure URL is created successfully
            if (!url) {
                console.error('Failed to create Object URL for the Blob.');
                return;
            }

            // Set the download attribute to define the file name
            link.href = url;
            link.download = `${name}-${doc}.pdf`; // You can adjust file extension based on the document type

            // Append the link to the DOM, trigger the download, and remove the link afterward
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Release the Object URL to free up memory
            window.URL.revokeObjectURL(url);
        } else {
            console.error('Received data is not a valid Buffer or Array.');
        }
    }

    if(isLoading){
        return(
            <Loader/>
        )
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
                                                    })}

                                                    {renderDetailSection('Financial Information', {
                                                        'Name as per Bank Account': employee.details.nameAsPerBank,
                                                        'Bank Name': employee.details.bankName,
                                                        'Account Number': employee.details.accountNumber,
                                                        'IFSC Code': employee.details.ifscCode,
                                                        'PAN Number': employee.details.panNumber,
                                                        'Aadhar Number': employee.details.aadharNumber,
                                                        'UAN Number': employee.details.uanNumber
                                                    }, employee)}

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
                                                                    onClick={() => handleDownload(employee, doc)}
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
