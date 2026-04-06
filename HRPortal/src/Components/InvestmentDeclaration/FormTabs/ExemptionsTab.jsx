import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Checkbox } from '../../ui/checkbox';
import { Upload } from 'lucide-react';
import DocumentList from '../Shared/DocumentList';

const ExemptionsTab = ({
    formData,
    isReadOnly,
    handleDeepNestedChange,
    handleDocumentUpload,
    removeDocument,
    declaration
}) => {
    return (
        <div className="space-y-4">
            {/* House Rent Allowance */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Exemption u/s 10 - House Rent Allowance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            disabled={isReadOnly}
                            checked={formData.exemptions.houseRentAllowance.isApplicable}
                            onCheckedChange={(checked) =>
                                handleDeepNestedChange('exemptions', 'houseRentAllowance', 'isApplicable', checked)
                            }
                        />
                        <label className="text-sm font-medium">Claim HRA Exemption</label>
                    </div>

                    {formData.exemptions.houseRentAllowance.isApplicable && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                            <div>
                                <label className="text-sm font-semibold">Rent Paid (Rs.)</label>
                                <Input
                                    disabled={isReadOnly}
                                    type="number"
                                    value={formData.exemptions.houseRentAllowance.rentDetails.rentPaid}
                                    onChange={(e) =>
                                        handleDeepNestedChange('exemptions', 'houseRentAllowance', 'rentDetails', {
                                            ...formData.exemptions.houseRentAllowance.rentDetails,
                                            rentPaid: e.target.value
                                        })
                                    }
                                    placeholder="Enter rent amount"
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold">Number of Months</label>
                                <Input
                                    disabled={isReadOnly}
                                    type="number"
                                    value={formData.exemptions.houseRentAllowance.rentDetails.months}
                                    onChange={(e) =>
                                        handleDeepNestedChange('exemptions', 'houseRentAllowance', 'rentDetails', {
                                            ...formData.exemptions.houseRentAllowance.rentDetails,
                                            months: e.target.value
                                        })
                                    }
                                    placeholder="Number of months"
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold">Landlord PAN</label>
                                <Input
                                    disabled={isReadOnly}
                                    value={formData.exemptions.houseRentAllowance.rentDetails.landlordPAN}
                                    onChange={(e) =>
                                        handleDeepNestedChange('exemptions', 'houseRentAllowance', 'rentDetails', {
                                            ...formData.exemptions.houseRentAllowance.rentDetails,
                                            landlordPAN: e.target.value
                                        })
                                    }
                                    placeholder="PAN of Landlord (if rent > 1 lac)"
                                    className="mt-2"
                                />
                            </div>
                            <div></div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    disabled={isReadOnly}
                                    checked={formData.exemptions.houseRentAllowance.rentDetails.hasRentReceipt}
                                    onCheckedChange={(checked) =>
                                        handleDeepNestedChange('exemptions', 'houseRentAllowance', 'rentDetails', {
                                            ...formData.exemptions.houseRentAllowance.rentDetails,
                                            hasRentReceipt: checked
                                        })
                                    }
                                />
                                <label className="text-sm font-medium">I have rent receipts/agreement</label>
                            </div>

                            {formData.exemptions.houseRentAllowance.rentDetails.hasRentReceipt && (
                                <div className="border-t pt-4 mt-4">
                                    <label className="block text-sm font-semibold mb-3">Upload HRA Receipts & Agreements</label>
                                    {!isReadOnly && (
                                        <div className="flex items-center gap-3 mb-3">
                                            <label className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/50 rounded-md cursor-pointer hover:bg-primary/20 transition">
                                                <Upload className="w-4 h-4" />
                                                <span className="text-sm">Choose Files</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={(e) => handleDocumentUpload('hraDocuments', e.target.files)}
                                                    className="hidden"
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                />
                                            </label>
                                        </div>
                                    )}
                                    <DocumentList
                                        documents={formData.hraDocuments}
                                        isReadOnly={isReadOnly}
                                        onRemove={removeDocument}
                                        declarationId={declaration?._id}
                                        documentType="hraDocuments"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* LTA */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Exemption u/s 10 - Leave Travel Allowance (LTA)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            disabled={isReadOnly}
                            checked={formData.exemptions.lta.isApplicable}
                            onCheckedChange={(checked) =>
                                handleDeepNestedChange('exemptions', 'lta', 'isApplicable', checked)
                            }
                        />
                        <label className="text-sm font-medium">Claim LTA Exemption</label>
                    </div>

                    {formData.exemptions.lta.isApplicable && (
                        <div className="space-y-4 bg-gray-50 p-4 rounded">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold">Claim Amount 2022</label>
                                    <Input
                                        disabled={isReadOnly}
                                        type="number"
                                        value={formData.exemptions.lta.claimsDetails.claims2022}
                                        onChange={(e) =>
                                            handleDeepNestedChange('exemptions', 'lta', 'claimsDetails', {
                                                ...formData.exemptions.lta.claimsDetails,
                                                claims2022: e.target.value
                                            })
                                        }
                                        placeholder="Amount for 2022"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Claim Amount 2023</label>
                                    <Input
                                        disabled={isReadOnly}
                                        type="number"
                                        value={formData.exemptions.lta.claimsDetails.claims2023}
                                        onChange={(e) =>
                                            handleDeepNestedChange('exemptions', 'lta', 'claimsDetails', {
                                                ...formData.exemptions.lta.claimsDetails,
                                                claims2023: e.target.value
                                            })
                                        }
                                        placeholder="Amount for 2023"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Claim Amount 2024</label>
                                    <Input
                                        disabled={isReadOnly}
                                        type="number"
                                        value={formData.exemptions.lta.claimsDetails.claims2024}
                                        onChange={(e) =>
                                            handleDeepNestedChange('exemptions', 'lta', 'claimsDetails', {
                                                ...formData.exemptions.lta.claimsDetails,
                                                claims2024: e.target.value
                                            })
                                        }
                                        placeholder="Amount for 2024"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Claim Amount 2025</label>
                                    <Input
                                        disabled={isReadOnly}
                                        type="number"
                                        value={formData.exemptions.lta.claimsDetails.claims2025}
                                        onChange={(e) =>
                                            handleDeepNestedChange('exemptions', 'lta', 'claimsDetails', {
                                                ...formData.exemptions.lta.claimsDetails,
                                                claims2025: e.target.value
                                            })
                                        }
                                        placeholder="Amount for 2025"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Claim Amount 2026</label>
                                    <Input
                                        disabled={isReadOnly}
                                        type="number"
                                        value={formData.exemptions.lta.claimsDetails.claims2026}
                                        onChange={(e) =>
                                            handleDeepNestedChange('exemptions', 'lta', 'claimsDetails', {
                                                ...formData.exemptions.lta.claimsDetails,
                                                claims2026: e.target.value
                                            })
                                        }
                                        placeholder="Amount for 2026"
                                        className="mt-2"
                                    />
                                </div>
                                <div></div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        disabled={isReadOnly}
                                        checked={formData.exemptions.lta.claimsDetails.willingToProduceBills === 'Yes'}
                                        onCheckedChange={(checked) =>
                                            handleDeepNestedChange('exemptions', 'lta', 'claimsDetails', {
                                                ...formData.exemptions.lta.claimsDetails,
                                                willingToProduceBills: checked ? 'Yes' : 'No'
                                            })
                                        }
                                    />
                                    <label className="text-sm font-medium">I agree to produce bills for verification</label>
                                </div>

                                {formData.exemptions.lta.claimsDetails.willingToProduceBills === 'Yes' && (
                                    <div className="border-t pt-4 mt-4">
                                        <label className="block text-sm font-semibold mb-3">Upload LTA Bills & Documents</label>
                                        {!isReadOnly && (
                                            <div className="flex items-center gap-3 mb-3">
                                                <label className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/50 rounded-md cursor-pointer hover:bg-primary/20 transition">
                                                    <Upload className="w-4 h-4" />
                                                    <span className="text-sm">Choose Files</span>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        onChange={(e) => handleDocumentUpload('ltaDocuments', e.target.files)}
                                                        className="hidden"
                                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                    />
                                                </label>
                                            </div>
                                        )}
                                        <DocumentList
                                            documents={formData.ltaDocuments}
                                            isReadOnly={isReadOnly}
                                            onRemove={removeDocument}
                                            declarationId={declaration?._id}
                                            documentType="ltaDocuments"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ExemptionsTab;
