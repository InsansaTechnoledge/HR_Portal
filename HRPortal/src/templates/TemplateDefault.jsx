import React from 'react';
import { Phone, Mail } from 'lucide-react';

const TemplateDefault = ({ data, company, calculations }) => {
  const n = (v) => Number(v || 0).toFixed(2);

  if (!data) return null; // guard

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      {/* COMPANY HEADER */}
      <div className="border-b pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600 mb-2">{company.name}</h1>
            <p className="text-gray-600">{company.address}</p>
            <p className="text-gray-600">{company.city}</p>
            <div className="mt-2 text-sm">
              <p><span className="font-medium">GST:</span> {company.gst}</p>
              <p><span className="font-medium">CIN:</span> {company.cin}</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="flex items-center justify-end gap-2">
              <Phone size={16} />
              {company.phone}
            </p>
            <p className="flex items-center justify-end gap-2">
              <Mail size={16} />
              {company.email}
            </p>
            <p className="text-gray-600">{company.website}</p>
          </div>
        </div>
      </div>

      {/* EMPLOYEE & PAYMENT DETAILS */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Employee Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Name:</p>
                <p>{data.name}</p>
              </div>
              <div>
                <p className="font-medium">Employee ID:</p>
                <p>{data.employeeId}</p>
              </div>
              <div>
                <p className="font-medium">Department:</p>
                <p>{data.department}</p>
              </div>
              <div>
                <p className="font-medium">Designation:</p>
                <p>{data.designation}</p>
              </div>
              <div>
                <p className="font-medium">PAN:</p>
                <p>{data.panNumber}</p>
              </div>
              <div>
                <p className="font-medium">UAN:</p>
                <p>{data.uanNumber}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Bank Account:</span> {data.bankAccount}</p>
              <p><span className="font-medium">Payment Month:</span> {data.month}</p>
            </div>
          </div>
        </div>

        {/* EARNINGS */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Earnings</h3>
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              {[ { label: 'Basic Salary', key: 'salary' }].map(({ label, key }) => (
                <div key={key} className="flex justify-between">
                  <span>{label}</span>
                  <span>₹{n(data[key])}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 font-semibold">
                <div className="flex justify-between">
                  <span>Total Earnings</span>
                  <span>₹{n(calculations.totalEarnings)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* DEDUCTIONS */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Deductions</h3>
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              {Object.entries(calculations.deductions).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span>₹{n(value)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 font-semibold">
                <div className="flex justify-between">
                  <span>Total Deductions</span>
                  <span>₹{n(calculations.totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NET SALARY */}
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Net Salary</span>
            <span className="text-xl font-bold">₹{n(calculations.netSalary)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateDefault;
