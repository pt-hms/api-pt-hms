import prisma from "./client.js";
import dayjs from "dayjs";

const main = async () => {
   console.log("🌱 Starting seeding process...");

   // 1️⃣ Buat admin
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

   console.log("✅ Admin created");

   // 2️⃣ Buat 10 driver
   const drivers = [];
   for (let i = 1; i <= 10; i++) {
      const driver = await prisma.user.create({
         data: {
            foto_profil: "https://cdn-icons-png.freepik.com/512/9703/9703596.png",
            nama: `Driver ${i}`,
            no_pol: `B ${1000 + i} HMS`,
            kategori: "GCA",
            mobil: `Avanza ${i}`,
            no_kep: `DR${i}12345`,
            exp_kep: "2026-12-31T00:00:00Z",
            no_hp: `0813245768${i}`,
            no_darurat: `0898765432${i}`,
            password: "12345678",
            role: "driver",
         },
      });
      drivers.push(driver);
   }

   console.log(`✅ Created ${drivers.length} drivers`);

   // 3️⃣ Buat data per jam (07:00–23:59)
   const date = "2025-10-16";

   // data asli dari flash report kamu
   const hourlyData = [
      { jam: 7, rides: 20, active: 17 },
      { jam: 8, rides: 24, active: 20 },
      { jam: 9, rides: 36, active: 30 },
      { jam: 10, rides: 46, active: 35 },
      { jam: 11, rides: 59, active: 39 },
      { jam: 12, rides: 75, active: 44 },
      { jam: 13, rides: 93, active: 48 },
      { jam: 14, rides: 114, active: 57 },
      { jam: 15, rides: 137, active: 60 },
      { jam: 16, rides: 145, active: 68 },
      { jam: 17, rides: 163, active: 69 },
      { jam: 18, rides: 182, active: 72 },
      { jam: 19, rides: 203, active: 74 },
      { jam: 20, rides: 222, active: 78 },
      { jam: 21, rides: 240, active: 78 },
      { jam: 22, rides: 255, active: 78 },
      { jam: 23, rides: 272, active: 78 },
   ];

   for (const h of hourlyData) {
      const jam = String(h.jam).padStart(2, "0");

      // buat SIJ per jam sesuai active driver count
      for (let i = 0; i < h.active; i++) {
         const driver = drivers[i % drivers.length];
         await prisma.sIJ.create({
            data: {
               no_sij: `SIJ-${jam}-${i + 1}`,
               bukti_tf: `bukti-${jam}-${i + 1}.jpg`,
               user_id: driver.id,
               createdAt: dayjs(`${date} ${jam}:00`).toDate(),
            },
         });
      }

      // buat Ritase per jam sesuai jumlah rides
      for (let j = 0; j < h.rides; j++) {
         const driver = drivers[j % drivers.length];
         await prisma.ritase.create({
            data: {
               ss_order: `ORDER-${jam}-${j + 1}`,
               pickup_point: `Pickup-${jam}-${j + 1}`,
               tujuan: `Tujuan-${jam}-${j + 1}`,
               user_id: driver.id,
               createdAt: dayjs(`${date} ${jam}:${Math.floor(Math.random() * 59)}`).toDate(),
            },
         });
      }

      console.log(`🕖 Hour ${jam}: Created ${h.active} SIJ & ${h.rides} Ritase`);
   }

   console.log("🌾 Seeding completed successfully!");
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
