import * as mongoose from 'mongoose';
import * as mongotimeseries from 'mongoose-timeseries';

export const SensorSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Types.ObjectId,
      ref: 'Device',
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
  },
  { timestamps: true },
);
export const sensorseries = new mongoose.Schema({
  timestamp: mongoose.Schema.Types.Date,
  metaField: {
    sensorUnique: String,
    incremental: Number,
    value: Number,
    max: Number,
    min: Number,
    average: Number,
  },
  attr1: { type: mongoose.Schema.Types.ObjectId, ref: 'attr1' },
  attr2: { type: mongoose.Schema.Types.ObjectId, ref: 'attr2' },
  date: { type: Date, default: Date.now },
  analytics: {
    metric: { type: Number },
  },

  info: {
    sub1: { type: String },
    sub2: { type: String },
    sub3: { type: String },
  },
});

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
}

export interface sensorseries {
  timestamp: mongotimeseries.date;
  target: typeof mongotimeseries;
  metaField: {
    sensorUnique: string;
    incremental: number;
    value: number;
    max: number;
    min: number;
    average: number;
  };
  dateField: mongotimeseries.date;
  resolutions: 'minute' | 'hour';
  key: {
    attr1: number;
    attr2: number;
    info: number;
  };
  data: {
    metric: {
      source: object;
      operations: 'sum' | 'max' | 'min';
      calculations: 'average' | 'range' | 'range_min' | 'range_max';
    };
  };
}
