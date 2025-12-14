import * as React from "react"

const AlertDialog = ({ open, onOpenChange, children }: any) => {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
            <div className="relative z-50">{children}</div>
        </div>
    )
}

const AlertDialogContent = ({ children, className }: any) => (
    <div className={`bg-slate-800 rounded-lg shadow-lg max-w-md w-full p-6 ${className}`}>
        {children}
    </div>
)

const AlertDialogHeader = ({ children }: any) => <div className="mb-4">{children}</div>
const AlertDialogTitle = ({ children, className }: any) => <h2 className={`text-xl font-bold ${className}`}>{children}</h2>
const AlertDialogDescription = ({ children, className }: any) => <p className={`text-sm text-slate-400 ${className}`}>{children}</p>
const AlertDialogFooter = ({ children }: any) => <div className="mt-6 flex justify-end gap-2">{children}</div>
const AlertDialogAction = ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded ${className}`}>
        {children}
    </button>
)
const AlertDialogCancel = ({ children, disabled, className }: any) => (
    <button disabled={disabled} className={`px-4 py-2 rounded ${className}`}>
        {children}
    </button>
)

export {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
}
