import bcrypt from "bcrypt";
import prisma from "../../prisma/client.js";

export const createDriver = async (req, res) => {
   const { nama, password, no_hp, no_pol, kategori, foto_profil } = req.body;

   if (!nama || !password || !no_hp || !no_pol || !kategori || !foto_profil) {
      return res.status(400).json({ message: "Semua field harus diisi" });
   }

   const exist = await prisma.driver.findUnique({
      where: { no_hp },
   });

   if (exist) {
      return res.status(400).json({ message: "Nomor HP sudah terdaftar" });
   }

   const hashedPassword = await bcrypt.hash(password, 10);

   const driver = await prisma.driver.create({
      data: {
         nama,
         password: hashedPassword,
         no_hp,
         no_pol,
         kategori,
         foto_profil,
         role: "driver",
      },
   });

   return res.status(201).json({ message: "Driver berhasil dibuat", driver });
};

export const getAllDrivers = async (req, res) => {
   const { kategori } = req.query;

   const drivers = await prisma.driver.findMany({
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

   const driver = await prisma.driver.findUnique({
      where: { id: Number(id) },
   });

   return res.status(200).json({ driver });
};

export const updateDriver = async (req, res) => {
   const { id } = req.params;
   const { nama, password, no_hp, no_pol, kategori, foto_profil } = req.body;

   const driver = await prisma.driver.update({
      where: { id: Number(id) },
      data: {
         nama,
         password,
         no_hp,
         no_pol,
         kategori,
         foto_profil,
      },
   });

   return res.status(200).json({ message: "Driver berhasil diperbarui", driver });
};

export const deleteDriver = async (req, res) => {
   const { id } = req.params;

   const driver = await prisma.driver.findUnique({
      where: { id: Number(id) },
   });

   if (!driver) {
      return res.status(400).json({ message: "Driver tidak ditemukan" });
   }

   await prisma.driver.delete({
      where: { id: Number(id) },
   });

   return res.status(200).json({ message: "Driver berhasil dihapus" });
};
