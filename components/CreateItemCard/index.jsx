import Link from 'next/link';
import classNames from 'classnames';

export default function CreateItemCard({
  title, callToAction, link, icon,
}) {
  return (
    <Link href={link} passHref>
      <div className="w-96 main-hover-card">
        <div className="card-body items-center text-center justify-center">
          <i className={classNames('bi text-9xl text-gray-600', icon)} />
          <h2 className="card-title text-2xl">{title}</h2>
          <span className="text-lg">{callToAction}</span>
        </div>
      </div>
    </Link>
  );
}
