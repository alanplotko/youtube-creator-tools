export const errors = {
  CLOUDINARY_UPLOAD_ERROR: ({ code, message }) => ({
    code: code ?? 500,
    message: message ?? 'Image upload failed, please try again.',
  }),
  INVALID_METHOD: ({ method }) => ({
    code: 405,
    message: `Method ${method} Not Allowed`,
  }),
  PROJECTS_GENERIC_SAVE_ERROR: ({ code, message }) => ({
    code: code ?? 500,
    message: message ?? 'Failed to save project, please try again.',
  }),
  PROJECTS_GENERIC_ARCHIVE_ERROR: ({ code, message }) => ({
    code: code ?? 500,
    message: message ?? 'Failed to archive project, please try again.',
  }),
  PROJECTS_THUMBNAIL_TYPE_ERROR: {
    code: 400,
    message: 'File is not of type PNG, JPG, or JPEG, please select a valid file.',
  },
  PROJECTS_THUMBNAIL_SIZE_ERROR: {
    code: 400,
    message: 'File size > 3MB, please select a smaller file.',
  },
  PROJECTS_SLUG_EXISTS_ERROR: {
    code: 400,
    message: 'Slug already exists, please choose a different title or override the slug.',
  },
  UNAUTHORIZED: {
    code: 401,
    message: 'Unauthorized, user not signed in.',
  },
  YOUTUBE_API_GENERIC_ERROR: {
    code: 500,
    message: 'Failed to contact YouTube API, please try again.',
  },
};

export const buildError = (res, error, args) => {
  const json = typeof error === 'function' ? error(args) : error;
  return res.status(json.code).json({ error: json });
};
