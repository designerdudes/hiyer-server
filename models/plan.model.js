import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
  razorpayPlanId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  interval: {
    type: Number,
    required: true
  },
  item: {
    id: String,
    active: Boolean,
    name: {
      type: String,
      required: true
    },
    description: String,
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true
    },
    unit_amount: Number,
    unit: String,
    tax_inclusive: Boolean,
    hsn_code: String,
    sac_code: String,
    tax_rate: Number,
    tax_id: String,
    tax_group_id: String,
    created_at: Number,
    updated_at: Number
  },
  notes: {
    type: Map,
    of: String
  },
  created_at: {
    type: Number,
    required: true
  },
  user_type: {
    type: String,
    enum: ['individualUser', 'organization'],
    required: true
  }
}, {
  timestamps: true
});

const Plan = mongoose.model('Plan', PlanSchema);

export default Plan;
