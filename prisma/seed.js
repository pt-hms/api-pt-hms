// prisma/seed.js
import prisma from "./client.js";
import dayjs from "dayjs";

const main = async () => {
   console.log("🌱 Starting seeding process...");

   // 🔹 Hapus data lama biar clean
   await prisma.sIJ.deleteMany();
   await prisma.ritase.deleteMany();
   await prisma.tF.deleteMany();
   await prisma.user.deleteMany();
   console.log("🧹 Old data cleared");

   // 1️⃣ Buat admin
   const admin = await prisma.user.create({
      data: {
         foto_profil: "https://cdn-icons-png.freepik.com/512/9703/9703596.png",
         nama: "ADMIN",
         no_pol: "B 0000 ADM",
         kategori: "PREMIUM",
         mobil: "AVANZA",
         no_kep: "KEP000",
         exp_kep: "2026-12-31T00:00:00Z",
         no_hp: "08120000000",
         no_darurat: "08120000001",
         password: "12345678",
         role: "admin",
      },
   });
   console.log("✅ Admin created:", admin.nama);

   // 2️⃣ Buat 5 driver
   const kategoriList = ["REGULER", "PREMIUM"];
   const drivers = [];
   for (let i = 1; i <= 5; i++) {
      const driver = await prisma.user.create({
         data: {
            foto_profil: "https://cdn-icons-png.freepik.com/512/9703/9703596.png",
            nama: `Driver ${i}`,
            no_pol: `B ${1000 + i} HMS`,
            kategori: kategoriList[i % 2],
            mobil: `Avanza ${i}`,
            no_kep: `KEP00${i}`,
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

   // 3️⃣ Range tanggal 9–16 Oktober 2025
   const startDate = dayjs("2025-10-09");
   const endDate = dayjs("2025-10-16");
   const totalDays = endDate.diff(startDate, "day") + 1;

   for (let d = 0; d < totalDays; d++) {
      const date = startDate.add(d, "day").format("YYYY-MM-DD");
      console.log(`📅 Seeding data untuk tanggal ${date}...`);

      for (const driver of drivers) {
         // jumlah random per hari (35–65)
         const ritaseCount = Math.floor(Math.random() * 31) + 35;
         const sijCount = Math.floor(Math.random() * 31) + 35;

         // 🔸 Buat TF
         const tf = await prisma.tF.create({
            data: {
               bukti_tf: `bukti_tf_${driver.id}_${date}.jpg`,
               user_id: driver.id,
               createdAt: dayjs(`${date} 07:00`).toDate(),
            },
         });

         // 🔸 Buat SIJ
         for (let i = 0; i < sijCount; i++) {
            const randomHour = Math.floor(Math.random() * 17) + 7; // jam 07–23
            const sijTime = dayjs(`${date} ${randomHour}:${Math.floor(Math.random() * 59)}`)
               .second(Math.floor(Math.random() * 59))
               .toDate();

            await prisma.sIJ.create({
               data: {
                  no_sij: `SIJ-${driver.id}-${date}-${i + 1}`,
                  user_id: driver.id,
                  tf_id: tf.id,
                  createdAt: sijTime,
               },
            });
         }

         // 🔸 Buat Ritase
         for (let j = 0; j < ritaseCount; j++) {
            const randomHour = Math.floor(Math.random() * 17) + 7;
            const ritaseTime = dayjs(`${date} ${randomHour}:${Math.floor(Math.random() * 59)}`)
               .second(Math.floor(Math.random() * 59))
               .toDate();

            await prisma.ritase.create({
               data: {
                  ss_order: `ORDER-${driver.id}-${date}-${j + 1}`,
                  pickup_point: `Pickup-${driver.nama}`,
                  tujuan: `Tujuan-${driver.nama}`,
                  user_id: driver.id,
                  createdAt: ritaseTime,
               },
            });
         }

         console.log(`🚗 ${driver.nama} → ${ritaseCount} ritase & ${sijCount} SIJ dibuat (${date})`);
      }
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
