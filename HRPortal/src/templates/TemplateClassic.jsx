import React from "react";

const TemplateClassic = ({ data, company, calculations }) => {
  const formatCurrency = (value) => {
    const num = Number(value || 0);
    return `₹${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const earnings = [
    { label: "Basic Salary", value: data.salary },
    { label: "HRA", value: data.hra },
    { label: "Conveyance Allowance", value: data.conveyanceAllowance },
    { label: "Medical Allowance", value: data.medicalAllowance },
    { label: "Special Allowance", value: data.specialAllowance },
  ].filter((item) => Number(item.value) > 0);

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white mx-auto font-sans text-slate-800 print:shadow-none shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold tracking-wide">
              {company.name}
            </h1>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Salary Statement
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-white/70 text-xs uppercase tracking-wider">
              Pay Period
            </p>
            <p className="text-white font-semibold">{data.month}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {/* Employee & Company Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2">
              Employee Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="w-28 text-muted-foreground">Name</span>
                <span className="font-medium">{data.name}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-muted-foreground">Employee ID</span>
                <span className="font-medium">{data.employeeId}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-muted-foreground">Department</span>
                <span className="font-medium">{data.department}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-muted-foreground">Designation</span>
                <span className="font-medium">{data.designation}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-right">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2">
              Company Details
            </h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{company.address}</p>
              <p>{company.city}</p>
              <p>{company.phone}</p>
              <p>{company.email}</p>
            </div>
          </div>
        </div>

        {/* Earnings */}
        <div className="mb-6 rounded-lg border overflow-hidden">
          <div className="grid grid-cols-2 bg-primary text-primary-foreground text-sm font-semibold">
            <div className="px-4 py-3">Earnings</div>
            <div className="px-4 py-3 text-right">Amount</div>
          </div>
          {earnings.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-2 border-t text-sm hover:bg-muted/30 transition-colors"
            >
              <div className="px-4 py-3">{item.label}</div>
              <div className="px-4 py-3 text-right font-medium">
                {formatCurrency(item.value)}
              </div>
            </div>
          ))}
          <div className="grid grid-cols-2 border-t bg-success/10 font-semibold text-sm">
            <div className="px-4 py-3">Total Earnings</div>
            <div className="px-4 py-3 text-right text-success">
              {formatCurrency(calculations.totalEarnings)}
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="mb-6 rounded-lg border overflow-hidden">
          <div className="grid grid-cols-2 bg-destructive text-destructive-foreground text-sm font-semibold">
            <div className="px-4 py-3">Deductions</div>
            <div className="px-4 py-3 text-right">Amount</div>
          </div>
          {Object.entries(calculations.deductions).map(([key, value]) => (
            <div
              key={key}
              className="grid grid-cols-2 border-t text-sm hover:bg-muted/30 transition-colors"
            >
              <div className="px-4 py-3 capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </div>
              <div className="px-4 py-3 text-right font-medium">
                {formatCurrency(value)}
              </div>
            </div>
          ))}
          <div className="grid grid-cols-2 border-t bg-destructive/10 font-semibold text-sm">
            <div className="px-4 py-3">Total Deductions</div>
            <div className="px-4 py-3 text-right text-destructive">
              {formatCurrency(calculations.totalDeductions)}
            </div>
          </div>
        </div>

        {/* Net Salary */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl p-6 flex justify-between items-center">
          <div>
            <span className="text-lg font-bold text-foreground">
              Net Salary
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Amount credited to bank account
            </p>
          </div>
          <span className="text-3xl font-bold text-primary">
            {formatCurrency(calculations.netSalary)}
          </span>
        </div>

        {/* Bank & Compliance */}
        <div className="mt-8 grid grid-cols-2 gap-8 text-sm">
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">
              Bank Details
            </h4>
            <div className="flex">
              <span className="w-20 text-muted-foreground">Account</span>
              <span className="font-medium">{data.bankAccount}</span>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">
              Compliance
            </h4>
            <div className="space-y-1">
              <div className="flex">
                <span className="w-12 text-muted-foreground">PAN</span>
                <span className="font-medium">{data.panNumber}</span>
              </div>
              <div className="flex">
                <span className="w-12 text-muted-foreground">UAN</span>
                <span className="font-medium">
                  {data.uanNumber || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-xs text-center text-muted-foreground">
          This is a computer-generated document and does not require a signature.
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary" />
    </div>
  );
};

export default TemplateClassic;
