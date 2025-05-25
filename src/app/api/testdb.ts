// pages/api/testdb.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../lib/mongodb'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect(); 
    res.status(200).json({ message: 'MongoDB is connected' });
  } catch (error) {
    console.error('❌ DB Connection Error:', error);
    res.status(500).json({ error: 'Failed to connect to DB' });
  }
}
