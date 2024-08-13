import mongoose, { Document, Schema } from 'mongoose';

interface ICounter extends Document {
  name: string;
  seq: number;
}

const CounterSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model<ICounter>('Counter', CounterSchema);

export default Counter;
