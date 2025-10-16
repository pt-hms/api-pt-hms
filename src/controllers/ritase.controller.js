import prisma from "../../prisma/client.js";
import { createWorker } from "tesseract.js";
import { deleteImage, upload } from "../middleware/cloudinary.js";

// if (!globalThis.ocrWorkerPromise) {
//    globalThis.ocrWorkerPromise = (async () => {
//       const worker = await createWorker("eng");
//       console.log("✅ OCR Worker siap digunakan di instance ini");
//       return worker;
//    })();
// }

export const createRitase = async (req, res) => {
   const ss_order = req.file;
   const { no_pol, tanggal, jam } = req.body;

   if (!ss_order || !no_pol) {
      return res.status(400).json({ message: "Semua field harus diisi" });
   }

   const noPolUpper = no_pol.toUpperCase();
   const driver = await prisma.user.findUnique({
      where: { no_pol: noPolUpper },
   });

   if (!driver) {
      return res.status(400).json({ message: "Driver tidak ditemukan" });
   }

   const order = await upload(ss_order);
   const worker = await createWorker("eng");
   const data = await worker.recognize(order.url);

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

   if (pickup === "Pick up point Tidak ditemukan" || tujuan === "Tujuan Tidak ditemukan") {
      await deleteImage(order.public_id);
      return res.status(400).json({ message: "Pick up point atau tujuan tidak ditemukan" });
   }

   const duplicate = await prisma.ritase.findFirst({
      where: { user_id: driver.id, pickup_point: pickup, tujuan: tujuan },
   });

   if (duplicate) {
      await deleteImage(order.public_id);
      return res.status(400).json({ message: "Pick up point dan tujuan sudah ada" });
   }

   await worker.terminate();

   const ritase = await prisma.ritase.create({
      data: {
         ss_order: order.url,
         pickup_point: pickup,
         tujuan,
         user_id: driver.id,
         createdAt: new Date(`${tanggal} ${jam}`),
      },
   });

   return res.status(201).json({ message: "Ritase berhasil dibuat", ritase });
};

export const getAllRitase = async (req, res) => {
   const ritase = await prisma.ritase.findMany({
      orderBy: { id: "desc" },
      include: { user: true },
   });

   return res.status(200).json({ ritase });
};

export const getRitaseById = async (req, res) => {
   const { id } = req.params;

   const ritase = await prisma.ritase.findUnique({
      where: { id: Number(id) },
      include: { user: true },
   });

   return res.status(200).json({ ritase });
};

export const updateRitase = async (req, res) => {
   const { id } = req.params;
   const { no_pol, pickup_point, tujuan } = req.body;

   if (!no_pol || !pickup_point || !tujuan) {
      return res.status(400).json({ message: "Semua field harus diisi" });
   }

   const ritase = await prisma.ritase.findUnique({
      where: { id: Number(id) },
   });

   if (!ritase) {
      return res.status(400).json({ message: "Ritase tidak ditemukan" });
   }

   const noPolUpper = no_pol.toUpperCase();
   const driver = await prisma.user.findUnique({
      where: { no_pol: noPolUpper },
   });

   if (!driver) {
      return res.status(400).json({ message: "Driver tidak ditemukan" });
   }

   await prisma.ritase.update({
      where: { id: Number(id) },
      data: {
         pickup_point,
         tujuan,
         user_id: driver.id,
      },
   });

   const updatedRitase = await prisma.ritase.findUnique({
      where: { id: Number(id) },
   });

   return res.status(200).json({ message: "Ritase berhasil diperbarui", ritase: updatedRitase });
};

export const deleteRitase = async (req, res) => {
   const { id } = req.params;

   const ritase = await prisma.ritase.findUnique({
      where: { id: Number(id) },
   });

   if (!ritase) {
      return res.status(400).json({ message: "Ritase tidak ditemukan" });
   }

   await prisma.ritase.delete({
      where: { id: Number(id) },
   });

   return res.status(200).json({ message: "Ritase berhasil dihapus" });
};

export const getMyRitase = async (req, res) => {
   const { id } = req.user;

   const ritase = await prisma.ritase.findMany({
      where: { user_id: Number(id) },
      orderBy: { createdAt: "desc" },
   });

   const grouped = ritase.reduce((acc, item) => {
      const date = item.createdAt.toISOString().split("T")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
   }, {});

   const groupedArray = Object.entries(grouped).map(([date, data]) => ({
      date,
      count: data.length,
      data,
   }));

   return res.status(200).json({ ritase: groupedArray });
};

export const uploadRitase = async (req, res) => {
   const ss_order = req.file;

   if (!ss_order) {
      return res.status(400).json({ message: "Semua field harus diisi" });
   }

   const timings = {};
   const startAll = Date.now();

   try {
      // 1️⃣ Inisialisasi OCR Worker
      const startInit = Date.now();
      const worker = await createWorker("eng");
      timings.ocrInit = Date.now() - startInit;

      // 2️⃣ Jalankan OCR dan Upload Cloudinary secara paralel
      const startParallel = Date.now();
      const [ocrResult, uploadResult] = await Promise.all([worker.recognize(req.file.buffer), upload(ss_order)]);
      timings.parallelTasks = Date.now() - startParallel;

      await worker.terminate();

      const text = ocrResult.data.text;

      // 3️⃣ Ekstraksi pickup point
      const pickupOptions = ["1A", "1B", "1C", "2D", "2E", "2F", "3 Domestik", "3 Internasional"];
      let pickup = pickupOptions.find((opt) => text.toLowerCase().includes(opt.toLowerCase()));
      if (pickup && !pickup.toLowerCase().startsWith("terminal")) {
         pickup = `Terminal ${pickup}`;
      }
      if (!pickup) pickup = "Pick up point Tidak ditemukan";

      // 4️⃣ Ekstraksi tujuan
      const tujuanMatch = text.match(/Menurunkan([\s\S]*?)Penumpang/i);
      let tujuan = tujuanMatch ? tujuanMatch[1].replace(/\n+/g, " ").trim() : "Tujuan Tidak ditemukan";

      // ❌ Validasi hasil OCR
      if (pickup.includes("Tidak ditemukan") || tujuan.includes("Tidak ditemukan")) {
         return res.status(400).json({
            message: "Pick up point atau tujuan tidak ditemukan",
            pickup,
            tujuan,
            timings,
            totalTime: Date.now() - startAll,
         });
      }

      // 5️⃣ Cek duplikat pakai findUnique (super cepat berkat @@unique)
      const startDuplicate = Date.now();
      const duplicate = await prisma.ritase.findFirst({
         where: {
            user_id_pickup_point_tujuan: {
               user_id: req.user.id,
               pickup_point: pickup,
               tujuan,
            },
         },
      });
      timings.checkDuplicate = Date.now() - startDuplicate;

      if (duplicate) {
         return res.status(400).json({
            message: "Pick up point dan tujuan sudah ada",
            pickup,
            tujuan,
            timings,
            totalTime: Date.now() - startAll,
         });
      }

      // 6️⃣ Simpan ke database
      const startDB = Date.now();
      const ritase = await prisma.ritase.create({
         data: {
            ss_order: uploadResult.url,
            pickup_point: pickup,
            tujuan,
            user_id: req.user.id,
         },
      });
      timings.saveDB = Date.now() - startDB;

      timings.total = Date.now() - startAll;

      return res.status(201).json({
         message: "Ritase berhasil dibuat",
         pickup,
         tujuan,
         timings,
         ritase,
      });
   } catch (error) {
      console.error("❌ Error uploadRitase:", error);
      return res.status(500).json({
         message: "Terjadi kesalahan server",
         error: error.message,
         timings,
         totalTime: Date.now() - startAll,
      });
   }
};
