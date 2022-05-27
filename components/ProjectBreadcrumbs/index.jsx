import Link from 'next/link';

export default function ProjectBreadcrumbs({ projectTitle, slug, finalPage }) {
  return (
    <div id="project-breadcrumbs" className="text-lg breadcrumbs">
      <ul>
        <li>
          <Link href="/projects">
            <a className="font-bold">Projects</a>
          </Link>
        </li>
        {(projectTitle && !slug) && (
          <li>
            {projectTitle}
          </li>
        )}
        {(projectTitle && slug) && (
          <li>
            <Link href={`/projects/${slug}`}>
              <a className="font-bold">{projectTitle}</a>
            </Link>
          </li>
        )}
        {finalPage && (
          <li>
            {finalPage}
          </li>
        )}
      </ul>
    </div>
  );
}
