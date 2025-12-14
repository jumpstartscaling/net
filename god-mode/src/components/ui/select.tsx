import * as React from "react"

const Select = ({ children, value, onValueChange }: any) => {
    return (
        <select
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            {children}
        </select>
    )
}

const SelectTrigger = ({ children, className }: any) => <>{children}</>
const SelectValue = ({ placeholder }: any) => <option value="">{placeholder}</option>
const SelectContent = ({ children, className }: any) => <>{children}</>
const SelectItem = ({ value, children }: any) => <option value={value}>{children}</option>

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
