import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Checkbox } from '../../ui/checkbox';
import { ChevronDown, Upload, Paperclip } from 'lucide-react';
import DocumentList from '../Shared/DocumentList';

const DeductionsTab = ({
    formData,
    isReadOnly,
    handleHousingLoanAdd,
    handleHousingLoanUpdate,
    handleHousingLoanRemove,
    handleSection80CAdd,
    handleSection80CUpdate,
    handleSection80CRemove,
    setFormData,
    handleDocumentUpload,
    removeDocument,
    declaration
}) => {
    return (
        <div className="space-y-4">
            {/* Section 24 - Housing Loan */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Deduction u/s 24 - Interest on Housing Loan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        {formData.housingLoanDeductions.map((loan, index) => (
                            <div key={index} className="space-y-4 bg-gray-50 p-4 rounded border border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                                        <div>
                                            <label className="text-sm font-semibold">Property Type</label>
                                            <div className='relative'>
                                                <Select
                                                    disabled={isReadOnly}
                                                    value={loan.type}
                                                    onValueChange={(value) => handleHousingLoanUpdate(index, 'type', value)}
                                                >
                                                    <SelectTrigger className="mt-2 text-sm w-full">
                                                        <SelectValue placeholder="Select Property Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Pre-1999 Self-Occupied">Pre-1999 Self-Occupied</SelectItem>
                                                        <SelectItem value="Post-1999 Self-Occupied">Post-1999 Self-Occupied</SelectItem>
                                                        <SelectItem value="Let-out Property">Let-out Property</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none mt-1" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold">Interest Amount (Rs.)</label>
                                            <Input
                                                disabled={isReadOnly}
                                                type="number"
                                                placeholder="Enter interest amount"
                                                value={loan.amount}
                                                onChange={(e) => handleHousingLoanUpdate(index, 'amount', e.target.value)}
                                                className="mt-2"
                                            />
                                        </div>
                                        {loan.type === 'Let-out Property' && (
                                            <div>
                                                <label className="text-sm font-semibold">Net Rental Income (Rs.)</label>
                                                <Input
                                                    disabled={isReadOnly}
                                                    type="number"
                                                    placeholder="Enter rental income"
                                                    value={loan.rentalIncome}
                                                    onChange={(e) => handleHousingLoanUpdate(index, 'rentalIncome', e.target.value)}
                                                    className="mt-2"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-sm font-semibold">Maximum Eligible Limit</label>
                                            <div className="mt-2 p-2 bg-white border rounded text-sm text-muted-foreground">
                                                {loan.maxLimit}
                                            </div>
                                        </div>
                                    </div>
                                    {!isReadOnly && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleHousingLoanRemove(index)}
                                            className="ml-4"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {!isReadOnly && (
                        <Button
                            variant="outline"
                            onClick={handleHousingLoanAdd}
                            className="w-full"
                        >
                            + Add Housing Loan Deduction
                        </Button>
                    )}

                    {/* Housing Loan Documents */}
                    <div className="border-t pt-4 mt-4">
                        <label className="block text-sm font-semibold mb-3">Upload Housing Loan Banker's Certificates</label>
                        {!isReadOnly && (
                            <div className="flex items-center gap-3 mb-3">
                                <label className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/50 rounded-md cursor-pointer hover:bg-primary/20 transition">
                                    <Upload className="w-4 h-4" />
                                    <span className="text-sm">Choose Files</span>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => handleDocumentUpload('housingLoanDocuments', e.target.files)}
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    />
                                </label>
                            </div>
                        )}
                        <DocumentList
                            documents={formData.housingLoanDocuments}
                            isReadOnly={isReadOnly}
                            onRemove={removeDocument}
                            declarationId={declaration?._id}
                            documentType="housingLoanDocuments"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Section 80C */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Deduction u/s 80C (Max: Rs. 150,000)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        {formData.section80CDeductions.map((deduction, index) => (
                            <div key={index} className="flex gap-2 bg-gray-50 p-3 rounded">
                                <div className='relative w-full'>
                                    <Select
                                        disabled={isReadOnly}
                                        value={deduction.itemName}
                                        onValueChange={(value) => handleSection80CUpdate(index, 'itemName', value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select deduction item" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Life Insurance Premium (LIC)">Life Insurance Premium (LIC)</SelectItem>
                                            <SelectItem value="Provident Fund (PF)">Provident Fund (PF)</SelectItem>
                                            <SelectItem value="Public Provident Fund (PPF)">Public Provident Fund (PPF)</SelectItem>
                                            <SelectItem value="Voluntary Provident Fund (VPF)">Voluntary Provident Fund (VPF)</SelectItem>
                                            <SelectItem value="National Savings Certificate (NSC)">National Savings Certificate (NSC)</SelectItem>
                                            <SelectItem value="Interest accrued on NSC (Re-invested)">Interest accrued on NSC (Re-invested)</SelectItem>
                                            <SelectItem value="ULIP - Unit Linked Insurance Policy">ULIP - Unit Linked Insurance Policy</SelectItem>
                                            <SelectItem value="ELSS - Equity Linked Savings Scheme">ELSS - Equity Linked Savings Scheme</SelectItem>
                                            <SelectItem value="Tuition Fees for Children (Max 2)">Tuition Fees for Children (Max 2)</SelectItem>
                                            <SelectItem value="Principal Repayment of Housing Loan">Principal Repayment of Housing Loan</SelectItem>
                                            <SelectItem value="Stamp Duty & Registration (1st year only)">Stamp Duty & Registration (1st year only)</SelectItem>
                                            <SelectItem value="Infrastructure Bonds">Infrastructure Bonds</SelectItem>
                                            <SelectItem value="Bank FD (5+ years)">Bank FD (5+ years)</SelectItem>
                                            <SelectItem value="Post Office TD (5+ years)">Post Office TD (5+ years)</SelectItem>
                                            <SelectItem value="Senior Citizen Savings Scheme">Senior Citizen Savings Scheme</SelectItem>
                                            <SelectItem value="Sukanya Samriddhi Account">Sukanya Samriddhi Account</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                                </div>
                                <Input
                                    disabled={isReadOnly}
                                    type="number"
                                    placeholder="Amount"
                                    value={deduction.amount}
                                    onChange={(e) => handleSection80CUpdate(index, 'amount', e.target.value)}
                                    className="w-32"
                                />
                                {!isReadOnly && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleSection80CRemove(index)}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    {!isReadOnly && (
                        <Button
                            variant="outline"
                            onClick={handleSection80CAdd}
                            className="w-full"
                        >
                            + Add Deduction Item
                        </Button>
                    )}

                    <div className="bg-primary/10 p-3 rounded border border-primary/50 text-muted-foreground">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Total Amount (Max 150,000):</span>
                            <span className="text-lg font-bold text-primary">Rs. {(formData.section80CTotal ? Number(formData.section80CTotal).toFixed(2) : "0.00")}</span>
                        </div>
                    </div>

                    {/* Section 80C Documents */}
                    <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-primary" />
                                Upload Section 80C Documents
                            </h4>
                            {!isReadOnly && (
                                <label className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg cursor-pointer transition-colors border border-primary/20 group">
                                    <Upload className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-medium">Upload Documents</span>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => handleDocumentUpload('section80CDocuments', e.target.files)}
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    />
                                </label>
                            )}
                        </div>
                        <DocumentList
                            documents={formData.section80CDocuments}
                            isReadOnly={isReadOnly}
                            onRemove={removeDocument}
                            declarationId={declaration?._id}
                            documentType="section80CDocuments"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Pension Funds & NPS */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Pension Funds & NPS Contributions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Section 80CCC */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                disabled={isReadOnly}
                                checked={formData.section80CCDeduction.isApplicable}
                                onCheckedChange={(checked) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        section80CCDeduction: { ...prev.section80CCDeduction, isApplicable: checked }
                                    }))
                                }
                            />
                            <label className="text-sm font-medium">u/s 80CCC - Contribution to Pension Funds (Max 1.5L, shared with 80C)</label>
                        </div>
                        {formData.section80CCDeduction.isApplicable && (
                            <Input
                                disabled={isReadOnly}
                                type="number"
                                placeholder="Enter amount"
                                value={formData.section80CCDeduction.amount}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        section80CCDeduction: { ...prev.section80CCDeduction, amount: e.target.value }
                                    }));
                                }}
                                className="ml-6"
                            />
                        )}
                    </div>

                    {/* Section 80CCD(1) */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                disabled={isReadOnly}
                                checked={formData.section80CCD1Deduction.isApplicable}
                                onCheckedChange={(checked) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        section80CCD1Deduction: { ...prev.section80CCD1Deduction, isApplicable: checked }
                                    }))
                                }
                            />
                            <label className="text-sm font-medium">u/s 80CCD(1) - Pension Scheme of Central Govt (Max 1.5L, shared with 80C)</label>
                        </div>
                        {formData.section80CCD1Deduction.isApplicable && (
                            <Input
                                disabled={isReadOnly}
                                type="number"
                                placeholder="Enter amount"
                                value={formData.section80CCD1Deduction.amount}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        section80CCD1Deduction: { ...prev.section80CCD1Deduction, amount: e.target.value }
                                    }));
                                }}
                                className="ml-6"
                            />
                        )}
                    </div>

                    {/* Section 80CCD(1B) */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                disabled={isReadOnly}
                                checked={formData.section80CCD1BDeduction.isApplicable}
                                onCheckedChange={(checked) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        section80CCD1BDeduction: { ...prev.section80CCD1BDeduction, isApplicable: checked }
                                    }))
                                }
                            />
                            <label className="text-sm font-medium">u/s 80CCD(1B) - Additional NPS Contribution (Max Rs. 50,000/-)</label>
                        </div>
                        {formData.section80CCD1BDeduction.isApplicable && (
                            <Input
                                disabled={isReadOnly}
                                type="number"
                                placeholder="Enter amount"
                                value={formData.section80CCD1BDeduction.amount}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        section80CCD1BDeduction: { ...prev.section80CCD1BDeduction, amount: e.target.value }
                                    }))
                                }
                                className="ml-6"
                            />
                        )}
                    </div>

                    {/* NPS Documents */}
                    <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-primary" />
                                Upload Pension/NPS Proofs
                            </h4>
                            {!isReadOnly && (
                                <label className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg cursor-pointer transition-colors border border-primary/20 group">
                                    <Upload className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-medium">Upload Proofs</span>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => handleDocumentUpload('section80CCDDocuments', e.target.files)}
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    />
                                </label>
                            )}
                        </div>
                        <DocumentList
                            documents={formData.section80CCDDocuments}
                            isReadOnly={isReadOnly}
                            onRemove={removeDocument}
                            declarationId={declaration?._id}
                            documentType="section80CCDDocuments"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Section 80D - Medical Insurance */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Deduction u/s 80D - Medical Insurance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex items-center space-x-2 mb-3">
                            <Checkbox
                                disabled={isReadOnly}
                                checked={formData.section80DDeductions.medicalInsuranceIndividual.isApplicable}
                                onCheckedChange={(checked) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        section80DDeductions: {
                                            ...prev.section80DDeductions,
                                            medicalInsuranceIndividual: {
                                                ...prev.section80DDeductions.medicalInsuranceIndividual,
                                                isApplicable: checked
                                            }
                                        }
                                    }))
                                }
                            />
                            <label className="text-sm font-medium">Medical Insurance - Individual, Spouse & Children</label>
                        </div>
                        {formData.section80DDeductions.medicalInsuranceIndividual.isApplicable && (
                            <div className="ml-6 space-y-3">
                                <Input
                                    disabled={isReadOnly}
                                    type="number"
                                    placeholder="Enter amount (Max: Rs. 25,000 + 25,000 if Senior Citizen)"
                                    value={formData.section80DDeductions.medicalInsuranceIndividual.amount}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            section80DDeductions: {
                                                ...prev.section80DDeductions,
                                                medicalInsuranceIndividual: {
                                                    ...prev.section80DDeductions.medicalInsuranceIndividual,
                                                    amount: e.target.value
                                                }
                                            }
                                        }))
                                    }
                                />
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        disabled={isReadOnly}
                                        checked={formData.section80DDeductions.medicalInsuranceIndividual.isSenior}
                                        onCheckedChange={(checked) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                section80DDeductions: {
                                                    ...prev.section80DDeductions,
                                                    medicalInsuranceIndividual: {
                                                        ...prev.section80DDeductions.medicalInsuranceIndividual,
                                                        isSenior: checked
                                                    }
                                                }
                                            }))
                                        }
                                    />
                                    <label className="text-xs font-medium">Is Senior Citizen?</label>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center space-x-2 mb-3">
                            <Checkbox
                                disabled={isReadOnly}
                                checked={formData.section80DDeductions.medicalInsuranceParents.isApplicable}
                                onCheckedChange={(checked) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        section80DDeductions: {
                                            ...prev.section80DDeductions,
                                            medicalInsuranceParents: {
                                                ...prev.section80DDeductions.medicalInsuranceParents,
                                                isApplicable: checked
                                            }
                                        }
                                    }))
                                }
                            />
                            <label className="text-sm font-medium">Medical Insurance - Parents</label>
                        </div>
                        {formData.section80DDeductions.medicalInsuranceParents.isApplicable && (
                            <div className="ml-6 space-y-3">
                                <Input
                                    disabled={isReadOnly}
                                    type="number"
                                    placeholder="Enter amount (Max: Rs. 25,000 + 25,000 if Senior Citizen)"
                                    value={formData.section80DDeductions.medicalInsuranceParents.amount}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            section80DDeductions: {
                                                ...prev.section80DDeductions,
                                                medicalInsuranceParents: {
                                                    ...prev.section80DDeductions.medicalInsuranceParents,
                                                    amount: e.target.value
                                                }
                                            }
                                        }))
                                    }
                                />
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        disabled={isReadOnly}
                                        checked={formData.section80DDeductions.medicalInsuranceParents.isSenior}
                                        onCheckedChange={(checked) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                section80DDeductions: {
                                                    ...prev.section80DDeductions,
                                                    medicalInsuranceParents: {
                                                        ...prev.section80DDeductions.medicalInsuranceParents,
                                                        isSenior: checked
                                                    }
                                                }
                                            }))
                                        }
                                    />
                                    <label className="text-xs font-medium">Is Senior Citizen?</label>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center space-x-2 mb-3">
                            <Checkbox
                                disabled={isReadOnly}
                                checked={formData.section80DDeductions.preventiveHealthCheckup.isApplicable}
                                onCheckedChange={(checked) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        section80DDeductions: {
                                            ...prev.section80DDeductions,
                                            preventiveHealthCheckup: {
                                                ...prev.section80DDeductions.preventiveHealthCheckup,
                                                isApplicable: checked
                                            }
                                        }
                                    }))
                                }
                            />
                            <label className="text-sm font-medium">Preventive Health Check-up</label>
                        </div>
                        {formData.section80DDeductions.preventiveHealthCheckup.isApplicable && (
                            <Input
                                disabled={isReadOnly}
                                type="number"
                                placeholder="Enter amount (Max: Rs. 5,000)"
                                value={formData.section80DDeductions.preventiveHealthCheckup.amount}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        section80DDeductions: {
                                            ...prev.section80DDeductions,
                                            preventiveHealthCheckup: {
                                                ...prev.section80DDeductions.preventiveHealthCheckup,
                                                amount: e.target.value
                                            }
                                        }
                                    }))
                                }
                                className="ml-6"
                            />
                        )}
                    </div>

                    <div className="pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-primary" />
                                Medical Insurance Proofs
                            </h4>
                            {!isReadOnly && (
                                <label className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg cursor-pointer transition-colors border border-primary/20 group">
                                    <Upload className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-medium">Upload Proofs</span>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => handleDocumentUpload('section80DDocuments', e.target.files)}
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    />
                                </label>
                            )}
                        </div>
                        <DocumentList
                            documents={formData.section80DDocuments}
                            isReadOnly={isReadOnly}
                            onRemove={removeDocument}
                            declarationId={declaration?._id}
                            documentType="section80DDocuments"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Section 80E - Education Loan Interest */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Deduction u/s 80E - Interest on Education Loan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 mb-3">
                        <Checkbox
                            disabled={isReadOnly}
                            checked={formData.section80EDeduction.isApplicable}
                            onCheckedChange={(checked) =>
                                setFormData(prev => ({
                                    ...prev,
                                    section80EDeduction: {
                                        ...prev.section80EDeduction,
                                        isApplicable: checked
                                    }
                                }))
                            }
                        />
                        <label className="text-sm font-medium">Claim Interest on Education Loan Deduction</label>
                    </div>
                    {formData.section80EDeduction.isApplicable && (
                        <Input
                            disabled={isReadOnly}
                            type="number"
                            placeholder="Enter interest amount (No limit)"
                            value={formData.section80EDeduction.amount}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    section80EDeduction: {
                                        ...prev.section80EDeduction,
                                        amount: e.target.value
                                    }
                                }))
                            }
                        />
                    )}
                </CardContent>
            </Card>

            {/* Section 80TTA - Savings Account Interest */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Deduction u/s 80TTA - Interest on Savings Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 mb-3">
                        <Checkbox
                            disabled={isReadOnly}
                            checked={formData.section80TTADeduction.isApplicable}
                            onCheckedChange={(checked) =>
                                setFormData(prev => ({
                                    ...prev,
                                    section80TTADeduction: {
                                        ...prev.section80TTADeduction,
                                        isApplicable: checked
                                    }
                                }))
                            }
                        />
                        <label className="text-sm font-medium">Claim Savings Account Interest Deduction</label>
                    </div>
                    {formData.section80TTADeduction.isApplicable && (
                        <Input
                            disabled={isReadOnly}
                            type="number"
                            placeholder="Enter interest amount (Max: Rs. 10,000)"
                            value={formData.section80TTADeduction.amount}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    section80TTADeduction: {
                                        ...prev.section80TTADeduction,
                                        amount: e.target.value
                                    }
                                }))
                            }
                        />
                    )}
                </CardContent>
            </Card>

            {/* Other Deductions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Other Deductions / Tax Reliefs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold">Description</label>
                            <Input
                                disabled={isReadOnly}
                                placeholder="Enter description"
                                value={formData.otherDeductions?.description}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        otherDeductions: { ...prev.otherDeductions, description: e.target.value }
                                    }))
                                }
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Amount (Rs.)</label>
                            <Input
                                disabled={isReadOnly}
                                type="number"
                                placeholder="Enter amount"
                                value={formData.otherDeductions?.amount}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        otherDeductions: { ...prev.otherDeductions, amount: e.target.value }
                                    }))
                                }
                                className="mt-2"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DeductionsTab;
