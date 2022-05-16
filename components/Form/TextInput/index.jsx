export default function TextInput({
  id, name, label, helpText, required, disabled,
  placeholder, customAttributes, pattern, defaultValue,
}) {
  return (
    <div className="form-control w-full max-w-2xl">
      <label className="label pb-0" htmlFor={name}>
        <span className="font-medium">
          {label}
          {required && (
            <>
              {' '}
              <span className="text-red-500">*</span>
            </>
          )}
        </span>
      </label>
      <label className="label pt-0">
        <p className="text-sm text-gray-600">{helpText}</p>
      </label>
      <input
        type="text"
        className="input input-bordered input-lg rounded-lg h-14 w-full px-3 mb-5"
        id={id}
        name={name}
        required={required}
        placeholder={placeholder}
        pattern={pattern}
        disabled={disabled}
        defaultValue={defaultValue}
        {...customAttributes}
      />
    </div>
  );
}
