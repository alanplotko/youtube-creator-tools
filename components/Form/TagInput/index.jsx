import { useState } from 'react';

export default function TagInput({
  id, name, label, helpText, required, disabled,
  placeholder, customAttributes, validation, defaultValue,
}) {
  const [state, setState] = useState({ currentEntry: '', tags: defaultValue ?? [] });

  const handleTagInput = (e) => {
    e.preventDefault();

    // Read current input
    const tag = e.target.value;

    // Process if terminating comma entered
    if (tag.includes(',')) {
      // Clean up spacing and validate if validation regex provided
      const formattedTag = tag.split(',')[0].trim().replace(validation ?? '', '');

      // Validate non-empty tag
      if (formattedTag.length === 0) {
        return setState({ ...state, currentEntry: '' });
      }

      // Add entry to tags
      return setState({ currentEntry: '', tags: [...state.tags, formattedTag] });
    }

    // No comma, keep recording current entry
    return setState({ ...state, currentEntry: tag });
  };

  const handleRemoveTag = (clickedTag) => {
    setState({ ...state, tags: state.tags.filter((tag) => tag !== clickedTag) });
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
        value={state.tags.join(',')}
      />
      <input
        type="text"
        className="input input-bordered input-lg rounded-lg h-14 w-full px-3 mb-5"
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleTagInput}
        value={state.currentEntry}
        {...customAttributes}
      />
      {state.tags.length > 0 && (
        <div className="flex flex-row flex-wrap gap-2 mb-5">
          {state.tags.map((tag) => (
            <div key={tag} className="badge badge-lg badge-secondary gap-2">
              {tag}
              {!disabled && (
                <button type="button" onClick={() => handleRemoveTag(tag)}>
                  <i className="bi bi-x" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
