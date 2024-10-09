import express from 'express';
import { checkLicense } from '../controllers/licenseController';

const router = express.Router();

router.post('/check-license', checkLicense);

export default router;
