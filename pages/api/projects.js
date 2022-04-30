import { getSession } from 'next-auth/react';
import nextConnect from 'next-connect';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import errors from '@/constants/errors';
import middleware from '@/middleware/middleware';

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
  if (session) {
    // Signed in
    const project = req.body;
    const uploadResult = await uploadThumbnail(req.file, `${session.user.name}/${project.slug}`);
    if (uploadResult.error) {
      return res.status(500).json({
        error: {
          code: 500,
          error: 'Thumbnail upload failed, please try again.',
        },
      });
    }
    project.image_thumbnail = uploadResult.eager[0].secure_url;
    project.image_cover = uploadResult.eager[1].secure_url;
    project.user = session.user.name;

    const result = await prisma.projects
      .create({ data: project })
      .then(() => res.status(200).json({
        project,
        message: 'Successfully saved project.',
      }))
      .catch((err) => {
        if (err && err.code === 'P2002') {
          return res.status(400).json({
            error: {
              code: 400,
              message: 'Slug already exists, please choose a different title or override the slug.',
            },
          });
        }
        return res.status(500).json(errors.PROJECT_GENERIC_ERROR);
      });
    return result;
  }
  // Not signed in
  return res.status(401).json({
    error: {
      code: 401,
      message: 'Unauthorized, user not signed in.',
    },
  });
}

handler.post(async (req, res) => {
  switch (req.method) {
    case 'POST':
      try {
        return await createProject(req, res);
      } catch (err) {
        return res.status(500).json();
      }
    default:
      return res.status(405).json(errors.INVALID_METHOD(req.method));
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
