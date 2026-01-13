import { useState } from "react";
import axios from "axios";
import {
  ReceiptIndianRupee,
  CreditCard,
  CalendarDays,
  FileText,
  ReceiptText,
  FileImage,
  Upload,
  Send,
  ChevronDown,
  CarTaxiFront,
  Utensils,
  ArrowDownUp,
  Hospital,
  HardDrive,
  ScrollText,
  IndianRupee,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "../hooks/useToast";
import API_BASE_URL from "../config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { Label } from "../Components/ui/label";
import { Input } from "../Components/ui/input";
import { Textarea } from "../Components/ui/textarea";
import { Badge } from "../Components/ui/badge";
import { Button } from "../Components/ui/button";

const expenseTypes = [
  { value: "Travel", label: "Travel", icon: CarTaxiFront },
  { value: "Food", label: "Food & Meals", icon: Utensils },
  { value: "Internet", label: "Internet", icon: ArrowDownUp },
  { value: "Medical", label: "Medical", icon: Hospital },
  { value: "Office Supplies", label: "Office Supplies", icon: HardDrive },
  { value: "Other", label: "Other", icon: ScrollText },
];

const AddExpense = () => {
  const [form, setForm] = useState({
    expenses: [],
    expenseDate: "",
    reimbursementMonth: "",
    description: "",
  });

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [customExpenseType, setCustomExpenseType] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addExpense = (type) => {
    if (!type || !expenseAmount) return;

    setForm((prev) => ({
      ...prev,
      expenses: [
        ...(prev.expenses || []),
        {
          type,
          amount: Number(expenseAmount),
        },
      ],
    }));

    // reset inputs
    setCustomExpenseType("");
    setExpenseAmount("");
    
  };

  const canAddExpense = Boolean(expenseAmount) && Boolean(customExpenseType.trim());

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    console.log("FILES:", files);
    setReceipts((prev) => [...prev, ...files]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files || []);
    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") || file.type === "application/pdf"
    );

    setReceipts((prev) => [...prev, ...validFiles]);
  };

  const removeReceipt = (index) => {
    setReceipts((prev) => prev.filter((_, i) => i !== index));
  };

  const clearReceipts = () => {
    setReceipts([]);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // reset previous messages
    if (receipts.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "At Least Upload one Reciept",
      });
      return;
    }

    if (!form.expenses || form.expenses.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please add at least one expense",
      });
      return;
    }

    const totalAmount = Array.isArray(form.expenses)
      ? form.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
      : 0;

    const formData = new FormData();
    formData.append("expenses", JSON.stringify(form.expenses));
    formData.append("expenseDate", form.expenseDate);
    formData.append("reimbursementMonth", form.reimbursementMonth);
    formData.append("description", form.description || "");

    receipts.forEach((file) => {
      formData.append("receipts", file);
    });

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/expense/add-expense`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        toast({
          variant: "success",
          title: "Uploded Success",
          description: "Expense Added Successfully",
        });
      }
      setForm({
        expenses: [],
        expenseDate: "",
        reimbursementMonth: "",
        description: "",
      });
      setCustomExpenseType("");
      setExpenseAmount("");
      setReceipts([]);
    } catch (err) {
      toast({
        variant: "destuctive",
        title: "Upload Error",
        description: "Error Adding Expense",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = Array.isArray(form.expenses)
    ? form.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    : 0;

  const expenseTypeList = Array.isArray(form.expenses)
    ? form.expenses.map((e) => e.type)
    : [];
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg mb-4">
            <ReceiptText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Add Expense
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Submit your expense claim with receipts for reimbursement approval
          </p>
        </div>

        {/* Amount Preview Card */}
        {totalAmount > 0 && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IndianRupee className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Claim Amount
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                {form.expenses && form.expenses.length > 0 && (
                  <Badge variant="secondary" className="text-sm">
                    {(() => {
                      const firstExpense = form.expenses[0];
                      const Icon = expenseTypes.find(
                        (t) => t.value === firstExpense.type
                      )?.icon;
                      return Icon ? (
                        <Icon className="w-4 h-4 mr-1" />
                      ) : null;
                    })()}
                    {form.expenses.map(e => e.type).join(", ")}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Form Card */}
        <Card className="shadow-lg border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Expense Details</CardTitle>
            <CardDescription>
              Fill in the details of your expense claim
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Two Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Expense Type */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Expense Types
                  </Label>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add expense type"
                      value={customExpenseType}
                      onChange={(e) => setCustomExpenseType(e.target.value)}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={!canAddExpense}
                    onClick={() => {
                      const typeToAdd = customExpenseType.trim();
                      addExpense(typeToAdd);
                    }}
                  >
                    Add
                  </Button>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    Expense Amount (₹)
                  </Label>

                  <Input
                    type="number"
                    placeholder="Enter amount for selected expense"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                  />
                </div>

                {/* Expense Date */}
                <div className="space-y-2">
                  <Label
                    htmlFor="expenseDate"
                    className="flex items-center gap-2"
                  >
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    Expense Date
                  </Label>
                  <Input
                    id="expenseDate"
                    name="expenseDate"
                    type="date"
                    value={form.expenseDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Reimbursement Month */}
                <div className="space-y-2">
                  <Label
                    htmlFor="reimbursementMonth"
                    className="flex items-center gap-2"
                  >
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    Reimbursement Month
                  </Label>
                  <Input
                    id="reimbursementMonth"
                    name="reimbursementMonth"
                    type="month"
                    value={form.reimbursementMonth}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {form.expenses && form.expenses.length > 0 && (
                <div className="space-y-2">
                  {form.expenses.map((expense, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{expense.type}</Badge>
                        <span className="text-sm font-medium">
                          ₹{expense.amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            expenses: prev.expenses.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Add any additional details about this expense..."
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Receipt Upload */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-muted-foreground" />
                  Receipts
                  <Badge variant="outline" className="ml-1 font-normal">
                    Required
                  </Badge>
                </Label>

                {/* Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`
                    relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
                    ${
                      dragActive
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    }
                  `}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    id="recieptUpload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`p-3 rounded-full transition-colors ${
                        dragActive ? "bg-primary/20" : "bg-muted"
                      }`}
                    >
                      <Upload
                        className={`w-6 h-6 ${
                          dragActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {dragActive
                          ? "Drop files here"
                          : "Click or drag files to upload"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Images or PDF files (max 10MB each)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uploaded Files List */}
                {receipts.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {receipts.length} file{receipts.length !== 1 && "s"}{" "}
                        selected
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearReceipts}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Clear all
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {receipts.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-background">
                              {file.type.startsWith("image/") ? (
                                <FileImage className="w-4 h-4 text-primary" />
                              ) : (
                                <FileText className="w-4 h-4 text-orange-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeReceipt(index)}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Submit Expense
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/30 border-border/50">
          <CardContent className="py-4">
            <div className="flex gap-3">
              <div className="p-2 rounded-lg bg-primary/10 h-fit">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  Expense Guidelines
                </p>
                <ul className="mt-1 text-muted-foreground space-y-1">
                  <li>• Submit expenses within 30 days of the transaction</li>
                  <li>• Ensure receipts are clear and legible</li>
                  <li>
                    • Approved expenses are reimbursed in the next payroll cycle
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddExpense;
