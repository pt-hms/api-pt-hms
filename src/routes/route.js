import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';
import * as profileController from '../controllers/profile.controller.js';
import * as driversController from '../controllers/drivers.controller.js';
import * as ordersController from '../controllers/orders.controller.js';

const route = Router();

// auth
route.post('/login', authController.login);

// profile
route.get('/profile', auth, profileController.getProfile);
route.put('/profile', auth, profileController.updateProfile);

// drivers
route.post('/drivers', auth, driversController.createDriver);
route.get('/drivers/', auth, driversController.getAllDrivers);
route.get('/drivers/:id', auth, driversController.getDriverById);
route.put('/drivers/:id', auth, driversController.updateDriver);
route.delete('/drivers/:id', auth, driversController.deleteDriver);

// orders
route.post('/orders', auth, ordersController.createOrder);
route.get('/orders/all', auth, ordersController.getAllOrders);
route.get('/orders/:id', auth, ordersController.getOrderById);
route.put('/orders/:id', auth, ordersController.updateOrder);
route.delete('/orders/:id', auth, ordersController.deleteOrder);

export default route;
