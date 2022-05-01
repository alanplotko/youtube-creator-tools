import { buildError, errors } from '@/constants/errors';
import multiparty from 'multiparty';
import nextConnect from 'next-connect';

const middleware = nextConnect();

middleware.use(async (req, res, next) => {
  // Middleware only applies to creating new projects
  if (req.method !== 'POST') {
    return next();
  }

  const form = new multiparty.Form();

  return form.parse(req, (err, fields, files) => {
    if (err) {
      return buildError(res, errors.PROJECTS_GENERIC_SAVE_ERROR, { code: err.status });
    }

    // Unpack data
    const { name, slug, description } = fields;
    req.body = { name: name[0], slug: slug[0], description: description[0] };
    [req.file] = files.thumbnail;

    // Validate
    if (!['image/png', 'image/jpeg'].includes(req.file.headers['content-type'])) {
      return buildError(res, errors.PROJECTS_THUMBNAIL_TYPE_ERROR);
    }
    if (req.file.size > 3000000) {
      return buildError(res, errors.PROJECTS_THUMBNAIL_SIZE_ERROR);
    }
    // Validation passes, proceed to API
    return next();
  });
});

export default middleware;
