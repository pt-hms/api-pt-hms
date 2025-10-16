import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';
import * as profileController from '../controllers/profile.controller.js';
import * as dashboardController from '../controllers/dashboard.controller.js';
import * as driversController from '../controllers/drivers.controller.js';
import * as sijController from '../controllers/sij.controller.js';
import * as ritaseController from '../controllers/ritase.controller.js';
import multer from 'multer';

const route = Router();
const upload = multer({ storage: multer.memoryStorage() });

// auth
route.post('/register', upload.single("foto_profil"), authController.register);
route.post('/login', authController.login);

// profile
route.get('/profile', auth, profileController.getProfile);
route.put('/profile', auth, upload.single("foto_profil"), profileController.updateProfile);

// dashboard
route.get('/dashboard', auth, dashboardController.getDashboard);

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
route.get('/sij-last', auth, sijController.getLastSij);
route.post('/sij-print', auth, upload.single("bukti_tf"), sijController.printSij);

// ritase
route.post('/ritase', auth, upload.single("ss_order"), ritaseController.createRitase);
route.get('/ritase', auth, ritaseController.getAllRitase);
route.get('/ritase/:id', auth, ritaseController.getRitaseById);
route.put('/ritase/:id', auth, ritaseController.updateRitase);
route.delete('/ritase/:id', auth, ritaseController.deleteRitase);
route.post('/ritase-upload', auth, upload.single("ss_order"), ritaseController.uploadRitase);
route.get('/ritase-saya', auth, ritaseController.getMyRitase);

export default route;
