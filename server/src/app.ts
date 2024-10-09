import express from 'express';
import cors from 'cors';
import orderRoutes from './routes/orderRoutes';
import articleRoutes from './routes/articleRoutes';
import csvRoutes from './routes/csvRoutes';
import licenseRoutes from './routes/licenseRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/csv', csvRoutes);
app.use('/api/license', licenseRoutes);

export default app;