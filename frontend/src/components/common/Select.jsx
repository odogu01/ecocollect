const Select = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  options = [],
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={`
          w-full bg-white/60 backdrop-blur-sm border rounded-xl px-4 py-3
          focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
          transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default Select