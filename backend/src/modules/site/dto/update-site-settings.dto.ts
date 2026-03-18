import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class ExperienceItemDto {
  @IsString()
  @MaxLength(100)
  period!: string;

  @IsString()
  @MaxLength(100)
  title!: string;

  @IsString()
  @MaxLength(500)
  description!: string;
}

class SocialLinkDto {
  @IsString()
  @MaxLength(50)
  label!: string;

  @IsString()
  @MaxLength(500)
  href!: string;
}

export class UpdateSiteSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  siteName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  siteDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  siteUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  favicon?: string;

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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceItemDto)
  experiences?: ExperienceItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactEmail?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socialLinks?: SocialLinkDto[];
}
