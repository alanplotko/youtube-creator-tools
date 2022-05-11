import classNames from 'classnames';
import styles from './UploadInput.module.css';

export default function UploadInput({
  id, name, label, helpText, required, customAttributes,
  uploadValid, uploadFileName, uploadResultMessage,
}) {
  const isValid = uploadValid == null || uploadValid;
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
      <div className="flex items-center justify-center w-full">
        <label
          className={classNames(styles.uploadContainer, {
            'border-gray-200 hover:border-gray-300': isValid,
            'border-red-400 hover:border-red-500': !isValid,
          })}
        >
          <div className="flex flex-col items-center justify-center pt-7">
            <p className="flex items-center space-x-2 text-xl text-gray-400 group-hover:text-gray-600">
              <i
                className={classNames('bi bi-cloud-upload', styles.uploadIcon, {
                  'text-gray-400 group-hover:text-gray-600': isValid,
                  'text-red-400 group-hover:text-red-600': !isValid,
                })}
              />
              {uploadFileName && uploadFileName}
            </p>
            <p
              className={classNames(styles.uploadText, {
                'text-gray-400 group-hover:text-gray-600': isValid,
                'text-red-400 group-hover:text-red-600': !isValid,
              })}
            >
              {uploadResultMessage}
            </p>
          </div>
          <input
            type="file"
            id={id}
            name={name}
            className="opacity-0"
            required
            hidden
            {...customAttributes}
          />
        </label>
      </div>
    </div>
  );
}
