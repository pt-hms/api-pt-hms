import dayjs from "dayjs";
import prisma from "../../prisma/client.js";

export const createSij = async (req, res) => {
   const { tf_id, no_pol, tanggal_jam } = req.body;

   if (!tf_id || !no_pol || !tanggal_jam) {
      return res.status(400).json({ message: `Kolom ${!tf_id ? "Bukti Transfer" : !no_pol ? "Plat Nomor" : "Tanggal & Jam"} harus diisi` });
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

   const createdAt = new Date(tanggal_jam);

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
      nextNumber = (lastNum + 1).toString().padStart(3, "0");
   }

   const sij = await prisma.sIJ.create({
      data: {
         no_sij: nextNumber,
         user_id: driver.id,
         tf_id: Number(tf_id),
         createdAt,
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

   const sijFilter = {
      createdAt: {
         gte: startOfDay,
         lte: endOfDay,
      },
   };

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

export const updateSij = async (req, res) => {
   const { id } = req.params;
   const { tf_id, no_pol, tanggal_jam } = req.body;

   if (!tf_id || !no_pol || !tanggal_jam) {
      return res.status(400).json({ message: `Kolom ${!tf_id ? "Bukti Transfer" : !no_pol ? "Plat Nomor" : "Tanggal & Jam"} harus diisi` });
   }

   const existingSij = await prisma.sIJ.findUnique({
      where: { id: Number(id) },
   });

   if (!existingSij) {
      return res.status(404).json({ message: "SIJ tidak ditemukan" });
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

   const createdAt = new Date(tanggal_jam);

   const updatedSij = await prisma.sIJ.update({
      where: { id: Number(id) },
      data: {
         tf_id: Number(tf_id),
         user_id: driver.id,
         createdAt,
      },
   });

   return res.status(200).json({
      message: "SIJ berhasil diperbarui",
      sij: updatedSij,
   });
};

export const deleteSij = async (req, res) => {
   const { id } = req.body;

   if (!id || !Array.isArray(id) || id.length === 0) {
      return res.status(400).json({ message: "Daftar ID tidak valid" });
   }

   const numericIds = id.map(Number);

   const deleted = await prisma.sIJ.deleteMany({
      where: { id: { in: numericIds } },
   });

   if (deleted.count === 0) {
      return res.status(404).json({ message: "Tidak ada SIJ yang dihapus" });
   }

   return res.status(200).json({
      message: `SIJ dengan ID ${numericIds.join(", ")} berhasil dihapus`,
      deletedCount: deleted.count,
   });
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
      return res.status(400).json({ message: "Bukti Transfer harus diisi" });
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
