import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import { userContext } from "../Context/userContext";
import { Receipt, FileText, TrendingUp, Clock, CheckCircle2, Search, Filter, Calendar, User, Building2, ExternalLink, Wallet, Download, ChevronDown, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Input } from "../Components/ui/input";
import { Button } from "../Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { Badge } from "../Components/ui/badge";
import { Table, TableBody, TableCell, TableHeader, TableFooter, TableRow, TableHead } from "../Components/ui/table";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ExpensePreview from '../templates/ExpensePreview'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../Components/ui/dialog";
// import { Checkbox } from "../Components/ui/checkbox";

import { currencySymbols } from "../Constant/currencies";

const ExpenseTracker = () => {
  const { user } = useContext(userContext);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const payslipRef = useRef(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  // Exchange rate dialog state for slip generation
  const [exchangeDialogOpen, setExchangeDialogOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({});
  const [exchangeCurrencies, setExchangeCurrencies] = useState([]);
  const [pendingExpenseForConversion, setPendingExpenseForConversion] = useState(null);

  const role = user?.role;

  const isEmployee = role === "user" || role === "employee";
  const isFinance = role === "accountant" || role === "superAdmin";
  const isAdmin = role === "superAdmin";


  const [filters, setFilters] = useState({
    status: "",
    reimbursementMonth: "",
  });
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { ...filters };

      // Employees should only see their own expenses
      if (user && (user.role === "user" || user.role === "employee")) {
        params.employeeEmail = user.userEmail;
      }

      const res = await axios.get(`${API_BASE_URL}/api/expense`, {
        params,
        withCredentials: true,
      });
      setExpenses(res.data.expenses || []);
    } catch (err) {
      console.error("Error fetching expenses");
      setError("Unable to load expenses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  // const handleFilterChange = (e) => {
  //   setFilters({ ...filters, [e.target.name]: e.target.value });
  // };
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (expenseId, newStatus) => {
    if (!isFinance || newStatus === "PENDING") return;
    if (!user || !["superAdmin"].includes(user.role)) return;

    setPendingStatusChange({ id: expenseId, status: newStatus });
    setConfirmOpen(true);
  };

  const confirmChange = async () => {
    if (!pendingStatusChange) return;
    const { id: expenseId, status: newStatus } = pendingStatusChange;

    try {
      setError("");
      await axios.patch(
        `${API_BASE_URL}/api/expense/${expenseId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      await fetchExpenses();
      setConfirmOpen(false);
      setPendingStatusChange(null);
    } catch (err) {
      console.error("Error updating expense status", err);
      setError(
        err.response?.data?.message ||
        "Unable to update expense status. Please try again."
      );
    }
  };

  //downlaod func for slip
  const generatePdfWithExpense = async (expenseToUse) => {
    setSelectedExpense(expenseToUse);

    // wait for preview to render
    setTimeout(async () => {
      if (!payslipRef.current) return;

      const canvas = await html2canvas(payslipRef.current, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Expense_${expenseToUse.employeeId.name}.pdf`);
    }, 300);
  };

  const downloadExpensePDF = async (expense) => {
    // Identify international currencies used in this expense
    const intlItems = Array.isArray(expense.expenses) ? expense.expenses.filter(e => e.location === 'International') : [];
    const currencies = [...new Set(intlItems.map(i => i.currency))];

    if (currencies.length === 0) {
      // no international items, generate directly
      await generatePdfWithExpense(expense);
      return;
    }

    // Ask user for exchange rates (one per currency)
    setExchangeCurrencies(currencies);
    setExchangeRates(currencies.reduce((acc, c) => ({ ...acc, [c]: '' }), {}));
    setPendingExpenseForConversion(expense);
    setExchangeDialogOpen(true);
  };






  const filteredExpenses = expenses.filter((exp) => {
    const matchesStatus = !filters.status || exp.status === filters.status;
    const matchesMonth =
      !filters.reimbursementMonth ||
      exp.reimbursementMonth === filters.reimbursementMonth;
    const expenseTypeText = Array.isArray(exp.expenses)
      ? exp.expenses.map(e => e.type).join(", ")
      : "";
    const matchesSearch =
      !searchTerm ||
      exp.employeeId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expenseTypeText.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesMonth && matchesSearch;
  });
  const statsExpenses = isEmployee
    ? filteredExpenses.filter(
      (exp) => exp.employeeId?.email === user?.userEmail
    )
    : filteredExpenses;

  const totalRequests = statsExpenses.length;

  const totalAmount = statsExpenses.reduce(
    (sum, exp) => sum + (Number(exp.amount) || 0),
    0
  );

  const pendingCount = statsExpenses.filter(
    (e) => e.status === "PENDING"
  ).length;

  const approvedAmount = statsExpenses
    .filter((e) => e.status === "APPROVED" || e.status === "PAID")
    .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);


  const getStatusConfig = (status) => {
    switch (status) {
      case "PENDING":
        return { icon: Clock, className: "bg-warning/10 text-warning", label: "Pending" };
      case "APPROVED":
        return { icon: CheckCircle2, className: "bg-info/10 text-info", label: "Approved" };
      case "PAID":
        return { icon: Wallet, className: "bg-success/10 text-success", label: "Paid" };
      case "REJECTED":
        return { icon: XCircle, className: "bg-destructive/10 text-destructive", label: "Rejected" };
      default:
        return { icon: Clock, className: "bg-muted", label: status };
    }
  };
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              Expense Tracker
            </h1>
            <p className="text-muted-foreground">
              Monitor employee reimbursements and track their status
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Requests",
              value: totalRequests,
              icon: FileText,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Total Amount",
              value: `₹${totalAmount.toLocaleString("en-IN")}`,
              icon: TrendingUp,
              color: "text-success",
              bg: "bg-success/10",
            },
            {
              label: "Pending",
              value: pendingCount,
              icon: Clock,
              color: "text-warning",
              bg: "bg-warning/10",
            },
            {
              label: "Approved/Paid",
              value: `₹${approvedAmount.toLocaleString("en-IN")}`,
              icon: CheckCircle2,
              color: "text-info",
              bg: "bg-info/10",
            },
          ].map((stat, i) => (
            <Card key={i} className="border-border/50 shadow-card card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-border/50 shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {isFinance && (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by employee or expense type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border/50"
                  />
                </div>
              )}
              <div className="relative">
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value === "all" ? "" : value)}
                >
                  <SelectTrigger className="w-full md:w-[180px] bg-secondary/50 border-border/50">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
              </div>

              <div className="relative">
                {/* <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" /> */}
                {/* <Input
                  type="month"
                  value={filters.reimbursementMonth}
                  onChange={(e) => handleFilterChange("reimbursementMonth", e.target.value)}
                  className="pl-10 w-full md:w-[180px] bg-secondary/50 border-border/50"
                /> */}
                <input
                  type="month"
                  value={filters.reimbursementMonth}
                  className="border rounded-lg px-4 py-1.5 bg-slate-50"
                  onChange={(e) => handleFilterChange("reimbursementMonth", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card className="border-border/50 shadow-card overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-secondary/30">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Expense Records
              <Badge variant="secondary" className="ml-2">
                {filteredExpenses.length} records
              </Badge>

            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">

                    {!isEmployee && <TableHead className="font-semibold">Employee</TableHead>}
                    <TableHead className="font-semibold">Expense Type</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Month</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Receipts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                          <span className="text-muted-foreground">Loading expenses...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Receipt className="h-12 w-12 text-muted-foreground/50" />
                          <span className="text-muted-foreground">No expenses found</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((exp) => {
                      const statusConfig = getStatusConfig(exp.status);
                      const StatusIcon = statusConfig.icon;
                      return (
                        <TableRow key={exp._id} className="group hover:bg-muted/30 transition-colors">

                          {!isEmployee && (
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">{exp.employeeId.name}</div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {exp.employeeId.department}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          )}

                          <TableCell className="font-medium">
                            {Array.isArray(exp.expenses) && exp.expenses.length > 0 ? (
                              <div className="space-y-2">
                                {exp.expenses.map((e, idx) => (
                                  <div key={idx} className="flex flex-col gap-1 bg-muted/20 p-2 rounded-md">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <Badge variant={e.location?.toLowerCase() === "international" ? "default" : "secondary"} className="text-[10px] h-5 px-1.5">
                                          {e.location?.toLowerCase() === "international" ? "Intl" : "Natl"}
                                        </Badge>
                                        <span className="text-muted-foreground text-sm">{e.type}</span>
                                      </div>
                                      <span className="font-semibold text-foreground text-sm">
                                        {currencySymbols[e.currency] || "₹"} {Number(e.amount).toLocaleString("en-IN")}
                                      </span>
                                    </div>
                                    {e.location?.toLowerCase() === 'international' && (e.convertedAmount || e.conversionRate) && (
                                      <div className="mt-1 pt-1 border-t border-muted/30 text-[10px] space-y-0.5">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Original:</span>
                                          <span>{currencySymbols[e.currency] || e.currency} {Number(e.amount).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Rate:</span>
                                          <span>₹{e.conversionRate || e.exchangeRate}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold text-success">
                                          <span>Total:</span>
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
                            <span className="font-semibold text-foreground">
                              ₹{Number(exp.amount || 0).toLocaleString("en-IN")}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {exp.expenseDate
                              ? new Date(exp.expenseDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                              })
                              : "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {exp.reimbursementMonth || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`${statusConfig.className} flex items-center gap-1`}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                              </Badge>
                              {isAdmin && exp.status === "PENDING" && (
                                <div className="relative">
                                  <Select
                                    value={exp.status}
                                    onValueChange={(value) => handleStatusChange(exp._id, value)}
                                  >
                                    <SelectTrigger className="h-7 w-24 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="PENDING">Pending</SelectItem>
                                      <SelectItem value="APPROVED">Approve</SelectItem>
                                      <SelectItem value="REJECTED">Reject</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <ChevronDown className="absolute right-2 top-2.5 h-3 w-3 opacity-50 pointer-events-none" />
                                </div>

                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {exp.receipts && exp.receipts.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {exp.receipts.map((r, idx) => (
                                  <Button
                                    key={idx}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-primary hover:text-primary hover:bg-primary/10 justify-start"
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
                                {exp.status === "PAID" && (isFinance || isEmployee) && (
                                  <Button
                                    size="sm"
                                    className="h-7 bg-success hover:bg-success/90 text-success-foreground"
                                    onClick={() => downloadExpensePDF(exp)}
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Download PDF
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">No receipts</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="p-8 text-center">
                  <Receipt className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                  <span className="text-muted-foreground">No expenses found</span>
                </div>
              ) : (
                filteredExpenses.map((exp) => {
                  const statusConfig = getStatusConfig(exp.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div key={exp._id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        {!isEmployee && (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{exp.employeeId.name}</div>
                              <div className="text-xs text-muted-foreground">{exp.employeeId.department}</div>
                            </div>
                          </div>
                        )}
                        <Badge
                          variant="outline"
                          className={`${statusConfig.className} flex items-center gap-1`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm bg-muted/10 p-3 rounded-lg border border-border/50">
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1">Total Amount</span>
                          <span className="font-bold text-base">₹{Number(exp.amount).toLocaleString("en-IN")}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1">Date</span>
                          <span className="font-medium">{exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString("en-IN") : "-"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-xs text-muted-foreground block mb-1">Reimbursement Month</span>
                          <span className="font-medium">{exp.reimbursementMonth || "-"}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Breakdown</span>
                        {Array.isArray(exp.expenses) && exp.expenses.length > 0 ? (
                          <div className="space-y-2">
                            {exp.expenses.map((e, idx) => (
                              <div key={idx} className="flex flex-col gap-1 bg-card border border-border/50 p-3 rounded-md shadow-sm">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={e.location === "International" ? "default" : "secondary"} className="text-[10px] h-5 px-1.5 shrink-0">
                                      {e.location === "International" ? "Intl" : "Natl"}
                                    </Badge>
                                    <span className="font-medium text-sm">{e.type}</span>
                                  </div>
                                  <span className="font-semibold text-sm whitespace-nowrap">
                                    {currencySymbols[e.currency] || "₹"} {Number(e.amount).toLocaleString("en-IN")}
                                  </span>
                                </div>
                                {e.location === 'International' && (e.convertedAmount || e.conversionRate) && (
                                  <div className="mt-2 pt-2 border-t border-border/50 text-[11px] space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Original:</span>
                                      <span>{currencySymbols[e.currency] || e.currency} {Number(e.amount).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Rate:</span>
                                      <span>₹{e.conversionRate || e.exchangeRate}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-success text-xs">
                                      <span>Converted Total:</span>
                                      <span>₹{Number(e.convertedAmount).toLocaleString("en-IN")}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground italic">No details available</div>
                        )}
                      </div>
                      {exp.receipts && exp.receipts.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {exp.receipts.map((r, idx) => (
                            <Button key={idx} variant="outline" size="sm" className="h-8" asChild>
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
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed -left-[9999px] top-0">
        {selectedExpense && (
          <div ref={payslipRef} className="w-[800px] bg-white p-6">
            <ExpensePreview
              expense={selectedExpense}
              employee={selectedExpense.employeeId}
              generatedBy={user?.userName}
            />
          </div>
        )}

        {/* Exchange Rate Dialog for Slip Generation */}
        <Dialog open={exchangeDialogOpen} onOpenChange={setExchangeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Exchange Rate(s)</DialogTitle>
              <DialogDescription>
                Please enter exchange rate(s) to convert international expenses to INR before generating the slip.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {exchangeCurrencies.map((cur) => (
                <div key={cur} className="grid grid-cols-2 gap-3 items-center">
                  <div className="font-medium">1 {cur} =</div>
                  <Input
                    type="number"
                    value={exchangeRates[cur] || ''}
                    onChange={(e) => setExchangeRates(prev => ({ ...prev, [cur]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={async () => {
                // Validate rates
                const invalid = exchangeCurrencies.some(c => !exchangeRates[c] || Number(exchangeRates[c]) <= 0);
                if (invalid) {
                  setError('Please enter valid positive exchange rate(s)');
                  return;
                }

                // Build converted expense copy
                const convertedExp = JSON.parse(JSON.stringify(pendingExpenseForConversion));
                let totalINR = 0;
                convertedExp.expenses = convertedExp.expenses.map(it => {
                  if (it.location === 'International') {
                    const rate = Number(exchangeRates[it.currency]);
                    it.exchangeRate = rate;
                    it.convertedAmount = Number(it.amount) * rate;
                    totalINR += Number(it.convertedAmount) || 0;
                  } else {
                    totalINR += Number(it.amount) || 0;
                  }
                  return it;
                });
                convertedExp.amount = totalINR;

                setExchangeDialogOpen(false);
                setPendingExpenseForConversion(null);
                // Generate PDF with converted values
                await generatePdfWithExpense(convertedExp);
              }}>Generate Slip</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the status of this expense to{" "}
              <span className="font-bold text-foreground">
                {pendingStatusChange?.status}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={confirmChange}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseTracker;
