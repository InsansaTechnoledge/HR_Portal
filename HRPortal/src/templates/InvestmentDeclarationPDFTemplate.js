import { jsPDF } from 'jspdf';

/**
 * Investment Declaration PDF Template (HTML-based)
 * 
 * Generates a detailed Investment Declaration PDF using HTML tables
 * for better formatting and styling control
 * 
 * @param {Object} declaration - The investment declaration object
 * @returns {jsPDF} PDF document object
 */
export const generateInvestmentDeclarationPDF = async (declaration) => {
    const doc = new jsPDF('p', 'mm', 'a4');

    // Helper functions
    const formatCurrency = (value) => {
        if (value === undefined || value === null || value === '') return '0.00';
        return Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString('en-IN') : 'N/A';
    };

    // Get form data with defaults
    const formData = declaration.formData || {};
    const exemptions = formData.exemptions || {};
    const hra = exemptions.houseRentAllowance || {};
    const lta = exemptions.lta || {};
    const ltaClaims = lta.claimsDetails || {};

    // Deductions extraction
    const sec80CDeductions = formData.section80CDeductions || [];
    const sec80CCDeduction = formData.section80CCDeduct || {};
    const sec80CCD1Deduction = formData.section80CCD1Deduct || {};
    const sec80CCD1BDeduction = formData.section80CCD1BDeduct || {};

    const sec80DDeductions = formData.section80DDeductions || {};
    const medInd = sec80DDeductions.medicalInsuranceIndividual || {};
    const medPar = sec80DDeductions.medicalInsuranceParents || {};
    const healthCheck = sec80DDeductions.preventiveHealthCheckup || {};

    const sec80EDeductive = formData.section80EDeduction || {};
    const sec80TTADeduction = formData.section80TTADeduction || {};
    const otherDeductions = formData.otherDeductions || {};

    const prevIncome = formData.previousEmploymentIncome || {};
    const otherSources = formData.incomeFromOtherSources || [];

    // Create HTML content
    const htmlContent = `
        <div style="font-family: 'Times New Roman', serif; padding: 10px; font-size: 10px; color: #000;">
            <!-- Header -->
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
                <h1 style="margin: 0; font-size: 16px;">FORM NO. 12BB</h1>
                <p style="margin: 2px 0; font-size: 10px;">(See rule 26C)</p>
                <h2 style="margin: 5px 0; font-size: 14px; text-decoration: underline;">Statement showing particulars of claims by an employee for deduction of tax under section 192</h2>
                <h3 style="margin: 5px 0; font-size: 12px;">FINANCIAL YEAR: ${declaration.financialYear || '2025-26'}</h3>
            </div>

            <!-- PART A: Employee Details -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                <tr>
                    <td style="border: 1px solid #000; padding: 4px; font-weight: bold; width: 25%;">Name of Employee</td>
                    <td style="border: 1px solid #000; padding: 4px; width: 25%;">${declaration.employeeName || ''}</td>
                    <td style="border: 1px solid #000; padding: 4px; font-weight: bold; width: 25%;">Employee Code</td>
                    <td style="border: 1px solid #000; padding: 4px; width: 25%;">${declaration.employeeId || ''}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">Designation</td>
                    <td style="border: 1px solid #000; padding: 4px;">${declaration.designation || ''}</td>
                    <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">Department</td>
                    <td style="border: 1px solid #000; padding: 4px;">${declaration.department || ''}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">PAN of Employee</td>
                    <td style="border: 1px solid #000; padding: 4px;">${formData.pan || ''}</td>
                    <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">Date of Joining</td>
                    <td style="border: 1px solid #000; padding: 4px;">${formatDate(declaration.dateOfJoining)}</td>
                </tr>
            </table>

            <!-- PART B: House Rent Allowance -->
            <h4 style="margin: 10px 0 5px 0; font-size: 11px; background: #f0f0f0; padding: 3px; border: 1px solid #000;">1. HOUSE RENT ALLOWANCE (Section 10(13A))</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                <tr>
                    <td style="border: 1px solid #000; padding: 4px; font-weight: bold; width: 40%;">Rent Paid to the Landlord</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: right; width: 20%; font-weight: bold;">₹ ${formatCurrency(hra.rentDetails?.rentPaid)}</td>
                    <td style="border: 1px solid #000; padding: 4px; font-weight: bold; width: 40%;">Landlord's PAN: ${hra.rentDetails?.landlordPAN || 'N/A'}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 4px;" colspan="3">Name and Address of Landlord: ${hra.rentDetails?.landlordName || 'N/A'}, ${hra.rentDetails?.landlordAddress || 'N/A'}</td>
                </tr>
            </table>

            <!-- LTA -->
            <h4 style="margin: 10px 0 5px 0; font-size: 11px; background: #f0f0f0; padding: 3px; border: 1px solid #000;">2. LEAVE TRAVEL CONCESSION OR ASSISTANCE (Section 10(5))</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                <tr style="text-align: center; font-weight: bold;">
                    <td style="border: 1px solid #000; padding: 4px;">Claim for 2022</td>
                    <td style="border: 1px solid #000; padding: 4px;">Claim for 2023</td>
                    <td style="border: 1px solid #000; padding: 4px;">Claim for 2024</td>
                    <td style="border: 1px solid #000; padding: 4px;">Claim for 2025</td>
                    <td style="border: 1px solid #000; padding: 4px;">Claim for 2026</td>
                </tr>
                <tr style="text-align: center;">
                    <td style="border: 1px solid #000; padding: 4px;">₹ ${formatCurrency(ltaClaims.claims2022)}</td>
                    <td style="border: 1px solid #000; padding: 4px;">₹ ${formatCurrency(ltaClaims.claims2023)}</td>
                    <td style="border: 1px solid #000; padding: 4px;">₹ ${formatCurrency(ltaClaims.claims2024)}</td>
                    <td style="border: 1px solid #000; padding: 4px;">₹ ${formatCurrency(ltaClaims.claims2025)}</td>
                    <td style="border: 1px solid #000; padding: 4px;">₹ ${formatCurrency(ltaClaims.claims2026)}</td>
                </tr>
            </table>

            <!-- PART C: Deductions under Chapter VI-A -->
            <h4 style="margin: 10px 0 5px 0; font-size: 11px; background: #f0f0f0; padding: 3px; border: 1px solid #000;">3. DEDUCTIONS UNDER CHAPTER VI-A</h4>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                <tr style="background: #e9e9e9; font-weight: bold;">
                    <td style="border: 1px solid #000; padding: 4px; width: 60%;">Nature of Claim (Section 80C)</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: right; width: 40%;">Amount (₹)</td>
                </tr>
                ${sec80CDeductions.length > 0 ? sec80CDeductions.map(item => `
                    <tr>
                        <td style="border: 1px solid #000; padding: 4px; padding-left: 20px;">${item.itemName}</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${formatCurrency(item.amount)}</td>
                    </tr>
                `).join('') : '<tr><td style="border: 1px solid #000; padding: 4px; padding-left: 20px;" colspan="2">No claims filed under Section 80C</td></tr>'}
                
                <!-- NPS & Pension Funds -->
                <tr>
                    <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">Contribution to Pension Funds (Section 80CCC)</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: right;">${formatCurrency(sec80CCDeduction.amount)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">Pension Scheme of Central Govt (Section 80CCD(1))</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: right;">${formatCurrency(sec80CCD1Deduction.amount)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">Additional NPS Contribution (Section 80CCD(1B))</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: right;">${formatCurrency(sec80CCD1BDeduction.amount)}</td>
                </tr>

                <!-- Section 80D -->
                <tr style="background: #e9e9e9; font-weight: bold;">
                    <td style="border: 1px solid #000; padding: 4px;">Health Insurance Premium (Section 80D)</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: right;">Amount (₹)</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 4px; padding-left: 20px;">Self, Spouse & Children ${medInd.isSenior ? '(Senior Citizen)' : ''}</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: right;">${formatCurrency(medInd.amount)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 4px; padding-left: 20px;">Parents ${medPar.isSenior ? '(Senior Citizen)' : ''}</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: right;">${formatCurrency(medPar.amount)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 4px; padding-left: 20px;">Preventive Health Check-up</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: right;">${formatCurrency(healthCheck.amount)}</td>
                </tr>

                <!-- Other VIA -->
                <tr style="background: #e9e9e9; font-weight: bold;">
                    <td style="border: 1px solid #000; padding: 4px;">Other Deductions</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: right;">Amount (₹)</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 4px; padding-left: 20px;">Interest on Education Loan (Section 80E)</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: right;">${formatCurrency(sec80EDeductive.amount)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 4px; padding-left: 20px;">Interest on Savings Account (Section 80TTA)</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: right;">${formatCurrency(sec80TTADeduction.amount)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 4px; padding-left: 20px;">Others: ${otherDeductions.description || '-'}</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: right;">${formatCurrency(otherDeductions.amount)}</td>
                </tr>
            </table>

            <!-- PART D: Previous Income & Other Sources -->
            <h4 style="margin: 10px 0 5px 0; font-size: 11px; background: #f0f0f0; padding: 3px; border: 1px solid #000;">4. INCOME FROM PREVIOUS EMPLOYMENT & OTHER SOURCES</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                <tr>
                    <td style="border: 1px solid #000; padding: 4px; width: 60%;">Income from Previous Employment (after exemptions)</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: right; width: 40%; font-weight: bold;">₹ ${formatCurrency(prevIncome.incomeAfterExemptions)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 4px;">TDS Deducted by Previous Employer</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: right;">₹ ${formatCurrency(prevIncome.tds)}</td>
                </tr>
                <tr style="background: #e9e9e9; font-weight: bold;">
                    <td style="border: 1px solid #000; padding: 4px;">Income from Other Sources</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: right;">Amount (₹)</td>
                </tr>
                ${otherSources.length > 0 ? otherSources.map(item => `
                    <tr>
                        <td style="border: 1px solid #000; padding: 4px; padding-left: 20px;">${item.description}</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${formatCurrency(item.amount)}</td>
                    </tr>
                `).join('') : '<tr><td style="border: 1px solid #000; padding: 4px; padding-left: 20px;" colspan="2">No other income declared</td></tr>'}
            </table>

            <!-- Declaration -->
            <div style="margin-top: 15px; border: 1px solid #000; padding: 8px;">
                <p style="font-weight: bold; margin-bottom: 5px;">DECLARATION:</p>
                <p style="margin: 0; line-height: 1.4;">I, ${declaration.employeeName}, son/daughter of ______________________, do hereby declare that what is stated above is true to the best of my knowledge and belief. I also undertake to provide any further information/evidence that may be required for the purpose of ensuring the correct deduction of tax.</p>
                
                <div style="margin-top: 20px; display: flex; justify-content: space-between;">
                    <div style="width: 45%;">
                        <p>Place: __________________</p>
                        <p>Date: ${formatDate(new Date())}</p>
                    </div>
                    <div style="width: 45%; text-align: right;">
                        <p style="margin-bottom: 25px;">______________________________</p>
                        <p style="font-weight: bold;">Signature of the Employee</p>
                    </div>
                </div>
            </div>

            <!-- Tax Slab Table -->
            <div style="margin-top: 15px; page-break-before: always;">
                <h4 style="text-align: center; text-decoration: underline;">FOR REFERENCE: TAX SLABS FOR FY 2025-26</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 8px; text-align: center;">
                    <tr style="background: #ddd; font-weight: bold;">
                        <td style="border: 1px solid #000; padding: 3px;">Income Bracket</td>
                        <td style="border: 1px solid #000; padding: 3px;">New Tax Scheme</td>
                        <td style="border: 1px solid #000; padding: 3px;">Old Tax Scheme</td>
                        <td style="border: 1px solid #000; padding: 3px;">Surcharge</td>
                        <td style="border: 1px solid #000; padding: 3px;">Health & Education Cess</td>
                    </tr>
                    <tr><td style="border: 1px solid #000; padding: 2px;">Up to ₹ 2,50,000</td><td style="border: 1px solid #000; padding: 2px;">NIL</td><td style="border: 1px solid #000; padding: 2px;">NIL</td><td style="border: 1px solid #000; padding: 2px;" rowspan="6">As applicable</td><td style="border: 1px solid #000; padding: 2px;" rowspan="6">4% on Tax+Surcharge</td></tr>
                    <tr><td style="border: 1px solid #000; padding: 2px;">₹ 2,50,001 - ₹ 5,00,000</td><td style="border: 1px solid #000; padding: 2px;">NIL (Up to 7L)</td><td style="border: 1px solid #000; padding: 2px;">5%</td></tr>
                    <tr><td style="border: 1px solid #000; padding: 2px;">₹ 5,00,001 - ₹ 7,50,000</td><td style="border: 1px solid #000; padding: 2px;">5%</td><td style="border: 1px solid #000; padding: 2px;">20%</td></tr>
                    <tr><td style="border: 1px solid #000; padding: 2px;">₹ 7,50,001 - ₹ 10,00,000</td><td style="border: 1px solid #000; padding: 2px;">10%</td><td style="border: 1px solid #000; padding: 2px;">20%</td></tr>
                    <tr><td style="border: 1px solid #000; padding: 2px;">₹ 10,00,001 - ₹ 12,00,000</td><td style="border: 1px solid #000; padding: 2px;">15%</td><td style="border: 1px solid #000; padding: 2px;">30%</td></tr>
                    <tr><td style="border: 1px solid #000; padding: 2px;">Above ₹ 15,00,000</td><td style="border: 1px solid #000; padding: 2px;">30%</td><td style="border: 1px solid #000; padding: 2px;">30%</td></tr>
                </table>
                <p style="font-size: 7px; font-style: italic; margin-top: 5px;">* Standard Deduction of ₹ 50,000 (Old) / ₹ 75,000 (New) is applicable for salaried individuals.</p>
            </div>
        </div>
    `;

    // Convert HTML to PDF
    // Note: doc.html requires windowWidth to be set for proper scaling
    await doc.html(htmlContent, {
        callback: function (doc) {
            // No action needed here, the caller will handle the document
        },
        x: 0,
        y: 0,
        width: 210, // A4 width in mm
        windowWidth: 700 // Scale window for rendering
    });

    return doc;
};

/**
 * Download Investment Declaration PDF
 * 
 * @param {Object} declaration - The investment declaration object
 * @param {string} filename - Optional custom filename (without extension)
 */
export const downloadForm12BB = async (declaration, filename) => {
    const doc = await generateInvestmentDeclarationPDF(declaration);
    const defaultFilename = `InvestmentDeclaration_${declaration.employeeName}_${declaration.financialYear}.pdf`;
    doc.save(filename ? `${filename}.pdf` : defaultFilename);
};

export default {
    generateInvestmentDeclarationPDF,
    downloadForm12BB
};
