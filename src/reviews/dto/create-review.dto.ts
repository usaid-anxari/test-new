import { IsOptional, IsString, IsEmail, IsBoolean, IsNumber } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  title: string;

  @IsString()
  authorName: string;

  @IsEmail()
  authorEmail: string;

  @IsBoolean()
  consent: boolean;

  // --- Media ---
  @IsOptional()
  @IsString()
  videoS3Key?: string;

  @IsOptional()
  @IsString()
  audioS3Key?: string;

  // --- Text Review ---
  @IsOptional()
  @IsString()
  text?: string;

  // --- Metadata ---
  @IsOptional()
  @IsNumber()
  durationSec?: number;

  @IsOptional()
  @IsString()
  previewUrl?: string;
}
