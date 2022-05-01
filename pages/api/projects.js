import { buildError, errors } from '@/constants/errors';
import { Prisma } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { getSession } from 'next-auth/react';
import middleware from '@/middleware/middleware';
import nextConnect from 'next-connect';
import prisma from '@/lib/prisma';

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

async function createProject(req, res) {
  const session = await getSession({ req });

  // Signed in
  if (session) {
    // Upload thumbnail
    const project = req.body;
    const response = await uploadThumbnail(req.file, `${session.user.name}/${project.slug}`);
    if (response.error) {
      return buildError(res, errors.CLOUDINARY_UPLOAD_ERROR, { message: response.error?.message });
    }

    // Extract thumbnail URLs from upload response, username from session
    project.image_thumbnail = response.eager[0].secure_url;
    project.image_cover = response.eager[1].secure_url;
    project.user = session.user.name;

    // Save project to projects schema
    try {
      await prisma.projects.create({ data: project });
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

  // Not signed in
  return buildError(res, errors.UNAUTHORIZED);
}

async function archiveProject(req, res) {
  const session = await getSession({ req });

  // Signed in
  if (session) {
    // Update archive flag to true
    const { slug } = req.query;
    try {
      await prisma.projects.update({
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

  // Not signed in
  return buildError(res, errors.UNAUTHORIZED);
}

handler.all(async (req, res) => {
  switch (req.method) {
    case 'POST':
      return createProject(req, res);
    case 'DELETE':
      return archiveProject(req, res);
    default:
      return buildError(res, errors.INVALID_METHOD, { method: req.method });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
