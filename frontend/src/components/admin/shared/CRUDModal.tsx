import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CRUDModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    onSubmit: () => void;
    isSubmitting?: boolean;
    children: React.ReactNode;
    submitText?: string;
    cancelText?: string;
}

export function CRUDModal({
    isOpen,
    onClose,
    title,
    description,
    onSubmit,
    isSubmitting = false,
    children,
    submitText = 'Save',
    cancelText = 'Cancel',
}: CRUDModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-slate-400">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="py-4">{children}</div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving...
                            </span>
                        ) : (
                            submitText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
