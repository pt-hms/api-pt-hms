import bcrypt from "bcrypt";
import prisma from "../../prisma/client.js";
import { upload } from "../middleware/upload.js";

export const createDriver = async (req, res) => {
   const foto_profil = req.file;
   const { nama, no_pol, kategori, mobil, no_kep, exp_kep, no_hp, no_darurat, password } = req.body;

   if (!foto_profil || !nama || !no_pol || !kategori || !mobil || !no_kep || !exp_kep || !no_hp || !no_darurat || !password) {
      return res.status(400).json({ message: "Semua field harus diisi" });
   }

   const exist = await prisma.user.findUnique({
      where: { no_pol },
   });

   if (exist) {
      return res.status(400).json({ message: "Plat Nomor sudah terdaftar" });
   }

   const profil_url = await upload(foto_profil);
   const exp_kep_iso = new Date(exp_kep).toISOString();
   const hashedPassword = await bcrypt.hash(password, 10);

   const driver = await prisma.user.create({
      data: {
         foto_profil: profil_url.url,
         nama,
         no_pol,
         kategori,
         mobil,
         no_kep,
         exp_kep: exp_kep_iso,
         no_hp,
         no_darurat,
         password: hashedPassword,
         role: "driver",
      },
   });

   return res.status(201).json({ message: "Driver berhasil dibuat", driver });
};

export const getAllDrivers = async (req, res) => {
   const { kategori } = req.query;

   const drivers = await prisma.user.findMany({
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

export const getDriverById = async (req, res) => {
   const { id } = req.params;

   const driver = await prisma.user.findUnique({
      where: { id: Number(id) },
   });

   return res.status(200).json({ driver });
};

export const updateDriver = async (req, res) => {
   const { id } = req.params;
   const foto_profil = req.file;
   const { nama, no_pol, kategori, mobil, no_kep, exp_kep, no_hp, no_darurat, password } = req.body;

   if (!foto_profil || !nama || !no_pol || !kategori || !mobil || !no_kep || !exp_kep || !no_hp || !no_darurat || !password) {
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
   const hashedPassword = await bcrypt.hash(password, 10);

   await prisma.user.update({
      where: { id: Number(id) },
      data: {
         foto_profil: profil_url.url,
         nama,
         no_pol,
         kategori,
         mobil,
         no_kep,
         exp_kep: exp_kep_iso,
         no_hp,
         no_darurat,
         password: hashedPassword,
         role: "driver",
      },
   });

   const updatedDriver = await prisma.user.findUnique({
      where: { id: Number(id) },
   });

   return res.status(200).json({ message: "Driver berhasil diperbarui", driver: updatedDriver });
};

export const deleteDriver = async (req, res) => {
   const { id } = req.params;

   const driver = await prisma.user.findUnique({
      where: { id: Number(id) },
   });

   if (!driver) {
      return res.status(400).json({ message: "Driver tidak ditemukan" });
   }

   await prisma.user.delete({
      where: { id: Number(id) },
   });

   return res.status(200).json({ message: "Driver berhasil dihapus" });
};
