import React, { useContext, useEffect, useState, useRef, useMemo } from 'react';
import { Search, Download, ChevronDown, User, Eye, IndianRupee, FileText, TrendingUp, Calendar, DockIcon, Trash2 } from 'lucide-react';
import { userContext } from '../Context/userContext';
import API_BASE_URL from '../config';
import axios, { all } from 'axios';
import Loader from '../Components/Loader/Loader';
import { companyDetails } from '../Constant/constant';
import { useNavigate } from 'react-router-dom';
import SuccessToast from '../Components/Toaster/SuccessToaser';
import ErrorToast from '../Components/Toaster/ErrorToaster';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import TemplateClassic from '../templates/TemplateClassic';
import TemplateCorporate from '../templates/TemplateCorporate';
import TemplateDefault from '../templates/TemplateDefault';
import TemplateMinimal from '../templates/TemplateMinimal';
import TemplateModern from '../templates/TemplateModern';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../Components/ui/dialog";


const PayslipTracker = () => {
    const [userRole, setUserRole] = useState('employee'); // 'employee' or 'accountant'
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [error, setError] = useState(null);
    const {user} = useContext(userContext);
    const [payslips, setPayslips] = useState([]);
    const [allPayslips, setAllPayslips] = useState([]);
    const [empPayslips, setEmpPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [noEmployeeDetail, setNoEmployeeDetail] = useState(false);
    const [downloading, setDownloading] = useState(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const navigate = useNavigate();
    
    const [previewPayslip, setPreviewPayslip] = useState(null);
    const [downloadPayslip, setDownloadPayslip] = useState(null);
    const downloadRef = useRef(null);

      const [activePayslip, setActivePayslip] = useState(null);
      const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
      const [selectedPayslipId, setSelectedPayslipId] = useState(null);
      const [isDeleting, setIsDeleting] = useState(false);
      const [successMessage, setSuccessMessage] = useState("");
      const [errorMessage, setErrorMessage] = useState("");
      const [successToastKey, setSuccessToastKey] = useState(0);
      const [errorToastKey, setErrorToastKey] = useState(0);

      const [deleteOpen, setDeleteOpen] = useState(false);
      const [deletingEmployee, setDeletingEmployee] = useState(null);

      const role = user?.role;

      const isEmployee = role === "user" || role === "employee";

const {
  statsPayslips,
  latestPayslip,
  lastPaymentAmount,
  totalDeductionsAmount,
  totalPayslips,
  lastPayDate,
} = useMemo(() => {

  const allList = Array.isArray(allPayslips) ? allPayslips : [];

     //Filter by payslip.month
  let filtered = allList;

  if (filterMonth) {
    filtered = allList.filter(
      slip => slip.month === filterMonth
    );
  }

    //Latest payslip
  const latest = filtered.reduce((acc, slip) => {
    if (!acc) return slip;
    return new Date(slip.createdAt) > new Date(acc.createdAt)
      ? slip
      : acc;
  }, null);

    // Last Payment OR Total Net Salary

  // Latest payslip net salary (default view)
  const latestNetSalary = Number(latest?.netSalary) || 0;

  // Total net salary for selected month
  const totalNetSalary = filtered.reduce(
    (sum, slip) => sum + (Number(slip.netSalary) || 0),
    0
  );

  // Decide value
  const lastPaymentAmount = filterMonth
    ? totalNetSalary
    : latestNetSalary;

  /* ----------------------------------------
     STEP 4: Total Deductions
  ---------------------------------------- */
  const totalDeductions = filtered.reduce(
    (sum, slip) => sum + (Number(slip.totalDeductions) || 0),
    0
  );

  /* ----------------------------------------
     STEP 5: Total Payslips
  ---------------------------------------- */
  const totalCount = filtered.length;

  /* ----------------------------------------
     STEP 6: Last Pay Date
  ---------------------------------------- */
  const lastPayDate = latest?.createdAt
    ? (() => {
        const d = new Date(latest.createdAt);
        const day = String(d.getDate()).padStart(2, '0');
        const month = d.toLocaleString('en-IN', { month: 'short' });
        const year = d.getFullYear();
        return `${day} ${month}, ${year}`;
      })()
    : '--';

  return {
    statsPayslips: filtered,
    latestPayslip: latest,
    lastPaymentAmount,
    totalDeductionsAmount: totalDeductions,
    totalPayslips: totalCount,
    lastPayDate,
  };

}, [allPayslips, filterMonth]);

   const renderPayslipTemplate = (template, payslipData) => {
    if (!template || !payslipData) return null;

    const calculations = {
      totalEarnings: Number(payslipData.totalEarnings || 0).toFixed(2),
      totalDeductions: Number(payslipData.totalDeductions || 0).toFixed(2),
      netSalary: Number(payslipData.netSalary || 0).toFixed(2),
      deductions: {
        professionalTax: payslipData.professionalTax || 0,
        TDS: payslipData.TDS || 0,
        incomeTax: payslipData.incomeTax || 0,
      },
    };

    const props = {
      data: payslipData,
      company: companyDetails,
      calculations,
    };

    switch (template.toLowerCase()) {
      case "classic":
        return <TemplateClassic {...props} />;
      case "modern":
        return <TemplateModern {...props} />;
      case "minimal":
        return <TemplateMinimal {...props} />;
      case "corporate":
        return <TemplateCorporate {...props} />;
      default:
        return <TemplateDefault {...props} />;
    }
  };


  const handleDownloadPayslip = async (payslipId) => {
    setDownloading(payslipId);

    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/payslip/${payslipId}`
      );

      // Store full payslip
      setDownloadPayslip(data.payslip);

    } catch (err) {
      console.error(err);
      setDownloading(null);
    }
  };

useEffect(() => {
  if (!downloadPayslip || !downloadRef.current) return;

  const timer = setTimeout(() => {
    generatePDF(downloadPayslip);
    setDownloading(null);
    setDownloadPayslip(null);
  }, 300); // allow DOM render

  return () => clearTimeout(timer);
}, [downloadPayslip]);


const handleDeletePayslip = async () => {
    if (!selectedPayslipId || isDeleting) return;
 
    setIsDeleting(true);
 
    try {
      await axios.delete(
        `${API_BASE_URL}/api/payslip/delete/${selectedPayslipId}`
      );
 
      setPayslips(
        (prev) => prev?.filter((p) => p._id !== selectedPayslipId) || []
      );
 
      setSuccessMessage("Payslip deleted successfully");
      setSuccessToastKey((k) => k + 1);
 
      // Close modal
      setIsDeleteModalOpen(false);
      setSelectedPayslipId(null);
    } catch (error) {
      console.error("Error deleting payslip:", error);
 
      setErrorMessage(
        error.response?.data?.message || "Failed to delete payslip"
      );
      setErrorToastKey((k) => k + 1);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (payslipId) => {
    setSelectedPayslipId(payslipId);
    setIsDeleteModalOpen(true);
  };

    const generatePDF = async (payslipData) => {
        if (!downloadRef.current || !payslipData) return;

        setIsGeneratingPDF(true);
        try {
            const canvas = await html2canvas(downloadRef.current, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgWidth = 208; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const pdf = new jsPDF('p', 'mm', 'a4');

            pdf.addImage(
                canvas.toDataURL('image/png'),
                'PNG',
                0,
                0,
                imgWidth,
                imgHeight,
                undefined,
                'FAST'
            );

            pdf.save(`payslip-${payslipData.name}-${payslipData.month}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchPayslips = async () => {
        try {
        const commonParams = {
          fields:
            "_id,employeeId,name,department,month,salary,totalEarnings,totalDeductions,netSalary,expenseTotal,totalPayable",
          limit: 200,
        };

        let response;

        if (user && (user.role === 'superAdmin' || user.role === 'accountant' || user.role === 'admin')) {
            response = await axios.get(`${API_BASE_URL}/api/payslip/`, {
            params: commonParams,
            signal,
            });

            if (response.status === 200) {
            setAllPayslips(response.data.paySlips || []);
            setPayslips(response.data.paySlips || []);
            }
        }

        if (user && (user.role === 'user' || user.role === 'employee')) {
            response = await axios.get(
            `${API_BASE_URL}/api/payslip/my-payslip/${user.userEmail}`,
            { params: { limit: 200 }, signal }
            );

            if (response.status === 200) {
            setAllPayslips(response.data.payslips || []);
            setPayslips(response.data.payslips || []);
            }
        }
        } catch (error) {
        if (axios.isCancel?.(error)) return;
        setAllPayslips([]);
        setPayslips([]);
        } finally {
        setLoading(false);
        }
    };

    if (user) fetchPayslips();
        return () => controller.abort();
    }, [user]);


    const filteredPayslips = useMemo(() => {
  let list = Array.isArray(payslips) ? payslips : [];

  // Month filter (TESTING via payslip.month)
  if (filterMonth) {
    list = list.filter(
      slip => slip.month === filterMonth
    );
  }

  // Search filter
  if (searchTerm) {
    list = list.filter(slip =>
      slip.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return list;
}, [payslips, filterMonth, searchTerm]);


  if (loading) {
    return <Loader />;
  }

  if (noEmployeeDetail) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">
        No employee details found.
      </p>
    </div>
  );
}
    return (
        <div className="min-h-screen bg-background p-4 lg:p-8">
         { successMessage && <SuccessToast key={successToastKey} message={successMessage} />}
         { errorMessage && <ErrorToast key={errorToastKey} error={errorMessage} />}
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Payslip Tracker</h1>
                    <p className="text-muted-foreground">
                    {userRole === 'accountant' ? 'Manage all employee payslips' : 'View your payslip history'}
                    </p>
                </div>
                </div>

                {/* Summary Cards */}
                {user && user.role !== 'user' && 
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {[
                    {
                        label: filterMonth ? 'Selected Month Payslips' : 'Total Payslips',
                        value: totalPayslips,
                        icon: DockIcon,
                        color: 'text-success',
                        bg: 'bg-success/10',
                    },
                    {
                        label: filterMonth ? 'Total Net Salary' : 'Last Payment',
                        value: `₹ ${lastPaymentAmount.toLocaleString()}`,
                        icon: FileText,
                        color: 'text-primary',
                        bg: 'bg-primary/10',
                    },
                    {
                        label: filterMonth ? 'Selected Month Deductions' : 'Total Deductions',
                        value: `₹ ${totalDeductionsAmount.toLocaleString()}`,
                        icon: TrendingUp,
                        color: 'text-hr-amber',
                        bg: 'bg-hr-amber/10',
                    },
                    {
                        label: 'Last Pay Date',
                        value: lastPayDate,
                        icon: Calendar,
                        color: 'text-info',
                        bg: 'bg-info/10',
                    },
                ].map((stat, i) => (
                    <Card key={i} className="border-0 shadow-card">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            </div>
                        </CardContent>
                        </Card>
                    ))}
                    </div>}

                    {/* Search & Filter */}
                    <Card className="border-0 shadow-card">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                        {user && (user.role !== 'user' && user.role !== 'employee') && (
                            <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search payslips..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            </div>
                        )}

                        <input
                                type="month"
                                value={filterMonth}
                                className="border rounded-lg px-4 py-2"
                                onChange={(e) => setFilterMonth(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    </Card>

                    {/* Payslip List */}
                    <Card className="border-0 shadow-card">
                    <CardHeader>
                        <CardTitle className="text-lg">Payslip History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                        {filteredPayslips && filteredPayslips.length > 0 ? (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                    { !isEmployee &&
                                      <>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Employee ID</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Name</th>
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Department</th>
                                      </>
                                    }
                                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Month</th>
                                      <th className="p-4 text-right text-sm font-medium text-muted-foreground">Basic Pay</th>
                                      <th className="p-4 text-right text-sm font-medium text-muted-foreground">Total Earnings</th>
                                      <th className="p-4 text-right text-sm font-medium text-muted-foreground">Deductions</th>
                                      <th className="p-4 text-right text-sm font-medium text-muted-foreground">Net Pay</th>
                                      <th className="p-4 text-center text-sm font-medium text-muted-foreground">Status</th>
                                      <th className="p-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredPayslips.map((slip) => (
                                    <tr
                                        key={slip._id || slip.id}
                                        className="border-b border-border hover:bg-muted/30 transition-colors"
                                    >
                                        {/* Employee Info */}
                                        { !isEmployee &&
                                          <>
                                            <td className="p-4 text-left whitespace-nowrap">{slip.employeeId}</td>
                                            <td className="p-4 text-left whitespace-nowrap">{slip.name}</td>
                                            <td className="p-4 text-left whitespace-nowrap">{slip.department}</td>
                                          </>
                                        }
                                        <td className="p-4 text-left whitespace-nowrap">{slip.month}</td>

                                        {/* Salary Details */}
                                        <td className="p-4 text-right font-medium">
                                        ₹{slip.salary?.toLocaleString() || 0}
                                        </td>
                                        <td className="p-4 text-right font-medium">
                                        ₹{slip.totalEarnings?.toLocaleString() || 0}
                                        </td>
                                        <td className="p-4 text-right text-destructive">
                                        -₹{slip.totalDeductions?.toLocaleString() || 0}
                                        </td>
                                        <td className="p-4 text-right font-bold text-success">
                                        ₹{slip.netSalary?.toLocaleString() || 0}
                                        </td>

                                        {/* Status */}
                                        <td className="p-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                                            Paid
                                        </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 text-right">
                                          <div className="inline-flex items-center gap-2">
                                              <Button
                                                  variant="ghost"
                                                  size="icon-sm"
                                                  onClick={() => setPreviewPayslip(slip)}
                                                  >
                                                  <Eye className="w-4 h-4" />
                                              </Button>

                                              <Button
                                              variant="ghost"
                                              size="icon-sm"
                                              onClick={() => handleDownloadPayslip(slip._id)}
                                              disabled={downloading === (slip._id)}
                                              >
                                              {downloading === (slip._id || slip.id) ? (
                                                  <span className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                              ) : (
                                                  <Download className="w-4 h-4" />
                                              )}
                                              </Button>

                                              { (user.role === 'admin' || user.role === 'superAdmin') &&
                                                <Button
                                                  variant="ghost"
                                                  size="icon-sm"
                                                  onClick={() => openDeleteModal(slip._id)}
                                                  className="text-red-500 hover:bg-red-600/50"
                                              >
                                                  <Trash2 className="w-4 h-4" />
                                              </Button>}
                                          </div>
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>

                        ) : (
                            <div className="p-4 text-center text-gray-400">No payslips found.</div>
                        )}
                        </div>
                    </CardContent>
                </Card>
                {/* Dialog for template preview */}
                <Dialog open={!!previewPayslip} onOpenChange={() => setPreviewPayslip(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                        <DialogHeader>
                        <DialogTitle>Payslip Preview</DialogTitle>
                        </DialogHeader>

                        <Dialog open={!!previewPayslip} onOpenChange={() => setPreviewPayslip(null)}>
                        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
                          <DialogHeader>
                            <DialogTitle>Payslip Preview</DialogTitle>
                          </DialogHeader>

                          {previewPayslip && (
                            <div className="bg-white p-4">
                              {/* SAME TEMPLATE USED FOR PDF */}
                              {renderPayslipTemplate(
                                previewPayslip.template || "default",
                                previewPayslip
                              )}
                            </div>
                          )}

                          <div className="flex justify-end gap-2 mt-4">
                            <Button
                              variant="outline"
                              onClick={() => setPreviewPayslip(null)}
                            >
                              Close
                            </Button>

                            <Button
                              onClick={() => handleDownloadPayslip(previewPayslip._id)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </DialogContent>
                </Dialog>
                      
                  {/* Delete Modal */}
                 {isDeleteModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Delete Payslip
                      </h2>
          
                      <p className="text-gray-600 mb-6">
                        Are you sure you want to delete this payslip? This action cannot
                        be undone.
                      </p>
          
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setIsDeleteModalOpen(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                          disabled={isDeleting}
                        >
                          Cancel
                        </button>
          
                        <button
                          onClick={handleDeletePayslip}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hidden Payslip Template for PDF */}
                {downloadPayslip && (
                  <div className="fixed -left-[9999px] top-0">
                    <div
                      ref={downloadRef}
                      className="w-[794px] bg-white text-gray-900"
                    >
                      {renderPayslipTemplate(
                        downloadPayslip.template || "default",
                        downloadPayslip
                      )}
                    </div>
                  </div>
                )}
            </div>
        </div>

    );
};

export default PayslipTracker;
