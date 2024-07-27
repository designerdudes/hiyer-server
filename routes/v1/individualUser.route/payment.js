import express from 'express';
import { cancelSubscriptionForOrg, cancelSubscriptionForUser, createOrUpdateOrderRazorpay, createRazorpayPlan, createSubscription, createSubscriptionTransactionForOrg, createSubscriptionTransactionForUser, getAllPlans, getPlanById, getPlansByUserType, getSubscriptionTransactionById, handleJoiningFeePayment, handlevideoResumePack, pauseSubscription, resumeSubscription, verifyPayment } from '../../../controllers/individualUser.controller/payment.js';

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


paymentRouter.get('/plans/:user_type', getPlansByUserType);

paymentRouter.get('/subscription-transactions/:id', getSubscriptionTransactionById);

// For Organizational Users
paymentRouter.post('/org/subscription/create', createSubscriptionTransactionForOrg);
paymentRouter.post('/org/subscription/cancel/:subscriptionId', cancelSubscriptionForOrg);

// For Individual Users
paymentRouter.post('/user/subscription/create', createSubscriptionTransactionForUser);
paymentRouter.post('/user/subscription/cancel/:subscriptionId', cancelSubscriptionForUser);

// Pause and Resume Subscription
paymentRouter.post('/subscription/pause/:subscriptionId', pauseSubscription);
paymentRouter.post('/subscription/resume/:subscriptionId', resumeSubscription);

export default paymentRouter;
