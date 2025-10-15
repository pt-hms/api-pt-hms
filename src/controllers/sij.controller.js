import prisma from "../../prisma/client.js";
import { upload } from "../middleware/cloudinary.js";

export const createSij = async (req, res) => {
   const bukti_tf = req.file;
   const { no_pol } = req.body;

   if (!bukti_tf || !no_pol) {
      return res.status(400).json({ message: "Semua field harus diisi" });
   }

   const noPolUpper = no_pol.toUpperCase();
   const driver = await prisma.user.findUnique({
      where: { no_pol: noPolUpper },
   });

   if (!driver) {
      return res.status(400).json({ message: "Driver tidak ditemukan" });
   }

   const bukti_tf_url = await upload(bukti_tf);

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
         bukti_tf: bukti_tf_url.url,
         user_id: driver.id,
      },
   });

   return res.status(200).json({
      message: "SIJ berhasil dibuat",
      sij,
   });
};

export const getAllSij = async (req, res) => {
   const sij = await prisma.sIJ.findMany({
      orderBy: {
         id: "desc",
      },
      include: {
         user: true,
      },
   });

   return res.status(200).json({ sij });
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

export const printSij = async (req, res) => {
   const bukti_tf = req.file;

   if (!bukti_tf) {
      return res.status(400).json({ message: "Semua field harus diisi" });
   }

   const driver = await prisma.user.findUnique({
      where: { id: req.user.id },
   });

   if (!driver) {
      return res.status(400).json({ message: "Driver tidak ditemukan" });
   }

   const bukti_tf_url = await upload(bukti_tf);

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
         bukti_tf: bukti_tf_url.url,
         user_id: driver.id,
      },
   });

   return res.status(200).json({
      message: "SIJ berhasil dibuat",
      sij,
   });
};
