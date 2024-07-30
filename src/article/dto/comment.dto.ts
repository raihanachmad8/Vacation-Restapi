import { IsNotEmpty, IsString } from 'class-validator';

export class commentDto {
  @IsString()
  @IsNotEmpty()
  comment: string;
}
