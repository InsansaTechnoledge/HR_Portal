import React from "react";

const TemplateCorporate = ({ data, company, calculations }) => {
  const n = (v) => Number(v || 0).toFixed(2);

  return (
    <div className="mx-auto relative w-[210mm] h-[297mm] bg-white font-['Inter'] text-gray-800 overflow-hidden">

      {/* ========= DECORATIVE SHAPES ========= */}
      {/* TOP LEFT */}
      <div className="absolute top-0 left-0 w-[70mm] h-[70mm] bg-blue-900 -rotate-45 -translate-x-[32mm] -translate-y-[32mm]" />
      <div className="absolute top-0 left-0 w-[55mm] h-[55mm] bg-blue-600 -rotate-45 -translate-x-[16mm] -translate-y-[16mm]" />

      {/* BOTTOM RIGHT */}
      <div className="absolute bottom-0 right-0 w-[70mm] h-[70mm] bg-blue-900 -rotate-45 translate-x-[32mm] translate-y-[32mm]" />
      <div className="absolute bottom-0 right-0 w-[55mm] h-[55mm] bg-blue-600 -rotate-45 translate-x-[16mm] translate-y-[16mm]" />

      {/* ========= SAFE CONTENT AREA ========= */}
      <div className="relative px-[20mm] py-[16mm]">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-[16mm]">
          <h1 className="text-4xl font-bold tracking-widest text-gray-900">
            INVOICE
          </h1>

          <div className="text-sm text-right space-y-1">
            <p><span className="font-medium">Invoice No:</span> 0000001</p>
            <p><span className="font-medium">Date:</span> {data.month}</p>
          </div>
        </div>

        {/* BILL TO */}
        <div className="mb-[14mm] text-sm">
          <p className="uppercase tracking-wider text-xs text-gray-500 mb-2">
            Bill To
          </p>
          <p className="font-semibold">{company.name}</p>
          <p>{company.address}</p>
          <p>{company.city}</p>
        </div>

        {/* TABLE */}
        <div className="border-t border-b border-gray-300 py-3 mb-6 text-sm font-medium grid grid-cols-12">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-3 text-right">Amount</div>
        </div>

        {/* ROWS */}
        {[
          ["Basic Salary", data.salary],
          ["HRA", data.hra],
          ["Conveyance Allowance", data.conveyanceAllowance],
          ["Medical Allowance", data.medicalAllowance],
          ["Special Allowance", data.specialAllowance],
        ]
          .filter(([, v]) => Number(v) > 0)
          .map(([label, value], i) => (
            <div
              key={label}
              className="grid grid-cols-12 py-2 text-sm border-b last:border-b-0"
            >
              <div className="col-span-1">{i + 1}.</div>
              <div className="col-span-6">{label}</div>
              <div className="col-span-2 text-right">₹{n(value)}</div>
              <div className="col-span-3 text-right">₹{n(value)}</div>
            </div>
          ))}

        {/* TOTAL */}
        <div className="flex justify-end mt-10">
          <div className="w-[64mm] text-sm space-y-2">
            <div className="flex justify-between font-semibold text-lg border-t pt-4">
              <span>Total</span>
              <span>₹{n(calculations.netSalary)}</span>
            </div>
          </div>
        </div>

        {/* PAY TO */}
        <div className="mt-16 text-sm">
          <p className="uppercase tracking-wider text-xs text-gray-500 mb-2">
            Pay To
          </p>
          <p><span className="font-medium">Bank:</span> {data.bankAccount}</p>
          <p><span className="font-medium">Account Name:</span> {data.name}</p>
          <p><span className="font-medium">Account Number:</span> ********</p>
        </div>

        {/* FOOTER */}
        <div className="mt-14 text-xs text-gray-500">
          <p>{company.address}</p>
          <p>{company.email}</p>
        </div>
      </div>
    </div>
  );
};

export default TemplateCorporate;
