import { Router } from 'express';
import authRoutes from './auth.routes.js';
import topicRoutes from './topic.routes.js';
import subTopicRoutes from './subtopic.routes.js';
import questionRoutes from './question.routes.js';
import trashRoutes from './trash.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    }
  });
});

// Route groupings
router.use('/auth', authRoutes);
router.use('/topics', topicRoutes);
router.use('/trash', trashRoutes);
router.use('/', subTopicRoutes); // Mounted at / to support nested /topics/:topicId/subtopics paths cleanly
router.use('/', questionRoutes); // Mounted at / to support nested paths

export default router;
