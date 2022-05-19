import { buildError, errors } from '@/constants/errors';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

const secret = process.env.NEXTAUTH_SECRET;

async function createProject(req, res) {
  const { saveData } = req.body;

  // Save project to projects schema
  try {
    const response = await prisma.project.create({ data: saveData });
    return res.status(200).json({
      response,
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

async function editProject(req, res) {
  try {
    const { saveData, originalSlug } = req.body;

    const updateResponse = await prisma.project.update({
      where: { slug: originalSlug },
      data: saveData,
    });

    return res.status(200).json({
      project: updateResponse,
      message: 'Successfully updated project.',
    });
  } catch (e) {
    // Catch all errors
    return buildError(res, errors.PROJECTS_GENERIC_SAVE_ERROR, { message: e?.message });
  }
}

async function addVideosToProject(req, res) {
  const { selections, slug } = req.body;
  if (selections.length === 0) {
    return buildError(res, errors.PROJECTS_NO_SELECTION_ERROR);
  }
  try {
    const result = await prisma.project.update({
      where: { slug },
      data: {
        published: true,
        videos: {
          connect: selections,
        },
      },
    });
    return res.status(200).json({
      data: result,
      message: `Successfully added ${selections.length} videos to project.`,
    });
  } catch (e) {
    // Catch all errors
    return buildError(res, errors.PROJECTS_GENERIC_UPDATE_ERROR, { message: e?.message });
  }
}

async function updateVideosForProject(req, res) {
  const { selections, slug } = req.body;
  if (selections.length === 0) {
    return buildError(res, errors.PROJECTS_NO_SELECTION_ERROR);
  }
  try {
    const result = await prisma.project.update({
      where: { slug },
      data: {
        videos: {
          set: selections,
        },
      },
    });
    return res.status(200).json({
      data: result,
      message: `Successfully updated project with ${selections.length} newly selected videos.`,
    });
  } catch (e) {
    // Catch all errors
    return buildError(res, errors.PROJECTS_GENERIC_UPDATE_ERROR, { message: e?.message });
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

export default async function handler(req, res) {
  const session = await getToken({ req, secret });

  // Signed in
  if (session) {
    switch (req.method) {
      case 'POST':
        if (req.body.isEditing) {
          return editProject(req, res);
        }
        return createProject(req, res);
      case 'PUT':
        if (req.body.isEditing) {
          return updateVideosForProject(req, res);
        }
        return addVideosToProject(req, res);
      case 'DELETE':
        return archiveProject(req, res);
      default:
        return buildError(res, errors.INVALID_METHOD, { method: req.method });
    }
  }

  // Not signed in
  return buildError(res, errors.UNAUTHORIZED);
}
