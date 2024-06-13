import express from 'express';
import { createOrUpdateOrderRazorpay, handleJoiningFeePayment, verifyPayment } from '../../../controllers/individualUser.controller/joiningFee.js';

const joiningFeeRouter = express.Router();


joiningFeeRouter.post('/addorupdaterazorpay', createOrUpdateOrderRazorpay);
joiningFeeRouter.post('/handleJoiningFeePayment', handleJoiningFeePayment);
joiningFeeRouter.post('/verify', verifyPayment);


export default joiningFeeRouter;
