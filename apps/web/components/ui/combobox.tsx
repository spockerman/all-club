'use client'

import { useRef, useState } from 'react'

export type ComboboxOption = { id: string; label: string; sublabel?: string }

type Props = {
  id?: string
  options: ComboboxOption[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  required?: boolean
}

/**
 * Searchable single-select combobox.
 * - While focused: shows typed query, filters options list
 * - While blurred: shows selected option label (or empty)
 * - Dropdown capped at max-h-56 with scroll
 */
export function Combobox({
  id,
  options,
  value,
  onChange,
  placeholder = 'Buscar…',
  required,
}: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedLabel = options.find((o) => o.id === value)?.label ?? ''
  const displayValue = open ? query : selectedLabel

  const filtered =
    query.length > 0
      ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
      : options

  function handleSelect(opt: ComboboxOption) {
    onChange(opt.id)
    setQuery('')
    setOpen(false)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    if (!open) setOpen(true)
    if (e.target.value === '') onChange('')
  }

  function handleFocus() {
    setQuery('')
    setOpen(true)
  }

  function handleBlur() {
    setOpen(false)
    setQuery('')
  }

  const inputClass =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-gray-300 focus:border-gray-300 outline-none'

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        autoComplete="off"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        aria-expanded={open}
        aria-autocomplete="list"
        className={inputClass}
      />

      {/* Hidden input carries the real value for form validation */}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          type="text"
          value={value}
          required
          onChange={() => {}}
          className="absolute inset-0 w-full opacity-0 pointer-events-none"
        />
      )}

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-400">Nenhum resultado</li>
          ) : (
            filtered.map((opt) => (
              <li
                key={opt.id}
                role="option"
                aria-selected={opt.id === value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(opt)}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                  opt.id === value ? 'bg-gray-50 font-medium' : ''
                }`}
              >
                {opt.label}
                {opt.sublabel && (
                  <span className="block text-xs text-gray-400">{opt.sublabel}</span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
