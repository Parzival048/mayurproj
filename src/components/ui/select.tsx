'use client'

import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    options: { value: string; label: string }[]
    placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, placeholder, id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        id={selectId}
                        className={cn(
                            'flex h-11 w-full appearance-none rounded-xl border border-stone-300 bg-white px-4 py-2 pr-10 text-sm text-stone-900 transition-all duration-200',
                            'focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20',
                            'disabled:cursor-not-allowed disabled:bg-stone-50 disabled:opacity-50',
                            'dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100',
                            'dark:focus:border-amber-400 dark:focus:ring-amber-400/20',
                            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                            className
                        )}
                        ref={ref}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                </div>
                {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
            </div>
        )
    }
)
Select.displayName = 'Select'

export { Select }
