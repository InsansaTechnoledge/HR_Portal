import { useEffect, useState, useContext } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import { userContext } from "../Context/userContext";

const ExpenseTracker = () => {
  const { user } = useContext(userContext);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    status: "",
    reimbursementMonth: "",
  });

  const [loading, setLoading] = useState(false);
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
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleStatusChange = async (expenseId, newStatus) => {
    // Only send update when moving away from PENDING to APPROVED/REJECTED
    if (newStatus === "PENDING") return;

    // Only superAdmin and accountant can approve/reject
    if (!user || !["superAdmin", "accountant"].includes(user.role)) {
      return;
    }

    try {
      setError("");
      await axios.patch(
        `${API_BASE_URL}/api/expense/${expenseId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      setExpenses((prev) =>
        prev.map((exp) =>
          exp._id === expenseId ? { ...exp, status: newStatus } : exp
        )
      );
    } catch (err) {
      console.error("Error updating expense status", err);
      setError(
        err.response?.data?.message ||
          "Unable to update expense status. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Expense Tracker</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor employee reimbursements and track their status.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-400">Total Requests</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">{expenses.length}</div>
          </div>
          <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-400">Total Amount</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              ₹
              {expenses
                .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)
                .toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg bg-white p-4 shadow-sm md:grid-cols-3">
        {/* Status */}
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="w-full rounded border border-gray-300 bg-white p-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="PAID">Paid</option>
          <option value="REJECTED">Rejected</option>
        </select>


        <input
          type="month"
          name="reimbursementMonth"
          value={filters.reimbursementMonth}
          onChange={handleFilterChange}
          className="w-full rounded border border-gray-300 bg-white p-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>


      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Employee
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Expense Type
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Amount
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Date
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Month
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Receipts
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-sm text-gray-500">
                  Loading expenses...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-sm text-gray-500">
                  No expenses found for the selected filters.
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 align-top">
                    <div className="text-sm font-medium text-gray-900">{exp.employeeId?.name}</div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      {exp.employeeId?.department}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-sm text-gray-700">
                    {exp.expenseType}
                  </td>
                  <td className="px-4 py-3 align-top text-sm font-medium text-gray-900">
                    ₹{Number(exp.amount || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 align-top text-sm text-gray-700">
                    {exp.expenseDate
                      ? new Date(exp.expenseDate).toLocaleDateString("en-IN")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 align-top text-sm text-gray-700">
                    {exp.reimbursementMonth || "-"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          exp.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : exp.status === "APPROVED"
                            ? "bg-blue-100 text-blue-700"
                            : exp.status === "PAID"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {exp.status}
                      </span>
                      {/* Only superAdmin/accountant can change status */}
                      {user && ["superAdmin", "accountant"].includes(user.role) && (
                        <select
                          value={exp.status}
                          disabled={exp.status !== "PENDING"}
                          onChange={(e) =>
                            handleStatusChange(exp._id, e.target.value)
                          }
                          className="ml-2 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-sm text-gray-700">
                    {exp.receipts && exp.receipts.length > 0 ? (
                      <div className="space-y-1">
                        {exp.receipts.map((r, idx) => (
                          <a
                            key={idx}
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            View Receipt {idx + 1}
                          </a>
                        ))}

                        {/* If expense is paid, allow download of receipt(s) */}
                        {exp.status === "PAID" && exp.receipts[0]?.url && (
                          <a
                            href={exp.receipts[0].url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mt-1 rounded bg-green-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-green-700"
                          >
                            Download Expense
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No receipts</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;
