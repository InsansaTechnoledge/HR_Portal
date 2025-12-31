import Expenses from "../models/Expenses.js";
import Employee from "../models/Employee.js";

export const createExpense = async (req, res) => {
  try {
    const {
      expenseType,
      amount,
      expenseDate,
      reimbursementMonth,
      paymentMode,
      description,
    } = req.body;

    const uploadedReceipts = req.uploadedReceipts || [];

    if (!uploadedReceipts.length) {
      return res
        .status(400)
        .json({ message: "At least one receipt file is required" });
    }

    if (!expenseType || !amount || !expenseDate || !reimbursementMonth) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const employee = await Employee.findOne({
      email: req.user.userEmail,
    }).select("_id");

    if (!employee) {
      return res.status(400).json({
        message:
          "No employee record linked to this user. Please ensure employee is created with matching email.",
      });
    }

    const newExpense = new Expenses({
      employeeId: employee._id,
      expenseType,
      amount,
      expenseDate,
      reimbursementMonth,
      paymentMode,
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
        "employeeId expenseType amount expenseDate receipts reimbursementMonth status paymentMode createdAt approvedBy"
      )
      .populate({ path: "employeeId", select: "name email department" })
      .populate("approvedBy", "name")
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

    const allowedRoles = ["superadmin", "accountant"];
    const userRole = String(req.user?.role || "").toLowerCase();

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Only superAdmin or accountant can update expense status",
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
