import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/app/lib/mongodb';
import User from '@/app/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    const users = await User.find({});
    return res.status(200).json(users);
  }

  if (req.method === 'POST') {
    const { studentId, password } = req.body;
    const user = await User.create({ studentId, password });
    return res.status(201).json(user);
  }

  res.status(405).end();
}
