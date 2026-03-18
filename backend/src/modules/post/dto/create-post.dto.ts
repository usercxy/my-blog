import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PostStatus } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  @MaxLength(200)
  title!: string;

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
  @MaxLength(500)
  cover?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsString()
  markdownContent!: string;

  @IsOptional()
  @IsString()
  htmlContent?: string;

  @IsOptional()
  tocJson?: unknown;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  @IsString({ each: true })
  categoryIds!: string[];

  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsString({ each: true })
  tagIds?: string[];

  @IsOptional()
  @IsBoolean()
  isTop?: boolean;

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
