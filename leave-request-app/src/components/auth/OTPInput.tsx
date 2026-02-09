'use client'

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react'

interface OTPInputProps {
    length?: number
    value: string
    onChange: (value: string) => void
    disabled?: boolean
    error?: boolean
}

export default function OTPInput({
    length = 6,
    value,
    onChange,
    disabled = false,
    error = false,
}: OTPInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const [localValue, setLocalValue] = useState<string[]>(
        value.split('').concat(Array(length - value.length).fill(''))
    )

    useEffect(() => {
        const newValue = value.split('').concat(Array(length - value.length).fill(''))
        setLocalValue(newValue)
    }, [value, length])

    const focusInput = (index: number) => {
        if (index >= 0 && index < length) {
            inputRefs.current[index]?.focus()
        }
    }

    const handleChange = (index: number, inputValue: string) => {
        if (disabled) return

        // Only allow digits
        const digit = inputValue.replace(/\D/g, '').slice(-1)

        const newValue = [...localValue]
        newValue[index] = digit
        setLocalValue(newValue)
        onChange(newValue.join(''))

        // Move to next input if digit was entered
        if (digit && index < length - 1) {
            focusInput(index + 1)
        }
    }

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return

        if (e.key === 'Backspace') {
            e.preventDefault()
            const newValue = [...localValue]

            if (localValue[index]) {
                // Clear current input
                newValue[index] = ''
                setLocalValue(newValue)
                onChange(newValue.join(''))
            } else if (index > 0) {
                // Move to previous input and clear it
                newValue[index - 1] = ''
                setLocalValue(newValue)
                onChange(newValue.join(''))
                focusInput(index - 1)
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault()
            focusInput(index - 1)
        } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            focusInput(index + 1)
        }
    }

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        if (disabled) return

        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)

        if (pastedData) {
            const newValue = pastedData.split('').concat(Array(length - pastedData.length).fill(''))
            setLocalValue(newValue)
            onChange(newValue.join(''))

            // Focus last filled input or last input
            const lastFilledIndex = Math.min(pastedData.length, length) - 1
            focusInput(lastFilledIndex)
        }
    }

    const handleFocus = (index: number) => {
        inputRefs.current[index]?.select()
    }

    return (
        <div className="flex gap-2 sm:gap-3 justify-center">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={localValue[index] || ''}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={() => handleFocus(index)}
                    disabled={disabled}
                    className={`
            w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold
            border-2 rounded-xl transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
                            ? 'border-red-300 text-red-600 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                        }
            ${localValue[index] ? 'bg-blue-50' : 'bg-white'}
          `}
                    aria-label={`Digit ${index + 1}`}
                />
            ))}
        </div>
    )
}
