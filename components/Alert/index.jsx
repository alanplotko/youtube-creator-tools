import Link from 'next/link';

export default function Alert({
  type, alertHeading, alertText, alertLink,
}) {
  let alertColor;
  let title;
  switch (type) {
    case 'success':
      alertColor = 'green';
      title = alertHeading ?? 'Successfully saved!';
      break;
    case 'error':
      alertColor = 'orange';
      title = alertHeading ?? 'Error encountered!';
      break;
    default:
      alertColor = 'gray';
      title = alertHeading ?? 'For your information...';
      break;
  }

  return (
    <div className={`border-t-4 p-4 bg-${alertColor}-100 border-${alertColor}-500 text-${alertColor}-700`} role="alert">
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
