import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";
config({ path: ".env" });

// Konfigurasi Cloudinary
cloudinary.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const upload = async (file) => {
   try {
      const result = await new Promise((resolve, reject) => {
         const stream = cloudinary.uploader.upload_stream(
            { folder: "pt-hms" }, // bisa ubah folder sesuai keinginanmu
            (error, result) => {
               if (error) reject(error);
               else resolve(result);
            }
         );
         stream.end(file.buffer); // langsung dari buffer multer
      });

      return {
         url: result.secure_url,
         public_id: result.public_id,
      };
   } catch (error) {
      console.error("Upload error:", error);
      throw new Error("Gagal upload ke Cloudinary");
   }
};
