import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';

const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
  try {
    return res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete recipe' });
  }
};

export default apiMiddleware(['DELETE'], handler);