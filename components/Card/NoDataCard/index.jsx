import Link from 'next/link';
import classNames from 'classnames';

export default function NoDataCard({
  title, callToAction, link, buttonText, icon,
}) {
  return (
    <div className="mx-auto p-5 my-10 w-6/12 main-card">
      <div className="card-body items-center text-center">
        <i className={classNames('bi text-9xl text-gray-600', icon)} />
        <h2 className="card-title text-2xl">{title}</h2>
        <p className="text-lg">{callToAction}</p>
        <div className="text-center mt-8">
          <Link href={link} passHref>
            <button className="btn btn-primary gap-2 text-lg" type="button">
              {buttonText}
              <i className="bi bi-arrow-right" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
