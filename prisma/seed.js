import prisma from "./client.js";

const main = async () => {
   await prisma.user.create({
      data: {
         foto_profil: "https://cdn-icons-png.freepik.com/512/9703/9703596.png",
         nama: "ADMIN",
         no_pol: "B 0000 ADM",
         kategori: "PREMIUM",
         mobil: "AVANZA",
         no_kep: "1234567890",
         exp_kep: "2025-12-31T00:00:00Z",
         no_hp: "08123456789",
         no_darurat: "08234567890",
         password: "12345678",
         role: "admin",
      },
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
