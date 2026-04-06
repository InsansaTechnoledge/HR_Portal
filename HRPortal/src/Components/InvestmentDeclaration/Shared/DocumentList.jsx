import React from 'react';
import { Button } from '../../ui/button';
import { FileText, FileImage, Eye, Download, X, Clock } from 'lucide-react';
import API_BASE_URL from '../../../config';

const DocumentList = ({ documents = [], isReadOnly, onRemove, declarationId, documentType }) => {
    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (!documents || documents.length === 0) return null;

    return (
        <div className="space-y-2 mt-3">
            {documents.map((doc, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50 group max-w-[500px]"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-background">
                            {doc.file?.type?.startsWith("image/") || (doc.filename && /\.(jpg|jpeg|png|gif)$/i.test(doc.filename)) ? (
                                <FileImage className="w-4 h-4 text-primary" />
                            ) : (
                                <FileText className="w-4 h-4 text-orange-500" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate max-w-fit">
                                {doc.name || doc.filename}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatFileSize(doc.size)}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        {doc._id ? (
                            <>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => window.open(`${API_BASE_URL}/api/investmentDeclaration/document/preview/${doc._id}`, "_blank")}
                                    className="h-8 w-8 text-primary hover:bg-primary/10"
                                    title="Preview"
                                >
                                    <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => window.open(`${API_BASE_URL}/api/investmentDeclaration/document/download/${doc._id}`, "_blank")}
                                    className="h-8 w-8 text-slate-500 hover:bg-slate-100"
                                    title="Download"
                                >
                                    <Download className="w-4 h-4" />
                                </Button>
                            </>
                        ) : (
                            declarationId && (
                                <div className="h-8 w-8 flex items-center justify-center text-amber-700" title="Pending upload after submit">
                                    <Clock className="w-4 h-4" />
                                </div>
                            )
                        )}
                        {!isReadOnly && onRemove && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemove(documentType, index)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DocumentList;
