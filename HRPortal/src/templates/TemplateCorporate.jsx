import React from "react";

const TemplateCorporate = ({ data, company, calculations }) => {
  const formatCurrency = (value) => {
    const num = Number(value || 0);
    return `₹${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const earningsItems = [
    ["Basic Salary", data.salary],
    ["HRA", data.hra],
    ["Conveyance Allowance", data.conveyanceAllowance],
    ["Medical Allowance", data.medicalAllowance],
    ["Special Allowance", data.specialAllowance],
  ].filter(([, v]) => Number(v) > 0);

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white mx-auto relative font-sans text-slate-800 overflow-hidden print:shadow-none shadow-xl">
      {/* Decorative shapes */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-primary -rotate-45 -translate-x-20 -translate-y-20" />
      <div className="absolute top-0 left-0 w-32 h-32 bg-primary/70 -rotate-45 -translate-x-10 -translate-y-10" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary -rotate-45 translate-x-20 translate-y-20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/70 -rotate-45 translate-x-10 translate-y-10" />

      {/* Content */}
      <div className="relative px-10 py-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-widest text-foreground">
              PAYSLIP
            </h1>
            <div className="mt-2 h-1 w-20 bg-primary rounded-full" />
          </div>

          <div className="text-right text-sm space-y-1 bg-muted/50 rounded-lg px-4 py-3">
            <p>
              <span className="text-muted-foreground">Invoice No:</span>{" "}
              <span className="font-semibold">
                {data.employeeId}/{data.month}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Pay Period:</span>{" "}
              <span className="font-semibold">{data.month}</span>
            </p>
          </div>
        </div>

        {/* Payable To */}
        <div className="mb-10 text-sm">
          <p className="uppercase tracking-widest text-xs text-muted-foreground mb-3 font-semibold">
            Payable To
          </p>
          <div className="bg-muted/30 rounded-lg p-4 inline-block">
            <p className="font-bold text-lg text-foreground">{data.name}</p>
            <p className="text-muted-foreground">
              {data.designation} • {data.department}
            </p>
            <p className="text-muted-foreground">
              Employee ID: {data.employeeId}
            </p>
          </div>
        </div>

        {/* Company Info */}
        <div className="mb-8 text-sm text-right">
          <p className="uppercase tracking-widest text-xs text-muted-foreground mb-2 font-semibold">
            From
          </p>
          <p className="font-semibold">{company.name}</p>
          <p className="text-muted-foreground">{company.address}</p>
          <p className="text-muted-foreground">{company.city}</p>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 border-y-2 border-foreground py-4 mb-1 text-sm font-bold tracking-wide">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-right">Unit</div>
          <div className="col-span-3 text-right">Amount</div>
        </div>

        {/* Earnings */}
        {earningsItems.map(([label, value], i) => (
          <div
            key={label}
            className="grid grid-cols-12 py-3 text-sm border-b border-muted hover:bg-muted/30 transition-colors"
          >
            <div className="col-span-1 text-muted-foreground">{i + 1}.</div>
            <div className="col-span-6 font-medium">{label}</div>
            <div className="col-span-2 text-right text-muted-foreground">1</div>
            <div className="col-span-3 text-right font-semibold">
              {formatCurrency(value)}
            </div>
          </div>
        ))}

        {/* Deductions */}
        <div className="mt-6 mb-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Deductions
        </div>

        {Object.entries(calculations.deductions).map(([key, value], i) => (
          <div
            key={key}
            className="grid grid-cols-12 py-3 text-sm border-b border-muted hover:bg-destructive/5 transition-colors"
          >
            <div className="col-span-1 text-muted-foreground">
              {earningsItems.length + i + 1}.
            </div>
            <div className="col-span-6 font-medium capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </div>
            <div className="col-span-2 text-right text-muted-foreground">—</div>
            <div className="col-span-3 text-right font-semibold text-destructive">
              -{formatCurrency(value)}
            </div>
          </div>
        ))}

        {/* Totals */}
        <div className="flex justify-end mt-10">
          <div className="w-72 space-y-4">
            <div className="flex justify-between text-sm py-2 border-b">
              <span className="text-muted-foreground">Gross Earnings</span>
              <span className="font-semibold text-success">
                {formatCurrency(calculations.totalEarnings)}
              </span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b">
              <span className="text-muted-foreground">Total Deductions</span>
              <span className="font-semibold text-destructive">
                -{formatCurrency(calculations.totalDeductions)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t-2 border-foreground">
              <span className="text-xl font-bold">NET PAY</span>
              <span className="text-2xl font-black text-primary">
                {formatCurrency(calculations.netSalary)}
              </span>
            </div>

          </div>
        </div>

        {/* Bank & Tax Info */}
        <div className="mt-16 text-sm grid grid-cols-2 gap-8">
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="uppercase tracking-widest text-xs text-muted-foreground mb-3 font-semibold">
              Bank Details
            </p>
            <p>
              <span className="text-muted-foreground">Account:</span>{" "}
              <span className="font-medium">{data.bankAccount}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Name:</span>{" "}
              <span className="font-medium">{data.name}</span>
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <p className="uppercase tracking-widest text-xs text-muted-foreground mb-3 font-semibold">
              Tax Information
            </p>
            <p>
              <span className="text-muted-foreground">PAN:</span>{" "}
              <span className="font-medium">{data.panNumber}</span>
            </p>
            <p>
              <span className="text-muted-foreground">UAN:</span>{" "}
              <span className="font-medium">{data.uanNumber || "-"}</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t text-xs text-muted-foreground flex justify-between">
          <p>
            {company.address} • {company.email}
          </p>
          <p>This is a computer-generated document</p>
        </div>
      </div>
    </div>
  );
};

export default TemplateCorporate;
