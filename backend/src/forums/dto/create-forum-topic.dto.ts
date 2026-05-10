import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateForumTopicDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;

  @IsString()
  @MinLength(3)
  @MaxLength(180)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];
}
