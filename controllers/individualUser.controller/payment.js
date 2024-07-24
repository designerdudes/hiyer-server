import Transaction from "../../models/transacation.js";
import Razorpay from 'razorpay';
import { getUserIdFromToken } from "../../utils/getUserIdFromToken.js";
import IndividualUser from "../../models/individualUser.model/individualUser.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});
// Add or update an order

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
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  console.log("id==", body)

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;


  if (isAuthentic) {

    console.log(Payment)



    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    //  return NextResponse.redirect(new URL('/paymentsuccess', req.url));

  } else {
    return NextResponse.json({
      message: "fail"
    }, {
      status: 400,
    })

  }


  return NextResponse.json({
    message: "success"
  }, {
    status: 200,
  })

}





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
        vpa: paymentDetails?.upi?.vpa || '',
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

