import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { getPortfolio, createAsset, updateAsset, deleteAsset } from '../controllers/assetController';

const router = Router();

router.use(authenticate);

router.get('/portfolio', getPortfolio);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Asset name required'),
    body('type').notEmpty().withMessage('Asset type required'),
    body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
    body('purchase_price').isFloat({ min: 0 }).withMessage('Purchase price required'),
  ],
  createAsset
);

router.patch('/:id', updateAsset);
router.delete('/:id', deleteAsset);

export default router;
