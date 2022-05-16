import Image from 'next/image';
import Link from 'next/link';
import classNames from 'classnames';
import styles from './UploadInput.module.css';

export default function UploadInput({
  id, name, label, helpText, required, disabled, customAttributes,
  uploadValid, uploadFileName, uploadResultMessage, existingThumbnail,
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
      <div className="flex items-center justify-center w-full space-x-5">
        {existingThumbnail && (
          <div className="flex-col">
            <div className="card card-bordered shadow-lg hover:brightness-75">
              <Link href={existingThumbnail} passHref>
                <a target="_blank">
                  <figure className="w-64 h-36 relative">
                    <Image src={existingThumbnail} layout="fill" alt="Thumbnail" title="View current thumbnail in new tab" />
                  </figure>
                </a>
              </Link>
            </div>
          </div>
        )}
        <label
          className={classNames(styles.uploadContainer, {
            'border-gray-200 hover:border-gray-300': isValid && !disabled,
            'border-red-400 hover:border-red-500': !isValid && !disabled,
            'cursor-pointer hover:bg-gray-100': !disabled,
            'cursor-not-allowed bg-gray-200': disabled,
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
            className="opacity-0 cursor-pointer"
            required={required}
            disabled={disabled}
            {...customAttributes}
          />
        </label>
      </div>
    </div>
  );
}
