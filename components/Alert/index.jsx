import Link from 'next/link';
import classNames from 'classnames';

export default function Alert({
  type, alertHeading, alertText, alertLink,
}) {
  // Default to information alert
  let alertColor = 'gray';
  let title = 'For your information...';

  if (type) {
    if (type.toLowerCase() === 'success') {
      alertColor = 'green';
      title = alertHeading ?? 'Successfully saved!';
    }
    if (type.toLowerCase() === 'error') {
      alertColor = 'orange';
      title = alertHeading ?? 'Error encountered!';
    }
  }

  return (
    <div className={classNames('border-t-4', 'p-4', `bg-${alertColor}-100`, `border-${alertColor}-500`, `text-${alertColor}-700`)} role="alert">
      <p className="font-bold text-lg">{title}</p>
      {alertLink && (
        <p className="underline">
          <Link href={alertLink}>
            {alertText}
          </Link>
        </p>
      )}
      {!alertLink && (
        <p>{alertText}</p>
      )}
    </div>
  );
}
