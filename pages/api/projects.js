import { getSession } from 'next-auth/react';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
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

    async function createProject() {
        const session = await getSession({ req });
        if (session) {
            // Signed in
            let project = req.body;
            try {
                new URL(project.thumbnail);
            } catch (err) {
                return res.status(400).json({ error: "Invalid URL provided" });
            }
            project.createdAt = new Date();
            project.user = session.user.name;
            return await prisma.projects
                .create({ data: project })
                .then(() => {
                    return res.status(200).json({
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
}
