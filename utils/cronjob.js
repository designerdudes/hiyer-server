import cron from 'node-cron';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import SubscriptionTransaction from '../models/subscriptionTransaction.model.js';

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});


// CRON job to run every 6 days
cron.schedule('* * * * * *', async () => {
  // Your code to execute every second
  console.log('This message will log every second');

  // try {
  //   // Find all active subscription transactions updated in the last 6 days
  //   const subscriptions = await SubscriptionTransaction.find({
  //     status: 'active',
  //     updatedAt: { $gte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) }, // Last 6 days
  //   });

  //   for (const subscription of subscriptions) {
  //     const subscription_id = subscription.subscription_id;

  //     try {
  //       // Fetch the subscription from Razorpay
  //       const result = await razorpay.subscriptions.fetch(subscription_id);

  //       if (result.status !== 'active') {
  //         // If the status is not active, update SubscriptionTransaction status to 'cancelled'
  //         subscription.status = 'cancelled';
  //         await subscription.save();
  //       }
  //     } catch (error) {
  //       console.error(`Error fetching subscription ${subscription_id}:`, error);
  //       // Handle errors if needed
  //     }
  //   }
  // } catch (error) {
  //   console.error('Error in CRON job:', error);
  // }
});
