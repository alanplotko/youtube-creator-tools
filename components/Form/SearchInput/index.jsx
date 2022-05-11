import classNames from 'classnames';
import styles from './SearchInput.module.css';

export default function SearchInput({
  id, name, label, helpText, required, placeholder, button,
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
      <label className="input-group input-group-lg">
        <input
          type="text"
          className={classNames('input input-bordered input-lg h-14 w-full px-3 mb-5', styles.roundedInput)}
          id={id}
          name={name}
          required={required}
          disabled={button.disabled}
          placeholder={placeholder}
        />
        <button
          className={classNames('btn btn-primary h-14', styles.roundedButton, {
            loading: button.isLoading,
          })}
          disabled={button.disabled}
          type="submit"
        >
          {button.text}
        </button>
      </label>
    </div>
  );
}
