import { buildError, errors } from '@/constants/errors';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

const secret = process.env.NEXTAUTH_SECRET;

export default async function deleteProject(req, res) {
  const session = await getToken({ req, secret });

  // Not signed in
  if (!session) {
    return buildError(res, errors.UNAUTHORIZED);
  }

  // Invalid request method
  if (req.method !== 'POST') {
    return buildError(res, errors.INVALID_METHOD, { method: req.method });
  }

  try {
    const { selections } = req.body;

    // Delete selected projects
    await prisma.project.deleteMany({
      where: {
        slug: {
          in: selections,
        },
      },
    });

    return res.status(200).json({
      message: 'Successfully deleted projects.',
    });
  } catch (e) {
    // Catch all errors
    return buildError(res, errors.PROJECTS_GENERIC_DELETE_ERROR, { message: e?.message });
  }
}
