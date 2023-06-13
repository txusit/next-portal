import { Schema, model, models } from 'mongoose'

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Invalid email address',
    ],
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    minLength: [4, 'Full name should be at least 4 characters long'],
    maxLength: [30, 'Full length should be less than 30 characters'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false,
  },
  isConfirmed: {
    type: Boolean,
    required: [true, 'isConfirmed is not set'],
  },
})

// Return existing model or create a new one
const User = models.User || model('User', UserSchema)

export default User
