import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateForumPostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  content: string;
}
