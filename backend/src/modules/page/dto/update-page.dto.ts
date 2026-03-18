import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PageStatus } from '@prisma/client';

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  seoKeywords?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;
}
