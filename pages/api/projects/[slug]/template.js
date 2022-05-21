import { buildError, errors, isPrismaError } from '@/constants/errors';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req, res) {
  const session = await getToken({ req, secret });

  // Signed in
  if (session) {
    if (req.method !== 'POST') {
      return buildError(res, errors.INVALID_METHOD, { method: req.method });
    }

    const { slug, template } = req.body;

    try {
      const project = await prisma.Project.update({
        where: { slug },
        data: {
          template: {
            upsert: {
              create: template,
              update: template,
            },
          },
        },
      });
      return res.status(200).json(project);
    } catch (e) {
      // Catch Prisma error
      if (isPrismaError(e)) {
        return buildError(res, errors.PRISMA_GENERIC_ERROR, {
          code: 500,
          message: `[${e.code}] ${e.message}`,
        });
      }

      // Catch all other errors
      return buildError(res, errors.PROJECTS_GENERIC_SAVE_ERROR);
    }
  }

  // Not signed in
  return buildError(res, errors.UNAUTHORIZED);
}
