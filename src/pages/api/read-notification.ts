import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';

const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
  try {
    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to read notification' });
  }
};

export default apiMiddleware(['PUT'], handler);