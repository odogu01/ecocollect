const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  icon,
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
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full bg-white/60 backdrop-blur-sm border rounded-xl px-4 py-3
            ${icon ? 'pl-10' : ''}
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
            transition-all duration-200 placeholder-gray-400
            ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default Input