import prisma from "../../prisma/client.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getDashboard = async (req, res) => {
   const { tanggal } = req.query;

   const selectedDate = tanggal || dayjs().tz("Asia/Jakarta").format("YYYY-MM-DD");
   const nowJakarta = dayjs().tz("Asia/Jakarta");

   const startOfDay = dayjs.tz(`${selectedDate} 00:00`, "Asia/Jakarta").utc().toDate();
   const endOfDay = dayjs.tz(`${selectedDate} 23:59:59`, "Asia/Jakarta").utc().toDate();

   const ritaseData = await prisma.ritase.findMany({
      where: { createdAt: { gte: startOfDay, lte: endOfDay } },
      select: { createdAt: true },
   });

   const tfData = await prisma.tF.findMany({
      where: { createdAt: { gte: startOfDay, lte: endOfDay } },
      select: { createdAt: true, user_id: true },
   });

   const report = [];
   const seenDrivers = new Set();

   let cumulativeRides = 0;
   let cumulativeDrivers = 0;

   const inRange = (createdAt, start, end) => {
      const t = dayjs(createdAt).tz("Asia/Jakarta");
      return (t.isAfter(start) || t.isSame(start)) && (t.isBefore(end) || t.isSame(end));
   };

   for (let hour = 7; hour <= 23; hour++) {
      let windowStart, windowEnd;
      if (hour === 7) {
         windowStart = dayjs.tz(`${selectedDate} 00:00:00`, "Asia/Jakarta");
         windowEnd = dayjs.tz(`${selectedDate} 06:59:59`, "Asia/Jakarta");
      } else {
         const prevHour = hour - 1;
         windowStart = dayjs.tz(`${selectedDate} ${String(prevHour).padStart(2, "0")}:00:00`, "Asia/Jakarta");
         windowEnd = dayjs.tz(`${selectedDate} ${String(hour - 1).padStart(2, "0")}:59:59`, "Asia/Jakarta");
      }

      const label = hour === 23 ? "23:59" : `${String(hour).padStart(2, "0")}:00`;

      const windowPassed = !windowEnd.isAfter(nowJakarta);

      if (windowPassed) {
         const ridesUntilNow = ritaseData.filter((r) => inRange(r.createdAt, dayjs.tz(`${selectedDate} 00:00:00`, "Asia/Jakarta"), windowEnd)).length;
         cumulativeRides = ridesUntilNow;

         const tfUntilNow = tfData.filter((t) => inRange(t.createdAt, dayjs.tz(`${selectedDate} 00:00:00`, "Asia/Jakarta"), windowEnd));
         tfUntilNow.forEach((t) => seenDrivers.add(t.user_id));
         cumulativeDrivers = seenDrivers.size;

         report.push({
            jam: label,
            rides: cumulativeRides,
            dailyActiveDriver: cumulativeDrivers,
         });
      } else {
         report.push({
            jam: label,
            rides: 0,
            dailyActiveDriver: 0,
         });
      }
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
