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

            // Simple session check - in a real app, you'd validate a JWT or session cookie
            // For now, we'll just pass a mock session or check for a session cookie
            const sessionCookie = req.cookies?.session;
            const session = sessionCookie ? JSON.parse(sessionCookie) : null;
            
            if (!session) {
                return res.status(401).json({ error: 'You must be logged in.' });
            }

            // Proceed with the actual handler
            await handler(req, res, session);
        } catch (error) {
            console.error('Middleware error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
}
