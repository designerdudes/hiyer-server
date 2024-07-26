import express from 'express';
import { createOrUpdateOrderRazorpay, createRazorpayPlan, createSubscription, createSubscriptionTransaction, getAllPlans, getPlanById, handleJoiningFeePayment, handlevideoResumePack, verifyPayment } from '../../../controllers/individualUser.controller/payment.js';

const paymentRouter = express.Router();


paymentRouter.post('/addorupdaterazorpay', createOrUpdateOrderRazorpay);
paymentRouter.post('/handleJoiningFeePayment', handleJoiningFeePayment);
paymentRouter.post('/handleVideoResumePackPayment', handlevideoResumePack);
paymentRouter.post('/verify', verifyPayment);


// Route to create a new Razorpay plan
paymentRouter.post('/plans', createRazorpayPlan);

// Route to get all plans
paymentRouter.get('/plans', getAllPlans);

// Route to get a plan by ID
paymentRouter.get('/plans/:id', getPlanById);

// Route to create a new subscription
paymentRouter.post('/subscriptions/:planId', createSubscription);

paymentRouter.post('/create-subscription-transaction', createSubscriptionTransaction);

export default paymentRouter;
