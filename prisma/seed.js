import prisma from "./client.js";
// import dayjs from "dayjs";
// import utc from "dayjs/plugin/utc.js";
// import timezone from "dayjs/plugin/timezone.js";

// dayjs.extend(utc);
// dayjs.extend(timezone);

// // const prisma = new PrismaClient();

// // const categories = ["Reguler", "Eksekutif"];

// // const startDate = dayjs.tz("2025-10-09", "Asia/Jakarta");
// // const endDate = dayjs.tz("2025-10-16", "Asia/Jakarta");

// // const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const main = async () => {
   console.log("🌱 Starting seeding...");

   // 1️⃣ Buat admin
   const admin = await prisma.user.create({
      data: {
         foto_profil: "https://cdn-icons-png.freepik.com/512/9703/9703596.png",
         nama: "ADMIN",
         no_pol: "B 1 HMS",
         kategori: "Admin",
         mobil: "-",
         no_kep: "-",
         exp_kep: new Date("2030-12-31T00:00:00Z"),
         no_hp: "081234567890",
         no_darurat: "089876543210",
         password: "12345678",
         role: "admin",
      },
   });

   console.log("✅ Admin created");

   // // 2️⃣ Buat 5 driver
   // const drivers = [];
   // for (let i = 1; i <= 5; i++) {
   //    const driver = await prisma.user.create({
   //       data: {
   //          foto_profil: "https://cdn-icons-png.freepik.com/512/9703/9703596.png",
   //          nama: `Driver ${i}`,
   //          no_pol: `B ${1000 + i} HMS`,
   //          kategori: categories[i % 2],
   //          mobil: `Avanza ${i}`,
   //          no_kep: `KEP${100 + i}`,
   //          exp_kep: new Date("2026-12-31T00:00:00Z"),
   //          no_hp: `0813245768${i}`,
   //          no_darurat: `0898765432${i}`,
   //          password: "12345678",
   //          role: "driver",
   //       },
   //    });
   //    drivers.push(driver);
   // }
   // console.log("✅ Drivers created");

   // // 3️⃣ Buat SIJ, Ritase, dan TF per hari
   // for (let day = startDate; day.isBefore(endDate) || day.isSame(endDate, "day"); day = day.add(1, "day")) {
   //    for (const driver of drivers) {
   //       // TF: 1x per user per hari
   //       const tfTime = day.hour(10).minute(0).second(0);
   //       const tf = await prisma.tF.create({
   //          data: {
   //             bukti_tf: `https://dummyimage.com/200x200/000/fff&text=TF+${driver.id}+${day.format("YYYYMMDD")}`,
   //             user_id: driver.id,
   //             createdAt: tfTime.toDate(),
   //             updatedAt: tfTime.toDate(),
   //          },
   //       });

   //       // SIJ & Ritase: 20-25 per user per hari
   //       const totalRitase = randomInt(20, 25);
   //       for (let j = 0; j < totalRitase; j++) {
   //          const hour = day
   //             .hour(6)
   //             .minute(0)
   //             .add(j * 30, "minute"); // interval tiap 30 menit
   //          // batasi 16 Okt sampai pukul 19:00
   //          if (day.isSame(endDate, "day") && hour.hour() >= 19) break;

   //          const no_sij = String(j + 1).padStart(3, "0");

   //          const ritase = await prisma.ritase.create({
   //             data: {
   //                ss_order: `SS-${driver.id}-${day.format("YYYYMMDD")}-${no_sij}`,
   //                pickup_point: `Point ${j + 1}`,
   //                tujuan: `Tujuan ${j + 1}`,
   //                user_id: driver.id,
   //                createdAt: hour.toDate(),
   //                updatedAt: hour.toDate(),
   //             },
   //          });

   //          await prisma.sIJ.create({
   //             data: {
   //                no_sij,
   //                user_id: driver.id,
   //                tf_id: tf.id,
   //                createdAt: hour.toDate(),
   //                updatedAt: hour.toDate(),
   //             },
   //          });
   //       }
   //    }
   // }

   console.log("🌱 Seeding finished");
};

main()
   .catch((e) => {
      console.error(e);
      process.exit(1);
   })
   .finally(async () => {
      await prisma.$disconnect();
   });
