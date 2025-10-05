export const createOrder = async (req, res) => {};

export const getAllOrders = async (req, res) => {};

export const getOrderById = async (req, res) => {
   const { id } = req.params;

   const order = await prisma.order.findUnique({
      where: { id: Number(id) },
   });

   return res.status(200).json({ order });
};

export const updateOrder = async (req, res) => {
   const { id } = req.params;
   const { nama_driver, no_hp, no_pol, kategori, pickup_point, tujuan } = req.body;

   if (!nama_driver || !no_hp || !no_pol || !kategori || !pickup_point || !tujuan) {
      return res.status(400).json({ message: "Semua field harus diisi" });
   }

   const order = await prisma.order.findUnique({
      where: { id: Number(id) },
   });

   if (!order) {
      return res.status(400).json({ message: "Order tidak ditemukan" });
   }

   await prisma.order.update({
      where: { id: Number(id) },
      data: {
         nama_driver,
         no_hp,
         no_pol,
         kategori,
         pickup_point,
         tujuan,
      },
   });

   return res.status(200).json({ message: "Order berhasil diperbarui" });
};

export const deleteOrder = async (req, res) => {
   const { id } = req.params;

   const order = await prisma.order.findUnique({
      where: { id: Number(id) },
   });

   if (!order) {
      return res.status(400).json({ message: "Order tidak ditemukan" });
   }

   await prisma.order.delete({
      where: { id: Number(id) },
   });

   return res.status(200).json({ message: "Order berhasil dihapus" });
};
