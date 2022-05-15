import { buildError, errors } from '@/constants/errors';
import { v2 as cloudinary } from 'cloudinary';
import { getToken } from 'next-auth/jwt';
import multiparty from 'multiparty';

const secret = process.env.NEXTAUTH_SECRET;

async function uploadThumbnail(filePath, id) {
  return cloudinary.uploader.upload(filePath, {
    public_id: id,
    upload_preset: 'project-thumbnail',
  }, (error, result) => {
    if (error) {
      return error;
    }
    return result;
  });
}

async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        // Unpack data
        const { name, slug, description } = fields;
        // Form provides both slugs if slug is overridden, so we always want the last posiiton
        req.body = { name: name[0], slug: slug[slug.length - 1], description: description[0] };
        resolve(files.thumbnail[0]);
      }
    });
  });
}

export default async function handler(req, res) {
  const session = await getToken({ req, secret });

  // Not signed in
  if (!session) {
    return buildError(res, errors.UNAUTHORIZED);
  }

  // Extract file for upload
  let thumbnail = null;
  try {
    thumbnail = await parseForm(req);
  } catch (err) {
    return buildError(res, errors.PROJECTS_GENERIC_SAVE_ERROR, { code: err.status });
  }

  if (thumbnail === null) {
    return buildError(res, errors.PROJECTS_GENERIC_SAVE_ERROR);
  }

  // Validate file extension and size
  if (!['image/png', 'image/jpeg'].includes(thumbnail.headers['content-type'])) {
    return buildError(res, errors.PROJECTS_THUMBNAIL_TYPE_ERROR);
  }
  if (thumbnail.size > 3000000) {
    return buildError(res, errors.PROJECTS_THUMBNAIL_SIZE_ERROR);
  }

  // Upload thumbnail
  const response = await uploadThumbnail(thumbnail.path, `${session.user.name}/${req.body.slug}`);
  if (response.error) {
    return buildError(res, errors.CLOUDINARY_UPLOAD_ERROR, { message: response.error?.message });
  }

  // Add user and thumbnail URLs to request body
  req.body.user = session.user.name;
  req.body.image_thumbnail = response.eager[0].secure_url;
  req.body.image_cover = response.eager[1].secure_url;

  // Validation and upload passes, proceed to API
  return res.status(200).json({
    project: req.body,
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
