import { Card, CardContent, CardHeader } from "../Components/ui/card";
import { Receipt } from "lucide-react";

const PayslipPreview = ({ employee, expense }) => {

    console.log("Employee Data: ", employee);
    console.log("Expense Data: ", expense);

  return (
    <Card className="border border-dashed rounded-xl bg-white">
      
      {/* Header */}
      <CardHeader className="text-center border-b pb-4">
        <h2 className="text-lg font-bold tracking-wide">
          Insansa Technologies
        </h2>
        <p className="text-xs text-muted-foreground">
          Expense Payment Slip
        </p>
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
            <span>Expense Type</span>
            <span className="font-medium">{expense?.expenseType}</span>
          </div>

          <div className="flex justify-between">
            <span>Expense Date</span>
            <span>
              {new Date(expense?.expenseDate).toLocaleDateString("en-IN")}
            </span>
          </div>
        </div>

        <div className="border-t pt-3 flex justify-between font-semibold text-base">
          <span>Total Payable</span>
          <span>
            ₹{Number(expense?.amount).toLocaleString("en-IN")}
          </span>
        </div>

        {/* Footer */}
        <div className="pt-4 text-center text-xs text-muted-foreground space-y-1">
          <div className="flex justify-center gap-2 items-center">
            <Receipt className="h-3 w-3" />
            <span>System Generated Slip</span>
          </div>
          <p>No signature required</p>
        </div>

      </CardContent>
    </Card>
  );
};

export default PayslipPreview;
