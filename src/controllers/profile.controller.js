import prisma from "../../prisma/client.js";
import { upload } from "../middleware/cloudinary.js";

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
   const file = req.file;
   const { foto_profil, nama, no_pol, kategori, mobil, no_kep, exp_kep, no_hp, no_darurat } = req.body;

   if (!nama || !no_pol || !kategori || !mobil || !no_hp || !no_darurat) {
      return res.status(400).json({ message: `Kolom ${!no_pol ? "Plat Nomor" : !kategori ? "Kategori" : !mobil ? "Mobil" : !no_hp ? "No Telepon" : !no_darurat ? "No Darurat" : "Password"} harus diisi` });
   }

   const driver = await prisma.user.findUnique({
      where: { id: Number(id) },
   });

   if (!driver) {
      return res.status(400).json({ message: "Driver tidak ditemukan" });
   }

   let fotoUrl;
   if (file) {
      const uploadResult = await upload(file);
      fotoUrl = uploadResult.url;
   } else if (typeof foto_profil === "string" && foto_profil.trim() !== "") {
      fotoUrl = foto_profil;
   } else {
      fotoUrl = driver.foto_profil;
   }

   let exp_kep_iso;
   if (exp_kep) {
      exp_kep_iso = new Date(exp_kep).toISOString();
   }

   const updatedDriver = await prisma.user.update({
      where: { id: Number(id) },
      data: {
         foto_profil: fotoUrl,
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

   return res.status(200).json({ message: "Profile berhasil diperbarui", driver: updatedDriver });
};
