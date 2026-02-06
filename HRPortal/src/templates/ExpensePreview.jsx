import { Receipt } from "lucide-react";
import { currencySymbols } from "../Constant/currencies";
import {
  Card,
  CardContent,
  CardHeader,
} from "../Components/ui/card";
import signature from "../assets/signature.png";

const ExpensePreview = ({ employee, expense, generatedBy }) => {
  console.log("Employee Data: ", employee);
  console.log("Expense Data: ", expense);

  const formatReimbursementMonth = (monthStr) => {
    if (!monthStr || monthStr === "Unknown") return monthStr;
    // Handle YYYY-MM format from month input
    if (/^\d{4}-\d{2}$/.test(monthStr)) {
      const [year, month] = monthStr.split("-");
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleString("en-IN", { month: "long", year: "numeric" });
    }
    return monthStr;
  };

  return (
    <Card className="border border-dashed rounded-xl bg-white">
      {/* Header */}
      <CardHeader className="text-center border-b pb-4">
        <h2 className="text-lg font-bold tracking-wide">
          Insansa Technologies
        </h2>
        <p className="text-xs text-muted-foreground">Expense Payment Slip</p>
      </CardHeader>

      <CardContent className="text-sm space-y-4 pt-4">
        {/* Slip Meta */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Generated On</span>
          <span>{new Date().toLocaleDateString("en-IN")}</span>
        </div>

        <div className="border-t" />

        {/* Employee Info */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Employee Name</span>
            <span className="font-medium">{expense?.employeeId?.name}</span>
          </div>

          <div className="flex justify-between">
            <span>Expense Date</span>
            <span>
              {!isNaN(new Date(expense?.expenseDate).getTime())
                ? new Date(expense?.expenseDate).toLocaleDateString("en-IN")
                : expense?.expenseDate}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Reimbursement Month</span>
            <span>{formatReimbursementMonth(expense?.reimbursementMonth) || "-"}</span>
          </div>

          {/* Bank Details */}
          <div className="pt-2 border-t border-dashed mt-2 space-y-1">
            <p className="font-medium text-xs">Bank Details</p>
            <div className="grid grid-cols-2 text-[10px] gap-x-4">
              <span className="text-muted-foreground">Bank Name:</span>
              <span className="text-right truncate">{employee?.details?.bankName || "-"}</span>

              <span className="text-muted-foreground">Account No:</span>
              <span className="text-right">{employee?.details?.accountNumber || "-"}</span>

              <span className="text-muted-foreground">IFSC:</span>
              <span className="text-right">{employee?.details?.ifscCode || "-"}</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-3">
          <p className="font-medium mb-2">Expense Breakdown</p>
          <div className="space-y-4 text-sm">
            {Array.isArray(expense?.expenses) && expense.expenses.length > 0 ? (
              Object.entries(
                expense.expenses.reduce((groups, exp) => {
                  const month = exp.parentMonth || expense.reimbursementMonth || "Unknown";
                  if (!groups[month]) groups[month] = [];
                  groups[month].push(exp);
                  return groups;
                }, {})
              ).map(([month, items]) => (
                <div key={month} className="space-y-2">
                  <div className="text-xs font-semibold bg-muted px-2 py-1 rounded">
                    Month: {formatReimbursementMonth(month)}
                  </div>
                  {items.map((exp, idx) => (
                    <div key={idx} className="flex flex-col gap-1 pl-4 border-l-2 border-muted">
                      <div className="flex justify-between">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground flex items-center gap-1 font-medium">
                            {exp.type}
                            <span className="text-[10px] bg-muted px-1 rounded font-normal">
                              {exp.location === "International" ? "Intl" : "Natl"}
                            </span>
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Date: {exp.parentDate ? new Date(exp.parentDate).toLocaleDateString("en-IN") : "-"}
                          </span>
                        </div>
                        <span className="font-medium">
                          ₹{Number(exp.convertedAmount || exp.amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                      {exp.location === "International" && (
                        <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5 border-t border-dashed pt-1">
                          <div className="flex justify-between italic">
                            <span>Added by Employee:</span>
                            <span>{currencySymbols[exp.currency] || exp.currency} {Number(exp.amount).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between italic">
                            <span>Conversion Rate:</span>
                            <span>₹{exp.conversionRate || exp.exchangeRate}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-[#000]">
                            <span>Converted Amount:</span>
                            <span>₹{Number(exp.convertedAmount).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-center">
                No expense details
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-3 flex justify-between font-semibold text-base mb-2">
          <span>Total Payable</span>
          <span>₹{Number(expense?.amount).toLocaleString("en-IN")}</span>
        </div>

        {/* Approval and Generation Details */}
        <div className="pt-3 border-t border-dashed space-y-1.5">
          <div className="grid grid-cols-2 text-[10px]">
            <span className="text-muted-foreground">Approved By:</span>
            <span className="text-right font-medium">{expense?.approvedBy?.userName || "System"}</span>

            <span className="text-muted-foreground">Approved At:</span>
            <span className="text-right">
              {expense?.approvedAt ? new Date(expense.approvedAt).toLocaleString("en-IN") : "-"}
            </span>

            <span className="text-muted-foreground">Generated By:</span>
            <span className="text-right font-medium">{generatedBy || "-"}</span>
          </div>
        </div>

        {/* Footer / Signature */}
        <div className="pt-6 border-t border-dashed flex justify-between items-end">
          <div className="text-[10px] text-muted-foreground space-y-1">
            <p className="flex items-center gap-1 italic">
              <Receipt className="h-3 w-3" />
              Verified & Processed
            </p>
            <p>Generated by: {generatedBy || "-"}</p>
          </div>

          <div className="text-center space-y-1">
            <img
              src={signature}
              alt="Signature"
              className="h-10 w-auto mx-auto brightness-90 contrast-125"
            />
            <div className="border-t border-muted w-24 mx-auto" />
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Authorized Signatory
            </p>
          </div>
        </div>
      </CardContent>
    </Card >
  );
};

export default ExpensePreview;
