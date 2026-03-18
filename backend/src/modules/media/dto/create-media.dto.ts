import { IsEnum, IsInt, IsString, MaxLength, Min } from 'class-validator';
import { MediaStorage } from '@prisma/client';

export class CreateMediaDto {
  @IsString()
  @MaxLength(255)
  filename!: string;

  @IsString()
  @MaxLength(255)
  originalName!: string;

  @IsString()
  @MaxLength(100)
  mimeType!: string;

  @IsEnum(MediaStorage)
  storage!: MediaStorage;

  @IsString()
  @MaxLength(500)
  path!: string;

  @IsInt()
  @Min(0)
  size!: number;
}
