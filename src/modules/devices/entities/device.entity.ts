import { deviceAddress, factors, Sensor } from '../devices.model';

export class Device {
  title: string;
  address: deviceAddress;
  type: 'Electrical panel' | 'Sensor Cotroller';
  factors: factors[];
  sensors: Sensor[];
}
