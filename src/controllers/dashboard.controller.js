import prisma from "../../prisma/client.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getDashboard = async (req, res) => {
   try {
      const { date } = req.query;
      if (!date) {
         return res.status(400).json({ message: "Tanggal harus diisi (format: YYYY-MM-DD)" });
      }

      // Anggap tanggal lokal Jakarta
      const startOfDay = dayjs.tz(`${date} 00:00`, "Asia/Jakarta").utc().toDate();
      const endOfDay = dayjs.tz(`${date} 23:59:59`, "Asia/Jakarta").utc().toDate();

      // Ambil semua ritase dan sij dalam rentang UTC itu
      const ritaseData = await prisma.ritase.findMany({
         where: {
            createdAt: {
               gte: startOfDay,
               lte: endOfDay,
            },
         },
         select: { createdAt: true },
      });

      const sijData = await prisma.sIJ.findMany({
         where: {
            createdAt: {
               gte: startOfDay,
               lte: endOfDay,
            },
         },
         select: { createdAt: true, user_id: true },
      });

      // lalu konversi createdAt ke jam lokal Jakarta untuk grouping
      const report = [];
      for (let hour = 7; hour <= 23; hour++) {
         const rides = ritaseData.filter((r) => dayjs(r.createdAt).tz("Asia/Jakarta").hour() === hour).length;

         const activeDrivers = new Set(sijData.filter((s) => dayjs(s.createdAt).tz("Asia/Jakarta").hour() === hour).map((s) => s.user_id)).size;

         report.push({
            jam: `${String(hour).padStart(2, "0")}:00`,
            rides,
            dailyActiveDriver: activeDrivers,
         });
      }

      const totalRides = report.reduce((sum, r) => sum + r.rides, 0);
      const totalDAD = report.reduce((sum, r) => sum + r.dailyActiveDriver, 0);

      return res.status(200).json({
         tanggal: date,
         report,
         total: { totalRides, totalDailyActiveDriver: totalDAD },
      });
   } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
   }
};
