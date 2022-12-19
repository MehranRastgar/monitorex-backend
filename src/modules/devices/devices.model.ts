import * as mongoose from 'mongoose';

const deviceAddress = new mongoose.Schema({
  multiPort: {
    type: Number,
    required: true,
    validator: { $gte: 1, $lte: 255 },
  },
  sMultiPort: {
    type: Number,
    required: true,
    validator: { $gte: 1, $lte: 16 },
  },
});
const factorsSchema = new mongoose.Schema({
  factorName: { type: String, required: true },
  factorPosition: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16],
  },
});

export const DeviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    address: { type: deviceAddress, required: true },
    type: {
      type: String,
      enum: ['Electrical panel', 'Sensor Cotroller'],
      required: true,
    },
    DeviceUniqueName: {
      type: String,
      required: true,
      unique: true,
      validator: true,
    },
    numberOfPorts: {
      type: Number,
      required: true,
      validator: true,
      enum: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    factors: [factorsSchema],
  },
  { timestamps: true },
);
export interface factors {
  factorName: string;
  factorPosition:
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 12
    | 13
    | 14
    | 15
    | 16;
}
export interface deviceAddress {
  multiPort: number;
  sMultiPort: number;
}
export interface Device {
  title: string;
  address: deviceAddress;
  type: 'Electrical panel' | 'Sensor Cotroller';
  DeviceUniqueName: string;
  factors: factors[];
}
