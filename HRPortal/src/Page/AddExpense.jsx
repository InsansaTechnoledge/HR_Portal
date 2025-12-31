import { useState } from "react";
import axios from "axios";
import {
  ReceiptIndianRupee,
  CreditCard,
  CalendarDays,
  FileText,
} from "lucide-react";
import SuccessToast from "../Components/Toaster/SuccessToaser";
import ErrorToast from "../Components/Toaster/ErrorToaster";
import API_BASE_URL from "../config";

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
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setReceipts((prev) => [...prev, ...files]);
  };

  const removeReceipt = (index) => {
    setReceipts((prev) => prev.filter((_, i) => i !== index));
  };

  const clearReceipts = () => {
    setReceipts([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // reset previous messages
    setSuccessMessage("");
    setErrorMessage("");

    if (receipts.length === 0) {
      alert("At least one receipt is required");
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
        setSuccessMessage("Expense submitted successfully");
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
      setErrorMessage(
        err.response?.data?.message || "Failed to submit expense"
      );
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white shadow-md rounded-xl p-8">
        {successMessage && <SuccessToast message={successMessage} />}
        {errorMessage && <ErrorToast error={errorMessage} />}

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
            <ReceiptIndianRupee className="mr-3 text-blue-600" />
            Add Expense
          </h2>
          <p className="text-gray-600 mt-2">
            Submit your expense claim with receipt for reimbursement.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Expense Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expense Type
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="text-gray-400" size={20} />
              </div>
              <select
                name="expenseType"
                value={form.expenseType}
                onChange={handleChange}
                required
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
              >
                <option value="">Select Expense Type</option>
                <option value="Travel">Travel</option>
                <option value="Food">Food</option>
                <option value="Internet">Internet</option>
                <option value="Medical">Medical</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Expense Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expense Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarDays className="text-gray-400" size={20} />
              </div>
              <input
                type="date"
                name="expenseDate"
                value={form.expenseDate}
                onChange={handleChange}
                required
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="text-gray-400" size={20} />
              </div>
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={form.amount}
                onChange={handleChange}
                required
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
              />
            </div>
          </div>

          {/* Reimbursement Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reimbursement Month
            </label>
            <input
              type="month"
              name="reimbursementMonth"
              value={form.reimbursementMonth}
              onChange={handleChange}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Mode
            </label>
            <select
              name="paymentMode"
              value={form.paymentMode}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
            >
              <option value="SALARY">With Salary</option>
              <option value="SEPARATE">Separate Payment</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              name="description"
              placeholder="Add any additional details about this expense"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
            />
          </div>

          {/* Receipt */}
          {/* Receipt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt (image or PDF)
            </label>

            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            {receipts.length > 0 && (
              <>
                <ul className="mt-3 text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3 bg-gray-50">
                  {receipts.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex flex-col truncate">
                        <span className="font-medium truncate max-w-xs">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeReceipt(index)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={clearReceipts}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear all receipts
                </button>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                !loading
                  ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              {loading ? "Submitting..." : "Submit Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
