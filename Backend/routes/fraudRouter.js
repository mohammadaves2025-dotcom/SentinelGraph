import express from 'express';
// Note: You must include the .js extension and use the curly braces for named exports!
import { pingController,runFraudAlgorithm,downloadReportController } from '../controllers/fraudController.js';


const router = express.Router();

// Standard Health Check for the Router
router.get('/ping', pingController);
router.get('/execute/:algorithmName', runFraudAlgorithm);
router.get('/download-report/:algorithmName', downloadReportController);

export default router;