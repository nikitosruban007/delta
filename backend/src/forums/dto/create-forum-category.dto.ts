import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateForumCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title: string;
}
