import dayjs from "dayjs";
import prisma from "../../prisma/client.js";
import { upload } from "../middleware/cloudinary.js";

export const uploadTf = async (req, res) => {
   const bukti_tf = req.file;

   if (!bukti_tf) {
      return res.status(400).json({ message: "Semua field harus diisi" });
   }

   const bukti_tf_url = await upload(bukti_tf);

   const tf = await prisma.tF.create({
      data: {
         bukti_tf: bukti_tf_url.url,
         user_id: req.user.id,
      },
   });

   return res.status(200).json({ message: "TF berhasil diupload", tf });
};

export const checkTf = async (req, res) => {
   const today = dayjs().startOf("day");
   const tomorrow = dayjs().endOf("day");

   const tf = await prisma.tF.findFirst({
      where: {
         user_id: req.user.id,
         createdAt: {
            gte: today.toDate(),
            lte: tomorrow.toDate(),
         },
      },
      orderBy: { createdAt: "desc" },
   });

   if (!tf) {
      return res.status(200).json({
         message: "Belum upload bukti transfer hari ini",
         tf,
      });
   }

   return res.status(200).json({
      message: "Sudah upload bukti transfer hari ini",
      tf,
   });
};
