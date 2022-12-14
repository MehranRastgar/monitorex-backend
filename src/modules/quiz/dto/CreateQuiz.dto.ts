import { IsNotEmpty, Length } from 'class-validator';

export class CreateQuizDto {
  @Length(3, 255)
  @IsNotEmpty({ message: 'The quiz should have a title' })
  title: string;
  @IsNotEmpty({ message: 'The quiz should have a description' })
  @Length(3)
  description: string;
}
