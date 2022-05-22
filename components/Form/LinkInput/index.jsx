import classNames from 'classnames';
import { truncateString } from '@/lib/macros';
import { useState } from 'react';

const isValidUrl = (url) => {
  let link;
  try {
    link = new URL(url);
  } catch (_) {
    return false;
  }
  return link.protocol === 'http:' || link.protocol === 'https:';
};

export default function LinkInput({
  id, name, label, helpText, required, disabled,
  placeholder, customAttributes, validation, defaultValue,
}) {
  const [state, setState] = useState({ currentEntry: '', links: defaultValue ?? [], error: null });

  const handleLinkInput = (e) => {
    e.preventDefault();

    // Read current input
    const entry = e.target.value;

    // Process if terminating comma entered
    if (entry.includes(',')) {
      // Clean up spacing and validate if validation regex provided
      const formattedTuple = entry.split(',')[0].trim().replace(validation ?? '', '');
      if (formattedTuple.length === 0) {
        return setState({ ...state, currentEntry: '' });
      }

      // Validate entry format
      if (!formattedTuple.includes(';')) {
        return setState({ ...state, error: 'Label and link must be separated by a semicolon (label;link).' });
      }

      // Break up into label and url
      const linkLabel = formattedTuple.split(';')[0].trim();
      const url = formattedTuple.split(';')[1].trim();

      // Validate non-empty label
      if (linkLabel.length === 0) {
        return setState({ ...state, error: 'Label cannot be empty.' });
      }

      // Validate valid URL
      if (!isValidUrl(url)) {
        return setState({ ...state, error: 'Link must be a valid url.' });
      }

      // Add entry to links
      return setState({ currentEntry: '', links: [...state.links, `${linkLabel};${url}`] });
    }

    // No comma, keep recording current entry
    return setState({ ...state, currentEntry: entry });
  };

  const handleRemoveLink = (clickedLink) => {
    setState({ ...state, links: state.links.filter((link) => link !== clickedLink) });
  };

  const handleReorder = (index, increment) => {
    // Validate sum is in bounds
    if (index + increment < 0 || index + increment >= state.links.length) {
      return;
    }
    const { links } = state;

    // Swap
    const tmp = links[index + increment];
    links[index + increment] = links[index];
    links[index] = tmp;

    // Update links
    setState({ ...state, links });
  };

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
      <input
        id={id}
        name={name}
        type="hidden"
        required={required}
        value={state.links.join(',')}
      />
      <input
        type="text"
        className={classNames('input input-bordered input-lg rounded-lg h-14 w-full px-3', {
          'mb-5': !state.error,
        })}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleLinkInput}
        value={state.currentEntry}
        {...customAttributes}
      />
      {state.error && (
        <label className="label mb-5">
          <span className="label-text-alt text-red-500 p-0">{state.error}</span>
        </label>
      )}
      {state.links.length > 0 && (
        <div className="mb-5">
          <table className="table table-compact w-full">
            <thead>
              <tr>
                <th>Order</th>
                <th>#</th>
                <th>Label</th>
                <th>Link</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {state.links.map((entry, index) => {
                const tuple = entry.split(';');
                return (
                  <tr key={tuple}>
                    <th>
                      <div className="flex flex-col">
                        {index !== 0 && (
                          <button type="button" className="btn btn-ghost btn-sm gap-2" disabled={disabled} onClick={() => handleReorder(index, -1)}>
                            <i className="bi bi-caret-up-fill" />
                          </button>
                        )}
                        {index !== state.links.length - 1 && (
                          <button type="button" className="btn btn-ghost btn-sm gap-2" disabled={disabled} onClick={() => handleReorder(index, 1)}>
                            <i className="bi bi-caret-down-fill" />
                          </button>
                        )}
                      </div>
                    </th>
                    <th>{index + 1}</th>
                    <td>
                      <a title={tuple[0].length > 50 ? tuple[0] : null}>
                        {truncateString(tuple[0], 50)}
                      </a>
                    </td>
                    <td>
                      <a
                        className="link"
                        href={`${tuple[1]}`}
                        target="_blank"
                        rel="noreferrer"
                        title={tuple[1].length > 50 ? tuple[1] : null}
                      >
                        {truncateString(tuple[1], 50)}
                      </a>
                    </td>
                    <th>
                      <button type="button" className="btn btn-ghost btn-sm gap-2" disabled={disabled} onClick={() => handleRemoveLink(entry)}>
                        <i className="bi bi-x-square-fill text-lg" />
                      </button>
                    </th>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
