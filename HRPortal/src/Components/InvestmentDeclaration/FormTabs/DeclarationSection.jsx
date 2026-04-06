import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Checkbox } from '../../ui/checkbox';
import { AlertCircle, Upload, Paperclip } from 'lucide-react';
import DocumentList from '../Shared/DocumentList';

const DeclarationSection = ({
    formData,
    isReadOnly,
    setFormData,
    handleDocumentUpload,
    removeDocument,
    declaration
}) => {
    return (
        <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    Declaration & Attestation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground italic">
                    "{formData.declaration.agreementText}"
                </p>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            disabled={isReadOnly}
                            id="declaration-agree"
                            checked={formData.declaration.isAgreed}
                            onCheckedChange={(checked) =>
                                setFormData(prev => ({
                                    ...prev,
                                    declaration: { ...prev.declaration, isAgreed: checked }
                                }))
                            }
                        />
                        <label htmlFor="declaration-agree" className="text-sm font-semibold cursor-pointer">
                            I confirm and agree to the above declaration
                        </label>
                    </div>
                    <div className="flex-1">
                        <label className="text-sm font-semibold mb-2 block">Employee Signature (Type Full Name)</label>
                        <Input
                            disabled={isReadOnly}
                            placeholder="Enter your full name as signature"
                            value={formData.declaration.employeeSignature}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    declaration: { ...prev.declaration, employeeSignature: e.target.value }
                                }))
                            }
                            className="bg-white border-primary/20"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-primary/20">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-primary" />
                            Upload Signed Declaration
                        </h4>
                        {!isReadOnly && (
                            <label className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg cursor-pointer transition-colors border border-primary/20 group">
                                <Upload className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-medium">Upload File</span>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => handleDocumentUpload('declarationDocuments', e.target.files)}
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                />
                            </label>
                        )}
                    </div>
                    <DocumentList
                        documents={formData.declarationDocuments}
                        isReadOnly={isReadOnly}
                        onRemove={removeDocument}
                        declarationId={declaration?._id}
                        documentType="declarationDocuments"
                    />
                    <p className="text-xs text-muted-foreground mt-2 italic">
                        Tip: You can upload a signed copy of this declaration for record-keeping.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default DeclarationSection;
