import Transaction from "../../models/transacation.js";
import Razorpay from 'razorpay';
import { getUserIdFromToken } from "../../utils/getUserIdFromToken.js";
import IndividualUser from "../../models/individualUser.model/individualUser.model.js";
import crypto from 'crypto'
import Plan from "../../models/plan.model.js";
import SubscriptionTransaction from "../../models/subscriptionTransaction.model.js";
import OrganizationalUser from "../../models/organizationUser.model/organizationUser.model.js";
import mongoose from "mongoose";


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export const createOrUpdateOrderRazorpay = async (req, res) => {
  try {
    const {
      cartTotal,
    } = req.body;

    const options = {
      amount: cartTotal * 100, // Amount in paise
      currency: 'INR',

      // receipt: 'order_receipt_' + newOrder._id, // You can customize the receipt ID as needed

    };
    // Create a new Razorpay order
    const order = await razorpay.orders.create(options);


    return res.status(201).json({
      message: 'Razorpay Order created successfully',
      razorpayOrder: order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // await Payment.create({
      //   razorpay_order_id,
      //   razorpay_payment_id,
      //   razorpay_signature,
      // });

      return res.status(200).json({
        message: "Payment verification successful",
      });
    } else {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      message: "An error occurred while verifying payment",
    });
  }
};

// Controller to handle joining fee payment
export const handleJoiningFeePayment = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req); // Assuming a function to get user ID from token
    const { amount, paymentMethod, razorpay_order_id, razorpay_payment_id, razorpay_signature, orderid } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const user = await IndividualUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.joiningFeePaid.status) {
      return res.status(400).json({ message: 'Joining fee already paid' });
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    if (!paymentDetails) {
      return res.status(400).json({ message: 'Invalid payment details' });
    }

    // Save the payment details
    const transaction = new Transaction({
      payment_id: razorpay_payment_id,
      razorpay_signature,
      user_id: userId,
      entity: paymentDetails.entity,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      status: paymentDetails.status,
      razorpay_order_id,
      method: paymentDetails.method || paymentMethod,
      captured: paymentDetails.captured,
      card_id: paymentDetails.card_id,
      bank: paymentDetails.bank,
      wallet: paymentDetails.wallet,
      vpa: paymentDetails.vpa,
      fee: paymentDetails.fee,
      tax: paymentDetails.tax,
      error_code: paymentDetails.error_code,
      error_description: paymentDetails.error_description,
      acquirer_data: {
        rrn: paymentDetails.acquirer_data.rrn,
        upi_transaction_id: paymentDetails.acquirer_data.upi_transaction_id,
      },
      created_at: paymentDetails.created_at,
      upi: {
        vpa: paymentDetails.upi.vpa,
      },
    });

    const savedTransaction = await transaction.save();



    // Update the user's joining fee status
    user.joiningFeePaid = {
      status: true,
      transactionId: savedTransaction._id,
    };

    await user.save();

    res.status(200).json({ message: 'Joining fee paid and payment details saved successfully' });
  } catch (error) {
    console.error('Error handling joining fee payment:', error);
    res.status(500).json({ message: 'An error occurred while processing payment' });
  }
};

export const handlevideoResumePack = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req); // Assuming a function to get user ID from token
    const { amount, paymentMethod, razorpay_order_id, razorpay_payment_id, razorpay_signature, orderid } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const user = await IndividualUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    if (!paymentDetails) {
      return res.status(400).json({ message: 'Invalid payment details' });
    }
    console.log("paymentDetails", paymentDetails)

    // Save the payment details
    const transaction = new Transaction({
      payment_id: razorpay_payment_id,
      razorpay_signature,
      user_id: userId,
      entity: paymentDetails.entity || "",
      amount: paymentDetails.amount || "",
      currency: paymentDetails.currency || "",
      status: paymentDetails.status || "",
      razorpay_order_id,
      method: paymentDetails.method || paymentMethod,
      captured: paymentDetails.captured || "",
      card_id: paymentDetails.card_id || "",
      bank: paymentDetails.bank || "",
      wallet: paymentDetails.wallet || "",
      vpa: paymentDetails.vpa || "",
      fee: paymentDetails.fee || "",
      tax: paymentDetails.tax || "",
      error_code: paymentDetails.error_code || "",
      error_description: paymentDetails.error_description || "",
      acquirer_data: {
        rrn: paymentDetails.acquirer_data ? paymentDetails.acquirer_data.rrn : "",
        upi_transaction_id: paymentDetails.acquirer_data ? paymentDetails.acquirer_data.upi_transaction_id : "",
      },
      created_at: paymentDetails.created_at || "",
      upi: {
        vpa: paymentDetails.upi ? paymentDetails.upi.vpa : "",
      },
    });

    const savedTransaction = await transaction.save();

    // Update user's videoResumePack with the transaction ID and increment numberOfVideoResumesAllowed
    if (!user.videoResumePack) {
      user.videoResumePack = {
        transactionIds: [],
        numberOfVideoResumesAllowed: 0,
        currentNumberOfVideoResumes: 0,
      };
    }
    user.videoResumePack.transactionIds.push(orderid);
    user.videoResumePack.numberOfVideoResumesAllowed += 3;

    await user.save();

    res.status(200).json({ message: 'Video resume pack updated and payment details saved successfully' });
  } catch (error) {
    console.error('Error handling video resume pack payment:', error);
    res.status(500).json({ message: 'An error occurred while processing payment' });
  }
};

 
export const createRazorpayPlan = async (req, res) => {
  try {
    const { period, interval, name, amount, currency, description, notes } = req.body;

    if (!period || !interval || !name || !amount || !currency) {
      return res.status(400).json({ error: 'Period, interval, name, amount, and currency are required' });
    }

    const razorpayPlan = await razorpay.plans.create({
      period,
      interval,
      item: {
        name,
        amount,
        currency,
        description
      },
      notes
    });

    const newPlan = new Plan({
      razorpayPlanId: razorpayPlan.id,
      period: razorpayPlan.period,
      interval: razorpayPlan.interval,
      item: {
        id: razorpayPlan.item.id,
        active: razorpayPlan.item.active,
        name: razorpayPlan.item.name,
        description: razorpayPlan.item.description,
        amount: razorpayPlan.item.amount,
        currency: razorpayPlan.item.currency,
        unit_amount: razorpayPlan.item.unit_amount,
        unit: razorpayPlan.item.unit,
        tax_inclusive: razorpayPlan.item.tax_inclusive,
        hsn_code: razorpayPlan.item.hsn_code,
        sac_code: razorpayPlan.item.sac_code,
        tax_rate: razorpayPlan.item.tax_rate,
        tax_id: razorpayPlan.item.tax_id,
        tax_group_id: razorpayPlan.item.tax_group_id,
        created_at: razorpayPlan.item.created_at,
        updated_at: razorpayPlan.item.updated_at
      },
      notes: razorpayPlan.notes,
      created_at: razorpayPlan.created_at
    });

    await newPlan.save();

    // Send a response with both the Razorpay plan and the newly created Plan
    res.status(201).json({
      razorpayPlan,
      newPlan
    });
  } catch (error) {
    console.error('Error creating Razorpay plan:', error);
    res.status(500).json({ error: 'An error occurred while creating the Razorpay plan' });
  }
};

 

export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({});
    res.status(200).json(plans);
  } catch (error) {
    console.error('Error fetching all plans:', error);
    res.status(500).json({ error: 'An error occurred while fetching all plans' });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findOne({ _id: id });


    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.status(200).json(plan);
  } catch (error) {
    console.error('Error fetching plan by ID:', error);
    res.status(500).json({ error: 'An error occurred while fetching the plan' });
  }
};


export const getPlansByUserType = async (req, res) => {
  try {
    const { user_type } = req.params;

    // Validate user_type
    if (!['individualUser', 'organization'].includes(user_type)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // Fetch all plans for the given user type
    const plans = await Plan.find({ user_type });

    if (plans.length === 0) {
      return res.status(404).json({ message: 'No plans found for the specified user type' });
    }

    res.status(200).json(plans);
  } catch (error) {
    console.error('Error fetching plans by user type:', error);
    res.status(500).json({ error: 'An error occurred while fetching plans' });
  }
};



export const createSubscription = async (req, res) => {
  try {
    const { quantity, total_count, notes, user_type } = req.body;
    const user_id = getUserIdFromToken(req);

    // 1. Fetch the plan data from the database
    const plan = await Plan.findById(req.params.planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // 2. Calculate a valid start time for the subscription (e.g., 5 minutes in the future)
    const futureStartTime = Math.floor((Date.now() + 5 * 60 * 1000) / 1000); // 5 minutes from now

    // 3. Create the subscription using Razorpay
    const subscriptionData = {
      plan_id: plan.razorpayPlanId,
      customer_notify: 1,
      quantity: quantity || 1,
      total_count: total_count || 6,
      start_at: futureStartTime, // Use the future timestamp
      notes,
      user_type
    };

    const subscription = await razorpay.subscriptions.create(subscriptionData);



    res.status(201).json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



export const createSubscriptionTransactionForOrg = async (req, res) => {
  const user_id = getUserIdFromToken(req);

  try {
    const {
      razorpay_plan_id,
      razorpay_payment_id,
      razorpay_signature,
      subscription_id,
      customer_id,
      razorpay_subscription_id,
    } = req.body;

    // Fetch subscription and payment details from Razorpay
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    const subscriptionDetails = await razorpay.subscriptions.fetch(razorpay_subscription_id);

    // Calculate amount in rupees (convert paise to rupees)
    const amount = paymentDetails ? paymentDetails.amount / 100 : subscriptionDetails.amount / 100;

    // Create and save the subscription transaction
    const subscriptionTransaction = new SubscriptionTransaction({
      subscription_id: subscriptionDetails.id,
      user_id: user_id,
      entity: subscriptionDetails.entity,
      plan_id: subscriptionDetails.plan_id,
      status: subscriptionDetails.status,
      current_start: new Date(subscriptionDetails.current_start * 1000),
      current_end: new Date(subscriptionDetails.current_end * 1000),
      ended_at: subscriptionDetails.ended_at ? new Date(subscriptionDetails.ended_at * 1000) : null,
      quantity: subscriptionDetails.quantity,
      notes: subscriptionDetails.notes,
      charge_at: new Date(subscriptionDetails.charge_at * 1000),
      start_at: new Date(subscriptionDetails.start_at * 1000),
      end_at: new Date(subscriptionDetails.end_at * 1000),
      total_count: subscriptionDetails.total_count,
      paid_count: subscriptionDetails.paid_count,
      customer_notify: subscriptionDetails.customer_notify,
      expire_by: new Date(subscriptionDetails.expire_by * 1000),
      short_url: subscriptionDetails.short_url,
      has_scheduled_changes: subscriptionDetails.has_scheduled_changes,
      change_scheduled_at: subscriptionDetails.change_scheduled_at ? new Date(subscriptionDetails.change_scheduled_at * 1000) : null,
      source: subscriptionDetails.source,
      offer_id: subscriptionDetails.offer_id,
      remaining_count: subscriptionDetails.remaining_count,
      payment_id: paymentDetails ? paymentDetails.id : null,
      razorpay_signature: paymentDetails ? paymentDetails.signature : null,
      amount: amount, // Ensure this is a valid number
      currency: paymentDetails ? paymentDetails.currency : subscriptionDetails.currency,
      razorpay_order_id: paymentDetails ? paymentDetails.order_id : null,
      method: paymentDetails ? paymentDetails.method : null, // Ensure 'method' field is included
      captured: paymentDetails ? paymentDetails.captured : false,
      card_id: paymentDetails ? paymentDetails.card_id : null,
      bank: paymentDetails ? paymentDetails.bank : null,
      wallet: paymentDetails ? paymentDetails.wallet : null,
      vpa: paymentDetails ? paymentDetails.vpa : null,
      fee: paymentDetails ? paymentDetails.fee / 100 : null, // Convert paise to rupees
      tax: paymentDetails ? paymentDetails.tax / 100 : null, // Convert paise to rupees
      error_code: paymentDetails ? paymentDetails.error_code : null,
      error_description: paymentDetails ? paymentDetails.error_description : null,
      acquirer_data: {
        rrn: paymentDetails ? paymentDetails.acquirer_data.rrn : null,
        upi_transaction_id: paymentDetails ? paymentDetails.acquirer_data.upi_transaction_id : null
      }
    });

    // Save subscription transaction to database
    await subscriptionTransaction.save();

    // Update OrganizationalUser with the subscription transaction ID
    await OrganizationalUser.findByIdAndUpdate(user_id, {
      subscription: subscriptionTransaction._id
    });

    // Send response
    res.status(201).json({
      success: true,
      message: 'Subscription transaction created successfully',
      data: subscriptionTransaction
    });

  } catch (error) {
    console.error('Error creating subscription transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subscription transaction',
      error: error.message
    });
  }
};
 

export const cancelSubscriptionForOrg = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const user_id = getUserIdFromToken(req);

    const subscriptionTransaction = await SubscriptionTransaction.findOne({ _id: subscriptionId });

    if (!subscriptionTransaction) {
      return res.status(404).json({ error: 'Subscription transaction not found' });
    }

    await razorpay.subscriptions.cancel(subscriptionTransaction.subscription_id);
   
    await OrganizationalUser.findByIdAndUpdate(user_id, { subscription: null });

    subscriptionTransaction.status = 'cancelled';
    await subscriptionTransaction.save();
    res.status(200).json({ message: 'Subscription successfully canceled' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'An error occurred while canceling the subscription' });
  }
};

export const createSubscriptionTransactionForUser = async (req, res) => {
  const user_id = getUserIdFromToken(req);

  try {
    const {
      razorpay_plan_id,
      razorpay_payment_id,
      razorpay_signature,
      subscription_id,
      customer_id,
      razorpay_subscription_id,
    } = req.body;

    // Fetch subscription and payment details from Razorpay
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    const subscriptionDetails = await razorpay.subscriptions.fetch(razorpay_subscription_id);

    // Calculate amount in rupees (convert paise to rupees)
    const amount = paymentDetails ? paymentDetails.amount / 100 : subscriptionDetails.amount / 100;

    // Create and save the subscription transaction
    const subscriptionTransaction = new SubscriptionTransaction({
      subscription_id: subscriptionDetails.id,
      user_id: user_id,
      entity: subscriptionDetails.entity,
      plan_id: subscriptionDetails.plan_id,
      status: subscriptionDetails.status,
      current_start: new Date(subscriptionDetails.current_start * 1000),
      current_end: new Date(subscriptionDetails.current_end * 1000),
      ended_at: subscriptionDetails.ended_at ? new Date(subscriptionDetails.ended_at * 1000) : null,
      quantity: subscriptionDetails.quantity,
      notes: subscriptionDetails.notes,
      charge_at: new Date(subscriptionDetails.charge_at * 1000),
      start_at: new Date(subscriptionDetails.start_at * 1000),
      end_at: new Date(subscriptionDetails.end_at * 1000),
      total_count: subscriptionDetails.total_count,
      paid_count: subscriptionDetails.paid_count,
      customer_notify: subscriptionDetails.customer_notify,
      expire_by: new Date(subscriptionDetails.expire_by * 1000),
      short_url: subscriptionDetails.short_url,
      has_scheduled_changes: subscriptionDetails.has_scheduled_changes,
      change_scheduled_at: subscriptionDetails.change_scheduled_at ? new Date(subscriptionDetails.change_scheduled_at * 1000) : null,
      source: subscriptionDetails.source,
      offer_id: subscriptionDetails.offer_id,
      remaining_count: subscriptionDetails.remaining_count,
      payment_id: paymentDetails ? paymentDetails.id : null,
      razorpay_signature: paymentDetails ? paymentDetails.signature : null,
      amount: amount, // Ensure this is a valid number
      currency: paymentDetails ? paymentDetails.currency : subscriptionDetails.currency,
      razorpay_order_id: paymentDetails ? paymentDetails.order_id : null,
      method: paymentDetails ? paymentDetails.method : null, // Ensure 'method' field is included
      captured: paymentDetails ? paymentDetails.captured : false,
      card_id: paymentDetails ? paymentDetails.card_id : null,
      bank: paymentDetails ? paymentDetails.bank : null,
      wallet: paymentDetails ? paymentDetails.wallet : null,
      vpa: paymentDetails ? paymentDetails.vpa : null,
      fee: paymentDetails ? paymentDetails.fee / 100 : null, // Convert paise to rupees
      tax: paymentDetails ? paymentDetails.tax / 100 : null, // Convert paise to rupees
      error_code: paymentDetails ? paymentDetails.error_code : null,
      error_description: paymentDetails ? paymentDetails.error_description : null,
      acquirer_data: {
        rrn: paymentDetails ? paymentDetails.acquirer_data.rrn : null,
        upi_transaction_id: paymentDetails ? paymentDetails.acquirer_data.upi_transaction_id : null
      }
    });

    // Save subscription transaction to database
    await subscriptionTransaction.save();

    // Update OrganizationalUser with the subscription transaction ID
    await IndividualUser.findByIdAndUpdate(user_id, {
      subscription: subscriptionTransaction._id
    });

    // Send response
    res.status(201).json({
      success: true,
      message: 'Subscription transaction created successfully',
      data: subscriptionTransaction
    });

  } catch (error) {
    console.error('Error creating subscription transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subscription transaction',
      error: error.message
    });
  }
};

export const cancelSubscriptionForUser = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const user_id = getUserIdFromToken(req);

    const subscriptionTransaction = await SubscriptionTransaction.findOne({ _id: subscriptionId });

    if (!subscriptionTransaction) {
      return res.status(404).json({ error: 'Subscription transaction not found' });
    }

    await razorpay.subscriptions.cancel(subscriptionTransaction.subscription_id);

    await IndividualUser.findByIdAndUpdate(user_id, { subscription: null });

    subscriptionTransaction.status = 'cancelled';
    await subscriptionTransaction.save();
    res.status(200).json({ message: 'Subscription successfully canceled' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'An error occurred while canceling the subscription' });
  }
};


export const pauseSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const user_id = getUserIdFromToken(req);

    // Fetch the subscription transaction
    const subscriptionTransaction = await SubscriptionTransaction.findOne({ _id: subscriptionId });

    if (!subscriptionTransaction) {
      return res.status(404).json({ error: 'Subscription transaction not found' });
    }

    // Pause the subscription using Razorpay
    const result = await razorpay.subscriptions.pause(subscriptionTransaction.subscription_id);

    // Optionally update the subscription transaction status in the database
    subscriptionTransaction.status = 'paused'; // Update status as needed
    await subscriptionTransaction.save();

    res.status(200).json({
      message: 'Subscription successfully paused',
      data: result
    });
  } catch (error) {
    console.error('Error pausing subscription:', error);
    res.status(500).json({ error: 'An error occurred while pausing the subscription' });
  }
};

export const resumeSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const user_id = getUserIdFromToken(req);

    // Fetch the subscription transaction
    const subscriptionTransaction = await SubscriptionTransaction.findOne({ _id: subscriptionId });

    if (!subscriptionTransaction) {
      return res.status(404).json({ error: 'Subscription transaction not found' });
    }

    // Resume the subscription using Razorpay
    const result = await razorpay.subscriptions.resume(subscriptionTransaction.subscription_id, { resume_at: 'now' });

    // Optionally update the subscription transaction status in the database
    subscriptionTransaction.status = 'active'; // Update status as needed
    await subscriptionTransaction.save();

    res.status(200).json({
      message: 'Subscription successfully resumed',
      data: result
    });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    res.status(500).json({ error: 'An error occurred while resuming the subscription' });
  }
};

export const getSubscriptionTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the subscription transaction and populate the user details
    const subscriptionTransaction = await SubscriptionTransaction.findById(id)
    // .populate({
    //   path: 'user_id',
    //   select: 'name email profilePicture', // Populate the fields you need
    //   model: User
    // });

    if (!subscriptionTransaction) {
      return res.status(404).json({ error: 'Subscription transaction not found' });
    }

    // Fetch subscription details from Razorpay
    const subscriptionDetails = await razorpay.subscriptions.fetch(subscriptionTransaction.subscription_id);

    // Respond with both subscription transaction and Razorpay subscription details
    res.status(200).json({
      subscriptionTransaction,
      subscriptionDetails
    });
  } catch (error) {
    console.error('Error fetching subscription transaction by ID:', error);
    res.status(500).json({ error: 'An error occurred while fetching the subscription transaction' });
  }
};


 
