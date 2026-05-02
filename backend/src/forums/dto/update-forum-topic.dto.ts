import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class UpdateForumTopicDto {
  @IsOptional()
  /* istanbul ignore next -- class-transformer decorator callback is exercised through ValidationPipe/Supertest. */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  title?: string;
}
