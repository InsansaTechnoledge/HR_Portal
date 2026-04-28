import Expenses from "../models/Expenses.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

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
    }).select("_id name");

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

    // Notify Admins and Accountants
    try {
      const admins = await User.find({
        $or: [
          { role: { $in: ['superAdmin', 'accountant'] } },
          { _id: req.user._id, role: 'admin' }
        ]
      });
      const notificationPromises = admins.map(admin => {
        const notification = new Notification({
          recipient: admin._id,
          recipientType: 'User',
          sender: req.user._id,
          senderType: 'User',
          type: 'EXPENSE_SUBMITTED',
          message: `New expense submitted by ${employee.name} for ${reimbursementMonth}. Amount: ₹${totalAmount.toLocaleString('en-IN')}`,
          relatedId: newExpense._id
        });
        return notification.save();
      });
      await Promise.all(notificationPromises);
    } catch (notifErr) {
      console.error("Failed to create notifications:", notifErr);
    }

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
        "employeeId expenses amount expenseDate receipts reimbursementMonth status paymentMode createdAt approvedBy approvedAt description"
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

    const expense = await Expenses.findById(id).populate('employeeId', 'name email');

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

    // Notify Employee
    try {
      const targetUser = await User.findOne({ userEmail: expense.employeeId.email });
      if (targetUser) {
        const notification = new Notification({
          recipient: targetUser._id,
          recipientType: 'User',
          sender: req.user._id,
          senderType: 'User',
          type: 'EXPENSE_STATUS_UPDATE',
          message: `Your expense claim for ${expense.reimbursementMonth} has been ${normalizedStatus.toLowerCase()}.`,
          relatedId: expense._id
        });
        await notification.save();
      }

      // If approved, also notify all accountants
      if (normalizedStatus === "APPROVED") {
        const accountants = await User.find({ role: 'accountant' });
        const accountantNotifications = accountants.map(acc => {
          return new Notification({
            recipient: acc._id,
            recipientType: 'User',
            sender: req.user._id,
            senderType: 'User',
            type: 'EXPENSE_STATUS_UPDATE',
            message: `Expense claim for ${expense.employeeId.name} (${expense.reimbursementMonth}) has been approved and is ready for processing.`,
            relatedId: expense._id
          }).save();
        });
        await Promise.all(accountantNotifications);
      }
    } catch (notifErr) {
      console.error("Failed to create notification:", notifErr);
    }

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

    const updatedExpense = await Expenses.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "PAID",
          paymentMode: "SEPARATE",
          paidInPayslipId: null,
          paidAt: new Date(),
        },
      },
      { new: true }
    ).populate('employeeId', 'name email');

    // Notify Employee that it got paid
    try {
      const targetUser = await User.findOne({ userEmail: updatedExpense.employeeId.email });
      if (targetUser) {
        const notification = new Notification({
          recipient: targetUser._id,
          recipientType: 'User',
          sender: req.user._id,
          senderType: 'User',
          type: 'EXPENSE_STATUS_UPDATE',
          message: `Your expense claim for ${updatedExpense.reimbursementMonth} has been PAID.`,
          relatedId: updatedExpense._id
        });
        await notification.save();
      }
    } catch (notifErr) {
      console.error("Failed to create payment notification:", notifErr);
    }

    res.status(200).json({ message: "Expense paid separately", expense: updatedExpense });
  } catch (error) {
    console.error("Error in payExpenseSeparately:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { expenses, amount, reimbursementMonth, description } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Expense ID is required" });
    }

    const expense = await Expenses.findById(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Check ownership/permissions
    const userRole = String(req.user?.role || "").toLowerCase();
    const isAdmin = userRole === "superadmin" || userRole === "accountant";

    const employee = await Employee.findOne({ email: req.user.userEmail }).select("_id");
    const isOwner = employee && expense.employeeId.toString() === employee._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "You are not authorized to update this expense" });
    }

    // Regular users can only update PENDING expenses
    if (!isAdmin && expense.status !== "PENDING") {
      return res.status(400).json({ message: "Only PENDING expenses can be updated" });
    }

    if (expenses) expense.expenses = expenses;
    if (amount !== undefined) expense.amount = amount;
    if (reimbursementMonth) expense.reimbursementMonth = reimbursementMonth;
    if (description !== undefined) expense.description = description;

    await expense.save();

    res.status(200).json({ message: "Expense updated successfully", expense });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Expense ID is required" });
    }

    const expense = await Expenses.findById(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Check ownership/permissions
    const userRole = String(req.user?.role || "").toLowerCase();
    const isAdmin = userRole === "superadmin" || userRole === "admin";

    const employee = await Employee.findOne({ email: req.user.userEmail }).select("_id");
    const isOwner = employee && expense.employeeId.toString() === employee._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "You are not authorized to delete this expense" });
    }

    // Regular users can only delete PENDING expenses
    if (!isAdmin && expense.status !== "PENDING") {
      return res.status(400).json({ message: "Only PENDING expenses can be deleted" });
    }

    await Expenses.findByIdAndDelete(id);

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
