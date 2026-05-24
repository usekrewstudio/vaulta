import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { updateProfile, changePassword, deleteAccount } from '../controllers/userController';
import { getRates, convert, getSupportedCurrencies } from '../controllers/fxController';

export const userRouter = Router();
export const fxRouter = Router();

userRouter.use(authenticate);
userRouter.patch('/profile', updateProfile);
userRouter.patch('/password', changePassword);
userRouter.delete('/account', deleteAccount);

fxRouter.get('/rates', getRates);
fxRouter.get('/convert', convert);
fxRouter.get('/currencies', getSupportedCurrencies);
