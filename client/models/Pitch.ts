import mongoose from 'mongoose'
import { Schema, model, models } from 'mongoose'
// type: [Schema.Types.ObjectId],
const PitchSchema = new Schema({
  stockTicker: {
    type: String,
    required: [true, 'Ticker of pitch stock is not set'],
  },
  direction: {
    type: String,
    required: [true, 'direction of pitch is not set'],
  },
  // percentYes: {
  //   type: Number,
  //   required: [
  //     true,
  //     'Percentage of votes supporting pitch direction is not set',
  //   ],
  // },
  votesFor: {
    type: Number,
    required: [true, 'Number of votes for pitch is not set'],
  },
  votesAgainst: {
    type: Number,
    required: [true, 'Number of votes against pitch is not set'],
  },
  creationTime: {
    type: Date,
    required: [true, 'Pitch creation date is not set '],
  },
})

PitchSchema.virtual('percentYes').get(function () {
  const totalVotes = this.votesFor! + this.votesAgainst!
  if (totalVotes === 0) {
    return 0
  }
  return (this.votesFor! / totalVotes) * 100
})

PitchSchema.set('toObject', { virtuals: true })
PitchSchema.set('toJSON', { virtuals: true })
// PitchSchema.set('toObject', { getters: true })

// Return existing model or create a new one
const Pitch = models.Pitch || model('Pitch', PitchSchema)

export default Pitch
