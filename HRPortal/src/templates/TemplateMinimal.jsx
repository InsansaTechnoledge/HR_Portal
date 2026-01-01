import React from "react";

/**
 * TemplateMinimal
 * Props:
 *  - data: employee details
 *  - company: company info
 *  - calculations: salary calculations
 *  - expenses: optional reimbursable expenses
 */
const TemplateMinimal = ({ data, company, calculations }) => {
  const formatCurrency = (v) => `₹${Number(v || 0).toFixed(2)}`;

  return (
    <div
      className="w-[794px] min-h-[1123px] bg-white mx-auto font-['Inter'] text-gray-800 p-12 text-sm"
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
        <p className="text-gray-600">{company.address}, {company.city}</p>
        <p className="text-gray-600">{company.email} | {company.phone}</p>
        <hr className="mt-4 border-gray-300" />
      </div>

      {/* Payslip Title */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Payslip</h2>
        <p className="text-gray-600">Salary Statement for <span className="font-medium">{data.month}</span></p>
      </div>

      {/* Employee & Payment Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-2">Employee Details</h3>
          <p><span className="font-medium">Name:</span> {data.name}</p>
          <p><span className="font-medium">Employee ID:</span> {data.employeeId}</p>
          <p><span className="font-medium">Department:</span> {data.department}</p>
          <p><span className="font-medium">Designation:</span> {data.designation}</p>
          <p><span className="font-medium">PAN:</span> {data.panNumber}</p>
          <p><span className="font-medium">UAN:</span> {data.uanNumber || "-"}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Payment Details</h3>
          <p><span className="font-medium">Bank Account:</span> {data.bankAccount}</p>
          <p><span className="font-medium">Month:</span> {data.month}</p>
          <p><span className="font-medium">Salary:</span> {formatCurrency(data.salary)}</p>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Earnings</h3>
        <div className="border border-gray-300 rounded overflow-hidden">
          <div className="grid grid-cols-2 bg-gray-100 font-semibold px-4 py-2">
            <span>Description</span>
            <span className="text-right">Amount</span>
          </div>

          {[
            { label: "Basic Salary", value: data.salary },
            { label: "HRA", value: data.hra },
            { label: "Conveyance Allowance", value: data.conveyanceAllowance },
            { label: "Medical Allowance", value: data.medicalAllowance },
            { label: "Special Allowance", value: data.specialAllowance },
          ]
            .filter(item => Number(item.value) > 0)
            .map((item, idx) => (
              <div key={idx} className="grid grid-cols-2 border-t px-4 py-2">
                <span>{item.label}</span>
                <span className="text-right">{formatCurrency(item.value)}</span>
              </div>
            ))}

          <div className="grid grid-cols-2 border-t bg-gray-50 font-semibold px-4 py-2">
            <span>Total Earnings</span>
            <span className="text-right">{formatCurrency(calculations.totalEarnings)}</span>
          </div>
        </div>
      </div>

      {/* Deductions Table */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Deductions</h3>
        <div className="border border-gray-300 rounded overflow-hidden">
          <div className="grid grid-cols-2 bg-gray-100 font-semibold px-4 py-2">
            <span>Description</span>
            <span className="text-right">Amount</span>
          </div>

          {Object.entries(calculations.deductions).map(([key, value]) => (
            <div key={key} className="grid grid-cols-2 border-t px-4 py-2 text-gray-600">
              <span>{key.replace(/([A-Z])/g, " $1")}</span>
              <span className="text-right">{formatCurrency(value)}</span>
            </div>
          ))}

          <div className="grid grid-cols-2 border-t bg-gray-50 font-semibold px-4 py-2">
            <span>Total Deductions</span>
            <span className="text-right">{formatCurrency(calculations.totalDeductions)}</span>
          </div>
        </div>
      </div>

      {/* Net Salary */}
      <div className="p-4 bg-gray-50 rounded-lg text-center font-bold text-lg mb-3">
        Net Salary: {formatCurrency(calculations.netSalary)}
      </div>


      {/* Footer */}
      <div className="mt-12 text-xs text-gray-500 text-center">
        This is a computer-generated payslip and does not require a signature.
      </div>
    </div>
  );
};

export default TemplateMinimal;
