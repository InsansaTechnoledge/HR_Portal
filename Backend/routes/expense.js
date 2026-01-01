import express from "express";
import {
	createExpense,
	getExpenses,
	payExpenseSeparately,
	updateExpenseStatus,
} from "../controller/expenseController.js";
import checkCookies from "../middleware/checkCookies.js";
import { uploadExpenseReceipts } from "../middleware/uploadExpense.js";

const router = express.Router();

router.post("/add-expense", checkCookies, uploadExpenseReceipts, createExpense);
router.get("/", getExpenses);
router.patch("/:id/pay-separate", checkCookies, payExpenseSeparately);
router.patch("/:id/status", checkCookies, updateExpenseStatus);

export default router;
