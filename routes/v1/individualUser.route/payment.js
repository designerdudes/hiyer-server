import express from 'express';
import { createOrUpdateOrderRazorpay, handleJoiningFeePayment, handlevideoResumePack, verifyPayment } from '../../../controllers/individualUser.controller/payment.js';

const paymentRouter = express.Router();


paymentRouter.post('/addorupdaterazorpay', createOrUpdateOrderRazorpay);
paymentRouter.post('/handleJoiningFeePayment', handleJoiningFeePayment);
paymentRouter.post('/handleVideoResumePackPayment', handlevideoResumePack);
paymentRouter.post('/verify', verifyPayment);




export default paymentRouter;
