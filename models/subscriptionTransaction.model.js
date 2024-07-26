import mongoose from 'mongoose';

const subscriptionTransactionSchema = new mongoose.Schema({
  subscription_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  entity: {
    type: String,
    required: true,
  },
  plan_id: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  current_start: {
    type: Date,
  },
  current_end: {
    type: Date,
  },
  ended_at: {
    type: Date,
  },
  quantity: {
    type: Number,
    required: true,
  },
  notes: {
    type: Map,
    of: String,
  },
  charge_at: {
    type: Date,
  },
  start_at: {
    type: Date,
  },
  end_at: {
    type: Date,
  },
  total_count: {
    type: Number,
    required: true,
  },
  paid_count: {
    type: Number,
  },
  customer_notify: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  expire_by: {
    type: Date,
  },
  short_url: {
    type: String,
  },
  has_scheduled_changes: {
    type: Boolean,
    default: false,
  },
  change_scheduled_at: {
    type: Date,
  },
  source: {
    type: String,
    required: true,
  },
  offer_id: {
    type: String,
  },
  remaining_count: {
    type: Number,
  },
  payment_id: { 
    type: String 
  },
  razorpay_signature: { 
    type: String,  
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String,   
  },
  razorpay_order_id: { 
    type: String, 
  },
  method: { 
    type: String, 
    required: true 
  },
  captured: { 
    type: Boolean,   
  },
  card_id: { 
    type: String 
  },
  bank: { 
    type: String 
  },
  wallet: { 
    type: String 
  },
  vpa: { 
    type: String,   
  },
  fee: { 
    type: Number,   
  },
  tax: { 
    type: Number,   
  },
  error_code: { 
    type: String 
  },
  error_description: { 
    type: String 
  },
  acquirer_data: {
    rrn: { 
      type: String 
    },
    upi_transaction_id: { 
      type: String 
    }
  }
}, {
  timestamps: true
});

const SubscriptionTransaction = mongoose.model('SubscriptionTransaction', subscriptionTransactionSchema);

export default SubscriptionTransaction;
