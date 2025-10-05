import prisma from "../../prisma/client.js";
import { createWorker } from "tesseract.js";

export const createOrder = async (req, res) => {
   const { gambar } = req.body;

   if (!gambar || !gambar.startsWith("data:image")) {
      return res.status(400).json({ message: "Image tidak valid" });
   }

   const worker = await createWorker("eng");
   const data = await worker.recognize(gambar);

   const pickupOptions = ["1A", "1B", "1C", "2D", "2E", "2F", "3 Domestik", "3 Internasional"];
   let pickup = pickupOptions.find((opt) => data.data.text.toLowerCase().includes(opt.toLowerCase()));
   if (pickup) {
      if (!pickup.toLowerCase().startsWith("terminal")) {
         pickup = `Terminal ${pickup}`;
      }
   } else {
      pickup = "Pick up point Tidak ditemukan";
   }

   const tujuanMatch = data.data.text.match(/Menurunkan([\s\S]*?)Penumpang/i);
   let tujuan = null;
   if (tujuanMatch) {
      tujuan = tujuanMatch[1].replace(/\n+/g, " ").trim();
   } else {
      tujuan = "Tujuan Tidak ditemukan";
   }

   const order = await prisma.order.create({
      data: {
         nama_driver: req.user.nama,
         no_hp: req.user.no_hp,
         no_pol: req.user.no_pol,
         kategori: req.user.kategori,
         pickup_point: pickup,
         tujuan,
         driverId: req.user.id,
      },
   });

   return res.status(201).json({ message: "Order berhasil dibuat", order });
};

export const getAllOrders = async (req, res) => {};

export const getOrderById = async (req, res) => {
   const { id } = req.params;

   const order = await prisma.order.findUnique({
      where: { id: Number(id) },
   });

   return res.status(200).json({ order });
};

export const updateOrder = async (req, res) => {
   const { id } = req.params;
   const { nama_driver, no_hp, no_pol, kategori, pickup_point, tujuan } = req.body;

   if (!nama_driver || !no_hp || !no_pol || !kategori || !pickup_point || !tujuan) {
      return res.status(400).json({ message: "Semua field harus diisi" });
   }

   const order = await prisma.order.findUnique({
      where: { id: Number(id) },
   });

   if (!order) {
      return res.status(400).json({ message: "Order tidak ditemukan" });
   }

   await prisma.order.update({
      where: { id: Number(id) },
      data: {
         nama_driver,
         no_hp,
         no_pol,
         kategori,
         pickup_point,
         tujuan,
      },
   });

   return res.status(200).json({ message: "Order berhasil diperbarui" });
};

export const deleteOrder = async (req, res) => {
   const { id } = req.params;

   const order = await prisma.order.findUnique({
      where: { id: Number(id) },
   });

   if (!order) {
      return res.status(400).json({ message: "Order tidak ditemukan" });
   }

   await prisma.order.delete({
      where: { id: Number(id) },
   });

   return res.status(200).json({ message: "Order berhasil dihapus" });
};
