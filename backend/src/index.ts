import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import 'dotenv/config';

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Must match your frontend URL precisely
  credentials: true, // Required for secure cookies / sessions across domains
}));
app.use(express.json());

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// -- Middleware --
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// -- Auth Routes --
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    if (!user.password) return res.status(400).json({ error: 'Please login using Google' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID');

app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return res.status(400).json({ error: 'Invalid Google Token' });

    const { email, name } = payload;
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email, name: name || 'Google User', password: null }
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// -- College Routes --
app.get('/api/colleges', async (req, res) => {
  try {
    const { search, location, maxFees, course } = req.query;
    const where: any = {};
    if (search) where.name = { contains: search as string, mode: 'insensitive' };
    if (location) where.location = { contains: location as string, mode: 'insensitive' };
    if (course) where.course = { contains: course as string, mode: 'insensitive' };
    if (maxFees) where.feesPerYear = { lte: parseFloat(maxFees as string) };

    const colleges = await prisma.college.findMany({ where });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
});

app.get('/api/colleges/compare', async (req, res) => {
  try {
    const ids = (req.query.ids as string)?.split(',').map(id => parseInt(id));
    if (!ids || ids.length === 0) return res.json([]);
    const colleges = await prisma.college.findMany({
      where: { id: { in: ids } }
    });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ error: 'Failed to compare colleges' });
  }
});

app.get('/api/colleges/:id', async (req, res) => {
  try {
    const college = await prisma.college.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { 
        reviews: { include: { user: { select: { name: true } } } }, 
        discussions: { include: { user: { select: { name: true } }, answers: { include: { user: { select: { name: true } } } } } } 
      }
    });
    if (!college) return res.status(404).json({ error: 'Not found' });
    res.json(college);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch college details' });
  }
});

// -- Reviews --
app.post('/api/reviews', authenticateToken, async (req: any, res) => {
  try {
    const { collegeId, rating, comment } = req.body;
    const review = await prisma.review.create({
      data: {
        collegeId: parseInt(collegeId),
        rating: parseInt(rating),
        comment,
        userId: req.user.id
      },
      include: { user: { select: { name: true } } }
    });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post review' });
  }
});

// -- User Actions --
app.get('/api/users/saved', authenticateToken, async (req: any, res) => {
  try {
    const saved = await prisma.savedCollege.findMany({
      where: { userId: req.user.id },
      include: { college: true }
    });
    res.json(saved.map((s: any) => s.college));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved colleges' });
  }
});

app.post('/api/users/saved', authenticateToken, async (req: any, res) => {
  try {
    const { collegeId } = req.body;
    await prisma.savedCollege.create({
      data: { userId: req.user.id, collegeId }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save college' });
  }
});

app.delete('/api/users/saved/:collegeId', authenticateToken, async (req: any, res) => {
  try {
    const collegeId = parseInt(req.params.collegeId);
    await prisma.savedCollege.deleteMany({
      where: { userId: req.user.id, collegeId }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove saved college' });
  }
});

// -- Discussions --
app.post('/api/discussions', authenticateToken, async (req: any, res) => {
  try {
    const { collegeId, question } = req.body;
    const disc = await prisma.discussion.create({
      data: { question, collegeId, userId: req.user.id }
    });
    res.json(disc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post question' });
  }
});

app.post('/api/discussions/:id/answers', authenticateToken, async (req: any, res) => {
  try {
    const { content } = req.body;
    const ans = await prisma.answer.create({
      data: { content, discussionId: req.params.id, userId: req.user.id }
    });
    res.json(ans);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post answer' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
