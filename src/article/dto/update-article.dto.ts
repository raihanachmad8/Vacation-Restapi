import { IsArray, IsMimeType, IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class UpdateArticleDto {
    @IsOptional()
    @IsString()
    @Length(5, 255)
    title?: string;

    @IsOptional()
    @IsString()
    @Length(10)
    content?: string;

    @IsOptional()
    @IsString()
    cover?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];


    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    user_id?: string;

}
