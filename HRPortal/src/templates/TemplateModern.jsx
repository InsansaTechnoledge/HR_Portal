import React from "react";

const TemplateModern = ({ data, company, calculations, expenses = [] }) => {
  const n = (v) => Number(v || 0).toFixed(2);
  const expenseTotal = (expenses || []).reduce(
    (sum, exp) => sum + (Number(exp.amount) || 0),
    0
  );
  const totalPayable = Number(calculations?.totalPayable || 0);

  return (
    <div
      className="w-[210mm] h-[297mm] mx-auto bg-white relative font-['Inter'] text-[13.5px] text-gray-800 overflow-hidden"
    >
      {/* TOP GRADIENT */}
      <div className="h-[24mm] bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900" />
      <div className="h-[3mm] bg-yellow-500" />

      {/* CONTENT */}
      <div className="px-[12mm] py-[10mm]">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-[12mm]">
          <div>
            <h1 className="text-[42px] font-bold tracking-wide text-gray-900">
              PAYSLIP
            </h1>
            <p className="mt-2 text-gray-500 text-sm">
              Salary Statement for <span className="font-medium">{data.month}</span>
            </p>
          </div>

          <div className="text-right leading-6 text-sm">
            <p className="font-semibold text-gray-900">{company.name}</p>
            <p>{company.address}</p>
            <p>{company.city}</p>
            <p className="text-gray-500">{company.email}</p>
          </div>
        </div>

        {/* EMPLOYEE INFO */}
        <div className="grid grid-cols-2 gap-[12mm] mb-[10mm]">
          <div>
            <p className="uppercase tracking-wider text-xs text-gray-500 mb-[3mm]">
              Employee Details
            </p>
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 text-base">{data.name}</p>
              <p>Employee ID: {data.employeeId}</p>
              <p>{data.designation}</p>
              <p>{data.department}</p>
              <p>PAN: {data.panNumber}</p>
              <p>UAN: {data.uanNumber || "-"}</p>
            </div>
          </div>

          <div>
            <p className="uppercase tracking-wider text-xs text-gray-500 mb-[3mm]">
              Payment Details
            </p>
            <div className="space-y-1">
              <p><span className="font-medium">Bank Account:</span> {data.bankAccount}</p>
              <p><span className="font-medium">Payslip Month:</span> {data.month}</p>
            </div>
          </div>
        </div>

        {/* TABLE HEADER */}
        <div className="grid grid-cols-3 border-y border-blue-700 py-[3mm] text-sm font-semibold text-gray-900">
          <span>Description</span>
          <span className="text-center">Units</span>
          <span className="text-right">Amount (₹)</span>
        </div>

        {/* EARNINGS */}
        <div className="grid grid-cols-3 py-[3mm] border-b">
          <span>Basic Salary</span>
          <span className="text-center">1</span>
          <span className="text-right">{n(data.salary)}</span>
        </div>

        {/* ALLOWANCES (OPTIONAL) */}
        {["hra", "conveyanceAllowance", "medicalAllowance", "specialAllowance"]
          .filter(key => Number(data[key]) > 0)
          .map(key => (
            <div key={key} className="grid grid-cols-3 py-[3mm] border-b">
              <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
              <span className="text-center">1</span>
              <span className="text-right">{n(data[key])}</span>
            </div>
          ))}

        {/* DEDUCTIONS */}
        {Object.entries(calculations.deductions).map(([key, value]) => (
          <div key={key} className="grid grid-cols-3 py-[3mm] border-b text-gray-600">
            <span>{key}</span>
            <span className="text-center">—</span>
            <span className="text-right">-{n(value)}</span>
          </div>
        ))}

        {/* TOTALS */}
        <div className="mt-[10mm] flex justify-end">
          <div className="w-[96mm] space-y-[3mm] text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Gross Earnings</span>
              <span className="font-medium">₹{n(calculations.totalEarnings)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Total Deductions</span>
              <span className="font-medium">₹{n(calculations.totalDeductions)}</span>
            </div>

            <div className="flex justify-between font-bold text-xl border-t pt-[4mm] text-gray-900">
              <span>Net Salary</span>
              <span>₹{n(calculations.netSalary)}</span>
            </div>

            {expenseTotal > 0 && (
              <div className="flex justify-between font-semibold text-sm text-green-700 mt-[3mm]">
                <span>Total Payable (Net + Expenses)</span>
                <span>
                  ₹{n(totalPayable || Number(calculations.netSalary || 0) + expenseTotal)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* REIMBURSABLE EXPENSES */}
        {expenses && expenses.length > 0 && (
          <div className="mt-[12mm]">
            <p className="uppercase tracking-wider text-xs text-gray-500 mb-[3mm]">
              Reimbursable Expenses (Approved)
            </p>
            <div className="border border-gray-200 rounded overflow-hidden text-xs">
              <div className="grid grid-cols-3 bg-gray-100 font-semibold px-[4mm] py-[2mm]">
                <span>Date</span>
                <span>Type</span>
                <span className="text-right">Amount (₹)</span>
              </div>

              {expenses.map((exp) => (
                <div
                  key={exp._id}
                  className="grid grid-cols-3 border-t px-[4mm] py-[2mm] text-gray-700"
                >
                  <span>
                    {exp.expenseDate
                      ? new Date(exp.expenseDate).toLocaleDateString()
                      : "-"}
                  </span>
                  <span>{exp.expenseType}</span>
                  <span className="text-right">₹{n(exp.amount)}</span>
                </div>
              ))}

              <div className="grid grid-cols-3 border-t bg-gray-50 font-semibold px-[4mm] py-[2mm]">
                <span className="col-span-2">Total Reimbursable Expenses</span>
                <span className="text-right">₹{n(expenseTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-[20mm] flex justify-between items-end text-xs text-gray-500">
          <p className="leading-relaxed">
            This is a system generated payslip and does not require signature.
          </p>

          <div className="text-right">
            <p className="font-medium text-gray-700">Authorized Signatory</p>
            <p className="text-gray-600">{company.name}</p>
          </div>
        </div>
      </div>

      {/* BOTTOM GOLD + GRADIENT */}
      <div className="absolute bottom-[24mm] w-full h-[3mm] bg-yellow-500" />
      <div className="absolute bottom-0 w-full h-[24mm] bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900" />
    </div>
  );
};

export default TemplateModern;
