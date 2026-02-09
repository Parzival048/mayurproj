import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, id, ...props }, ref) => {
        const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    id={textareaId}
                    className={cn(
                        'flex min-h-[100px] w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 transition-all duration-200',
                        'placeholder:text-stone-400',
                        'focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20',
                        'disabled:cursor-not-allowed disabled:bg-stone-50 disabled:opacity-50',
                        'dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500',
                        'dark:focus:border-amber-400 dark:focus:ring-amber-400/20',
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
            </div>
        )
    }
)
Textarea.displayName = 'Textarea'

export { Textarea }
