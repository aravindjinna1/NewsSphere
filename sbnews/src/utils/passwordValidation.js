// Shared password strength rule, used by Signup and the Settings
// "change password" form so both enforce the same policy.
export const PASSWORD_HINT = 'At least 8 characters, with one capital letter, one lowercase letter, one number, and one symbol (e.g. ! @ # $ %).'

// Returns null when the password is valid, otherwise a user-facing message.
export const validatePassword = (password) => {
  if (!password || password.length < 8) return 'Password must be at least 8 characters long.'
  if (!/[A-Z]/.test(password)) return 'Password must include at least one capital letter.'
  if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter.'
  if (!/[0-9]/.test(password)) return 'Password must include at least one number.'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include at least one symbol (e.g. ! @ # $ %).'
  return null
}
