import { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import { userContext } from "../Context/userContext";
import SuccessToast from "../Components/Toaster/SuccessToaser";
import ErrorToast from "../Components/Toaster/ErrorToaster";
import { toast } from "../hooks/useToast";
import ExpensePreview from "../templates/ExpensePreview";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  Wallet,
  User,
  Calendar,
  IndianRupee,
  FileText,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Building2,
  Mail,
  ExternalLink,
  Loader2,
  Receipt,
  Download,
  ArrowDownUp,
} from "lucide-react";

import { Checkbox } from "../Components/ui/checkbox";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
} from "../Components/ui/card";
import { Label } from "../Components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Components/ui/select";
import { Input } from "../Components/ui/input";
import { Badge } from "../Components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from "../Components/ui/table";
import { Button } from "../Components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../Components/ui/dialog";
import { currencySymbols } from "../Constant/currencies";

const ExpenseGenerator = () => {
  const { user } = useContext(userContext);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [expenses, setExpenses] = useState([]);

  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [payingId, setPayingId] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [generatingSlip, setGeneratingSlip] = useState(false);
  const [slipGenerated, setSlipGenerated] = useState(false);

  // View controls: LIST | REVIEW
  const [viewMode, setViewMode] = useState("LIST");

  // Exchange rate dialog state
  const [exchangeDialogOpen, setExchangeDialogOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({});
  const [exchangeCurrencies, setExchangeCurrencies] = useState([]);
  const [pendingExpenseForPayment, setPendingExpenseForPayment] = useState(null);
  // Conversion tracking: map expenseId -> { rates: {currency: rate}, converted: true }
  const [conversionData, setConversionData] = useState({});
  // Track which international sub-item is being converted
  const [pendingIntlItem, setPendingIntlItem] = useState(null);
  // Mode for dialog: 'PAY' or 'CONVERT'
  const [dialogMode, setDialogMode] = useState('PAY');

  const slipRef = useRef(null);

  // Fetch employees once
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const response = await axios.get(`${API_BASE_URL}/api/employee/`, {
          params: {
            fields:
              "name,empId,email,department,details.designation,details.salary,details.bankName,details.accountNumber,details.ifscCode,details.nameAsPerBank",
            limit: 200,
          },
          signal,
        });

        if (response.status === 200 || response.status === 201) {
          setEmployees(response.data.employees || []);
        }
      } catch (err) {
        if (axios.isCancel?.(err)) return;
        console.error("Error fetching employees for expense generator:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error Fetching Employees",
        });
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
    return () => controller.abort();
  }, []);

  // Fetch approved expenses when employee or month changes
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!selectedEmployeeId) {
        setExpenses([]);
        return;
      }

      const employee = employees.find((e) => e._id === selectedEmployeeId);
      setSelectedEmployee(employee || null);

      try {
        setLoadingExpenses(true);
        setErrorMessage("");

        const params = {
          status: "APPROVED",
          employeeId: selectedEmployeeId,
          limit: 200,
        };

        if (selectedMonth) {
          params.reimbursementMonth = selectedMonth;
        }

        const response = await axios.get(`${API_BASE_URL}/api/expense`, {
          params,
          withCredentials: true,
        });

        if (response.status === 200 || response.status === 201) {
          setExpenses(response.data.expenses || []);
        }
      } catch (err) {
        console.error("Error fetching approved expenses:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error Fetching Expenses",
        });
      } finally {
        setLoadingExpenses(false);
      }
    };

    fetchExpenses();
  }, [selectedEmployeeId, selectedMonth, employees]);

  const handleEmployeeChange = (value) => {
    if (value === "none") {
      setSelectedEmployeeId("");
      setSelectedEmployee(null);
      setExpenses([]);
      return;
    }

    setSelectedEmployeeId(value || "");
    setSelectedMonth("");
    setExpenses([]);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value || "");
  };

  const handlePaySeparately = async (expense) => {
    if (!expense) return;
    await processPayment(expense);
  };

  const processPayment = async (expense) => {
    try {
      console.log("[DEBUG] Entering processPayment for expense:", expense._id || "bulk");
      if (needsConversion(expense)) {
        console.log("[DEBUG] processPayment blocked: conversion required", expense._id);
        toast({
          variant: "destructive",
          title: "Conversion Required",
          description: "International expenses must be converted before payment"
        });
        setGeneratingSlip(false);
        setPayingId("");
        return;
      }

      setPayingId(expense._id || "bulk");
      setGeneratingSlip(true);

      // Conversion is now persistent, so we just ensure the expense is selected for the PDF ref
      setSelectedExpense(expense);
      // Give React a moment to render
      await new Promise(r => setTimeout(r, 100));

      if (expense.status === "COMBINED") {

        // Bulk Payment
        const ids = expense.selectedIds || [];
        await Promise.all(
          ids.map((id) =>
            axios.patch(
              `${API_BASE_URL}/api/expense/${id}/pay-separate`,
              {},
              { withCredentials: true }
            )
          )
        );

        toast({
          variant: "success",
          title: "Bulk Payment Successful",
          description: "All selected expenses marked as paid",
        });

        // Trigger PDF download for combined
        await downloadCombinedPDF(expense);

        // Remove from list
        setExpenses((prev) => prev.filter((e) => !ids.includes(e._id)));
        setSelectedExpenses(new Set());
      } else {
        // Individual Payment
        await axios.patch(
          `${API_BASE_URL}/api/expense/${expense._id}/pay-separate`,
          {},
          { withCredentials: true }
        );

        toast({
          variant: "success",
          title: "Payment Successful",
          description: "Expense marked as paid successfully",
        });

        // Trigger PDF download for individual
        await downloadSinglePDF(expense);

        // Remove from list
        setExpenses((prev) => prev.filter((e) => e._id !== expense._id));
      }

      // Close the dialog
      setOpenDialog(false);
      setSelectedExpense(null);
      setSlipGenerated(false);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to process payment",
      });
    } finally {
      setPayingId("");
      setGeneratingSlip(false);
      setPendingExpenseForPayment(null);
    }
  };

  const downloadSinglePDF = async (expense) => {
    // Wait for DOM
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!slipRef.current) return;

    const canvas = await html2canvas(slipRef.current, {
      scale: 2,
      backgroundColor: "#fff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "px", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Expense_Slip_${expense._id}.pdf`);
  };

  const downloadCombinedPDF = async (expense) => {
    // Wait for DOM
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!slipRef.current) return;

    const canvas = await html2canvas(slipRef.current, {
      scale: 2,
      backgroundColor: "#fff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "px", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Combined_Expense_Report.pdf`);
  };

  // Not used directly anymore, functionality merged into handlePaySeparately
  const downloadPayslipPDF = async () => { };

  const totalApprovedAmount = expenses.reduce(
    (sum, exp) => sum + (Number(exp.amount) || 0),
    0
  );

  // Helper to check if an expense contains ANY international items
  const isInternationalExpense = (expense) => {
    const items = expense.expenses || [];
    return items.some(e => e.location?.toLowerCase() === 'international');
  };

  // Helper to check if an international expense actually needs conversion values
  const needsConversion = (expense) => {
    const items = expense.expenses || [];
    const isIntl = items.some(e => e.location?.toLowerCase() === 'international');
    const missingConversion = items.some(e => e.location === 'International' && (!e.convertedAmount || Number(e.convertedAmount) <= 0 || e.amount === e.convertedAmount));

    // console.log(`[DEBUG] needsConversion check for ${expense._id}: isIntl=${isIntl}, missingConversion=${missingConversion}`);
    return missingConversion;
  };

  const handleSaveConversion = async (expense, rates) => {
    try {
      console.log("[DEBUG] handleSaveConversion started", { expenseId: expense._id, rates });
      setLoadingExpenses(true);
      const newItems = expense.expenses.map(item => {
        if (item.location?.toLowerCase() === 'international' && rates[item.currency]) {
          const rate = Number(rates[item.currency]);
          const converted = Number(item.amount) * rate;
          console.log(`[DEBUG] Converting item: ${item.type}, Rate: ${rate}, Converted: ${converted}`);
          return {
            ...item,
            conversionRate: rate,
            exchangeRate: rate, // Store both for compatibility
            convertedAmount: converted
          };
        }
        return item;
      });

      const newTotal = newItems.reduce((sum, item) => sum + (Number(item.convertedAmount) || 0), 0);
      console.log("[DEBUG] Calculated new total:", newTotal);

      const response = await axios.put(`${API_BASE_URL}/api/expense/${expense._id}`, {
        expenses: newItems,
        amount: newTotal
      }, { withCredentials: true });

      console.log("[DEBUG] Save conversion response:", response.status, response.data);

      if (response.status === 200) {
        console.log("[DEBUG] State updated successfully with new expense data", response.data.expense);
        setExpenses(prev => prev.map(exp => exp._id === expense._id ? response.data.expense : exp));
        toast({
          variant: "success",
          title: "Converted to INR",
          description: "Expense amounts persisted. You can now generate the payment slip."
        });
      }
    } catch (err) {
      console.error("Error saving conversion:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to persist conversion."
      });
    } finally {
      setLoadingExpenses(false);
    }
  };

  // Multi-select Logic
  const [selectedExpenses, setSelectedExpenses] = useState(new Set());

  const toggleExpenseSelection = (expenseId) => {
    setSelectedExpenses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(expenseId)) {
        newSet.delete(expenseId);
      } else {
        newSet.add(expenseId);
      }
      return newSet;
    });
  };

  const toggleAllSelection = () => {
    if (selectedExpenses.size === expenses.length) {
      setSelectedExpenses(new Set());
    } else {
      setSelectedExpenses(new Set(expenses.map((e) => e._id)));
    }
  };

  const handlePrepareBulkPayment = () => {
    if (selectedExpenses.size <= 1) return;

    const expensesToDownload = expenses.filter((e) =>
      selectedExpenses.has(e._id)
    );

    // Create synthetic expense object
    const combinedExpense = {
      employeeId: selectedEmployee || expensesToDownload[0].employeeId,
      amount: expensesToDownload.reduce((sum, e) => sum + Number(e.convertedAmount || e.amount), 0),
      expenseDate: `${new Date(
        Math.min(
          ...expensesToDownload.map((e) =>
            new Date(e.expenseDate || Date.now()).getTime()
          )
        )
      ).toLocaleDateString("en-IN")} - ${new Date(
        Math.max(
          ...expensesToDownload.map((e) =>
            new Date(e.expenseDate || Date.now()).getTime()
          )
        )
      ).toLocaleDateString("en-IN")}`,
      reimbursementMonth: [
        ...new Set(expensesToDownload.map((e) => e.reimbursementMonth)),
      ].join(", "),
      expenses: expensesToDownload.flatMap((parent) =>
        (parent.expenses || []).map((child) => ({
          ...child,
          parentDate: parent.expenseDate,
          parentMonth: parent.reimbursementMonth,
        }))
      ),
      status: "COMBINED",
      selectedIds: Array.from(selectedExpenses),
      approvedBy: expensesToDownload[0].approvedBy,
      approvedAt: expensesToDownload[0].approvedAt,
    };

    setSelectedExpense(combinedExpense);
    setOpenDialog(true);
  };

  const downloadBulkExpensePDF = async () => { }; // Merged into handlePaySeparately flow



  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {successMessage && <SuccessToast message={successMessage} />}
      {errorMessage && <ErrorToast error={errorMessage} />}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              Expense Generator
            </h1>
            <p className="text-muted-foreground">
              Select an employee to view their approved expenses and generate
              separate payments
            </p>
          </div>
        </div>

        {/* Selection & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Employee Selection */}
          <Card className="border-border/50 shadow-card">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Select Employee
                </Label>
                <div className="relative">
                  <Select
                    value={selectedEmployeeId || "none"}
                    onValueChange={handleEmployeeChange}
                    disabled={loadingEmployees}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border/50">
                      <SelectValue
                        placeholder={
                          loadingEmployees ? "Loading..." : "Select employee"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select employee</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp._id} value={emp._id}>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                              {emp.name.charAt(0)}
                            </div>
                            {emp.name} ({emp.empId})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ChevronDown className="absolute right-3 top-4 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Reimbursement Month
                </Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="bg-secondary/50 border-border/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="border-border/50 shadow-card bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4 flex flex-col justify-center h-full">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-primary/10 mx-auto">
                  <IndianRupee className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Total Approved Amount
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    ₹{totalApprovedAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-0"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {expenses.length} approved expense
                  {expenses.length !== 1 ? "s" : ""} found
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Employee Details Card */}
          <Card
            className={`border-border/50 shadow-card transition-all duration-300 ${selectedEmployee ? "opacity-100" : "opacity-50"
              }`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Employee Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {selectedEmployee ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {selectedEmployee.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {selectedEmployee.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedEmployee.details?.designation}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="h-3 w-3" />
                      <span>{selectedEmployee.empId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span>{selectedEmployee.department}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{selectedEmployee.email}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Select an employee to view details
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expenses Table */}
        <Card className="border-border/50 shadow-card overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-secondary/30">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Approved Expenses
              {selectedEmployee && (
                <Badge
                  variant="outline"
                  className="ml-2 bg-success/10 text-success border-success/20"
                >
                  Ready for payment
                </Badge>
              )}
              {selectedExpenses.size > 1 && (
                <Button
                  size="sm"
                  onClick={handlePrepareBulkPayment}
                  className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Combined Report ({selectedExpenses.size})
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          expenses.length > 0 &&
                          selectedExpenses.size === expenses.length
                        }
                        onCheckedChange={toggleAllSelection}
                      />
                    </TableHead>
                    <TableHead className="font-semibold">
                      Expense Type
                    </TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Month</TableHead>
                    <TableHead className="font-semibold">Receipts</TableHead>
                    <TableHead className="font-semibold text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingExpenses ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                          <span className="text-muted-foreground">
                            Loading approved expenses...
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : !selectedEmployeeId ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <User className="h-12 w-12 text-muted-foreground/50" />
                          <span className="text-muted-foreground">
                            Please select an employee to view expenses
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Receipt className="h-12 w-12 text-muted-foreground/50" />
                          <span className="text-muted-foreground">
                            No approved expenses found
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((exp) => (
                      <TableRow
                        key={exp._id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedExpenses.has(exp._id)}
                            onCheckedChange={() => toggleExpenseSelection(exp._id)}
                          />
                        </TableCell>
                        <TableCell>
                          {Array.isArray(exp.expenses) && exp.expenses.length > 0 ? (
                            <div className="space-y-1">
                              {exp.expenses.map((e, idx) => (
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <Receipt className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground text-xs">{e.type}:</span>
                                    <span className="font-medium text-xs">
                                      {currencySymbols[e.currency] || "₹"} {Number(e.amount).toLocaleString("en-IN")}
                                    </span>
                                    {e.location?.toLowerCase() === 'international' && (
                                      <Badge variant="outline" className={`ml-1 text-[10px] leading-none h-4 ${e.convertedAmount ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                                        {e.convertedAmount ? 'Converted' : 'Needs Conversion'}
                                      </Badge>
                                    )}
                                  </div>
                                  {e.location?.toLowerCase() === 'international' && e.convertedAmount && (
                                    <div className="text-[10px] text-muted-foreground pl-5 grid grid-cols-1 gap-0.5">
                                      <div className="flex justify-between max-w-[200px]">
                                        <span>Original:</span>
                                        <span>{currencySymbols[e.currency] || e.currency} {Number(e.amount).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between max-w-[200px]">
                                        <span>Rate:</span>
                                        <span>₹{e.conversionRate || e.exchangeRate}</span>
                                      </div>
                                      <div className="flex justify-between max-w-[200px] font-semibold text-success">
                                        <span>Converted:</span>
                                        <span>₹{Number(e.convertedAmount).toLocaleString("en-IN")}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground underline decoration-primary/30 decoration-offset-2">
                              ₹{Number(exp.amount || 0).toLocaleString("en-IN")}
                            </span>
                            {needsConversion(exp) && (
                              <span className="text-[10px] text-warning font-medium italic">Pending Conversion</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {exp.expenseDate
                            ? new Date(exp.expenseDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                            : "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {exp.reimbursementMonth || "-"}
                        </TableCell>
                        <TableCell>
                          {exp.receipts && exp.receipts.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {exp.receipts.map((r, idx) => (
                                <Button
                                  key={idx}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-primary hover:text-primary hover:bg-primary/10"
                                  asChild
                                >
                                  <a
                                    href={r.url || "#"}
                                    target={r.url ? "_blank" : "_self"}
                                    rel="noreferrer"
                                    title={!r.url ? "Receipt not found" : ""}
                                    onClick={(e) => !r.url && e.preventDefault()}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />#
                                    {idx + 1}
                                  </a>
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No receipts
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(() => {
                              const needsConv = needsConversion(exp);
                              return needsConv ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    console.log("[DEBUG] Opening Conversion Dialog for", exp._id);
                                    const intlItems = exp.expenses.filter(e => e.location?.toLowerCase() === 'international');
                                    const currencies = [...new Set(intlItems.map(i => i.currency))];
                                    setExchangeCurrencies(currencies);
                                    // Pre-fill existing rates if available
                                    const initialRates = currencies.reduce((acc, c) => {
                                      const itemWithCur = intlItems.find(i => i.currency === c);
                                      return { ...acc, [c]: itemWithCur?.conversionRate || itemWithCur?.exchangeRate || '' };
                                    }, {});
                                    console.log("[DEBUG] Initial Exchange Rates:", initialRates);
                                    setExchangeRates(initialRates);
                                    setPendingExpenseForPayment(exp);
                                    setExchangeDialogOpen(true);
                                  }}
                                // className="border-primary text-primary hover:bg-primary/5 h-8 font-medium"
                                >
                                  <ArrowDownUp className="h-4 w-4 mr-1" />
                                  Convert Amount
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    console.log("[DEBUG] Opening Payment Dialog for converted expense", exp._id);
                                    setSelectedExpense(exp);
                                    setOpenDialog(true);
                                  }}
                                  className="bg-primary hover:bg-primary/90 h-8 font-medium shadow-sm transition-all"
                                >
                                  <Wallet className="h-4 w-4 mr-1" />
                                  Generate Payment
                                </Button>
                              );
                            })()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {loadingExpenses ? (
                <div className="p-8 text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              ) : !selectedEmployeeId ? (
                <div className="p-8 text-center">
                  <User className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                  <span className="text-muted-foreground">
                    Select an employee
                  </span>
                </div>
              ) : expenses.length === 0 ? (
                <div className="p-8 text-center">
                  <Receipt className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                  <span className="text-muted-foreground">
                    No approved expenses
                  </span>
                </div>
              ) : (
                expenses.map((exp) => (
                  <div key={exp._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedExpenses.has(exp._id)}
                          onCheckedChange={() => toggleExpenseSelection(exp._id)}
                        />
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Receipt className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          {/* Main header shows total and icon */}
                          <div className="text-xs text-muted-foreground mt-1">
                            Total: ₹{Number(exp.amount).toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                    </div>
                    {Array.isArray(exp.expenses) && exp.expenses.map((e, idx) => (
                      <div key={idx} className="text-sm space-y-1 bg-muted/10 p-2 rounded border border-border/50">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{e.type}: </span>
                          <span className="font-bold">{currencySymbols[e.currency] || "₹"} {Number(e.amount).toLocaleString("en-IN")}</span>
                        </div>
                        {e.location?.toLowerCase() === 'international' && (e.convertedAmount || e.conversionRate) && (
                          <div className="pt-1 mt-1 border-t border-muted/30 text-[11px] space-y-0.5">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Original:</span>
                              <span>{currencySymbols[e.currency] || e.currency} {Number(e.amount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Rate:</span>
                              <span>₹{e.conversionRate || e.exchangeRate}</span>
                            </div>
                            <div className="flex justify-between font-bold text-success">
                              <span>Total:</span>
                              <span>₹{Number(e.convertedAmount).toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Date: </span>
                        <span>
                          {exp.expenseDate
                            ? new Date(exp.expenseDate).toLocaleDateString(
                              "en-IN"
                            )
                            : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Month: </span>
                        <span>{exp.reimbursementMonth || "-"}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      {exp.receipts && exp.receipts.length > 0 && (
                        <div className="flex gap-1">
                          {exp.receipts.map((r, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="h-8"
                              asChild
                            >
                              <a
                                href={r.url || "#"}
                                target={r.url ? "_blank" : "_self"}
                                rel="noreferrer"
                                title={!r.url ? "Receipt not found" : ""}
                                onClick={(e) => !r.url && e.preventDefault()}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Receipt {idx + 1}
                              </a>
                            </Button>
                          ))}
                        </div>
                      )}
                      {(() => {
                        const needsConv = needsConversion(exp);
                        // console.log(`[DEBUG] Mobile Card ${exp._id} render: needsConversion=${needsConv}`);
                        return needsConv ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              console.log("[DEBUG] Opening Conversion Dialog (Mobile) for", exp._id);
                              const intlItems = exp.expenses.filter(e => e.location?.toLowerCase() === 'international');
                              const currencies = [...new Set(intlItems.map(i => i.currency))];
                              setExchangeCurrencies(currencies);
                              // Pre-fill existing rates if available
                              const initialRates = currencies.reduce((acc, c) => {
                                const itemWithCur = intlItems.find(i => i.currency === c);
                                return { ...acc, [c]: itemWithCur?.conversionRate || itemWithCur?.exchangeRate || '' };
                              }, {});
                              console.log("[DEBUG] Initial Exchange Rates (Mobile):", initialRates);
                              setExchangeRates(initialRates);
                              setPendingExpenseForPayment(exp);
                              setExchangeDialogOpen(true);
                            }}
                            className="border-primary text-primary hover:bg-primary/5 h-9 font-medium ml-auto"
                          >
                            <ArrowDownUp className="h-4 w-4 mr-1" />
                            Convert Amount
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              console.log("[DEBUG] Opening Payment Dialog (Mobile) for converted expense", exp._id);
                              setSelectedExpense(exp);
                              setOpenDialog(true);
                            }}
                            className="bg-primary hover:bg-primary/90 h-9 font-medium shadow-sm transition-all ml-auto"
                          >
                            <Wallet className="h-4 w-4 mr-1" />
                            Generate Payment
                          </Button>
                        );
                      })()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl w-full max-h-[85vh] flex flex-col">
          {/* Header */}
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Confirm Expense Payment
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pr-1">
            {selectedExpense && selectedEmployee && (
              <div className="space-y-6">
                {/* Employee Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Employee Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Name:</strong> {selectedEmployee.name}
                    </div>
                    <div>
                      <strong>Employee ID:</strong> {selectedEmployee.empId}
                    </div>
                    <div>
                      <strong>Department:</strong> {selectedEmployee.department}
                    </div>
                    <div>
                      <strong>Email:</strong> {selectedEmployee.email}
                    </div>
                  </CardContent>
                </Card>

                {/* Payslip Preview */}
                <ExpensePreview
                  employee={selectedEmployee}
                  expense={selectedExpense}
                  generatedBy={user?.userName}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <Button
            onClick={() => handlePaySeparately(selectedExpense)}
            disabled={generatingSlip}
            className="bg-success hover:bg-success/90"
          >
            {generatingSlip ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Confirm & Generate Payment
              </>
            )}
          </Button>
        </DialogContent>
      </Dialog>

      {/* This is for download */}
      <div className="fixed -left-[9999px] top-0">
        {selectedExpense && selectedEmployee && (
          <div ref={slipRef} className="w-[794px] bg-white p-6">
            <ExpensePreview
              employee={selectedEmployee}
              expense={selectedExpense}
              generatedBy={user?.userName}
            />
          </div>
        )}
      </div>
      <Dialog open={exchangeDialogOpen} onOpenChange={setExchangeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              International Amount Conversion
            </DialogTitle>
            <DialogDescription>
              Please enter the current exchange rate for each currency to convert international expenses to INR.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {exchangeCurrencies.map((cur) => (
              <div key={cur} className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Exchange Rate for {cur}</Label>
                </div>
                <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center">
                  <div className="bg-background border rounded px-3 py-2 text-center font-medium text-sm">
                    1 {cur}
                  </div>
                  <span className="text-muted-foreground font-medium">=</span>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground font-medium text-xs">₹</span>
                    <Input
                      type="number"
                      className="pl-6 h-9"
                      placeholder="0.00"
                      value={exchangeRates[cur] || ''}
                      onChange={(e) => setExchangeRates(prev => ({ ...prev, [cur]: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" className="hover:text-primary" onClick={() => {
              setExchangeDialogOpen(false);
              setPendingExpenseForPayment(null);
            }}>Cancel</Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                // Validate rates
                const invalid = exchangeCurrencies.some(c => !exchangeRates[c] || Number(exchangeRates[c]) <= 0);
                if (invalid) {
                  toast({
                    variant: "destructive",
                    title: "Invalid Rate",
                    description: "Please enter valid positive exchange rate(s)"
                  });
                  return;
                }

                setExchangeDialogOpen(false);
                handleSaveConversion(pendingExpenseForPayment, exchangeRates);
              }}>
              Convert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseGenerator;
