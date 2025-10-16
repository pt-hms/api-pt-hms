import prisma from "./client.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const main = async () => {
   console.log("🌱 Starting seeding process...");

   // Bersihkan database dulu biar gak dobel
   await prisma.sIJ.deleteMany();
   await prisma.tF.deleteMany();
   await prisma.ritase.deleteMany();
   await prisma.user.deleteMany();

   // 1️⃣ Buat admin
   const admin = await prisma.user.create({
      data: {
         foto_profil: "https://cdn-icons-png.freepik.com/512/9703/9703596.png",
         nama: "ADMIN",
         no_pol: "B 0000 ADM",
         kategori: "PREMIUM",
         mobil: "AVANZA",
         no_kep: "KEP000",
         exp_kep: "2025-12-31T00:00:00Z",
         no_hp: "08123456789",
         no_darurat: "08234567890",
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
            kategori: kategoriList[Math.floor(Math.random() * kategoriList.length)],
            mobil: `Avanza ${i}`,
            no_kep: `KEP${i.toString().padStart(3, "0")}`,
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

   // 3️⃣ Tanggal range: 9–16 Oktober (Asia/Jakarta, tapi disimpan UTC)
   const startDate = dayjs.tz("2025-10-09", "Asia/Jakarta");
   const endDate = dayjs.tz("2025-10-16", "Asia/Jakarta");

   for (let date = startDate; date.isBefore(endDate) || date.isSame(endDate, "day"); date = date.add(1, "day")) {
      console.log(`📅 Seeding data untuk tanggal ${date.format("YYYY-MM-DD")}`);
      let sijCounter = 1; // reset tiap hari

      for (const driver of drivers) {
         // 1️⃣ TF per hari per user
         const tf = await prisma.tF.create({
            data: {
               bukti_tf: `bukti_${driver.nama}_${date.format("YYYYMMDD")}.jpg`,
               user_id: driver.id,
               createdAt: date.utc().toDate(), // simpan UTC
            },
         });

         // jumlah random 35–65
         const sijCount = Math.floor(Math.random() * 31) + 35;
         const ritaseCount = Math.floor(Math.random() * 31) + 35;

         // 2️⃣ SIJ per user
         for (let i = 0; i < sijCount; i++) {
            const sijTime = date.add(Math.floor(Math.random() * 24), "hour").add(Math.floor(Math.random() * 60), "minute");
            await prisma.sIJ.create({
               data: {
                  no_sij: sijCounter.toString().padStart(3, "0"),
                  user_id: driver.id,
                  tf_id: tf.id,
                  createdAt: sijTime.tz("Asia/Jakarta").utc().toDate(),
               },
            });
            sijCounter++;
         }

         // 3️⃣ Ritase per user
         for (let j = 0; j < ritaseCount; j++) {
            const rTime = date.add(Math.floor(Math.random() * 24), "hour").add(Math.floor(Math.random() * 60), "minute");
            await prisma.ritase.create({
               data: {
                  ss_order: `ORDER-${driver.id}-${date.format("MMDD")}-${j + 1}`,
                  pickup_point: `Pickup-${driver.nama}-${j + 1}`,
                  tujuan: `Tujuan-${driver.nama}-${j + 1}`,
                  user_id: driver.id,
                  createdAt: rTime.tz("Asia/Jakarta").utc().toDate(),
               },
            });
         }
      }
   }

   console.log("🌾 Seeding completed successfully!");
};

main()
   .then(async () => {
      await prisma.$disconnect();
   })
   .catch(async (e) => {
      console.error("❌ Error during seeding:", e);
      await prisma.$disconnect();
      process.exit(1);
   });
