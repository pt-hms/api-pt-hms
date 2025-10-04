import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';
import * as profileController from '../controllers/profile.controller.js';
import * as ordersController from '../controllers/orders.controller.js';

const route = Router();

// auth
route.post('/login', authController.login);

// profile
route.get('/profile', auth, profileController.getProfile);
route.put('/profile', auth, profileController.updateProfile);

// orders
route.post('/orders', auth, ordersController.createOrder);
route.get('/orders/all', auth, ordersController.getAllOrders);
route.get('/orders/:id', auth, ordersController.getOrderById);
route.put('/orders/:id', auth, ordersController.updateOrder);
route.delete('/orders/:id', auth, ordersController.deleteOrder);

export default route;
