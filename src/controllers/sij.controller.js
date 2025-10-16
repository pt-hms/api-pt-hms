import dayjs from "dayjs";
import prisma from "../../prisma/client.js";
import { upload } from "../middleware/cloudinary.js";

export const createSij = async (req, res) => {
   const { tf_id, no_pol } = req.body;

   if (!tf_id || !no_pol) {
      return res.status(400).json({ message: "Semua field harus diisi" });
   }

   const noPolUpper = no_pol.toUpperCase();
   const driver = await prisma.user.findUnique({
      where: { no_pol: noPolUpper },
   });

   if (!driver) {
      return res.status(400).json({ message: "Driver tidak ditemukan" });
   }

   const tf = await prisma.tF.findUnique({
      where: { id: Number(tf_id) },
   });

   if (!tf) {
      return res.status(400).json({ message: "Bukti Transfer tidak ditemukan" });
   }

   const startOfDay = new Date();
   startOfDay.setHours(0, 0, 0, 0);

   const endOfDay = new Date();
   endOfDay.setHours(23, 59, 59, 999);

   const lastSij = await prisma.sIJ.findFirst({
      where: {
         createdAt: {
            gte: startOfDay,
            lte: endOfDay,
         },
      },
      orderBy: {
         createdAt: "desc",
      },
   });

   let nextNumber = "001";
   if (lastSij) {
      const lastNum = parseInt(lastSij.no_sij, 10);
      const newNum = (lastNum + 1).toString().padStart(3, "0");
      nextNumber = newNum;
   }

   const sij = await prisma.sIJ.create({
      data: {
         no_sij: nextNumber,
         user_id: driver.id,
         tf_id: Number(tf_id),
      },
   });

   return res.status(200).json({
      message: "SIJ berhasil dibuat",
      sij,
   });
};

export const getAllSij = async (req, res) => {
   const { tanggal } = req.query;

   const selectedDate = tanggal || dayjs().tz("Asia/Jakarta").format("YYYY-MM-DD");

   const startOfDay = dayjs.tz(selectedDate, "Asia/Jakarta").startOf("day").toDate();
   const endOfDay = dayjs.tz(selectedDate, "Asia/Jakarta").endOf("day").toDate();

   // Filter untuk tabel sij
   const sijFilter = {
      createdAt: {
         gte: startOfDay,
         lte: endOfDay,
      },
   };

   // Filter untuk tabel tf
   const tfFilter = {
      createdAt: {
         gte: startOfDay,
         lte: endOfDay,
      },
   };

   const drivers = await prisma.user.findMany({
      where: { role: "driver" },
      orderBy: { id: "desc" },
      include: {
         sij: {
            where: sijFilter,
            orderBy: { id: "desc" },
         },
         tf: {
            where: tfFilter,
            orderBy: { id: "desc" },
         },
      },
   });

   return res.status(200).json({ drivers });
};

export const getSijById = async (req, res) => {
   const { id } = req.params;

   const sij = await prisma.sIJ.findUnique({
      where: { id: Number(id) },
      include: {
         user: true,
      },
   });

   if (!sij) {
      return res.status(400).json({ message: "SIJ tidak ditemukan" });
   }

   return res.status(200).json({ sij });
};

export const updateSij = async (req, res) => {
   const { id } = req.params;
   const bukti_tf = req.file;
   const { no_pol } = req.body;

   if (!bukti_tf || !no_pol) {
      return res.status(400).json({ message: "Semua field harus diisi" });
   }

   const sij = await prisma.sIJ.findUnique({
      where: { id: Number(id) },
   });

   if (!sij) {
      return res.status(400).json({ message: "SIJ tidak ditemukan" });
   }

   const bukti_tf_url = await upload(bukti_tf);

   await prisma.sIJ.update({
      where: { id: Number(id) },
      data: {
         bukti_tf: bukti_tf_url.url,
         user_id: sij.user_id,
      },
   });

   const updatedSij = await prisma.sIJ.findUnique({
      where: { id: Number(id) },
   });

   return res.status(200).json({ message: "SIJ berhasil diupdate", sij: updatedSij });
};

export const deleteSij = async (req, res) => {
   const { id } = req.params;

   const sij = await prisma.sIJ.findUnique({
      where: { id: Number(id) },
   });

   if (!sij) {
      return res.status(400).json({ message: "SIJ tidak ditemukan" });
   }

   await prisma.sIJ.delete({
      where: { id: Number(id) },
   });

   return res.status(200).json({ message: "SIJ berhasil dihapus" });
};

export const getLastSij = async (req, res) => {
   const startOfDay = dayjs().tz("Asia/Jakarta").startOf("day").utc().toDate();
   const endOfDay = dayjs().tz("Asia/Jakarta").endOf("day").utc().toDate();

   const lastSij = await prisma.sIJ.findFirst({
      where: {
         createdAt: {
            gte: startOfDay,
            lte: endOfDay,
         },
      },
      orderBy: {
         no_sij: "desc",
      },
   });

   if (!lastSij) {
      return res.status(200).json({ message: "Belum ada SIJ hari ini", no_sij: null });
   }

   return res.status(200).json({ no_sij: lastSij.no_sij });
};

export const printSij = async (req, res) => {
   const { tf_id } = req.body;

   if (!tf_id) {
      return res.status(400).json({ message: "Semua field harus diisi" });
   }

   const driver = await prisma.user.findUnique({
      where: { id: req.user.id },
   });

   if (!driver) {
      return res.status(400).json({ message: "Driver tidak ditemukan" });
   }

   const tf = await prisma.tF.findUnique({
      where: { id: Number(tf_id) },
   });

   if (!tf) {
      return res.status(400).json({ message: "Bukti Transfer tidak ditemukan" });
   }

   // ✅ Gunakan timezone Asia/Jakarta
   const startOfDay = dayjs().tz("Asia/Jakarta").startOf("day").toDate();
   const endOfDay = dayjs().tz("Asia/Jakarta").endOf("day").toDate();

   const lastSij = await prisma.sIJ.findFirst({
      where: {
         createdAt: {
            gte: startOfDay,
            lte: endOfDay,
         },
      },
      orderBy: {
         createdAt: "desc",
      },
   });

   let nextNumber = "001";
   if (lastSij) {
      const lastNum = parseInt(lastSij.no_sij, 10);
      const newNum = (lastNum + 1).toString().padStart(3, "0");
      nextNumber = newNum;
   }

   const sij = await prisma.sIJ.create({
      data: {
         no_sij: nextNumber,
         user_id: driver.id,
         tf_id: Number(tf_id),
      },
   });

   return res.status(200).json({
      message: "SIJ berhasil dibuat",
      sij,
   });
};
