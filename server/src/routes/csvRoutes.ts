import express from 'express';
import { appendCsv, getCsv, moveCsv } from '../controllers/csvController';

const router = express.Router();

router.post('/append-csv', appendCsv);
router.get('/get-csv', getCsv);
router.post('/move-csv', moveCsv);

export default router;