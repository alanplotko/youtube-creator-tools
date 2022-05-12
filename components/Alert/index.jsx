import Link from 'next/link';

export default function Alert({
  type, alertHeading, alertText, alertLink,
}) {
  let title;
  let icon;
  let alertType = type;
  switch (alertType) {
    case 'success':
      title = alertHeading ?? 'Successfully saved!';
      icon = 'bi-check-circle';
      break;
    case 'error':
      title = alertHeading ?? 'Error encountered!';
      icon = 'bi-x-circle';
      break;
    default:
      alertType = 'info';
      title = alertHeading ?? 'For your information...';
      icon = 'bi-info-circle';
      break;
  }

  return (
    <div className={`alert alert-${type} shadow-lg rounded-b-none`}>
      <div>
        <i className={`bi ${icon} text-4xl pr-2`} />
        <div className="flex-col">
          <p className="font-semibold text-lg">{title}</p>
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
      </div>
    </div>
  );
}
