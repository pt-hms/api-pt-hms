import prisma from "../../prisma/client.js";
import { createToken } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

export const register = async (req, res) => {
   const foto_profil = req.file;
   const { nama, no_pol, kategori, mobil, no_kep, exp_kep, no_hp, no_darurat, password } = req.body;

   if (!foto_profil || !nama || !no_pol || !kategori || !mobil || !no_kep || !exp_kep || !no_hp || !no_darurat || !password) {
      return res.status(400).json({ message: "Semua field harus diisi" });
   }

   const noPolUpper = no_pol.toUpperCase();

   const exist = await prisma.user.findUnique({
      where: { no_pol: noPolUpper },
   });

   if (exist) {
      return res.status(400).json({ message: "Plat Nomor sudah terdaftar" });
   }

   const profil_url = await upload(foto_profil);
   const exp_kep_iso = new Date(exp_kep).toISOString();

   const driver = await prisma.user.create({
      data: {
         foto_profil: profil_url.url,
         nama: nama.toUpperCase(),
         no_pol: no_pol.toUpperCase(),
         kategori: kategori.toUpperCase(),
         mobil: mobil.toUpperCase(),
         no_kep,
         exp_kep: exp_kep_iso,
         no_hp,
         no_darurat,
         password,
         role: "driver",
      },
      omit: {
         password: true,
      },
   });

   return res.status(201).json({ message: "Register berhasil", driver });
};

export const login = async (req, res) => {
   const { no_pol, password } = req.body;

   if (!no_pol || !password) {
      return res.status(400).json({ message: "Semua field harus diisi" });
   }

   const noPolUpper = no_pol.toUpperCase();

   const driver = await prisma.user.findUnique({
      where: { no_pol: noPolUpper },
   });

   if (!driver) {
      return res.status(400).json({ message: "Plat nomor tidak terdaftar" });
   }

   const isMatch = driver.password == password;

   if (!isMatch) {
      return res.status(400).json({ message: "Password salah" });
   }

   const token = createToken(driver);

   return res.status(200).json({ message: "Login berhasil", token, driver });
};
