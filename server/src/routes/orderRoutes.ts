import express from 'express';
import { getOrder } from '../controllers/orderController';

const router = express.Router();

router.get('/:barcode', getOrder);

export default router;