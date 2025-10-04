import bcrypt from "bcrypt";
import prisma from "../../prisma/client.js";

export const createDriver = async (req, res) => {};

export const getAllDrivers = async (req, res) => {
   const { kategori } = req.query;

   const drivers = await prisma.driver.findMany({
      orderBy: {
         id: "desc",
      },
   });

   if (kategori) {
      const filteredDrivers = drivers.filter((driver) => driver.kategori === kategori);
      return res.status(200).json({ drivers: filteredDrivers });
   }

   return res.status(200).json({ drivers });
};

export const getDriverById = async (req, res) => {};

export const updateDriver = async (req, res) => {};

export const deleteDriver = async (req, res) => {};
