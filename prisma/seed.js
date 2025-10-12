import bcrypt from "bcrypt";
import prisma from "./client.js";

const main = async () => {
   await prisma.user.createMany({
      data: [
         {
            foto_profil: "https://cdn-icons-png.freepik.com/512/9703/9703596.png",
            nama: "Admin",
            no_pol: "B 0000 ADM",
            kategori: "premium",
            mobil: "Avanza",
            no_kep: "1234567890",
            exp_kep: "2025-12-31T00:00:00Z",
            no_hp: "08123456789",
            no_darurat: "08234567890",
            password: await bcrypt.hash("12345678", 10),
            role: "admin",
         },
         {
            foto_profil: "https://cdn-icons-png.freepik.com/512/1535/1535791.png",
            nama: "Driver",
            no_pol: "B 1234 DRV",
            kategori: "reguler",
            mobil: "Avanza",
            no_kep: "1234567890",
            exp_kep: "2025-12-31T00:00:00Z",
            no_hp: "08987654321",
            no_darurat: "08234567890",
            password: await bcrypt.hash("12345678", 10),
            role: "driver",
         },
      ],
   });
};

main()
   .then(async () => {
      await prisma.$disconnect();
   })
   .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
   });
