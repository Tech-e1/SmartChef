import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Middleware to handle HTTP method validation and authentication
 * @param allowedMethods - Array of allowed HTTP methods (e.g., ['POST'])
 * @param handler - The API route handler function
 */
export function apiMiddleware(allowedMethods: string[], handler: (req: NextApiRequest, res: NextApiResponse, session: any) => Promise<void>) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            // Validate HTTP method
            if (!allowedMethods.includes(req.method!)) {
                res.setHeader('Allow', allowedMethods);
                return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
            }

            // Offline self-hosted app: no real auth backend, so pass a mock session
            // when no session cookie is present instead of rejecting with 401.
            const sessionCookie = req.cookies?.session;
            const session = sessionCookie ? JSON.parse(sessionCookie) : { user: { id: 'offline', name: 'Offline User' } };

            // Proceed with the actual handler
            await handler(req, res, session);
        } catch (error) {
            console.error('Middleware error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
}
