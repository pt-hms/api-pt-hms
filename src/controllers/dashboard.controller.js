import prisma from "../../prisma/client.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getDashboard = async (req, res) => {
   const { tanggal } = req.query;

   const selectedDate = tanggal || dayjs().tz("Asia/Jakarta").format("YYYY-MM-DD");

   const startOfDay = dayjs.tz(`${selectedDate} 00:00`, "Asia/Jakarta").utc().toDate();
   const endOfDay = dayjs.tz(`${selectedDate} 23:59:59`, "Asia/Jakarta").utc().toDate();

   const ritaseData = await prisma.ritase.findMany({
      where: {
         createdAt: { gte: startOfDay, lte: endOfDay },
      },
      select: { createdAt: true },
   });

   const tfData = await prisma.tF.findMany({
      where: {
         createdAt: { gte: startOfDay, lte: endOfDay },
      },
      select: { createdAt: true, user_id: true },
   });

   const report = [];
   let cumulativeRides = 0;
   let cumulativeDrivers = 0;
   const seenDrivers = new Set();

   for (let hour = 7; hour <= 23; hour++) {
      const ridesThisHour = ritaseData.filter((r) => dayjs(r.createdAt).tz("Asia/Jakarta").hour() === hour).length;
      cumulativeRides += ridesThisHour;

      const tfThisHour = tfData.filter((t) => dayjs(t.createdAt).tz("Asia/Jakarta").hour() === hour);

      tfThisHour.forEach((t) => seenDrivers.add(t.user_id));
      cumulativeDrivers = seenDrivers.size;

      report.push({
         jam: `${String(hour).padStart(2, "0")}:00`,
         rides: cumulativeRides,
         dailyActiveDriver: cumulativeDrivers,
      });
   }

   const totalRides = cumulativeRides;
   const totalDAD = cumulativeDrivers;

   return res.status(200).json({
      tanggal: selectedDate,
      report,
      total: {
         totalRides,
         totalDailyActiveDriver: totalDAD,
      },
   });
};
