import React, { useState } from 'react'
import { IoEye, IoEyeOff } from 'react-icons/io5'
import './PasswordField.css'

export default function PasswordField({
  value,
  onChange,
  placeholder,
  required = false,
  minLength,
  autoComplete
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="password-field">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <IoEyeOff /> : <IoEye />}
      </button>
    </div>
  )
}
