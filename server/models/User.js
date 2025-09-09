import mongoose from 'mongoose';

const OperatingHoursSchema = new mongoose.Schema({
  monday: { open: String, close: String },
  tuesday: { open: String, close: String },
  wednesday: { open: String, close: String },
  thursday: { open: String, close: String },
  friday: { open: String, close: String },
  saturday: { open: String, close: String },
  sunday: { open: String, close: String },
}, { _id: false });

const StaffDetailsSchema = new mongoose.Schema({
  doctors: String,
  specialists: String,
  nurses: String,
}, { _id: false });

const BankDetailsSchema = new mongoose.Schema({
  bankName: String,
  accountTitle: String,
  accountNumber: String,
  paymentMode: String,
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['patient', 'doctor', 'clinic/hospital', 'laboratory', 'pharmacy'], default: 'patient' },
  avatar: String,
  isVerified: { type: Boolean, default: false },
  // Verification lifecycle fields
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verifiedAt: { type: Date, default: null },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Allow providers to operate without being fully verified
  allowedToOperate: { type: Boolean, default: false },
  phone: String,
  phoneAlternate: String,
  cnic: String,
  licenseNumber: String,
  businessName: String,
  address: String,
  city: String,
  province: String,
  mapsLocation: String,
  specialization: String,
  description: String,
  designation: String,
  servicesOffered: [String],
  deliveryAvailable: { type: Boolean, default: false },
  service24x7: { type: Boolean, default: false },
  operatingHours: OperatingHoursSchema,
  staffDetails: { type: StaffDetailsSchema, required: false },
  bankDetails: { type: BankDetailsSchema, required: false },
  // Password reset fields
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;
