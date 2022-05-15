import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client';

export const errors = {
  CATCH_ALL_GENERIC_ERROR: ({ code }) => ({
    code: code ?? 500,
    message: 'Error performing action, please try again.',
  }),
  CLOUDINARY_UPLOAD_ERROR: ({ code, message }) => ({
    code: code ?? 500,
    message: message ?? 'Image upload failed, please try again.',
  }),
  INVALID_METHOD: ({ method }) => ({
    code: 405,
    message: `Method ${method} Not Allowed`,
  }),
  PRISMA_GENERIC_ERROR: ({ code, message }) => ({
    code: code ?? 500,
    message: message ?? 'Prisma query failed, please try again.',
  }),
  PROJECTS_GENERIC_SAVE_ERROR: ({ code, message }) => ({
    code: code ?? 500,
    message: message ?? 'Failed to save project, please try again.',
  }),
  PROJECTS_GENERIC_ARCHIVE_ERROR: ({ code, message }) => ({
    code: code ?? 500,
    message: message ?? 'Failed to archive project, please try again.',
  }),
  PROJECTS_GENERIC_UNARCHIVE_ERROR: ({ code, message }) => ({
    code: code ?? 500,
    message: message ?? 'Failed to unarchive project(s), please try again.',
  }),
  PROJECTS_GENERIC_DELETE_ERROR: ({ code, message }) => ({
    code: code ?? 500,
    message: message ?? 'Failed to delete project(s), please try again.',
  }),
  PROJECTS_GENERIC_UPDATE_ERROR: ({ code, message }) => ({
    code: code ?? 500,
    message: message ?? 'Failed to update project, please try again.',
  }),
  PROJECTS_NO_SELECTION_ERROR: {
    code: 400,
    message: 'No videos selected, please choose at least 1 video.',
  },
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
  USER_STATS_GENERIC_ERROR: ({ code, message }) => ({
    code: code ?? 500,
    message: message ?? 'Failed to fetch stats.',
  }),
  YOUTUBE_API_GENERIC_ERROR: ({ code, message, serviceMessage }) => ({
    code: code ?? 500,
    message: message ?? 'Encountered error from YouTube API services, please try again.',
    serviceMessage: serviceMessage ?? null,
  }),
};

export const buildError = (res, error, args) => {
  const json = typeof error === 'function' ? error(args ?? {}) : error;
  return res.status(json.code).json({ error: json });
};

export const isPrismaError = (e) => e instanceof PrismaClientInitializationError
  || e instanceof PrismaClientKnownRequestError
  || e instanceof PrismaClientRustPanicError
  || e instanceof PrismaClientUnknownRequestError
  || e instanceof PrismaClientValidationError;
