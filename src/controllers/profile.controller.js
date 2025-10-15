import prisma from "../../prisma/client.js";
import { upload } from "../middleware/upload.js";

export const getProfile = async (req, res) => {
   const { id } = req.user;

   const driver = await prisma.user.findUnique({
      where: { id: Number(id) },
      omit: { password: true },
   });

   return res.status(200).json({ driver });
};

export const updateProfile = async (req, res) => {
   const { id } = req.user;
   const foto_profil = req.file;
   const { nama, no_pol, kategori, mobil, no_kep, exp_kep, no_hp, no_darurat } = req.body;

   if (!foto_profil || !nama || !no_pol || !kategori || !mobil || !no_kep || !exp_kep || !no_hp || !no_darurat) {
      return res.status(400).json({ message: "Semua field harus diisi" });
   }

   const driver = await prisma.user.findUnique({
      where: { id: Number(id) },
   });

   if (!driver) {
      return res.status(400).json({ message: "Driver tidak ditemukan" });
   }

   const profil_url = await upload(foto_profil);
   const exp_kep_iso = new Date(exp_kep).toISOString();

   await prisma.user.update({
      where: { id: Number(id) },
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
      },
   });

   const updatedDriver = await prisma.user.findUnique({
      where: { id: Number(id) },
      omit: { password: true },
   });

   return res.status(200).json({ message: "Profile berhasil diperbarui", driver: updatedDriver });
};
