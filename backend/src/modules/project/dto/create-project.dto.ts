import { IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
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
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cover?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  repoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  previewUrl?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
