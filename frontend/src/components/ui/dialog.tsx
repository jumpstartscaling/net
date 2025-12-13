import * as React from "react"

const Dialog = ({ open, onOpenChange, children }: any) => {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
            <div className="relative z-50">{children}</div>
        </div>
    )
}

const DialogContent = ({ children, className }: any) => (
    <div className={`bg-slate-800 rounded-lg shadow-lg max-w-lg w-full p-6 ${className}`}>
        {children}
    </div>
)

const DialogHeader = ({ children }: any) => <div className="mb-4">{children}</div>
const DialogTitle = ({ children, className }: any) => <h2 className={`text-xl font-bold ${className}`}>{children}</h2>
const DialogDescription = ({ children, className }: any) => <p className={`text-sm text-slate-400 ${className}`}>{children}</p>
const DialogFooter = ({ children }: any) => <div className="mt-6 flex justify-end gap-2">{children}</div>

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
