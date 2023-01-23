import * as mongoose from 'mongoose';
import { sensorseries } from '../sensors/sensor/sensor.model';
import * as mongotimeseries from 'mongoose-timeseries';

const deviceAddress = new mongoose.Schema({
  multiPort: {
    type: Number,
    required: true,
    validator: { $gte: 1, $lte: 16 },
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
  factorValue: { type: Number, required: true },
});

export const ElectricalSchema = new mongoose.Schema({
  status: { type: Boolean },
  deviceRelationId: { type: mongoose.Schema.Types.ObjectId },
  deviceName: { type: String },
  lastStatus: { type: Boolean },
});

const SensorSchema = new mongoose.Schema(
  {
    // deviceId: {
    //   type: mongoose.Types.ObjectId,
    //   ref: 'Device',
    //   autopopulate: true,
    // },
    // sensorLastSerie: {
    //   type: sensorseries,
    // },
    title: { type: String, required: true },
    // superMultiport: { type: Number, required: true },
    // multiport: { type: Number, required: true },
    port: { type: Number, required: false },
    type: { type: String, required: true },
    unit: { type: String, required: true },
    maxAlarm: { type: Number },
    minAlarm: { type: Number },
    // sensorUniqueName: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   validator: true,
    // },
    resolution: { type: String, default: 'minute' },
    sensorRealtimeValues: {
      value: { type: Number },
      updateTime: { type: Date },
    },
  },
  { timestamps: true },
);

export const DeviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    address: { type: deviceAddress, required: true },
    type: {
      type: String,
      enum: ['Electrical panel', 'Sensor Cotroller'],
      required: true,
    },
    numberOfPorts: {
      type: Number,
      required: true,
      validator: true,
      enum: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    sensors: [SensorSchema],
    sensorLastSerie: [sensorseries],
    // {
    //   sensorId: {
    //     type: mongoose.Types.ObjectId,
    //     ref: 'Sensor',
    //     autopopulate: true,
    //   },
    // },
    electricals: [ElectricalSchema],
    factors: [factorsSchema],
  },
  { timestamps: true },
);

export const TempDevicesSchema = new mongoose.Schema({
  deviceId: {
    type: mongoose.Types.ObjectId,
    ref: 'Device',
    autopopulate: true,
  },
  sensorId: mongoose.Schema.Types.ObjectId,
  value: { type: Number },
  createdAt: { type: Date, expires: 120, default: Date.now },
});
export interface TempDevice {
  deviceId: Device;
  sensorId: mongoose.Schema.Types.ObjectId;
  value: number;
  createdAt: Date;
}
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
  factorValue: number;
}
export interface deviceAddress {
  multiPort: number;
  sMultiPort: number;
}
export interface Device {
  title: string;
  address: deviceAddress;
  type: 'Electrical panel' | 'Sensor Cotroller';
  factors: factors[];
  sensors: Sensor[];
  electricals: ElectricalPanelType[];
  sensorLastSerie?: sensorseries;
}
export interface Sensor {
  _id: mongoose.Schema.Types.ObjectId;
  deviceId: mongoose.Schema.Types.ObjectId;
  title: string;
  // superMultiport: number;
  // multiport: number;
  port?: number;
  type: string;
  unit: string;
  maxAlarm: number;
  minAlarm: number;
  // sensorUniqueName: string;
  resolution?: 'second' | 'minute' | 'hour';
  sensorRealtimeValues?: SensorRealtimeValues;
}
export interface SensorType {
  _id: mongoose.Schema.Types.ObjectId;
  deviceId: mongoose.Schema.Types.ObjectId;
  title: string;
  // superMultiport: number;
  // multiport: number;
  port?: number;
  type: string;
  unit: string;
  maxAlarm: number;
  minAlarm: number;
  // sensorUniqueName: string;
  resolution?: 'second' | 'minute' | 'hour';
  sensorRealtimeValues?: SensorRealtimeValues;
}

export interface ElectricalPanelType {
  _id: mongoose.Schema.Types.ObjectId;
  deviceRelationId?: mongoose.Schema.Types.ObjectId;
  deviceName: string;
  lastStatus?: boolean;
}

export interface SensorRealtimeValues {
  value: number;
  updateTime: Date;
}
export const ebSeries = new mongoose.Schema(
  {
    timestamp: mongoose.Schema.Types.Date,
    deviceId: mongoose.Schema.Types.ObjectId,
    metaField: {
      byte1: Number,
      byte2: Number,
      byte3: Number,
    },
  },
  {
    timeseries: {
      timeField: 'timestamp',
      metaField: 'metaField',
      granularity: 'minutes',
    },
  },
);
export interface ebSeries {
  // _id: mongoose.Schema.Types.ObjectId;
  timestamp: mongotimeseries.date;
  // target: typeof mongotimeseries;
  sensorId: mongoose.Schema.Types.ObjectId;
  metaField: {
    byte1: number;
    byte2: number;
    byte3: number;
  };
}
