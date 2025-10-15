import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';
import * as profileController from '../controllers/profile.controller.js';
import * as driversController from '../controllers/drivers.controller.js';
import * as sijController from '../controllers/sij.controller.js';
import * as ordersController from '../controllers/orders.controller.js';
import multer from 'multer';

const route = Router();
const upload = multer({ storage: multer.memoryStorage() });

// auth
route.post('/register', upload.single("foto_profil"), authController.register);
route.post('/login', authController.login);

// profile
route.get('/profile', auth, profileController.getProfile);
route.put('/profile', auth, upload.single("foto_profil"), profileController.updateProfile);

// drivers
route.post('/drivers', auth, upload.single("foto_profil"), driversController.createDriver);
route.get('/drivers', auth, driversController.getAllDrivers);
route.get('/drivers/:id', auth, driversController.getDriverById);
route.put('/drivers/:id', auth, upload.single("foto_profil"), driversController.updateDriver);
route.delete('/drivers/:id', auth, driversController.deleteDriver);

// sij
route.post('/sij', auth, upload.single("bukti_tf"), sijController.createSij);
route.get('/sij', auth, sijController.getAllSij);
route.get('/sij/:id', auth, sijController.getSijById);
route.put('/sij/:id', auth, upload.single("bukti_tf"), sijController.updateSij);
route.delete('/sij/:id', auth, sijController.deleteSij);
route.post('/sij/print', auth, upload.single("bukti_tf"), sijController.printSij);

// orders
route.post('/orders', auth, ordersController.createOrder);
route.get('/orders', auth, ordersController.getAllOrders);
route.get('/orders/:id', auth, ordersController.getOrderById);
route.put('/orders/:id', auth, ordersController.updateOrder);
route.delete('/orders/:id', auth, ordersController.deleteOrder);

export default route;
