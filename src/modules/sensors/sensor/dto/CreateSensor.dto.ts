import { IsNotEmpty, Length } from 'class-validator';

export class CreateSensorDto {
  @IsNotEmpty({ message: 'The sensor should have a sensorId' })
  deviceId: string;
  @Length(3, 255)
  @IsNotEmpty({ message: 'The sensor should have a title' })
  title: string;
  @IsNotEmpty({ message: 'The sensor should have a type' })
  @Length(1, 50)
  type: string;
  @IsNotEmpty({ message: 'The sensor should have a unit' })
  unit: string;
}
