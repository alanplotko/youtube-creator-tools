import { buildError, errors } from '@/constants/errors';
import { Parser } from 'json2csv';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req, res) {
  const session = await getToken({ req, secret });

  // Signed in
  if (session) {
    if (req.method !== 'GET') {
      return buildError(res, errors.INVALID_METHOD, { method: req.method });
    }

    const { slug } = req.query;

    const project = await prisma.Project.findUnique({
      where: { slug },
      select: {
        videos: {
          orderBy: {
            publishedAt: 'desc',
          },
          select: {
            videoId: true,
            title: true,
          },
        },
      },
    });

    // Project does not exist
    if (project === null) {
      return buildError(res, errors.PROJECTS_SLUG_NOT_FOUND_ERROR);
    }

    project.videos = project.videos.map((video) => ({ ...video, episode: null }));

    const json2csv = new Parser();
    const csv = json2csv.parse(project.videos);
    res.setHeader('Content-disposition', `attachment; filename=${slug}-template.csv`);
    return res.status(200).send(csv);
  }

  // Not signed in
  return buildError(res, errors.UNAUTHORIZED);
}
