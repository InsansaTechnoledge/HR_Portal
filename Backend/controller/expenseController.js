import Expenses from "../models/Expenses.js";
import Employee from "../models/Employee.js";

export const createExpense = async (req, res) => {
  try {
    const { reimbursementMonth, description } = req.body;
    const rawExpenses = req.body.expenses;

    let expenses = [];

    if (typeof rawExpenses === "string") {
      try {
        const parsed = JSON.parse(rawExpenses);
        if (Array.isArray(parsed)) {
          expenses = parsed
            .filter((e) => e && e.type && e.amount)
            .map((e) => ({
              type: String(e.type).trim(),
              amount: Number(e.amount),
              expenseDate: e.expenseDate ? new Date(e.expenseDate) : null,
              location: e.location || "National",
              currency: e.currency || "INR",
              exchangeRate: Number(e.exchangeRate || 1),
              convertedAmount: Number(e.convertedAmount !== undefined ? e.convertedAmount : e.amount),
            }))
            .filter((e) => e.type && e.amount > 0);

          const invalidExpense = expenses.find(
            (e) => !e.expenseDate || isNaN(new Date(e.expenseDate))
          );

          if (invalidExpense) {
            return res.status(400).json({
              message: `Each expense must have a valid expense date. Invalid item: ${JSON.stringify(invalidExpense)}`,
            });
          }
        }
      } catch (e) {
        return res.status(400).json({ message: "Invalid expenses format: " + e.message });
      }
    } else if (Array.isArray(rawExpenses)) {
      expenses = rawExpenses
        .filter((e) => e && e.type && e.amount)
        .map((e) => ({
          type: String(e.type).trim(),
          amount: Number(e.amount),
          expenseDate: e.expenseDate ? new Date(e.expenseDate) : null,
          location: e.location || "National",
          currency: e.currency || "INR",
          exchangeRate: Number(e.exchangeRate || 1),
          convertedAmount: Number(e.convertedAmount !== undefined ? e.convertedAmount : e.amount),
        }))
        .filter((e) => e.type && e.amount > 0);

      const invalidExpense = expenses.find(
        (e) => !e.expenseDate || isNaN(new Date(e.expenseDate))
      );

      if (invalidExpense) {
        return res.status(400).json({
          message: "Each expense must have a valid expense date",
        });
      }
    }

    const uploadedReceipts = req.uploadedReceipts || [];

    if (!uploadedReceipts.length) {
      return res
        .status(400)
        .json({ message: "At least one receipt file is required. Upload failed or no receipts provided." });
    }

    if (!expenses.length || !reimbursementMonth) {
      return res.status(400).json({ message: `Required fields are missing. Expenses count: ${expenses.length}, Month: ${reimbursementMonth}` });
    }

    const employee = await Employee.findOne({
      email: req.user.userEmail,
    }).select("_id");

    if (!employee) {
      return res.status(400).json({
        message:
          `No employee record linked to user ${req.user.userEmail}. Please ensure employee is created with matching email.`,
      });
    }

    // Calculate total amount strictly from convertedAmounts
    const totalAmount = expenses.reduce((sum, e) => sum + (Number(e.convertedAmount) || 0), 0);

    const expenseDate = expenses.length > 0 ? expenses[0].expenseDate : new Date();

    const newExpense = new Expenses({
      employeeId: employee._id,
      expenses,
      amount: totalAmount,
      expenseDate,
      reimbursementMonth,
      description,
      receipts: uploadedReceipts,
    });

    await newExpense.save();
    res
      .status(201)
      .json({ message: "Expense created successfully", expense: newExpense });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      reimbursementMonth,
      employeeId,
      employeeEmail,
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (reimbursementMonth) filter.reimbursementMonth = reimbursementMonth;
    if (employeeId) filter.employeeId = employeeId;

    if (!employeeId && employeeEmail) {
      const employee = await Employee.findOne({ email: employeeEmail }).select(
        "_id"
      );

      if (!employee) {
        return res.status(200).json({
          message: "No employee found for provided email",
          meta: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            totalPages: 0,
          },
          expenses: [],
        });
      }

      filter.employeeId = employee._id;
    }

    const expenses = await Expenses.find(filter)
      .select(
        "employeeId expenses amount expenseDate receipts reimbursementMonth status paymentMode createdAt approvedBy approvedAt"
      )
      .populate({ path: "employeeId", select: "name email department" })
      .populate("approvedBy", "userName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Expenses.countDocuments(filter);

    res.status(200).json({
      message: "Expenses fetched successfully",
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
      expenses,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

export const updateExpenseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Expense ID is required" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const allowedRoles = ["superadmin"];
    const userRole = String(req.user?.role || "").toLowerCase();

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Only superAdmin  can update expense status",
      });
    }

    const normalizedStatus = String(status).toUpperCase();
    const allowedStatuses = ["APPROVED", "REJECTED"];

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        message: "Invalid status. Only APPROVED or REJECTED are allowed.",
      });
    }

    const expense = await Expenses.findById(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.status !== "PENDING") {
      return res.status(400).json({
        message: "Only PENDING expenses can be updated to APPROVED or REJECTED",
      });
    }

    expense.status = normalizedStatus;

    if (normalizedStatus === "APPROVED") {
      expense.approvedBy = req.user._id;
      expense.approvedAt = new Date();
      expense.rejectionReason = undefined;
    } else if (normalizedStatus === "REJECTED") {
      expense.rejectionReason = rejectionReason || "Rejected by approver";
      expense.approvedBy = undefined;
      expense.approvedAt = undefined;
    }

    await expense.save();

    return res.status(200).json({
      message: "Expense status updated successfully",
      expense,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

export const payExpenseSeparately = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Paying expense separately for ID:", id);
    if (!id) {
      return res.status(400).json({ message: "Expense ID is required" });
    }

    const expense = await Expenses.findById(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    if (expense.status !== "APPROVED" || expense.paidInPayslipId) {
      return res.status(400).json({
        message: "Expense is not eligible for separate payment",
      });
    }

    expense.status = "PAID";
    expense.paymentMode = "SEPARATE";
    expense.paidInPayslipId = null;
    expense.paidAt = new Date();

    await expense.save();

    res.status(200).json({ message: "Expense paid separately", expense });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { expenses, amount } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Expense ID is required" });
    }

    const expense = await Expenses.findById(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expenses) expense.expenses = expenses;
    if (amount !== undefined) expense.amount = amount;

    await expense.save();

    res.status(200).json({ message: "Expense updated successfully", expense });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
