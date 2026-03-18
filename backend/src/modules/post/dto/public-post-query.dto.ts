import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PostStatus } from '@prisma/client';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class PublicPostQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @Type(() => String)
  @IsString()
  categoryId?: string;

  @IsOptional()
  @Type(() => String)
  @IsString()
  tagId?: string;
}
