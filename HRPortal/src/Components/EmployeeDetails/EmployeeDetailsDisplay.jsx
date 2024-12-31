import React from 'react'
import { Download } from 'lucide-react';

function EmployeeDetailsDisplay({ employee }) {

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

                                <p className="text-sm text-gray-900">{employee.details.salary || 'N/A'}</p>


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

    return (
        <div>
            <table>
                <thead>
                    <tr className="bg-gray-50">

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
                <tbody>
                    <tr className="px-6 py-4 bg-gray-50">

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
                </tbody>
            </table>
        </div>
    )
}

export default EmployeeDetailsDisplay