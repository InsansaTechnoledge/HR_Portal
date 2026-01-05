import React from "react";

const TemplateModern = ({ data, company, calculations }) => {
  const formatCurrency = (value) => {
    const num = Number(value || 0);
    return `₹${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const allowances = [
    { key: "hra", label: "HRA" },
    { key: "conveyanceAllowance", label: "Conveyance Allowance" },
    { key: "medicalAllowance", label: "Medical Allowance" },
    { key: "specialAllowance", label: "Special Allowance" },
  ].filter(({ key }) => Number(data[key]) > 0);

  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto bg-white relative font-sans text-slate-800 overflow-hidden print:shadow-none shadow-xl">
      {/* Top bars */}
      <div className="h-24 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
      <div className="h-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />

      {/* Content */}
      <div className="px-10 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900">
              PAYSLIP
            </h1>
            <p className="mt-2 text-slate-500">
              Salary Statement for{" "}
              <span className="font-semibold text-slate-700">
                {data.month}
              </span>
            </p>
          </div>

          <div className="text-right text-sm space-y-1">
            <p className="font-semibold text-slate-900">{company.name}</p>
            <p className="text-slate-500">{company.address}</p>
            <p className="text-slate-500">{company.city}</p>
            <p className="text-slate-400">{company.email}</p>
          </div>
        </div>

        {/* Employee & Payment Info */}
        <div className="grid grid-cols-2 gap-10 mb-10">
          <div className="bg-slate-50 rounded-xl p-5">
            <p className="uppercase tracking-widest text-xs text-slate-400 font-semibold mb-4">
              Employee Details
            </p>

            <div className="space-y-2 text-sm">
              <p className="font-bold text-xl text-slate-900">{data.name}</p>
              <p className="text-slate-600">Employee ID: {data.employeeId}</p>
              <p className="text-slate-600">{data.designation}</p>
              <p className="text-slate-600">{data.department}</p>

              <div className="pt-2 border-t border-slate-200 mt-3">
                <p className="text-slate-500">
                  <span className="font-medium">PAN:</span> {data.panNumber}
                </p>
                <p className="text-slate-500">
                  <span className="font-medium">UAN:</span>{" "}
                  {data.uanNumber || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-5">
            <p className="uppercase tracking-widest text-xs text-slate-400 font-semibold mb-4">
              Payment Details
            </p>

            <div className="space-y-2 text-sm">
              <p>
                <span className="text-slate-500">Bank Account:</span>{" "}
                <span className="font-medium">{data.bankAccount}</span>
              </p>
              <p>
                <span className="text-slate-500">Payslip Month:</span>{" "}
                <span className="font-medium">{data.month}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-3 border-y-2 border-slate-800 py-4 text-sm font-bold text-slate-900 mb-1">
          <span>Description</span>
          <span className="text-center">Units</span>
          <span className="text-right">Amount (₹)</span>
        </div>

        {/* Basic Salary */}
        <div className="grid grid-cols-3 py-3 border-b border-slate-200 text-sm hover:bg-slate-50 transition-colors">
          <span className="font-medium">Basic Salary</span>
          <span className="text-center text-slate-500">1</span>
          <span className="text-right font-semibold">
            {formatCurrency(data.salary)}
          </span>
        </div>

        {/* Allowances */}
        {allowances.map(({ key, label }) => (
          <div
            key={key}
            className="grid grid-cols-3 py-3 border-b border-slate-200 text-sm hover:bg-slate-50 transition-colors"
          >
            <span className="font-medium">{label}</span>
            <span className="text-center text-slate-500">1</span>
            <span className="text-right font-semibold">
              {formatCurrency(data[key])}
            </span>
          </div>
        ))}

        {/* Deductions */}
        <div className="mt-4 mb-2 text-xs uppercase tracking-widest text-slate-400 font-semibold">
          Deductions
        </div>

        {Object.entries(calculations.deductions).map(([key, value]) => (
          <div
            key={key}
            className="grid grid-cols-3 py-3 border-b border-slate-200 text-sm hover:bg-rose-50/50 transition-colors"
          >
            <span className="font-medium capitalize text-slate-600">
              {key.replace(/([A-Z])/g, " $1")}
            </span>
            <span className="text-center text-slate-400">—</span>
            <span className="text-right font-semibold text-rose-600">
              -{formatCurrency(value)}
            </span>
          </div>
        ))}

        {/* Totals */}
        <div className="flex justify-end mt-10">
          <div className="w-80 space-y-4">
            <div className="flex justify-between text-sm py-2">
              <span className="text-slate-500">Gross Earnings</span>
              <span className="font-semibold text-emerald-600">
                {formatCurrency(calculations.totalEarnings)}
              </span>
            </div>

            <div className="flex justify-between text-sm py-2">
              <span className="text-slate-500">Total Deductions</span>
              <span className="font-semibold text-rose-600">
                -{formatCurrency(calculations.totalDeductions)}
              </span>
            </div>

            <div className="flex justify-between items-center font-bold text-2xl pt-4 border-t-2 border-slate-800">
              <span className="text-slate-900">Net Salary</span>
              <span className="text-slate-900">
                {formatCurrency(calculations.netSalary)}
              </span>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 flex justify-between items-end text-xs text-slate-400">
          <p className="max-w-xs">
            This is a system-generated payslip and does not require a signature.
          </p>

          <div className="text-right">
            <p className="font-medium text-slate-600">
              Authorized Signatory
            </p>
            <p className="text-slate-500">{company.name}</p>
          </div>
        </div>
      </div>

      {/* Bottom bars */}
      <div className="absolute bottom-24 w-full h-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />
      <div className="absolute bottom-0 w-full h-24 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
    </div>
  );
};

export default TemplateModern;
