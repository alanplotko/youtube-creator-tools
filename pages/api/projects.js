import { buildError, errors } from '@/constants/errors';
import { Prisma } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { getToken } from 'next-auth/jwt';
import middleware from '@/middleware/middleware';
import nextConnect from 'next-connect';
import prisma from '@/lib/prisma';

const secret = process.env.NEXTAUTH_SECRET;

const handler = nextConnect();
handler.use(middleware);

async function uploadThumbnail(file, id) {
  return cloudinary.uploader.upload(file.path, {
    public_id: id,
    upload_preset: 'project-thumbnail',
  }, (error, result) => {
    if (error) {
      return error;
    }
    return result;
  });
}

async function createProject(req, res, user) {
  // Upload thumbnail
  const project = req.body;
  const response = await uploadThumbnail(req.file, `${user}/${project.slug}`);
  if (response.error) {
    return buildError(res, errors.CLOUDINARY_UPLOAD_ERROR, { message: response.error?.message });
  }

  // Extract thumbnail URLs from upload response, username from session
  project.image_thumbnail = response.eager[0].secure_url;
  project.image_cover = response.eager[1].secure_url;
  project.user = user;

  // Save project to projects schema
  try {
    await prisma.project.create({ data: project });
    return res.status(200).json({
      project,
      message: 'Successfully saved project.',
    });
  } catch (e) {
    // Slug already exists
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return buildError(res, errors.PROJECTS_SLUG_EXISTS_ERROR);
    }
    // Catch all other errors
    return buildError(res, errors.PROJECTS_GENERIC_SAVE_ERROR, { message: e?.message });
  }
}

async function archiveProject(req, res) {
  // Update archive flag to true
  const { slug } = req.query;
  try {
    await prisma.project.update({
      where: { slug },
      data: { archived: true },
    });
    return res.status(200).json({
      slug,
      message: 'Successfully archived project.',
    });
  } catch (e) {
    // Catch all errors
    return buildError(res, errors.PROJECTS_GENERIC_ARCHIVE_ERROR, { message: e?.message });
  }
}

handler.all(async (req, res) => {
  const session = await getToken({ req, secret });

  // Signed in
  if (session) {
    switch (req.method) {
      case 'POST':
        return createProject(req, res, session.user.name);
      case 'DELETE':
        return archiveProject(req, res);
      default:
        return buildError(res, errors.INVALID_METHOD, { method: req.method });
    }
  }

  // Not signed in
  return buildError(res, errors.UNAUTHORIZED);
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
