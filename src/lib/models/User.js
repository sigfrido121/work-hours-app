import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  googleId:        { type: String, required: true, unique: true },
  email:           { type: String, required: true, unique: true },
  firstName:       { type: String, default: '' },
  lastName:        { type: String, default: '' },
  avatar:          { type: String, default: '' },
  isAdmin:         { type: Boolean, default: false },
  profileComplete: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
