import { getSession } from 'next-auth/react';
import middleware from 'middleware/middleware';
import nextConnect from 'next-connect';
import prisma from 'lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

const handler = nextConnect();
handler.use(middleware);

handler.post(async (req, res) => {
    switch (req.method) {
        case 'POST':
            return await createProject();
        default:
            return res.status(405).json({
                error: {
                    code: 500,
                    message: `Method ${req.method} Not Allowed`,
                }
            });
    }

    async function uploadThumbnail(file, id) {
        return cloudinary.uploader.upload(file.path, {
            public_id: id,
            upload_preset: 'project-thumbnail'
        }, (error, result) => {
            if (error) {
                return error;
            }
            return result;
        });
    }

    async function createProject() {
        const session = await getSession({ req });
        if (session) {
            // Signed in
            let project = req.body;
            let uploadResult = await uploadThumbnail(req.file, `${session.user.name}/${project.slug}`);
            if (uploadResult.error) {
                return res.status(500).json({
                    error: {
                        code: 500,
                        error: 'Thumbnail upload failed, please try again.'
                    }
                });
            }
            project.image_thumbnail = uploadResult.eager[0].secure_url;
            project.image_cover = uploadResult.eager[1].secure_url;
            project.user = session.user.name;
            return await prisma.projects
                .create({ data: project })
                .then(() => {
                    return res.status(200).json({
                        project,
                        message: "Successfully saved project."
                    });
                }).catch(err => {
                    if (err && err.code === "P2002") {
                        return res.status(400).json({
                            error: {
                                code: 400,
                                message: "Slug already exists, please choose a different title or override the slug."
                            }
                        });
                    }
                    return res.status(500).json({
                        error: {
                            code: 500,
                            message: "Failed to save project, please try again."
                        }
                    });
                });
        } else {
            // Not signed in
            return res.status(401).json({
                error: {
                    code: 401,
                    message: 'Unauthorized, user not signed in.',
                }
            });
        }
    }
});

export const config = {
    api: {
        bodyParser: false
    }
};

export default handler;
