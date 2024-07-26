import Transaction from "../../models/transacation.js";
import Razorpay from 'razorpay';
import { getUserIdFromToken } from "../../utils/getUserIdFromToken.js";
import IndividualUser from "../../models/individualUser.model/individualUser.model.js";
import crypto from 'crypto'
import Plan from "../../models/plan.model.js";


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

    res.status(201).json(newPlan);
  } catch (error) {
    console.error('Error creating Razorpay plan:', error);
    res.status(500).json({ error: 'An error occurred while creating the Razorpay plan' });
  }
};