import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import SuccessToast from "../Components/Toaster/SuccessToaser";
import ErrorToast from "../Components/Toaster/ErrorToaster";

const ExpenseGenerator = () => {
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
							"name,empId,email,department,details.designation,details.salary",
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
				setErrorMessage("Unable to load employees. Please try again.");
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
				setErrorMessage(
					err.response?.data?.message ||
						"Unable to load approved expenses. Please try again."
				);
			} finally {
				setLoadingExpenses(false);
			}
		};

		fetchExpenses();
	}, [selectedEmployeeId, selectedMonth, employees]);

	const handleEmployeeChange = (e) => {
		setSelectedEmployeeId(e.target.value || "");
		setSelectedMonth("");
		setExpenses([]);
		setSuccessMessage("");
		setErrorMessage("");
	};

	const handleMonthChange = (e) => {
		setSelectedMonth(e.target.value || "");
	};

	const handlePaySeparately = async (expenseId) => {
		if (!expenseId) return;
		setSuccessMessage("");
		setErrorMessage("");

		try {
			setPayingId(expenseId);

			const response = await axios.patch(
				`${API_BASE_URL}/api/expense/${expenseId}/pay-separate`,
				{},
				{ withCredentials: true }
			);

			if (response.status === 200) {
				setExpenses((prev) => prev.filter((exp) => exp._id !== expenseId));
				setSuccessMessage("Expense marked as paid separately.");
			}
		} catch (err) {
			console.error("Error paying expense separately:", err);
			setErrorMessage(
				err.response?.data?.message ||
					"Unable to mark expense as paid. Please try again."
			);
		} finally {
			setPayingId("");
		}
	};

	const totalApprovedAmount = expenses.reduce(
		(sum, exp) => sum + (Number(exp.amount) || 0),
		0
	);

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			{successMessage && <SuccessToast message={successMessage} />}
			{errorMessage && <ErrorToast error={errorMessage} />}   

			<div className="max-w-6xl mx-auto">
				<div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
					<div>
						<h1 className="text-2xl font-semibold text-gray-900">
							Expense Generator
						</h1>
						<p className="mt-1 text-sm text-gray-500">
							Select an employee to view their approved expenses and generate
							separate payments.
						</p>
					</div>
				</div>

				<div className="mb-6 grid grid-cols-1 gap-4 rounded-lg bg-white p-4 shadow-sm md:grid-cols-3">
					<div className="flex flex-col gap-2">
						<label className="text-xs font-medium text-gray-600">
							Employee
						</label>
						<select
							value={selectedEmployeeId}
							onChange={handleEmployeeChange}
							disabled={loadingEmployees}
							className="w-full rounded border border-gray-300 bg-white p-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100"
						>
							<option value="">
								{loadingEmployees ? "Loading employees..." : "Select employee"}
							</option>
							{employees.map((emp) => (
								<option key={emp._id} value={emp._id}>
									{emp.name} ({emp.empId})
								</option>
							))}
						</select>
					</div>

					<div className="flex flex-col gap-2">
						<label className="text-xs font-medium text-gray-600">
							Reimbursement Month (optional)
						</label>
						<input
							type="month"
							value={selectedMonth}
							onChange={handleMonthChange}
							className="w-full rounded border border-gray-300 bg-white p-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
						/>
					</div>

					<div className="flex flex-col justify-center gap-1 rounded-lg bg-gray-50 p-3">
						<span className="text-xs uppercase tracking-wide text-gray-400">
							Total Approved Amount
						</span>
						<span className="text-lg font-semibold text-gray-900">
              
							{totalApprovedAmount.toLocaleString("en-IN")}
						</span>
						<span className="text-xs text-gray-500">
							{expenses.length} approved expense
							{expenses.length === 1 ? "" : "s"} found
						</span>
					</div>
				</div>

				{selectedEmployee && (
					<div className="mb-4 rounded-lg bg-white p-4 shadow-sm text-sm text-gray-700">
						<div className="flex flex-wrap gap-4">
							<div>
								<div className="text-xs text-gray-400">Name</div>
								<div className="font-medium">{selectedEmployee.name}</div>
							</div>
							<div>
								<div className="text-xs text-gray-400">Employee ID</div>
								<div className="font-medium">{selectedEmployee.empId}</div>
							</div>
							<div>
								<div className="text-xs text-gray-400">Department</div>
								<div className="font-medium">{selectedEmployee.department}</div>
							</div>
							<div>
								<div className="text-xs text-gray-400">Email</div>
								<div className="font-medium break-all">
									{selectedEmployee.email}
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="overflow-x-auto rounded-lg bg-white shadow-sm">
					<table className="w-full text-left text-sm">
						<thead className="bg-gray-100">
							<tr>
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
									Receipts
								</th>
								<th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
									Action
								</th>
							</tr>
						</thead>

						<tbody>
							{loadingExpenses ? (
								<tr>
									<td
										colSpan="6"
										className="px-4 py-6 text-center text-sm text-gray-500"
									>
										Loading approved expenses...
									</td>
								</tr>
							) : !selectedEmployeeId ? (
								<tr>
									<td
										colSpan="6"
										className="px-4 py-6 text-center text-sm text-gray-500"
									>
										Please select an employee to view expenses.
									</td>
								</tr>
							) : expenses.length === 0 ? (
								<tr>
									<td
										colSpan="6"
										className="px-4 py-6 text-center text-sm text-gray-500"
									>
										No approved expenses found for the selected filters.
									</td>
								</tr>
							) : (
								expenses.map((exp) => (
									<tr
										key={exp._id}
										className="border-t border-gray-100 hover:bg-gray-50"
									>
										<td className="px-4 py-3 align-top text-sm text-gray-700">
											{exp.expenseType}
										</td>
										<td className="px-4 py-3 align-top text-sm font-medium text-gray-900">
                      
											{Number(exp.amount || 0).toLocaleString("en-IN")}
										</td>
										<td className="px-4 py-3 align-top text-sm text-gray-700">
											{exp.expenseDate
												? new Date(exp.expenseDate).toLocaleDateString(
														"en-IN"
													)
												: "-"}
										</td>
										<td className="px-4 py-3 align-top text-sm text-gray-700">
											{exp.reimbursementMonth || "-"}
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
												</div>
											) : (
												<span className="text-xs text-gray-400">
													No receipts
												</span>
											)}
										</td>
										<td className="px-4 py-3 align-top text-sm text-gray-700">
											<button
												type="button"
												disabled={payingId === exp._id}
												onClick={() => handlePaySeparately(exp._id)}
												className={`rounded-md px-3 py-1 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${
													payingId === exp._id
														? "bg-indigo-300 cursor-not-allowed"
														: "bg-indigo-600 hover:bg-indigo-700"
												}`}
											>
												{payingId === exp._id
													? "Generating..."
													: "Generate Expense"}
											</button>
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

export default ExpenseGenerator;

