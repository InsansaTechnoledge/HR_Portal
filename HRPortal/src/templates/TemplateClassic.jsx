import React from "react";

/**
 * TemplateClassic - A4 Compatible
 */
const TemplateClassic = ({ data, company, calculations, expenses = [] }) => {
  const n = (v) => Number(v || 0).toFixed(2);
  const expenseTotal = (expenses || []).reduce(
    (sum, exp) => sum + (Number(exp.amount) || 0),
    0
  );
  const totalPayable = Number(
    calculations?.totalPayable || 0
  );

  return (
    <div className="w-[210mm] h-[297mm] bg-white mx-auto font-['Inter'] text-gray-800 overflow-hidden">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-[20mm] py-[8mm]">
        <h1 className="text-white text-2xl font-semibold tracking-wide">
          {company.name}
        </h1>
        <p className="text-blue-100 text-sm">Payslip</p>
      </div>

      {/* CONTENT */}
      <div className="px-[20mm] py-[10mm]">

        {/* EMPLOYEE + COMPANY */}
        <div className="flex justify-between mb-[8mm]">
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-gray-700">Employee Details</p>
            <p><span className="font-medium">Name:</span> {data.name}</p>
            <p><span className="font-medium">Employee ID:</span> {data.employeeId}</p>
            <p><span className="font-medium">Department:</span> {data.department}</p>
            <p><span className="font-medium">Designation:</span> {data.designation}</p>
            <p><span className="font-medium">Month:</span> {data.month}</p>
          </div>

          <div className="space-y-1 text-sm text-right">
            <p className="font-semibold text-gray-700">Company</p>
            <p>{company.address}</p>
            <p>{company.city}</p>
            <p>{company.phone}</p>
            <p>{company.email}</p>
          </div>
        </div>

        {/* EARNINGS */}
        <div className="border border-gray-300 rounded overflow-hidden mb-[6mm]">
          <div className="grid grid-cols-2 bg-blue-600 text-white text-sm font-semibold">
            <div className="px-[4mm] py-[2mm]">Earnings</div>
            <div className="px-[4mm] py-[2mm] text-right">Amount (₹)</div>
          </div>

          {[
            { label: "Basic Salary", value: data.salary },
            { label: "HRA", value: data.hra },
            { label: "Conveyance Allowance", value: data.conveyanceAllowance },
            { label: "Medical Allowance", value: data.medicalAllowance },
            { label: "Special Allowance", value: data.specialAllowance },
          ]
            .filter(item => Number(item.value) > 0)
            .map((item, i) => (
              <div key={i} className="grid grid-cols-2 border-t text-sm">
                <div className="px-[4mm] py-[2mm]">{item.label}</div>
                <div className="px-[4mm] py-[2mm] text-right">
                  ₹{n(item.value)}
                </div>
              </div>
            ))}

          <div className="grid grid-cols-2 border-t bg-gray-50 font-semibold text-sm">
            <div className="px-[4mm] py-[2mm]">Total Earnings</div>
            <div className="px-[4mm] py-[2mm] text-right">
              ₹{n(calculations.totalEarnings)}
            </div>
          </div>
        </div>

        {/* DEDUCTIONS */}
        <div className="border border-gray-300 rounded overflow-hidden mb-[6mm]">
          <div className="grid grid-cols-2 bg-blue-600 text-white text-sm font-semibold">
            <div className="px-[4mm] py-[2mm]">Deductions</div>
            <div className="px-[4mm] py-[2mm] text-right">Amount (₹)</div>
          </div>

          {Object.entries(calculations.deductions).map(([key, value]) => (
            <div key={key} className="grid grid-cols-2 border-t text-sm">
              <div className="px-[4mm] py-[2mm] capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </div>
              <div className="px-[4mm] py-[2mm] text-right">
                ₹{n(value)}
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 border-t bg-gray-50 font-semibold text-sm">
            <div className="px-[4mm] py-[2mm]">Total Deductions</div>
            <div className="px-[4mm] py-[2mm] text-right">
              ₹{n(calculations.totalDeductions)}
            </div>
          </div>
        </div>

        {/* NET SALARY */}
        <div className="bg-blue-50 border border-blue-200 rounded p-[3mm] flex justify-between items-center mb-[4mm]">
          <span className="text-lg font-semibold">Net Salary</span>
          <span className="text-lg font-bold text-blue-700">
            ₹{n(calculations.netSalary)}
          </span>
        </div>

        {/* TOTAL PAYABLE (NET + EXPENSES) */}
        {expenseTotal > 0 && (
          <div className="bg-green-50 border border-green-200 rounded p-[3mm] flex justify-between items-center">
            <span className="text-sm font-semibold">Total Payable (Net Salary + Expenses)</span>
            <span className="text-lg font-bold text-green-700">
              ₹{n(totalPayable || Number(calculations.netSalary) + expenseTotal)}
            </span>
          </div>
        )}

        {/* REIMBURSABLE EXPENSES */}
        {expenses && expenses.length > 0 && (
          <div className="mt-[8mm]">
            <p className="font-semibold mb-[2mm] text-sm">
              Reimbursable Expenses (Approved)
            </p>
            <div className="border border-gray-300 rounded overflow-hidden">
              <div className="grid grid-cols-3 bg-blue-600 text-white text-xs font-semibold">
                <div className="px-[4mm] py-[2mm]">Date</div>
                <div className="px-[4mm] py-[2mm]">Type</div>
                <div className="px-[4mm] py-[2mm] text-right">Amount (₹)</div>
              </div>

              {expenses.map((exp) => (
                <div
                  key={exp._id}
                  className="grid grid-cols-3 border-t text-xs"
                >
                  <div className="px-[4mm] py-[2mm]">
                    {exp.expenseDate
                      ? new Date(exp.expenseDate).toLocaleDateString()
                      : "-"}
                  </div>
                  <div className="px-[4mm] py-[2mm]">{exp.expenseType}</div>
                  <div className="px-[4mm] py-[2mm] text-right">
                    ₹{n(exp.amount)}
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-3 border-t bg-gray-50 font-semibold text-xs">
                <div className="px-[4mm] py-[2mm] col-span-2">
                  Total Reimbursable Expenses
                </div>
                <div className="px-[4mm] py-[2mm] text-right">
                  ₹{n(expenseTotal)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BANK & COMPLIANCE */}
        <div className="mt-[8mm] grid grid-cols-2 gap-[6mm] text-sm">
          <div>
            <p className="font-semibold mb-[1mm]">Bank Details</p>
            <p><span className="font-medium">Account:</span> {data.bankAccount}</p>
          </div>
          <div>
            <p className="font-semibold mb-[1mm]">Compliance</p>
            <p><span className="font-medium">PAN:</span> {data.panNumber}</p>
            <p><span className="font-medium">UAN:</span> {data.uanNumber || "-"}</p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-[10mm] h-[2mm] bg-gradient-to-r from-blue-600 to-blue-500" />
    </div>
  );
};

export default TemplateClassic;
