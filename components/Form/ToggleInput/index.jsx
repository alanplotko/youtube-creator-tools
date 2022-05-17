import classNames from 'classnames';
import styles from './ToggleInput.module.css';

export default function ToggleInput({
  id, name, label, helpText, required, pattern, toggleCondition,
  defaultAttributes, toggleAttributes, button, defaultValue, defaultToggleValue,
}) {
  const input = toggleCondition ? (
    <input
      type="text"
      className={classNames('input input-bordered input-lg h-14 w-10/12 px-3 mb-5', styles.roundedInput)}
      id={id}
      name={name}
      required={required}
      pattern={pattern}
      defaultValue={defaultToggleValue}
      {...toggleAttributes}
    />
  ) : (
    <input
      type="text"
      className={classNames('input input-lg h-14 w-10/12 px-3 mb-5 cursor-not-allowed select-none focus:outline-none bg-gray-200', styles.roundedInput)}
      id={id}
      name={name}
      required={required}
      defaultValue={defaultValue}
      {...defaultAttributes}
    />
  );

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
      <label className="input-group input-group-lg">
        {input}
        <input
          className={classNames('btn h-14 w-2/12', styles.roundedButton)}
          type="button"
          disabled={button.disabled}
          onClick={button.onClick}
          value={button.text}
        />
      </label>
    </div>
  );
}
