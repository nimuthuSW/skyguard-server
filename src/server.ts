import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import locationRoutes from './routes/locationRoutes';
import weatherRoutes from './routes/weatherRoutes';
import { authenticateToken } from './middleware/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/locations', authenticateToken as any, locationRoutes);
app.use('/weather', weatherRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'SkyGuard server running' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
