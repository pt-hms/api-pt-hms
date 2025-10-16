import prisma from "./client.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

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

   // 2️⃣ Buat 5 driver
   const drivers = [];
   const categories = ["Reguler", "Premium"];
   for (let i = 1; i <= 5; i++) {
      const driver = await prisma.user.create({
         data: {
            foto_profil: "https://cdn-icons-png.freepik.com/512/9703/9703596.png",
            nama: `Driver ${i}`,
            no_pol: `B ${1000 + i} HMS`,
            kategori: categories[i % 2],
            mobil: `Avanza ${i}`,
            no_kep: `KEP${100 + i}`,
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

   // 3️⃣ Buat data dari 9–16 Oktober
   const startDate = dayjs.tz("2025-10-09", "Asia/Jakarta");
   const endDate = dayjs.tz("2025-10-16", "Asia/Jakarta");

   for (let d = startDate; d.isBefore(endDate.add(1, "day")); d = d.add(1, "day")) {
      const dayStr = d.format("YYYY-MM-DD");
      let maxHour = d.isSame(endDate, "day") ? 19 : 23; // 16 Okt sampai jam 19

      for (const driver of drivers) {
         // 3a️⃣ Buat 1 TF per hari
         const tf = await prisma.tF.create({
            data: {
               bukti_tf: `bukti-${driver.id}-${dayStr}.jpg`,
               user_id: driver.id,
               createdAt: d.hour(0).minute(0).second(0).toDate(),
               updatedAt: d.hour(0).minute(0).second(0).toDate(),
            },
         });

         // 3b️⃣ Buat beberapa SIJ dan Ritase per user
         const numSIJ = Math.floor(Math.random() * 5) + 1; // 1–5 SIJ per user per hari
         const numRitase = Math.floor(Math.random() * 31) + 35; // 35–65 Ritase

         for (let i = 1; i <= numSIJ; i++) {
            const hour = Math.floor(Math.random() * (maxHour - 7 + 1)) + 7;
            const createdAt = dayjs
               .tz(`${dayStr} ${String(hour).padStart(2, "0")}:${Math.floor(Math.random() * 59)}`, "Asia/Jakarta")
               .utc()
               .toDate();

            await prisma.sIJ.create({
               data: {
                  no_sij: String(i).padStart(3, "0"),
                  tf_id: tf.id,
                  user_id: driver.id,
                  createdAt,
                  updatedAt: createdAt,
               },
            });
         }

         for (let i = 1; i <= numRitase; i++) {
            const hour = Math.floor(Math.random() * (maxHour - 7 + 1)) + 7;
            const createdAt = dayjs
               .tz(`${dayStr} ${String(hour).padStart(2, "0")}:${Math.floor(Math.random() * 59)}`, "Asia/Jakarta")
               .utc()
               .toDate();

            await prisma.ritase.create({
               data: {
                  ss_order: `ORDER-${driver.id}-${i}`,
                  pickup_point: `Pickup-${i}`,
                  tujuan: `Tujuan-${i}`,
                  user_id: driver.id,
                  createdAt,
                  updatedAt: createdAt,
               },
            });
         }
      }

      console.log(`📅 Day ${dayStr} seeded`);
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
