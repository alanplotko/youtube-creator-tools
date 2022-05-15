import Link from 'next/link';
import classNames from 'classnames';

const htmlRegex = /<[^>]+>/g;

export default function Alert({
  className, type, alertHeading, alertText, alertLink,
  includeHeading = true, refreshHandler, isRefreshing,
}) {
  let title;
  let icon;
  let alertType = `alert-${type}`;
  switch (type) {
    case 'success':
      title = alertHeading ?? 'Successfully saved!';
      icon = 'bi-check-circle';
      break;
    case 'error':
      title = alertHeading ?? 'Error encountered!';
      icon = 'bi-x-circle';
      break;
    default:
      alertType = 'alert-info';
      title = alertHeading ?? 'For your information...';
      icon = 'bi-info-circle';
      break;
  }

  return (
    <div
      className={classNames('alert shadow-md', alertType, className, {
        'h-10': !includeHeading,
      })}
    >
      <div>
        <i
          className={classNames(`bi ${icon} pr-1`, {
            'text-4xl': includeHeading,
            'text-xl': !includeHeading,
          })}
        />
        <div className="flex-col">
          {includeHeading && (
            <p className="font-semibold text-lg">{title}</p>
          )}
          {alertLink && (
            <p className="underline">
              <Link href={alertLink}>
                {alertText}
              </Link>
            </p>
          )}
          {!alertLink && (
            <span>{alertText.replace(htmlRegex, '')}</span>
          )}
          {refreshHandler && (
            <button id="refresh" type="button" onClick={refreshHandler} className={classNames('btn btn-ghost btn-sm ml-2', { loading: isRefreshing })} disabled={isRefreshing}>
              Refresh
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
