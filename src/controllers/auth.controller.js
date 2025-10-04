import bcrypt from 'bcrypt';
import prisma from '../../prisma/client.js';
import { createToken } from '../middleware/auth.js';

export const login = async (req, res) => {
   const { no_hp, password } = req.body;

   if (!no_hp || !password) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
   }

   const driver = await prisma.driver.findUnique({
      where: { no_hp },
   });

   if (!driver) {
      return res.status(400).json({ message: 'Nomor HP tidak terdaftar' });
   }

   const isMatch = await bcrypt.compare(password, driver.password);

   if (!isMatch) {
      return res.status(400).json({ message: 'Password salah' });
   }

   const token = createToken(driver);

   return res.status(200).json({ message: 'Login berhasil', token, driver });
};
