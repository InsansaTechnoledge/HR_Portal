import React from "react";
import { Phone, Mail, Globe } from "lucide-react";

const TemplateDefault = ({ data, company, calculations }) => {
  const formatCurrency = (value) => {
    const num = Number(value || 0);
    return `₹${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (!data) return null;

  return (
    <div className="bg-white shadow-xl rounded-xl overflow-hidden print:shadow-none">
      {/* Company Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-6 text-primary-foreground">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">{company.name}</h1>
            <p className="text-primary-foreground/80 text-sm">{company.address}</p>
            <p className="text-primary-foreground/80 text-sm">{company.city}</p>

            <div className="mt-3 flex gap-4 text-xs">
              {company.gst && (
                <span className="bg-white/10 backdrop-blur-sm rounded px-2 py-1">
                  <span className="opacity-70">GST:</span> {company.gst}
                </span>
              )}
              {company.cin && (
                <span className="bg-white/10 backdrop-blur-sm rounded px-2 py-1">
                  <span className="opacity-70">CIN:</span> {company.cin}
                </span>
              )}
            </div>
          </div>

          <div className="text-right text-sm space-y-1">
            <p className="flex items-center justify-end gap-2">
              <Phone className="w-4 h-4 opacity-70" />
              {company.phone}
            </p>
            <p className="flex items-center justify-end gap-2">
              <Mail className="w-4 h-4 opacity-70" />
              {company.email}
            </p>
            {company.website && (
              <p className="flex items-center justify-end gap-2">
                <Globe className="w-4 h-4 opacity-70" />
                {company.website}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payslip Title */}
      <div className="bg-muted/50 px-8 py-4 border-b">
        <h2 className="text-lg font-semibold text-center">
          Salary Statement for{" "}
          <span className="text-primary">{data.month}</span>
        </h2>
      </div>

      {/* Content */}
      <div className="p-8 space-y-6">
        {/* Employee & Payment Details */}
        <div className="grid grid-cols-2 gap-6">
          {/* Employee Details */}
          <div className="bg-muted/30 p-5 rounded-xl border">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Employee Details
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Name</p>
                <p className="font-medium">{data.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Employee ID</p>
                <p className="font-medium">{data.employeeId}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Department</p>
                <p className="font-medium">{data.department}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Designation</p>
                <p className="font-medium">{data.designation}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">PAN</p>
                <p className="font-medium">{data.panNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">UAN</p>
                <p className="font-medium">{data.uanNumber || "-"}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-muted/30 p-5 rounded-xl border">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Payment Details
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Bank Account</p>
                <p className="font-medium">{data.bankAccount}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Payment Month</p>
                <p className="font-medium">{data.month}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings & Deductions */}
        <div className="grid grid-cols-2 gap-6">
          {/* Earnings */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-success mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              Earnings
            </h3>

            <div className="bg-success/5 border border-success/20 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-sm py-2 border-b border-success/10">
                <span>Basic Salary</span>
                <span className="font-medium">
                  {formatCurrency(data.salary)}
                </span>
              </div>

              <div className="border-t border-success/20 pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total Earnings</span>
                  <span className="text-success">
                    {formatCurrency(calculations.totalEarnings)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-destructive mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              Deductions
            </h3>

            <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-xl space-y-2">
              {Object.entries(calculations.deductions).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between text-sm py-2 border-b border-destructive/10"
                  >
                    <span className="capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(value)}
                    </span>
                  </div>
                )
              )}

              <div className="border-t border-destructive/20 pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total Deductions</span>
                  <span className="text-destructive">
                    {formatCurrency(calculations.totalDeductions)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl p-6 border-2 border-primary/20">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xl font-bold">Net Salary</span>
              <p className="text-sm text-muted-foreground">
                Amount credited to bank account
              </p>
            </div>
            <span className="text-3xl font-black text-primary">
              {formatCurrency(calculations.netSalary)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground pt-4 border-t">
          This is a computer-generated payslip and does not require a signature.
        </p>
      </div>
    </div>
  );
};

export default TemplateDefault;
