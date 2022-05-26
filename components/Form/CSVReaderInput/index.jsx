import { formatFileSize, useCSVReader } from 'react-papaparse';
import classNames from 'classnames';
import { useState } from 'react';
// eslint-disable-next-line sort-imports
import styles from './CSVReaderInput.module.css';

export default function CSVReaderInput({
  id, name, disabled, required, label, helpText, defaultValue,
}) {
  const { CSVReader } = useCSVReader();
  const defaultState = { data: defaultValue ?? null, error: null, hasUploaded: false };
  const [state, setState] = useState(defaultState);

  return (
    <>
      <CSVReader
        config={{
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        }}
        onUploadAccepted={(res) => {
          if (res.errors && res.errors.length > 0) {
            setState({ data: null, error: res.errors[0].message, hasUploaded: true });
          } else {
            setState({ data: res.data, error: null, hasUploaded: true });
          }
        }}
        onUploadRejected={(res) => {
          if (res[0].errors && res[0].errors.length > 0) {
            setState({ data: null, error: res[0].errors[0].message, hasUploaded: true });
          }
        }}
      >
        {({
          getRootProps,
          acceptedFile,
          ProgressBar,
        }) => (
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
            <label
              className={classNames(styles.uploadContainer, {
                'border-gray-200 hover:border-gray-300': !state.error && !disabled,
                'border-red-400 hover:border-red-500': state.error && !disabled,
                'cursor-pointer hover:bg-gray-100': !disabled,
                'cursor-not-allowed bg-gray-200': disabled,
              })}
            >
              <div className="flex flex-col items-center justify-center pt-7" {...(!disabled ? getRootProps() : {})}>
                <div className="flex items-center space-x-2 text-xl text-gray-400 group-hover:text-gray-600">
                  <i
                    className={classNames('bi bi-cloud-upload', styles.uploadIcon, {
                      'text-gray-400 group-hover:text-gray-600': !state.error,
                      'text-red-400 group-hover:text-red-600': state.error,
                    })}
                  />
                  {acceptedFile && (
                    <>
                      {acceptedFile.name}
                      {' '}
                      {`(${formatFileSize(acceptedFile.size)})`}
                    </>
                  )}
                </div>
                <div
                  className={classNames(styles.uploadText, {
                    'text-gray-400 group-hover:text-gray-600': !state.error,
                    'text-red-400 group-hover:text-red-600': state.error,
                  })}
                >
                  {state.error && (
                    <p className="text-red-500">
                      Error:
                      {' '}
                      {state.error}
                    </p>
                  )}
                  {(state.data && state.hasUploaded) && (
                    <p className="text-green-500">
                      Successfully parsed uploaded template.
                    </p>
                  )}
                  {(state.data && !state.hasUploaded) && (
                    <p>
                      Parsed previously uploaded template.
                    </p>
                  )}
                  {(!state.data && !state.error) && (
                    <p>
                      Upload a CSV template
                    </p>
                  )}
                  <ProgressBar />
                </div>
              </div>
            </label>
          </div>
        )}
      </CSVReader>
      {state.data && state.data.length > 0 && (
        <div className="my-5">
          <table className="table table-compact w-full">
            <thead>
              <tr>
                <th>#</th>
                {Object.keys(state.data[0]).map((key) => (
                  // Convert "camelCase" to "Title Case"
                  <th key={key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.data.map((entry, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={`tr-${entry}-${index}`}>
                  <th>{index + 1}</th>
                  {Object.keys(entry).map((key) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <td key={`td-${key}-${index}`}>{entry[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <input
        id={id}
        name={name}
        type="hidden"
        value={state.data ? JSON.stringify(state.data) : ''}
      />
    </>
  );
}
