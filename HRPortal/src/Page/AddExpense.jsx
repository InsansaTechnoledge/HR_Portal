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
  X
} from "lucide-react";
// import SuccessToast from "../Components/Toaster/SuccessToaser";
// import ErrorToast from "../Components/Toaster/ErrorToaster";
import {toast} from '../hooks/useToast'
import API_BASE_URL from "../config";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../Components/ui/card';
import {Label} from '../Components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../Components/ui/select';
import {Input} from '../Components/ui/input';
import {Textarea} from '../Components/ui/textarea';
import {Badge} from '../Components/ui/badge';
import {Button} from '../Components/ui/button';

const expenseTypes = [
  { value: "Travel", label: "Travel", icon: CarTaxiFront },
  { value: "Food", label: "Food & Meals", icon: Utensils },
  { value: "Internet", label: "Internet", icon: ArrowDownUp },
  { value: "Medical", label: "Medical", icon: Hospital },
  { value: "Office Supplies", label: "Office Supplies", icon: HardDrive },
  { value: "Other", label: "Other", icon: ScrollText},
];

const AddExpense = () => {
  const [form, setForm] = useState({
    expenseType: "",
    amount: "",
    expenseDate: "",
    reimbursementMonth: "",
    paymentMode: "SALARY",
    description: "",
  });

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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
      toast ({
        variant:"destructive",
        title:"Validation Error",
        description:"At Least Upload one Reciept"
      })
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });
    
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
        toast ({
          variant:"success",
          title:"Uploded Success",
          description:"Expense Added Successfully"
        })
      }
      setForm({
        expenseType: "",
        amount: "",
        expenseDate: "",
        reimbursementMonth: "",
        paymentMode: "SALARY",
        description: "",
      });
      setReceipts([]);
    } catch (err) {
       toast ({
          variant:"destuctive",
          title:"Upload Error",
          description:"Error Adding Expense"
        })
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = parseFloat(form.amount) || 0;
  return (
    // <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    //   <div className="max-w-lg w-full bg-white shadow-md rounded-xl p-8">
    //     {successMessage && <SuccessToast message={successMessage} />}
    //     {errorMessage && <ErrorToast error={errorMessage} />}

    //     <div className="text-center mb-8">
    //       <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
    //         <ReceiptIndianRupee className="mr-3 text-blue-600" />
    //         Add Expense
    //       </h2>
    //       <p className="text-gray-600 mt-2">
    //         Submit your expense claim with receipt for reimbursement.
    //       </p>
    //     </div>

    //     <form onSubmit={handleSubmit} className="space-y-6">
    //       {/* Expense Type */}
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           Expense Type
    //         </label>
    //         <div className="relative">
    //           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    //             <FileText className="text-gray-400" size={20} />
    //           </div>
    //           <select
    //             name="expenseType"
    //             value={form.expenseType}
    //             onChange={handleChange}
    //             required
    //             className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
    //           >
    //             <option value="">Select Expense Type</option>
    //             <option value="Travel">Travel</option>
    //             <option value="Food">Food</option>
    //             <option value="Internet">Internet</option>
    //             <option value="Medical">Medical</option>
    //             <option value="Office Supplies">Office Supplies</option>
    //             <option value="Other">Other</option>
    //           </select>
    //         </div>
    //       </div>

    //       {/* Expense Date */}
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           Expense Date
    //         </label>
    //         <div className="relative">
    //           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    //             <CalendarDays className="text-gray-400" size={20} />
    //           </div>
    //           <input
    //             type="date"
    //             name="expenseDate"
    //             value={form.expenseDate}
    //             onChange={handleChange}
    //             required
    //             className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
    //           />
    //         </div>
    //       </div>

    //       {/* Amount */}
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           Amount
    //         </label>
    //         <div className="relative">
    //           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    //             <CreditCard className="text-gray-400" size={20} />
    //           </div>
    //           <input
    //             type="number"
    //             name="amount"
    //             placeholder="Amount"
    //             value={form.amount}
    //             onChange={handleChange}
    //             required
    //             className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
    //           />
    //         </div>
    //       </div>

    //       {/* Reimbursement Month */}
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           Reimbursement Month
    //         </label>
    //         <input
    //           type="month"
    //           name="reimbursementMonth"
    //           value={form.reimbursementMonth}
    //           onChange={handleChange}
    //           required
    //           className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
    //         />
    //       </div>


    //       {/* Description */}
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           Description (optional)
    //         </label>
    //         <textarea
    //           name="description"
    //           placeholder="Add any additional details about this expense"
    //           value={form.description}
    //           onChange={handleChange}
    //           rows={3}
    //           className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
    //         />
    //       </div>

    //       {/* Receipt */}
    //       {/* Receipt */}
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           Receipt (image or PDF)
    //         </label>

    //         <input
    //           type="file"
    //           multiple
    //           accept="image/*,.pdf"
    //           onChange={handleFileChange}
    //           className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
    //         />

    //         {receipts.length > 0 && (
    //           <>
    //             <ul className="mt-3 text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3 bg-gray-50">
    //               {receipts.map((file, index) => (
    //                 <li
    //                   key={index}
    //                   className="flex items-center justify-between gap-2"
    //                 >
    //                   <div className="flex flex-col truncate">
    //                     <span className="font-medium truncate max-w-xs">
    //                       {file.name}
    //                     </span>
    //                     <span className="text-xs text-gray-400">
    //                       {(file.size / 1024).toFixed(1)} KB
    //                     </span>
    //                   </div>

    //                   <button
    //                     type="button"
    //                     onClick={() => removeReceipt(index)}
    //                     className="text-red-500 hover:text-red-700 text-xs font-medium"
    //                   >
    //                     Remove
    //                   </button>
    //                 </li>
    //               ))}
    //             </ul>

    //             <button
    //               type="button"
    //               onClick={clearReceipts}
    //               className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
    //             >
    //               Clear all receipts
    //             </button>
    //           </>
    //         )}
    //       </div>

    //       <div>
    //         <button
    //           type="submit"
    //           disabled={loading}
    //           className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
    //             !loading
    //               ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    //               : "bg-blue-300 cursor-not-allowed"
    //           }`}
    //         >
    //           {loading ? "Submitting..." : "Submit Expense"}
    //         </button>
    //       </div>
    //     </form>
    //   </div>
    // </div>
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
                    <p className="text-sm text-muted-foreground">Claim Amount</p>
                    <p className="text-2xl font-bold text-primary">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                {form.expenseType && (
                  <Badge variant="secondary" className="text-sm">
                    {(() => {
                      const Icon =
                        expenseTypes.find((t) => t.value === form.expenseType)?.icon;
                      return Icon ? <Icon className="w-4 h-4 mr-1" /> : null;
                    })()}
                    {form.expenseType}
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
                  <Label htmlFor="expenseType" className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Expense Type
                  </Label>
                  <div className="relative">
                    <Select
                      value={form.expenseType}
                      onValueChange={(value) => handleSelectChange("expenseType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              {(() => {
                                const Icon = type.icon;
                                return <Icon className="w-4 h-4" />;
                              })()}
                              <span>{type.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none"/>
                  </div>
                  
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    Amount (₹)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={handleChange}
                      required
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Expense Date */}
                <div className="space-y-2">
                  <Label htmlFor="expenseDate" className="flex items-center gap-2">
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
                  <Label htmlFor="reimbursementMonth" className="flex items-center gap-2">
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

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-muted-foreground">(optional)</span>
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
                    ${dragActive
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
                    <div className={`p-3 rounded-full transition-colors ${dragActive ? "bg-primary/20" : "bg-muted"}`}>
                      <Upload className={`w-6 h-6 ${dragActive ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {dragActive ? "Drop files here" : "Click or drag files to upload"}
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
                        {receipts.length} file{receipts.length !== 1 && "s"} selected
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
                <p className="font-medium text-foreground">Expense Guidelines</p>
                <ul className="mt-1 text-muted-foreground space-y-1">
                  <li>• Submit expenses within 30 days of the transaction</li>
                  <li>• Ensure receipts are clear and legible</li>
                  <li>• Approved expenses are reimbursed in the next payroll cycle</li>
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
