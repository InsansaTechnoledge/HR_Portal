import React, { useContext, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../config";
import { userContext } from "../Context/userContext";
import Loader from "../Components/Loader/Loader";
import SuccessToast from "../Components/Toaster/SuccessToaser";
import ErrorToast from "../Components/Toaster/ErrorToaster";

const EmployeeList = () => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [employees, setEmployees] = useState([]);
  const [toggleEditsalary, setToggleEditSalary] = useState(false);
  const { user } = useContext(userContext);
  const [isLoading, setIsLoading] = useState(true);
  const [toastSuccessMessage, setToastSuccessMessage] = useState();
  const [toastErrorMessage, setToastErrorMessage] = useState();
  const [toastSuccessVisible, setToastSuccessVisible] = useState(false);
  const [toastErrorVisible, setToastErrorVisible] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const initialFormState = {
    name: "",
    email: "",
    department: "",
    designation: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    nationality: "",
    currentAddress: "",
    permanentAddress: "",
    city: "",
    state: "",
    pincode: "",
    dateOfJoining: "",
    nameAsPerBank: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    panNumber: "",
    aadharNumber: "",
    uanNumber: "",
    salary: "",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
  };

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController();
    const { signal } = controller;

    const fetchEmployees = async () => {
      try {
        // Request without document buffers - they'll be loaded on-demand when downloading
        const response = await axios.get(`${API_BASE_URL}/api/employee`, {
          params: {
            excludeDocuments: "true",
            limit: 200,
          },
          signal,
        });
        if (response.status === 201 || response.status === 200) {
          const allEmployees = response.data.employees;
          const filteredEmployees = allEmployees.filter(
            (emp) => emp.details !== undefined
          );
          setEmployees(filteredEmployees);
        }
      } catch (err) {
        if (axios.isCancel?.(err)) return;
        console.error("Error fetching employees:", err);
        setToastErrorMessage("Failed to load employees");
        setToastErrorVisible(true);
        setTimeout(() => setToastErrorVisible(false), 3500);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
    return () => controller.abort();
  }, []);


  // Update employee details
  const updateEmployee = async (employeeId, payload) => {
    try {
      const resp = await axios.put(
        `${API_BASE_URL}/api/employee/updateEmployee/${employeeId}`,
        { newEmployee: payload },
        { headers: { "Content-Type": "application/json" } }
      );

      if (resp.status === 200) {
        const updatedDetails = resp.data?.employee?.details || payload;

        setEmployees((prev) =>
          prev.map((emp) =>
            emp._id === employeeId ? { ...emp, details: updatedDetails } : emp
          )
        );
        setEditingEmployee((prev) =>
          prev && prev._id === employeeId
            ? { ...prev, details: updatedDetails }
            : prev
        );

        setToastSuccessMessage(resp.data?.message || "Employee updated successfully");
        setToastSuccessVisible(true);
        setTimeout(() => setToastSuccessVisible(false), 3000);
        setEditOpen(false);
      }
    } catch (err) {
      console.error(err);
      setToastErrorMessage(err.response?.data?.message || "Update failed");
      setToastErrorVisible(true);
      setTimeout(() => setToastErrorVisible(false), 3000);
    }
  };

// Delete employee
const deleteEmployee = async (employeeId) => {
  try {
    if (!confirm("Delete this employee?")) return;
    const resp = await axios.delete(`${API_BASE_URL}/api/employee/${employeeId}`);
    if (resp.status === 200) {
      setEmployees(prev => prev.filter(emp => emp._id !== employeeId));
      setToastSuccessMessage("Employee deleted");
      setToastSuccessVisible(true);
      setTimeout(() => setToastSuccessVisible(false), 3000);
    }
  } catch (err) {
    console.error(err);
    setToastErrorMessage(err.response?.data?.message || "Delete failed");
    setToastErrorVisible(true);
    setTimeout(() => setToastErrorVisible(false), 3000);
  }
};

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

//Update Salary

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
          salary: updatedSalary,
        };

        const response = await axios.post(
          `${API_BASE_URL}/api/employee/updateSalary/${emp._id}`,
          sal,
          {
            headers: {
              "content-type": "application/json",
            },
          }
        );

        if (response.status === 201) {
          // alert(response.data.message);
          setToastSuccessMessage(response.data.message);
          setToastSuccessVisible(true);
          setTimeout(() => setToastSuccessVisible(false), 3500);
        }
      }
    } else {
      setTimeout(() => {
        document.getElementById("salary").value =
          emp.details.salary || "Enter salary";
      }, 1);
    }
  };

  const renderDetailSection = (title, data, employee) => (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-blue-600 mb-2">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <p className="text-sm font-medium text-gray-600">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </p>
            <p className="text-sm text-gray-900">{value || "N/A"}</p>
          </div>
        ))}
        {title === "Financial Information" && employee ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">basic salary</p>
            <div className="flex items-center">
              {toggleEditsalary ? (
                <input
                  type="text"
                  id="salary"
                  className="w-1/3 border-gray-400 border-2 rounded p-1"
                  placeholder={"Enter salary"}
                />
              ) : (
                <p className="text-sm text-gray-900">
                  {employee.details.salary || "N/A"}
                </p>
              )}
              {(user && user.role === "superAdmin") ||
              user.role === "accountant" ? (
                <Pencil
                  className="inline w-4 ml-2 hover:cursor-pointer"
                  onClick={() => {
                    updateSalary(employee);
                    setToggleEditSalary(!toggleEditsalary);
                  }}
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  const handleCancelEdit = () => {
    setEditOpen(false);
    setEditingEmployee(null);
    setForm(initialFormState);
  };

  // const handleDownload = async (employee, doc) => {
  //     // Fetch document on-demand to avoid loading all documents upfront
  //     try {
  //         const response = await axios.get(`${API_BASE_URL}/api/employee/${employee._id}`, {
  //             params: { includeDocuments: "true" }
  //         });

  //         if (response.status === 200) {
  //             const fullEmployee = response.data.employee;

  //             if (doc === 'PAN Card') {
  //                 downloadDocument(employee.name, doc, fullEmployee.details.documentsPanCard);
  //             }
  //             else if (doc === 'Aadhar Card') {
  //                 downloadDocument(employee.name, doc, fullEmployee.details.documentsAadhar);
  //             }
  //             else if (doc === 'Degree Certificate') {
  //                 downloadDocument(employee.name, doc, fullEmployee.details.documentsDegree);
  //             }
  //             else if (doc === 'Experience Certificate') {
  //                 downloadDocument(employee.name, doc, fullEmployee.details.documentsExperience);
  //             }
  //         } else {
  //             throw new Error('Failed to fetch employee documents');           }
  //     } catch (err) {
  //         console.error('Error downloading document:', err);
  //         setToastErrorMessage('Failed to download document');
  //                   setToastErrorVisible(true);
  //         setTimeout(() => setToastErrorVisible(false), 3500);
  //     }
  // }

  // function downloadDocument(name, doc, buffer) {
  //     // Check if we have a valid Buffer and convert it to ArrayBuffer
  //     if (buffer && buffer.data instanceof Array) {
  //         // Convert Buffer (Node.js) to ArrayBuffer
  //         const arrayBuffer = new Uint8Array(buffer.data).buffer; // Create an ArrayBuffer from Buffer data

  //         // Convert the ArrayBuffer to a Blob (ensure MIME type is correct for the document)
  //         const blob = new Blob([arrayBuffer], { type: 'application/pdf' }); // Adjust MIME type as needed (e.g., 'application/pdf')

  //         // Ensure Blob is created correctly
  //         if (!blob.size) {
  //             console.error('Failed to create Blob from ArrayBuffer.');
  //             return;
  //         }

  //         // Create a link element to download the Blob
  //         const link = document.createElement('a');
  //         const url = window.URL.createObjectURL(blob);

  //         // Ensure URL is created successfully
  //         if (!url) {
  //             console.error('Failed to create Object URL for the Blob.');
  //             return;
  //         }

  //         // Set the download attribute to define the file name
  //         link.href = url;
  //         link.download = `${name}-${doc}.pdf`; // You can adjust file extension based on the document type

  //         // Append the link to the DOM, trigger the download, and remove the link afterward
  //         document.body.appendChild(link);
  //         link.click();
  //         document.body.removeChild(link);

  //         // Release the Object URL to free up memory
  //         window.URL.revokeObjectURL(url);
  //     } else {
  //         console.error('Received data is not a valid Buffer or Array.');
  //     }
  // }

  const handleDownload = (docObj) => {
    if (!docObj?.url) {
      setToastErrorMessage("Document not available");
      setToastErrorVisible(true);
      setTimeout(() => setToastErrorVisible(false), 3000);
      return;
    }

    // Open Cloudinary file in new tab (downloadable)
    window.open(docObj.url, "_blank");
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      {toastSuccessVisible ? (
        <SuccessToast message={toastSuccessMessage} />
      ) : null}
      {toastErrorVisible ? <ErrorToast error={toastErrorMessage} /> : null}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-100 border-b border-gray-300">
            <h2 className="text-xl font-semibold text-gray-800">
              Employee Directory
            </h2>
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((employee) => (
                  <React.Fragment key={employee.details.employeeDetailId}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            toggleRow(employee.details.employeeDetailId)
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {expandedRows.has(
                            employee.details.employeeDetailId
                          ) ? (
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
                        <div className="text-sm text-gray-900">
                          {employee.details.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                            onClick={async () => {
                              setEditingEmployee(employee);
                              const d = employee.details;
                              setForm({
                                name: d.name || "",
                                email: d.email || "",
                                department: d.department || "",
                                designation: d.designation || "",
                                phone: d.phone || "",
                                dateOfBirth: d.dateOfBirth
                                  ? new Date(d.dateOfBirth)
                                      .toISOString()
                                      .split("T")[0]
                                  : "",
                                gender: d.gender || "",
                                maritalStatus: d.maritalStatus || "",
                                nationality: d.nationality || "",
                                currentAddress: d.currentAddress || "",
                                permanentAddress: d.permanentAddress || "",
                                city: d.city || "",
                                state: d.state || "",
                                pincode: d.pincode || "",
                                dateOfJoining: d.dateOfJoining
                                  ? new Date(d.dateOfJoining)
                                      .toISOString()
                                      .split("T")[0]
                                  : "",
                                nameAsPerBank: d.nameAsPerBank || "",
                                bankName: d.bankName || "",
                                accountNumber: d.accountNumber || "",
                                ifscCode: d.ifscCode || "",
                                panNumber: d.panNumber || "",
                                aadharNumber: d.aadharNumber || "",
                                uanNumber: d.uanNumber || "",
                                salary: d.salary || "",
                                emergencyContactName:
                                  d.emergencyContactName || "",
                                emergencyContactRelation:
                                  d.emergencyContactRelation || "",
                                emergencyContactPhone:
                                  d.emergencyContactPhone || "",
                              });

                              setEditOpen(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded border border-red-200"
                            onClick={()=> deleteEmployee(employee._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(employee.details.employeeDetailId) && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 bg-gray-50">
                          <div className="space-y-6">
                            {renderDetailSection("Personal Information", {
                              Phone: employee.details.phone,
                              "Date of Birth": employee.details.dateOfBirth
                                ? new Date(
                                    employee.details.dateOfBirth
                                  ).toLocaleDateString("en-GB") // Format to dd-mm-yyyy
                                : null,
                              Gender: employee.details.gender,
                              "Marital Status": employee.details.maritalStatus,
                              Nationality: employee.details.nationality,
                            })}

                            {renderDetailSection("Address Information", {
                              "Current Address":
                                employee.details.currentAddress,
                              "Permanent Address":
                                employee.details.permanentAddress,
                              City: employee.details.city,
                              State: employee.details.state,
                              Pincode: employee.details.pincode,
                            })}

                            {renderDetailSection("Employment Details", {
                              "Date of Joining": employee.details.dateOfJoining
                                ? new Date(
                                    employee.details.dateOfJoining
                                  ).toLocaleDateString("en-GB") // Format to dd-mm-yyyy
                                : null,
                            })}

                            {renderDetailSection(
                              "Financial Information",
                              {
                                "Name as per Bank Account":
                                  employee.details.nameAsPerBank,
                                "Bank Name": employee.details.bankName,
                                "Account Number":
                                  employee.details.accountNumber,
                                "IFSC Code": employee.details.ifscCode,
                                "PAN Number": employee.details.panNumber,
                                "Aadhar Number": employee.details.aadharNumber,
                                "UAN Number": employee.details.uanNumber,
                              },
                              employee
                            )}

                            {renderDetailSection("Emergency Contact", {
                              "Contact Name":
                                employee.details.emergencyContactName,
                              "Contact Relation":
                                employee.details.emergencyContactRelation,
                              "Contact Phone":
                                employee.details.emergencyContactPhone,
                            })}

                            <div className="mt-4">
                              <h3 className="text-lg font-semibold text-blue-600 mb-2">
                                Documents
                              </h3>
                              {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            {
                                                                employee.details.documentsAadhar || employee.details.documentsPanCard || employee.details.documentsDegree || employee.details.documentsExperience
                                                                    ?
                                                                    null
                                                                    :
                                                                    <div className='text-gray-500'>No documents submitted</div>
                                                            }
                                                            {
                                                                employee.details.documentsPanCard
                                                                    ?
                                                                    <button
                                                                        onClick={() => handleDownload(employee.details.documentsPanCard)}
                                                                        key='PAN Card'
                                                                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                                    >
                                                                        <Download className="w-4 h-4 mr-2" />
                                                                        PAN Card
                                                                    </button>
                                                                    :
                                                                    null
                                                            }
                                                            {
                                                                employee.details.documentsAadhar
                                                                    ?
                                                                    <button
                                                                        onClick={() => handleDownload(employee.details.documentsAadhar)}
                                                                        key='Aadhar Card'
                                                                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                                    >
                                                                        <Download className="w-4 h-4 mr-2" />
                                                                        Aadhar Card
                                                                    </button>
                                                                    :
                                                                    null
                                                            }
                                                            {
                                                                employee.details.documentsDegree
                                                                    ?
                                                                    <button
                                                                        onClick={() => handleDownload(employee.details.documentsDegree)}
                                                                        key='Degree Certificate'
                                                                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                                    >
                                                                        <Download className="w-4 h-4 mr-2" />
                                                                        Degree Certificate
                                                                    </button>
                                                                    :
                                                                    null
                                                            }
                                                            {
                                                                employee.details.documentsExperience
                                                                    ?
                                                                    <button
                                                                        onClick={() => handleDownload(employee.details.documentsExperience)}
                                                                        key='Experience Certificate'
                                                                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                                    >
                                                                        <Download className="w-4 h-4 mr-2" />
                                                                        Experience Certificate
                                                                    </button>
                                                                    :
                                                                    null
                                                            }

                                                        </div> */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {!employee.details.documentsPanCard &&
                                  !employee.details.documentsAadhar &&
                                  !employee.details.documentsDegree &&
                                  !employee.details.documentsExperience && (
                                    <div className="text-gray-500">
                                      No documents submitted
                                    </div>
                                  )}

                                {employee.details.documentsPanCard && (
                                  <button
                                    onClick={() =>
                                      handleDownload(
                                        employee.details.documentsPanCard
                                      )
                                    }
                                    className="flex items-center justify-center px-4 py-2 border rounded-md"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    PAN Card
                                  </button>
                                )}

                                {employee.details.documentsAadhar && (
                                  <button
                                    onClick={() =>
                                      handleDownload(
                                        employee.details.documentsAadhar
                                      )
                                    }
                                    className="flex items-center justify-center px-4 py-2 border rounded-md"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Aadhar Card
                                  </button>
                                )}

                                {employee.details.documentsDegree && (
                                  <button
                                    onClick={() =>
                                      handleDownload(
                                        employee.details.documentsDegree
                                      )
                                    }
                                    className="flex items-center justify-center px-4 py-2 border rounded-md"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Degree Certificate
                                  </button>
                                )}

                                {employee.details.documentsExperience && (
                                  <button
                                    onClick={() =>
                                      handleDownload(
                                        employee.details.documentsExperience
                                      )
                                    }
                                    className="flex items-center justify-center px-4 py-2 border rounded-md"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Experience Certificate
                                  </button>
                                )}
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

      {/* Edit Modal */}
      {editOpen && editingEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Edit Employee - {editingEmployee.details.name}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setEditOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-md font-semibold text-blue-600 mb-3">
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="text-sm">
                    Name
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Email
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Phone
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Date of Birth
                    <input
                      type="date"
                      className="mt-1 w-full border rounded p-2"
                      value={form.dateOfBirth}
                      onChange={(e) =>
                        setForm({ ...form, dateOfBirth: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Gender
                    <select
                      className="mt-1 w-full border rounded p-2"
                      value={form.gender}
                      onChange={(e) =>
                        setForm({ ...form, gender: e.target.value })
                      }
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  <label className="text-sm">
                    Marital Status
                    <select
                      className="mt-1 w-full border rounded p-2"
                      value={form.maritalStatus}
                      onChange={(e) =>
                        setForm({ ...form, maritalStatus: e.target.value })
                      }
                    >
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  </label>
                  <label className="text-sm col-span-2">
                    Nationality
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.nationality}
                      onChange={(e) =>
                        setForm({ ...form, nationality: e.target.value })
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-md font-semibold text-blue-600 mb-3">
                  Address Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="text-sm col-span-2">
                    Current Address
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.currentAddress}
                      onChange={(e) =>
                        setForm({ ...form, currentAddress: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm col-span-2">
                    Permanent Address
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.permanentAddress}
                      onChange={(e) =>
                        setForm({ ...form, permanentAddress: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    City
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    State
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.state}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Pincode
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.pincode}
                      onChange={(e) =>
                        setForm({ ...form, pincode: e.target.value })
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Employment Details */}
              <div>
                <h4 className="text-md font-semibold text-blue-600 mb-3">
                  Employment Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="text-sm">
                    Department
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.department}
                      onChange={(e) =>
                        setForm({ ...form, department: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Designation
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.designation}
                      onChange={(e) =>
                        setForm({ ...form, designation: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Date of Joining
                    <input
                      type="date"
                      className="mt-1 w-full border rounded p-2"
                      value={form.dateOfJoining}
                      onChange={(e) =>
                        setForm({ ...form, dateOfJoining: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Salary
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.salary}
                      onChange={(e) =>
                        setForm({ ...form, salary: e.target.value })
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h4 className="text-md font-semibold text-blue-600 mb-3">
                  Financial Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="text-sm">
                    Name as per Bank
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.nameAsPerBank}
                      onChange={(e) =>
                        setForm({ ...form, nameAsPerBank: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Bank Name
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.bankName}
                      onChange={(e) =>
                        setForm({ ...form, bankName: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Account Number
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.accountNumber}
                      onChange={(e) =>
                        setForm({ ...form, accountNumber: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    IFSC Code
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.ifscCode}
                      onChange={(e) =>
                        setForm({ ...form, ifscCode: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    PAN Number
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.panNumber}
                      onChange={(e) =>
                        setForm({ ...form, panNumber: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Aadhar Number
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.aadharNumber}
                      onChange={(e) =>
                        setForm({ ...form, aadharNumber: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    UAN Number
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.uanNumber}
                      onChange={(e) =>
                        setForm({ ...form, uanNumber: e.target.value })
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 className="text-md font-semibold text-blue-600 mb-3">
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="text-sm">
                    Contact Name
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.emergencyContactName}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          emergencyContactName: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Contact Relation
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.emergencyContactRelation}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          emergencyContactRelation: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Contact Phone
                    <input
                      className="mt-1 w-full border rounded p-2"
                      value={form.emergencyContactPhone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          emergencyContactPhone: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 border rounded text-gray-700 bg-gray-100 hover:bg-gray-200"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 border rounded"
                onClick={()=> updateEmployee(editingEmployee._id, form)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Usage example for testing
export default () => <EmployeeList />;
