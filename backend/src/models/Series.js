import mongoose from 'mongoose';

const seriesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['planned', 'watching', 'completed'],
      required: true
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      }
    }
  }
);

export const Series = mongoose.model('Series', seriesSchema);
