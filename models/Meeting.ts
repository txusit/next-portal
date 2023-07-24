import { Schema, model, models } from 'mongoose'
// type: [Schema.Types.ObjectId],
const MeetingSchema = new Schema({
  userIds: {
    type: [String],
    required: [true, 'userIds is not set'],
  },
  meetingDate: {
    type: Date,
    required: [true, 'Meeting date is not set'],
  },
  stockTicker: {
    type: String,
    required: [true, 'Stock ticker is not set'],
  },
  creationTime: {
    type: Date,
    required: [true, 'Meeting creation date is not set '],
  },
  isActive: {
    type: Boolean,
    required: [true, 'Meeting active status is not set'],
  },
})

// Return existing model or create a new one
const Meeting = models.Meeting || model('Meeting', MeetingSchema)

export default Meeting
