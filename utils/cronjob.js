import cron from 'node-cron';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import SubscriptionTransaction from '../models/subscriptionTransaction.model.js';

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});



// CRON job to run every day
cron.schedule('0 0 * * *', async () => { 

  try {
    // Find all active subscription transactions
    const subscriptions = await SubscriptionTransaction.find({ status: 'active' });

    for (const subscription of subscriptions) {
      const subscription_id = subscription.subscription_id;

      try {
        // Fetch the subscription from Razorpay
        const result = await razorpay.subscriptions.fetch(subscription_id);

        if (result.status === 'active') {
          // If the status is active, update the updatedAt field
          subscription.updatedAt = new Date();
          await subscription.save();
        } else {
          // If the status is not active, update SubscriptionTransaction status to 'cancelled'
          subscription.status = 'cancelled';
          await subscription.save();

          // Set the corresponding IndividualUser's subscription field to null
          await IndividualUser.updateOne(
            { subscription: subscription._id },
            { $set: { subscription: null } }
          );
        }
      } catch (error) {
        console.error(`Error fetching subscription ${subscription_id}:`, error);
        // Handle errors if needed
      }
    }
  } catch (error) {
    console.error('Error in CRON job:', error);
  }
});
