import React, { useMemo, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const stripPhone = (value) => String(value || '').replace(/[^\d]/g, '');
const withPlus = (value) => {
  const digits = stripPhone(value);
  return digits ? `+${digits}` : '';
};

function PhoneNumberInput({
  id,
  name,
  value,
  onChange,
  country = 'ke',
  required = false,
  placeholder = 'Phone Number',
  inputStyle,
  containerClassName = '',
}) {
  const [selectedCountry, setSelectedCountry] = useState(country);
  const normalizedValue = useMemo(() => stripPhone(value), [value]);

  return (
    <PhoneInput
      country={selectedCountry}
      value={normalizedValue}
      onChange={(phone, countryData) => {
        setSelectedCountry(countryData?.countryCode || selectedCountry);
        onChange(withPlus(phone));
      }}
      inputProps={{ id, name, required, autoComplete: 'tel' }}
      placeholder={placeholder}
      containerClass={`auth-phone-container ${containerClassName}`.trim()}
      inputClass="auth-phone-lib-input"
      buttonClass="auth-phone-lib-btn"
      dropdownClass="auth-phone-lib-dropdown"
      countryCodeEditable={false}
      enableSearch
      searchPlaceholder="Search country..."
      disableSearchIcon
      inputStyle={inputStyle}
    />
  );
}

export default PhoneNumberInput;
