import * as React from "react"

const Dialog = ({ open, onOpenChange, children }: any) => {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
            <div className="relative z-50 animate-in fade-in zoom-in-95 duration-200">{children}</div>
        </div>
    )
}

const DialogTrigger = ({ children, asChild, onClick, ...props }: any) => {
    // This is a simplified trigger that just renders children.
    // In a real implementation (Radix UI), this controls the dialog state.
    // For now, we rely on the parent controlling 'open' state.
    return <div onClick={onClick} {...props}>{children}</div>
}

const DialogContent = ({ children, className }: any) => (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl max-w-lg w-full p-6 ${className}`}>
        {children}
    </div>
)

const DialogHeader = ({ children }: any) => <div className="mb-4 text-left">{children}</div>
const DialogTitle = ({ children, className }: any) => <h2 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 ${className}`}>{children}</h2>
const DialogDescription = ({ children, className }: any) => <p className={`text-sm text-zinc-400 ${className}`}>{children}</p>
const DialogFooter = ({ children }: any) => <div className="mt-6 flex justify-end gap-2">{children}</div>

export { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
