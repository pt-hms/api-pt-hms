import prisma from "../../prisma/client.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import ExcelJS from "exceljs";

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

export const exportExcel = async (req, res) => {
   try {
      const { date, start, end } = req.query;

      let dateRange = [];
      if (date) {
         dateRange = [new Date(date)];
      } else if (start && end) {
         const startDate = new Date(start);
         const endDate = new Date(end);
         for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dateRange.push(new Date(d));
         }
      } else {
         return res.status(400).json({
            message: "Harap sertakan parameter ?date=YYYY-MM-DD atau ?start=YYYY-MM-DD&end=YYYY-MM-DD",
         });
      }

      const users = await prisma.user.findMany({
         include: {
            ritase: {
               where: {
                  createdAt: {
                     gte: dateRange[0],
                     lte: new Date(dateRange[dateRange.length - 1].getTime() + 24 * 60 * 60 * 1000),
                  },
               },
            },
         },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Laporan Ritase PT HMS");

      const columns = [
         { header: "No", key: "no", width: 5 },
         { header: "Nama", key: "nama", width: 25 },
         { header: "Plat Nomor", key: "no_pol", width: 15 },
         ...dateRange.map((d) => ({
            header: d.toISOString().split("T")[0],
            key: d.toISOString().split("T")[0],
            width: 12,
         })),
      ];

      worksheet.columns = columns;

      const totalRitasePerTanggal = Array(dateRange.length).fill(0);
      const totalDriverHadirPerTanggal = Array(dateRange.length).fill(0);

      let no = 1;
      users.forEach((user) => {
         const row = {
            no,
            nama: user.nama,
            no_pol: user.no_pol,
         };

         dateRange.forEach((tanggal, idx) => {
            const sameDay = user.ritase.filter((r) => {
               const ritaseDate = new Date(r.createdAt);
               return ritaseDate.toISOString().split("T")[0] === tanggal.toISOString().split("T")[0];
            });

            const jumlahRitase = sameDay.length;

            if (jumlahRitase > 0) {
               row[tanggal.toISOString().split("T")[0]] = jumlahRitase;
               totalRitasePerTanggal[idx] += jumlahRitase;
               totalDriverHadirPerTanggal[idx] += 1;
            } else {
               row[tanggal.toISOString().split("T")[0]] = "-";
            }
         });

         worksheet.addRow(row);
         no++;
      });

      worksheet.addRow({});

      const totalRow = { nama: "TOTAL RITASE" };
      const hadirRow = { nama: "TOTAL DRIVER HADIR" };
      const dadRow = { nama: "PERSENTASE DAD" };

      dateRange.forEach((tanggal, idx) => {
         const key = tanggal.toISOString().split("T")[0];
         totalRow[key] = totalRitasePerTanggal[idx];
         hadirRow[key] = totalDriverHadirPerTanggal[idx];

         const dadPercent = ((totalDriverHadirPerTanggal[idx] / users.length) * 100).toFixed(0) + "%";
         dadRow[key] = dadPercent;
      });

      const totalRowRef = worksheet.addRow(totalRow);
      const hadirRowRef = worksheet.addRow(hadirRow);
      const dadRowRef = worksheet.addRow(dadRow);

      [totalRowRef, hadirRowRef, dadRowRef].forEach((row) => {
         row.eachCell((cell) => {
            cell.font = { bold: true };
         });
      });

      worksheet.getRow(1).eachCell((cell) => {
         cell.font = { bold: true };
         cell.alignment = { horizontal: "center" };
         cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
         };
      });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=laporan_ritase_pt_hms_${date || `${start}_${end}`}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
   } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Gagal mengekspor Excel" });
   }
};
