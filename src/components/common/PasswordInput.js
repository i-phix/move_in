import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { key: 'lower', label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
  { key: 'number', label: 'One number', test: (value) => /\d/.test(value) },
  { key: 'special', label: 'One special character', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

export const getPasswordStrength = (value = '') => {
  const checks = PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(value) }));
  const score = checks.filter((rule) => rule.passed).length;
  const isStrong = score === PASSWORD_RULES.length;
  return {
    checks,
    score,
    isStrong,
    label: isStrong ? 'Strong password' : score >= 3 ? 'Getting stronger' : 'Weak password',
  };
};

export const passwordStrengthMessage = 'Password must include uppercase, lowercase, number, special character, and be at least 8 characters.';

function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = 'Enter your password',
  autoComplete = 'current-password',
  required = false,
  showStrength = false,
  error = '',
}) {
  const [visible, setVisible] = useState(false);
  const strength = getPasswordStrength(value);

  return (
    <>
      <div className="auth-input-wrap">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          className={`auth-input${error ? ' is-invalid' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
        />
        <button
          type="button"
          className="auth-eye-btn"
          onClick={() => setVisible((current) => !current)}
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && <div className="auth-field-error">{error}</div>}
      {showStrength && (
        <div className="password-strength" aria-live="polite">
          <div className="password-strength-head">
            <span>{strength.label}</span>
            <span>{strength.score}/{PASSWORD_RULES.length}</span>
          </div>
          <div className="password-strength-meter">
            <span style={{ width: `${(strength.score / PASSWORD_RULES.length) * 100}%` }} />
          </div>
          <ul className="password-strength-rules">
            {strength.checks.map((rule) => (
              <li key={rule.key} className={rule.passed ? 'passed' : ''}>
                {rule.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default PasswordInput;
