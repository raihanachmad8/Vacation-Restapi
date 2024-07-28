import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  @Length(5)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(10)
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  user_id?: string;
}
