import bcrypt from "bcrypt";
import prisma from "./client.js";

const main = async () => {
   await prisma.driver.createMany({
      data: [
         {
            nama: "Admin",
            password: await bcrypt.hash("12345678", 10),
            no_hp: "08123456789",
            foto_profil: "https://upload.wikimedia.org/wikipedia/id/0/0f/Logo_IPB.png",
            role: "admin",
         },
         {
            nama: "Driver",
            password: await bcrypt.hash("12345678", 10),
            no_hp: "08987654321",
            no_pol: "B 1234 ABC",
            kategori: "reguler",
            foto_profil: "https://upload.wikimedia.org/wikipedia/id/0/0f/Logo_IPB.png",
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
