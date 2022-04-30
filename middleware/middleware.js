import nextConnect from 'next-connect';
import multiparty from 'multiparty';

const middleware = nextConnect();

middleware.use(async (req, res, next) => {
  const form = new multiparty.Form();

  await form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(err.status).json({
        error: {
          code: err.status,
          message: 'Failed to save project, please try again.',
        },
      });
    }

    // Unpack data
    const { name, slug, description } = fields;
    req.body = { name: name[0], slug: slug[0], description: description[0] };
    [req.file] = files.thumbnail;

    // Validate
    if (!['image/png', 'image/jpeg'].includes(req.file.headers['content-type'])) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'File is not of type PNG, JPG, or JPEG, please select a valid file.'
        },
      });
    }
    if (req.file.size > 3000000) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'File size > 3MB, please select a smaller file.',
        },
      });
    }
    // Validation passes, proceed to API
    return next();
  });
});

export default middleware;
