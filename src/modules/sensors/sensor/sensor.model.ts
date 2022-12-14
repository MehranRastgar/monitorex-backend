import * as mongoose from 'mongoose';

export const SensorSchema = new mongoose.Schema({
  title: { type: String, require: true },
  multiport: { type: Number, require: true },
  superMultiport: { type: Number, require: true },
  type: { type: String, require: true },
  unit: { type: String, require: true },
  sensorUniqueName: {
    type: String,
    require: true,
    unique: true,
    validator: true,
  },
});

export interface Sensor {
  title: string;
  multiport: number;
  superMultiport: number;
  type: string;
  unit: string;
  sensorUniqueName: string;
}
