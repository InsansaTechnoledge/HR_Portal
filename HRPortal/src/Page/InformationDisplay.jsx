import React, { useContext, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Pencil,
  Trash2,
  X,
  Search,
  Building2
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../config";
import { userContext } from "../Context/userContext";
import Loader from "../Components/Loader/Loader";
import SuccessToast from "../Components/Toaster/SuccessToaser";
import ErrorToast from "../Components/Toaster/ErrorToaster";
import {Card, CardContent, CardHeader, CardTitle} from '../Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from '../Components/ui/dialog';
import { Label } from '../Components/ui/label';
import { Input} from '../Components/ui/input';
import {Button} from '../Components/ui/button';
import * as XLSX from "xlsx";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [allEmployees, setAllEmployees] = useState([]);
  
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState(null);

  const [exportOpen, setExportOpen] = useState(false);
  const [exportType, setExportType] = useState("all"); // all | department | department-wise
  const [exportDepartment, setExportDepartment] = useState("");

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
          setAllEmployees(response.data.employees);
          setEmployees(response.data.employees);
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


useEffect(() => {
  const filtered = allEmployees.filter((emp) => {
    // Skip employees without details
    if (!emp?.details) return false;

    const name = emp.details.name?.toLowerCase() || "";
    const email = emp.details.email?.toLowerCase() || "";
    const department = emp.details.department || "";

    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "all" ||
      department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  setEmployees(filtered);
}, [searchTerm, selectedDepartment, allEmployees]);

//Helper function Initializer for edit dialog employee data
  const mapEmployeeToForm = (employee) => {
    const d = employee?.details || {};

    return {
      // Personal
      name: d.name || "",
      email: d.email || "",
      phone: d.phone || "",
      dateOfBirth: d.dateOfBirth
        ? d.dateOfBirth.split("T")[0]
        : "",
      gender: d.gender || "",
      maritalStatus: d.maritalStatus || "",
      nationality: d.nationality || "",

      // Address
      currentAddress: d.currentAddress || "",
      permanentAddress: d.permanentAddress || "",
      city: d.city || "",
      state: d.state || "",
      pincode: d.pincode || "",

      // Employment
      department: d.department || "",
      designation: d.designation || "",
      dateOfJoining: d.dateOfJoining
        ? d.dateOfJoining.split("T")[0]
        : "",
      salary: d.salary || "",

      // Financial
      nameAsPerBank: d.nameAsPerBank || "",
      bankName: d.bankName || "",
      accountNumber: d.accountNumber || "",
      ifscCode: d.ifscCode || "",
      panNumber: d.panNumber || "",
      aadharNumber: d.aadharNumber || "",
      uanNumber: d.uanNumber || "",

      // Emergency
      emergencyContactName: d.emergencyContactName || "",
      emergencyContactRelation: d.emergencyContactRelation || "",
      emergencyContactPhone: d.emergencyContactPhone || "",
    };
  };

  //initializing edit form data
  useEffect(() => {
  if (editingEmployee?.details) {
    setForm(mapEmployeeToForm(editingEmployee));
  }
}, [editingEmployee]);
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

  //edit employee modal open func
  const handleEditClick = (employee) => {
  setEditingEmployee(employee);
  setForm(mapEmployeeToForm(employee));
  setEditOpen(true);
};

  const handleDeleteClick = (employee) => {
  setDeletingEmployee(employee);
  setDeleteOpen(true);
};
// Delete employee

const deleteEmployee = async (employeeId) => {
  try {
    const resp = await axios.delete(
      `${API_BASE_URL}/api/employee/${employeeId}`
    );

    if (resp.status === 200) {
      setEmployees((prev) =>
        prev.filter((emp) => emp._id !== employeeId)
      );

      setToastSuccessMessage(
        resp.data?.message || "Employee deleted successfully"
      );
      setToastSuccessVisible(true);
      setTimeout(() => setToastSuccessVisible(false), 3000);

      setDeleteOpen(false);
      setDeletingEmployee(null);
    }
  } catch (err) {
    console.error(err);
    setToastErrorMessage(
      err.response?.data?.message || "Delete failed"
    );
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

  //Reusable Field component for information display
  const Field = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-gray-500 uppercase">
      {label}
    </p>
    <p className="text-sm text-gray-900 break-words">
      {value || "—"}
    </p>
  </div>
);

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

  //Handle export employee data to excel
  const handleExportExcel = () => {
  const workbook = XLSX.utils.book_new();

  // Full employee list
  if (exportType === "all") {
    const data = allEmployees.map(mapEmployeeForExcel);
    const sheet = XLSX.utils.json_to_sheet(data);
    applySheetStyles(sheet, data);
    XLSX.utils.book_append_sheet(workbook, sheet, "All Employees");
  }

  // Specific department
  if (exportType === "department") {
    const filtered = allEmployees.filter(
      (e) => e.details?.department === exportDepartment
    );

    const data = filtered.map(mapEmployeeForExcel);
    const sheet = XLSX.utils.json_to_sheet(data);
    applySheetStyles(sheet, data);
    XLSX.utils.book_append_sheet(workbook, sheet, exportDepartment);
  }

  // Department-wise sheets
  if (exportType === "department-wise") {
    const departmentMap = {};

    allEmployees.forEach((emp) => {
      const dep = emp.details?.department || "Unknown";
      if (!departmentMap[dep]) departmentMap[dep] = [];
      departmentMap[dep].push(emp);
    });

    Object.entries(departmentMap).forEach(([dep, emps]) => {
      const data = emps.map(mapEmployeeForExcel);
      const sheet = XLSX.utils.json_to_sheet(data);
      applySheetStyles(sheet, data);
      XLSX.utils.book_append_sheet(workbook, sheet, dep);
    });
  }

  XLSX.writeFile(
    workbook,
    `Employees_${new Date().toISOString().split("T")[0]}.xlsx`
  );

  setExportOpen(false);
};
  //Helper function for export employeelist format
  const mapEmployeeForExcel = (emp, index) => {
  const d = emp.details || {};

  return {
    "S.No": index + 1,
    "Employee Name": d.name || "",
    "Email": d.email || "",
    "Phone": d.phone || "",
    "Department": d.department || "",
    "Designation": d.designation || "",
    "Date of Joining": d.dateOfJoining
      ? new Date(d.dateOfJoining).toLocaleDateString("en-GB")
      : "",
    "Salary": d.salary || "",
    "Gender": d.gender || "",
    "City": d.city || "",
    "State": d.state || "",
  };
};

//helper function for Auto Column Width + Bold Headers
const applySheetStyles = (worksheet, data) => {
  const headers = Object.keys(data[0] || {});
  const colWidths = headers.map((key) => ({
    wch: Math.max(
      key.length,
      ...data.map((row) => String(row[key] || "").length)
    ) + 2,
  }));

  worksheet["!cols"] = colWidths;

  // Bold header row
  headers.forEach((_, index) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true },
      };
    }
  });

};

  return (
    <>
      {toastSuccessVisible ? (
        <SuccessToast message={toastSuccessMessage} />
      ) : null}
      {toastErrorVisible ? <ErrorToast error={toastErrorMessage} /> : null}
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Employee List</h1>
              <p className="text-muted-foreground">View and manage all employees</p>
            </div>
            { user.role === 'admin' || user.role === 'superAdmin' &&
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setExportOpen(true)}
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              }
          </div>


          {/* Search */}
          <Card className="border-0 shadow-card">
            <CardContent className="p-4">
              <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    className="pl-10 w-full border rounded px-3 py-2"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="border rounded px-3 py-2"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {[...new Set(allEmployees.map(e => e.details.department))].map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Employee Table */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">All Employees ({employees.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="p-4">Expand</th>
                      <th className="p-4">Employee</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                  {employees.map((employee) => (
                    <React.Fragment key={employee._id}>
                      <tr className="border-b hover:bg-muted/30">
                        <td className="p-4">
                          <button
                            onClick={() =>
                              toggleRow(employee.details.employeeDetailId)
                            }
                            className="text-green-600 hover:text-green-800"
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

                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground font-bold">
                              {employee.details?.name?.charAt(0) || "E"}
                            </div>
                            <div>
                              <p className="font-medium">{employee.details.name}</p>
                              <p className="text-sm text-gray-500">{employee.details.designation}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4"><div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span>{employee.details.department}</span>
                        </div></td>

                        <td className="p-4 text-sm text-gray-600">
                          <div>{employee.details.email}</div>
                          <div>{employee.details.phone}</div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="p-2 hover:bg-gray-100 rounded"
                              onClick={() => handleEditClick(employee)}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 hover:bg-red-100 text-red-600 rounded"
                              onClick={() => handleDeleteClick(employee)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {employee?.details &&
                      expandedRows.has(employee.details.employeeDetailId) && (
                        <tr>
                          <td colSpan="7" className="bg-gray-50 px-6 py-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                              {/* LEFT COLUMN */}
                              <div className="space-y-6">

                                {/* PERSONAL INFORMATION */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg font-semibold">
                                      Personal Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Phone" value={employee.details.phone} />
                                    <Field label="Gender" value={employee.details.gender} />
                                    <Field label="Marital Status" value={employee.details.maritalStatus} />
                                    <Field label="Nationality" value={employee.details.nationality} />
                                    <Field
                                      label="Date of Birth"
                                      value={
                                        employee.details.dateOfBirth
                                          ? new Date(employee.details.dateOfBirth).toLocaleDateString("en-GB")
                                          : null
                                      }
                                    />
                                  </CardContent>
                                </Card>

                                {/* ADDRESS INFORMATION */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg font-semibold">
                                      Address Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <Field
                                      label="Current Address"
                                      value={employee.details.currentAddress}
                                    />
                                    <Field
                                      label="Permanent Address"
                                      value={employee.details.permanentAddress}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                      <Field label="City" value={employee.details.city} />
                                      <Field label="State" value={employee.details.state} />
                                      <Field label="Pincode" value={employee.details.pincode} />
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* FINANCIAL INFORMATION */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg font-semibold">
                                      Financial Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Bank Name" value={employee.details.bankName} />
                                    <Field label="Account Number" value={employee.details.accountNumber} />
                                    <Field label="IFSC Code" value={employee.details.ifscCode} />
                                    <Field label="PAN Number" value={employee.details.panNumber} />
                                    <Field label="Aadhar Number" value={employee.details.aadharNumber} />
                                    <Field label="UAN Number" value={employee.details.uanNumber} />
                                  </CardContent>
                                </Card>

                              </div>

                              {/* RIGHT COLUMN */}
                              <div className="space-y-6">

                                {/* EMPLOYMENT DETAILS */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg font-semibold">
                                      Employment Details
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field
                                      label="Date of Joining"
                                      value={
                                        employee.details.dateOfJoining
                                          ? new Date(employee.details.dateOfJoining).toLocaleDateString("en-GB")
                                          : null
                                      }
                                    />
                                    <Field label="Department" value={employee.details.department} />
                                  </CardContent>
                                </Card>

                                {/* CONTACT DETAILS */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg font-semibold">
                                      Contact Details
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Email" value={employee.details.email} />
                                    <Field label="Phone" value={employee.details.phone} />
                                    <Field
                                      label="Emergency Contact"
                                      value={employee.details.emergencyContactName}
                                    />
                                    <Field
                                      label="Emergency Phone"
                                      value={employee.details.emergencyContactPhone}
                                    />
                                  </CardContent>
                                </Card>

                                {/* DOCUMENTS */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg font-semibold">
                                      Documents
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                    {!employee.details.documentsPanCard &&
                                      !employee.details.documentsAadhar &&
                                      !employee.details.documentsDegree &&
                                      !employee.details.documentsExperience && (
                                        <p className="text-sm text-gray-500 col-span-full">
                                          No documents submitted
                                        </p>
                                      )}

                                    {employee.details.documentsPanCard && (
                                      <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() =>
                                          handleDownload(employee.details.documentsPanCard)
                                        }
                                      >
                                        <Download className="w-4 h-4" />
                                        PAN Card
                                      </Button>
                                    )}

                                    {employee.details.documentsAadhar && (
                                      <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() =>
                                          handleDownload(employee.details.documentsAadhar)
                                        }
                                      >
                                        <Download className="w-4 h-4" />
                                        Aadhar Card
                                      </Button>
                                    )}

                                    {employee.details.documentsDegree && (
                                      <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() =>
                                          handleDownload(employee.details.documentsDegree)
                                        }
                                      >
                                        <Download className="w-4 h-4" />
                                        Degree Certificate
                                      </Button>
                                    )}

                                    {employee.details.documentsExperience && (
                                      <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() =>
                                          handleDownload(employee.details.documentsExperience)
                                        }
                                      >
                                        <Download className="w-4 h-4" />
                                        Experience Certificate
                                      </Button>
                                    )}

                                  </CardContent>
                                </Card>

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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) handleCancelEdit();
        }}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Edit Employee – {editingEmployee?.details?.name}
            </DialogTitle>

          </DialogHeader>

          <div className="space-y-8">

            {/* PERSONAL INFORMATION */}
            <section>
              <h4 className="text-base font-semibold text-blue-600 mb-4">
                Personal Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
                </div>

                <div>
                  <Label>Email</Label>
                  <Input value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
                </div>

                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.dateOfBirth} onChange={e=>setForm({...form,dateOfBirth:e.target.value})}/>
                </div>

                <div>
                  <Label>Gender</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={form.gender}
                    onChange={e=>setForm({...form,gender:e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <Label>Marital Status</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={form.maritalStatus}
                    onChange={e=>setForm({...form,maritalStatus:e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Label>Nationality</Label>
                  <Input value={form.nationality} onChange={e=>setForm({...form,nationality:e.target.value})}/>
                </div>
              </div>
            </section>

            {/* ADDRESS INFORMATION */}
            <section>
              <h4 className="text-base font-semibold text-blue-600 mb-4">
                Address Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Current Address</Label>
                  <Input value={form.currentAddress} onChange={e=>setForm({...form,currentAddress:e.target.value})}/>
                </div>

                <div className="sm:col-span-2">
                  <Label>Permanent Address</Label>
                  <Input value={form.permanentAddress} onChange={e=>setForm({...form,permanentAddress:e.target.value})}/>
                </div>

                <div>
                  <Label>City</Label>
                  <Input value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/>
                </div>

                <div>
                  <Label>State</Label>
                  <Input value={form.state} onChange={e=>setForm({...form,state:e.target.value})}/>
                </div>

                <div>
                  <Label>Pincode</Label>
                  <Input value={form.pincode} onChange={e=>setForm({...form,pincode:e.target.value})}/>
                </div>
              </div>
            </section>

            {/* EMPLOYMENT DETAILS */}
            <section>
              <h4 className="text-base font-semibold text-blue-600 mb-4">
                Employment Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <Input value={form.department} onChange={e=>setForm({...form,department:e.target.value})}/>
                </div>

                <div>
                  <Label>Designation</Label>
                  <Input value={form.designation} onChange={e=>setForm({...form,designation:e.target.value})}/>
                </div>

                <div>
                  <Label>Date of Joining</Label>
                  <Input type="date" value={form.dateOfJoining} onChange={e=>setForm({...form,dateOfJoining:e.target.value})}/>
                </div>

                <div>
                  <Label>Salary</Label>
                  <Input value={form.salary} onChange={e=>setForm({...form,salary:e.target.value})}/>
                </div>
              </div>
            </section>

            {/* FINANCIAL INFORMATION */}
            <section>
              <h4 className="text-base font-semibold text-blue-600 mb-4">
                Financial Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Name as per Bank</Label>
                  <Input value={form.nameAsPerBank} onChange={e=>setForm({...form,nameAsPerBank:e.target.value})}/>
                </div>

                <div>
                  <Label>Bank Name</Label>
                  <Input value={form.bankName} onChange={e=>setForm({...form,bankName:e.target.value})}/>
                </div>

                <div>
                  <Label>Account Number</Label>
                  <Input value={form.accountNumber} onChange={e=>setForm({...form,accountNumber:e.target.value})}/>
                </div>

                <div>
                  <Label>IFSC Code</Label>
                  <Input value={form.ifscCode} onChange={e=>setForm({...form,ifscCode:e.target.value})}/>
                </div>

                <div>
                  <Label>PAN Number</Label>
                  <Input value={form.panNumber} onChange={e=>setForm({...form,panNumber:e.target.value})}/>
                </div>

                <div>
                  <Label>Aadhar Number</Label>
                  <Input value={form.aadharNumber} onChange={e=>setForm({...form,aadharNumber:e.target.value})}/>
                </div>

                <div>
                  <Label>UAN Number</Label>
                  <Input value={form.uanNumber} onChange={e=>setForm({...form,uanNumber:e.target.value})}/>
                </div>
              </div>
            </section>

            {/* EMERGENCY CONTACT */}
            <section>
              <h4 className="text-base font-semibold text-blue-600 mb-4">
                Emergency Contact
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Contact Name</Label>
                  <Input value={form.emergencyContactName} onChange={e=>setForm({...form,emergencyContactName:e.target.value})}/>
                </div>

                <div>
                  <Label>Contact Relation</Label>
                  <Input value={form.emergencyContactRelation} onChange={e=>setForm({...form,emergencyContactRelation:e.target.value})}/>
                </div>

                <div>
                  <Label>Contact Phone</Label>
                  <Input value={form.emergencyContactPhone} onChange={e=>setForm({...form,emergencyContactPhone:e.target.value})}/>
                </div>
              </div>
            </section>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={() => updateEmployee(editingEmployee._id, form)}>
                Save Changes
              </Button>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteOpen(false);
            setDeletingEmployee(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {deletingEmployee?.details?.name}
              </span>
              ?
              <br />
              <span className="text-sm text-gray-500">
                This action cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setDeletingEmployee(null);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={() =>
                deleteEmployee(deletingEmployee?._id)
              }
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Employee details options dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Employees</DialogTitle>
            <DialogDescription>
              Choose how you want to export employee data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="all"
                checked={exportType === "all"}
                onChange={(e) => setExportType(e.target.value)}
              />
              Full Employee List
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="department"
                checked={exportType === "department"}
                onChange={(e) => setExportType(e.target.value)}
              />
              Specific Department
            </label>

            {exportType === "department" && (
              <select
                className="w-full border rounded px-3 py-2"
                value={exportDepartment}
                onChange={(e) => setExportDepartment(e.target.value)}
              >
                <option value="">Select Department</option>
                {[...new Set(allEmployees.map(e => e.details?.department))]
                  .filter(Boolean)
                  .map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            )}

            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="department-wise"
                checked={exportType === "department-wise"}
                onChange={(e) => setExportType(e.target.value)}
              />
              Department-wise Sheets
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setExportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportExcel}>
              Export
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Usage example for testing
export default () => <EmployeeList />;
