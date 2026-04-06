import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';

const PreviousIncomeTab = ({
    formData,
    isReadOnly,
    handleNestedChange,
    handleInputChange
}) => {
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Income from Previous Employment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold">Income after Exemptions (Rs.)</label>
                        <Input
                            disabled={isReadOnly}
                            type="number"
                            value={formData.previousEmploymentIncome.incomeAfterExemptions}
                            onChange={(e) =>
                                handleNestedChange('previousEmploymentIncome', 'incomeAfterExemptions', e.target.value)
                            }
                            placeholder="Enter income amount"
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold">Provident Fund (PF) (Rs.)</label>
                        <Input
                            disabled={isReadOnly}
                            type="number"
                            value={formData.previousEmploymentIncome.providentFund}
                            onChange={(e) =>
                                handleNestedChange('previousEmploymentIncome', 'providentFund', e.target.value)
                            }
                            placeholder="Enter PF amount"
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold">Professional Tax (PT) (Rs.)</label>
                        <Input
                            disabled={isReadOnly}
                            type="number"
                            value={formData.previousEmploymentIncome.professionalTax}
                            onChange={(e) =>
                                handleNestedChange('previousEmploymentIncome', 'professionalTax', e.target.value)
                            }
                            placeholder="Enter PT amount"
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold">Tax Deducted At Source (TDS) (Rs.)</label>
                        <Input
                            disabled={isReadOnly}
                            type="number"
                            value={formData.previousEmploymentIncome.tds}
                            onChange={(e) =>
                                handleNestedChange('previousEmploymentIncome', 'tds', e.target.value)
                            }
                            placeholder="Enter TDS amount"
                            className="mt-2"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Income from Other Sources */}
            <Card>
                <CardHeader>
                    <CardTitle>Income From Other Sources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        {(formData.incomeFromOtherSources || []).map((source, index) => (
                            <div key={index} className="flex gap-2 bg-gray-50 p-3 rounded">
                                <Input
                                    disabled={isReadOnly}
                                    placeholder="Description (e.g. Interest, Rental)"
                                    value={source.description}
                                    onChange={(e) => {
                                        const updated = [...formData.incomeFromOtherSources];
                                        updated[index].description = e.target.value;
                                        handleInputChange('incomeFromOtherSources', updated);
                                    }}
                                    className="flex-1"
                                />
                                <Input
                                    disabled={isReadOnly}
                                    type="number"
                                    placeholder="Amount"
                                    value={source.amount}
                                    onChange={(e) => {
                                        const updated = [...formData.incomeFromOtherSources];
                                        updated[index].amount = e.target.value;
                                        handleInputChange('incomeFromOtherSources', updated);
                                    }}
                                    className="w-32"
                                />
                                {!isReadOnly && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            const updated = formData.incomeFromOtherSources.filter((_, i) => i !== index);
                                            handleInputChange('incomeFromOtherSources', updated);
                                        }}
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
                            onClick={() => {
                                const updated = [...(formData.incomeFromOtherSources || []), { description: '', amount: '' }];
                                handleInputChange('incomeFromOtherSources', updated);
                            }}
                            className="w-full"
                        >
                            + Add Other Source
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PreviousIncomeTab;
