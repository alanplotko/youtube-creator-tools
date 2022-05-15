import { buildError, errors } from '@/constants/errors';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req, res) {
  const session = await getToken({ req, secret });

  // Not signed in
  if (!session) {
    return buildError(res, errors.UNAUTHORIZED);
  }

  const slug = await prisma.project.findUnique({
    where: { slug: req.body.slug },
  });

  // Slug already exists
  if (slug !== null) {
    return buildError(res, errors.PROJECTS_SLUG_EXISTS_ERROR);
  }

  // Validation passes
  return res.status(200).json({ response: 'Slug is available' });
}
