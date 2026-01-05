import React from "react";

const TemplateMinimal = ({ data, company, calculations }) => {
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
    <div className="w-[210mm] min-h-[297mm] bg-white mx-auto font-sans text-slate-800 p-12 print:shadow-none shadow-xl">
      {/* Header */}
      <div className="text-center mb-10 pb-6 border-b-2 border-slate-200">
        <h1 className="text-3xl font-light tracking-wide text-slate-900">
          {company.name}
        </h1>
        <p className="text-slate-500 mt-2">
          {company.address}, {company.city}
        </p>
        <p className="text-slate-500 text-sm">
          {company.email} | {company.phone}
        </p>
      </div>

      {/* Payslip Title */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Payslip
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="h-px w-12 bg-slate-300" />
          <p className="text-slate-600">{data.month}</p>
          <div className="h-px w-12 bg-slate-300" />
        </div>
      </div>

      {/* Employee & Payment Details */}
      <div className="grid grid-cols-2 gap-12 mb-10">
        {/* Employee Details */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4">
            Employee Details
          </h3>
          <div className="space-y-2 text-sm">
            <DetailRow label="Name" value={data.name} />
            <DetailRow label="Employee ID" value={data.employeeId} />
            <DetailRow label="Department" value={data.department} />
            <DetailRow label="Designation" value={data.designation} />
            <DetailRow label="PAN" value={data.panNumber} />
            <DetailRow label="UAN" value={data.uanNumber || "-"} last />
          </div>
        </div>

        {/* Payment Details */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4">
            Payment Details
          </h3>
          <div className="space-y-2 text-sm">
            <DetailRow label="Bank Account" value={data.bankAccount} />
            <DetailRow label="Month" value={data.month} />
            <DetailRow
              label="Base Salary"
              value={formatCurrency(data.salary)}
              last
            />
          </div>
        </div>
      </div>

      {/* Earnings */}
      <SectionTable
        title="Earnings"
        items={earnings.map((e) => ({
          label: e.label,
          value: formatCurrency(e.value),
        }))}
        totalLabel="Total Earnings"
        totalValue={formatCurrency(calculations.totalEarnings)}
        totalClass="bg-emerald-50 text-emerald-700"
      />

      {/* Deductions */}
      <SectionTable
        title="Deductions"
        items={Object.entries(calculations.deductions).map(
          ([key, value]) => ({
            label: key.replace(/([A-Z])/g, " $1"),
            value: formatCurrency(value),
          })
        )}
        totalLabel="Total Deductions"
        totalValue={formatCurrency(calculations.totalDeductions)}
        totalClass="bg-rose-50 text-rose-700"
      />

      {/* Net Salary */}
      <div className="bg-slate-900 text-white rounded-lg p-6 text-center mb-10">
        <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">
          Net Salary
        </p>
        <p className="text-4xl font-light tracking-tight">
          {formatCurrency(calculations.netSalary)}
        </p>
      </div>


      {/* Footer */}
      <div className="text-xs text-slate-400 text-center pt-6 border-t border-slate-200">
        This is a computer-generated payslip and does not require a signature.
      </div>
    </div>
  );
};

/* Helper Components */

const DetailRow = ({ label, value, last }) => (
  <div
    className={`flex ${
      !last ? "border-b border-dashed border-slate-200 pb-2" : ""
    }`}
  >
    <span className="w-28 text-slate-500">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const SectionTable = ({
  title,
  items,
  totalLabel,
  totalValue,
  totalClass,
}) => (
  <div className="mb-8">
    <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4">
      {title}
    </h3>

    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-2 bg-slate-50 text-sm font-semibold px-4 py-3 border-b">
        <span>Description</span>
        <span className="text-right">Amount</span>
      </div>

      {items.map((item, idx) => (
        <div
          key={idx}
          className="grid grid-cols-2 text-sm px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
        >
          <span className="text-slate-700 capitalize">{item.label}</span>
          <span className="text-right font-medium">{item.value}</span>
        </div>
      ))}

      <div
        className={`grid grid-cols-2 text-sm font-semibold px-4 py-3 ${totalClass}`}
      >
        <span>{totalLabel}</span>
        <span className="text-right">{totalValue}</span>
      </div>
    </div>
  </div>
);

export default TemplateMinimal;
