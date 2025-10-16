import prisma from "../../prisma/client.js";
import { createWorker } from "tesseract.js";
import { deleteImage, upload } from "../middleware/cloudinary.js";

if (!globalThis.ocrWorkerPromise) {
   globalThis.ocrWorkerPromise = (async () => {
      const worker = await createWorker("eng");
      console.log("✅ OCR Worker siap digunakan di instance ini");
      return worker;
   })();
}

export const createRitase = async (req, res) => {
   const ss_order = req.file;
   const { no_pol } = req.body;

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

// export const uploadRitase = async (req, res) => {
//    const ss_order = req.file;

//    if (!ss_order) {
//       return res.status(400).json({ message: "Semua field harus diisi" });
//    }

//    const worker = await createWorker();
//    await worker.load();
//    await worker.loadLanguage("ind");
//    await worker.initialize("ind");
//    const { data } = await worker.recognize(req.file.buffer);

//    await worker.terminate();

//    const pickupOptions = ["1A", "1B", "1C", "2D", "2E", "2F", "3 Domestik", "3 Internasional"];
//    let pickup = pickupOptions.find((opt) => data.text.toLowerCase().includes(opt.toLowerCase()));
//    if (pickup) {
//       if (!pickup.toLowerCase().startsWith("terminal")) {
//          pickup = `Terminal ${pickup}`;
//       }
//    } else {
//       pickup = "Pick up point Tidak ditemukan";
//    }

//    const tujuanMatch = data.text.match(/Menurunkan([\s\S]*?)Penumpang/i);
//    let tujuan = null;
//    if (tujuanMatch) {
//       tujuan = tujuanMatch[1].replace(/\n+/g, " ").trim();
//    } else {
//       tujuan = "Tujuan Tidak ditemukan";
//    }

//    if (pickup === "Pick up point Tidak ditemukan" || tujuan === "Tujuan Tidak ditemukan") {
//       await deleteImage(order.public_id);
//       return res.status(400).json({ message: "Pick up point atau tujuan tidak ditemukan" });
//    }

//    const duplicate = await prisma.ritase.findFirst({
//       where: { user_id: req.user.id, pickup_point: pickup, tujuan: tujuan },
//    });

//    if (duplicate) {
//       await deleteImage(order.public_id);
//       return res.status(400).json({ message: "Pick up point dan tujuan sudah ada" });
//    }

//    const order = await upload(ss_order);

//    const ritase = await prisma.ritase.create({
//       data: {
//          ss_order: order.url,
//          pickup_point: pickup,
//          tujuan,
//          user_id: req.user.id,
//       },
//    });

//    return res.status(201).json({ message: "Ritase berhasil dibuat", ritase });

//    // const worker = await getOcrWorker();

//    // const ss_order = req.file;
//    //    if (!ss_order) {
//    //       return res.status(400).json({ message: "Semua field harus diisi" });
//    //    }

//    //    // Pastikan worker udah siap
//    //    if (!ocrWorker) {
//    //       return res.status(503).json({ message: "OCR sedang inisialisasi, coba lagi sebentar." });
//    //    }

//    //    // 🧠 Jalankan OCR langsung dari buffer (tanpa upload dulu)
//    //    const { data } = await worker.recognize(ss_order.buffer);

//    //    // 🎯 Ambil pickup point
//    //    const pickupOptions = ["1A", "1B", "1C", "2D", "2E", "2F", "3 Domestik", "3 Internasional"];
//    //    let pickup = pickupOptions.find((opt) => data.text.toLowerCase().includes(opt.toLowerCase()));
//    //    pickup = pickup ? (pickup.toLowerCase().startsWith("terminal") ? pickup : `Terminal ${pickup}`) : null;

//    //    // 🎯 Ambil tujuan
//    //    const tujuanMatch = data.text.match(/Menurunkan([\s\S]*?)Penumpang/i);
//    //    const tujuan = tujuanMatch ? tujuanMatch[1].replace(/\n+/g, " ").trim() : null;

//    //    // ❌ Jika tidak ditemukan
//    //    if (!pickup || !tujuan) {
//    //       return res.status(400).json({ message: "Pick up point atau tujuan tidak ditemukan" });
//    //    }

//    //    // 🔍 Cek duplikat di database
//    //    const duplicate = await prisma.ritase.findFirst({
//    //       where: { user_id: req.user.id, pickup_point: pickup, tujuan },
//    //    });

//    //    if (duplicate) {
//    //       return res.status(400).json({ message: "Pick up point dan tujuan sudah ada" });
//    //    }

//    //    // ☁️ Upload gambar hanya jika data valid
//    //    const order = await upload(ss_order);

//    //    // 💾 Simpan ke database
//    //    const ritase = await prisma.ritase.create({
//    //       data: {
//    //          ss_order: order.url,
//    //          pickup_point: pickup,
//    //          tujuan,
//    //          user_id: req.user.id,
//    //       },
//    //    });

//    //    return res.status(201).json({ message: "Ritase berhasil dibuat", ritase });
// };

export const uploadRitase = async (req, res) => {
   try {
      const ss_order = req.file;
      if (!ss_order) {
         return res.status(400).json({ message: "Semua field harus diisi" });
      }

      // 🔹 Tunggu worker siap (jika cold start)
      const worker = await globalThis.ocrWorkerPromise;

      // 🧠 Jalankan OCR langsung dari buffer (tanpa upload dulu)
      const { data } = await worker.recognize(ss_order.buffer);

      // 🎯 Ambil pickup point
      const pickupOptions = ["1A", "1B", "1C", "2D", "2E", "2F", "3 Domestik", "3 Internasional"];

      let pickup = pickupOptions.find((opt) => data.text.toLowerCase().includes(opt.toLowerCase()));
      pickup = pickup ? (pickup.toLowerCase().startsWith("terminal") ? pickup : `Terminal ${pickup}`) : null;

      // 🎯 Ambil tujuan
      const tujuanMatch = data.text.match(/Menurunkan([\s\S]*?)Penumpang/i);
      const tujuan = tujuanMatch ? tujuanMatch[1].replace(/\n+/g, " ").trim() : null;

      if (!pickup || !tujuan) {
         return res.status(400).json({ message: "Pick up point atau tujuan tidak ditemukan" });
      }

      // 🔍 Cek duplikat
      const duplicate = await prisma.ritase.findFirst({
         where: { user_id: req.user.id, pickup_point: pickup, tujuan },
      });

      if (duplicate) {
         return res.status(400).json({ message: "Pick up point dan tujuan sudah ada" });
      }

      // ☁️ Upload gambar hanya jika data valid
      const order = await upload(ss_order);

      // 💾 Simpan ke database
      const ritase = await prisma.ritase.create({
         data: {
            ss_order: order.url,
            pickup_point: pickup,
            tujuan,
            user_id: req.user.id,
         },
      });

      return res.status(201).json({
         message: "Ritase berhasil dibuat",
         ritase,
      });
   } catch (error) {
      console.error("❌ Error uploadRitase:", error);
      return res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
   }
};

export const getMyRitase = async (req, res) => {
   const { id } = req.user;

   const ritase = await prisma.ritase.findMany({
      where: { user_id: Number(id) },
   });

   return res.status(200).json({ ritase });
}
