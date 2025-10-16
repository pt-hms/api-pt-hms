import prisma from "../../prisma/client.js";
import { upload } from "../middleware/cloudinary.js";

export const createDriver = async (req, res) => {
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

   return res.status(201).json({ message: "Driver berhasil dibuat", driver });
};

export const getAllDrivers = async (req, res) => {
   const { kategori } = req.query;

   const drivers = await prisma.user.findMany({
      where: { role: "driver" },
      orderBy: {
         id: "desc",
      },
   });

   if (kategori) {
      const filteredDrivers = drivers.filter((driver) => driver.kategori === kategori);
      return res.status(200).json({ drivers: filteredDrivers });
   }

   return res.status(200).json({ drivers });
};

export const updateDriver = async (req, res) => {
   const { id } = req.params;
   const { nama, no_pol, kategori, mobil, no_kep, exp_kep, no_hp, no_darurat, password } = req.body;

   const file = req.file;
   const foto_profil = req.body.foto_profil;

   if (!nama || !no_pol || !kategori || !mobil || !no_kep || !exp_kep || !no_hp || !no_darurat || !password) {
      return res.status(400).json({ message: "Semua field harus diisi" });
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

   const exp_kep_iso = new Date(exp_kep).toISOString();

   await prisma.user.update({
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
         password,
         role: "driver",
      },
   });

   const updatedDriver = await prisma.user.findUnique({
      where: { id: Number(id) },
   });

   return res.status(200).json({
      message: "Driver berhasil diperbarui",
      driver: updatedDriver,
   });
};

export const deleteDriver = async (req, res) => {
   const { id } = req.body;

   if (!id || !Array.isArray(id) || id.length === 0) {
      return res.status(400).json({ message: "Daftar ID tidak valid" });
   }

   const numericIds = id.map(Number);

   const deleted = await prisma.user.deleteMany({
      where: { id: { in: numericIds } },
   });

   if (deleted.count === 0) {
      return res.status(404).json({ message: "Tidak ada driver yang dihapus" });
   }

   return res.status(200).json({
      message: `Driver dengan ID ${id} berhasil dihapus`,
   });
};
