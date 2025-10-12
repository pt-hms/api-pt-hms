import multer from "multer";
import fs from "fs";

export const upload = (folder) => {
   const storage = multer.diskStorage({
      destination: (req, file, cb) => {
         const dir = `public/${folder}`;
         if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
         cb(null, dir);
      },
      filename: (req, file, cb) => {
         const uniqueName = Date.now() + "-" + file.originalname;
         cb(null, uniqueName);
      },
   });

   return multer({ storage });
};
