import axios from "axios";
import FormData from "form-data";
import { config } from "dotenv";
config({ path: ".env" });

const url = process.env.FILESERVER_URL;

export const upload = async (file) => {
   const formData = new FormData();
   formData.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
   });

   const profil_url = await axios.post(`${url}/upload`, formData, {
      headers: formData.getHeaders(),
   });

   return profil_url.data.url;
};
