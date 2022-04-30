const errors = {
  YOUTUBE_API_GENERIC_ERROR: {
    error: {
      code: 500,
      message: 'Failed to contact YouTube API, please try again.',
    },
  },
  INVALID_METHOD: (method) => ({
    error: {
      code: 405,
      message: `Method ${method} Not Allowed`,
    },
  }),
  PROJECTS_GENERIC_ERROR: {
    error: {
      code: 500,
      message: 'Failed to save project, please try again.',
    },
  },
  UNAUTHORIZED: {
    error: {
      code: 401,
      message: 'Unauthorized, user not signed in.',
    },
  },
};

export default errors;
