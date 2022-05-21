import classNames from 'classnames';
import { useState } from 'react';

export default function TextArea({
  id, name, label, helpText, required, disabled, placeholder,
  customAttributes, pattern, defaultValue, maxLength = 300, trackCharacterCount,
}) {
  const [remainingCharCount, setRemainingCharCount] = useState((() => {
    if (defaultValue && maxLength) {
      return maxLength - defaultValue.length;
    }
    return maxLength ?? 0;
  })());
  const overrideAttributes = {};
  const getCharCount = () => setRemainingCharCount(maxLength
    - document.getElementById(id).value.length);
  if (trackCharacterCount) {
    overrideAttributes.onChange = getCharCount;
  }

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
        className={classNames('textarea textarea-bordered input-lg rounded-lg h-32 px-3', { 'mb-5': !trackCharacterCount })}
        id={id}
        name={name}
        required={required}
        placeholder={placeholder}
        pattern={pattern}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={disabled}
        maxLength={maxLength}
        {...customAttributes}
        {...overrideAttributes}
      />
      {trackCharacterCount && (
        <label className="label mb-5">
          <span className="label-text-alt" />
          <span
            className={classNames('label-text-alt font-semibold', {
              'text-yellow-500': remainingCharCount <= Math.floor(maxLength / 3) && remainingCharCount > 0,
              'text-red-500': remainingCharCount === 0,
            })}
          >
            {remainingCharCount}
            {' / '}
            {maxLength}
            {' '}
            characters remaining
          </span>
        </label>
      )}
    </div>
  );
}
