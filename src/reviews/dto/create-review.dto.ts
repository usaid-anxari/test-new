import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator'
export class CreateReviewDto {
  @IsOptional() @IsString() title?: string
  @IsOptional() @IsString() authorName?: string
  @IsOptional() @IsEmail() authorEmail?: string
  @IsBoolean() consent!: boolean
  @IsOptional() @IsString() videoS3Key?: string
}