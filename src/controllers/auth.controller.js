import bcrypt from 'bcrypt';
import prisma from '../../prisma/client.js';
import { createToken } from '../middleware/auth.js';

export const login = async (req, res) => {
   const { email, password } = req.body;

   if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
   }

   if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
   }

   const user = await prisma.user.findUnique({
      where: { email },
   });

   if (!user) {
      return res.status(400).json({ message: 'User not found' });
   }

   const isMatch = await bcrypt.compare(password, user.password);

   if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
   }

   const token = createToken(user);

   return res.status(200).json({ message: 'Login success', token, user });
};

export const getRole = async (req, res) => {
   const roles = await prisma.role.findMany();

   res.status(200).json({ data: roles });
};
