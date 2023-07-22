import mongoose from 'mongoose'
import { Schema, model, models } from 'mongoose'
// type: [Schema.Types.ObjectId],
const StockSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name of stock is not set'],
  },
  ticker: {
    type: String,
    required: [true, 'Ticker of stock is not set'],
  },
  price: {
    type: Number,
    required: [true, 'Price of stock is not set'],
  },
  creationTime: {
    type: Date,
    required: [true, 'Stock creation date is not set '],
  },
})

// Return existing model or create a new one
const Stock = models.Stock || model('Stock', StockSchema)

export default Stock
