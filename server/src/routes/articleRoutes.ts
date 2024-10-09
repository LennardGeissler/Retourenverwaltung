import express from 'express';
import { getArticles } from '../controllers/articleController';

const router = express.Router();

router.get('/:orderNumber', getArticles);

export default router;