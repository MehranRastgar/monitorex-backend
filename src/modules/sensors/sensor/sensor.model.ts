import * as mongoose from 'mongoose';
import * as mongotimeseries from 'mongoose-timeseries';

export const SensorSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Types.ObjectId,
      ref: 'Device',
      autopopulate: true,
    },
    sensorLastSerie: {
      type: mongoose.Types.ObjectId,
      ref: 'sensorseries',
      autopopulate: true,
    },
    title: { type: String, required: true },
    superMultiport: { type: Number, required: true },
    multiport: { type: Number, required: true },
    port: { type: Number, required: true },
    type: { type: String, required: true },
    unit: { type: String, required: true },
    sensorUniqueName: {
      type: String,
      required: true,
      unique: true,
      validator: true,
    },
    resolution: { type: String, default: 'minute' },
    sensorRealtimeValues: {
      value: { type: Number },
      updateTime: { type: Date, required: true },
    },
  },
  { timestamps: true },
);
export const sensorseries = new mongoose.Schema(
  {
    timestamp: mongoose.Schema.Types.Date,
    sensorId: mongoose.Schema.Types.ObjectId,
    metaField: {
      sensorUnique: String,
      incremental: Number,
      value: Number,
      max: Number,
      min: Number,
      average: Number,
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

// export const timeSeriesSensors = SensorRecords.plugin(mongotimeseries, {
//   target: 'sensorseries',
//   dateField: 'date',
//   resolutions: ['minute', 'hour'],
//   key: {
//     attr1: 1,
//     attr2: 1,
//     info: function (doc) {
//       return doc.info.sub1 + doc.info.sub2 + doc.info.sub3;
//     },
//   },
//   data: {
//     metric: {
//       source: 'analytics.metric',
//       operations: ['sum', 'max', 'min'],
//       calculations: ['average', 'range', 'range_min', 'range_max'],
//     },
//   },
// });

export interface Sensor {
  deviceId: mongoose.Schema.Types.ObjectId;
  title: string;
  superMultiport: number;
  multiport: number;
  port: number;
  type: string;
  unit: string;
  sensorUniqueName: string;
  resolution: 'second' | 'minute' | 'hour';
  sensorLastSerie: sensorseries;
  sensorRealtimeValues: SensorRealtimeValues;
}
export interface SensorRealtimeValues {
  value: number;
  updateTime: Date;
}
export interface sensorseries {
  // _id: mongoose.Schema.Types.ObjectId;
  timestamp: mongotimeseries.date;
  target: typeof mongotimeseries;
  sensorId: mongoose.Schema.Types.ObjectId;
  metaField: {
    sensorUnique: string;
    incremental: number;
    value: number;
    max: number;
    min: number;
    average: number;
  };
}
