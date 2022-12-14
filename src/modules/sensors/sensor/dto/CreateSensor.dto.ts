import { IsNotEmpty, Length } from 'class-validator';

export class CreateSensorDto {
  @Length(3, 255)
  @IsNotEmpty({ message: 'The sensor should have a title' })
  title: string;
  @IsNotEmpty({ message: 'The sensor should have a multiport' })
  multiport: number;
  @IsNotEmpty({ message: 'The sensor should have a superMultiport' })
  superMultiport: number;
  @IsNotEmpty({ message: 'The sensor should have a description' })
  @Length(1, 50)
  type: string;
  @IsNotEmpty({ message: 'The sensor should have a unit' })
  unit: string;
}
