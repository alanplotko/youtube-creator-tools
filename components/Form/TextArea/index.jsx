export default function TextArea({
  id, name, label, helpText, required, disabled, placeholder, customAttributes, pattern,
}) {
  return (
    <div className="form-control w-full">
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
      <textarea
        className="textarea textarea-bordered input-lg rounded-lg h-32 px-3 mb-5"
        id={id}
        name={name}
        required={required}
        placeholder={placeholder}
        pattern={pattern}
        disabled={disabled}
        readOnly={disabled}
        {...customAttributes}
      />
    </div>
  );
}
