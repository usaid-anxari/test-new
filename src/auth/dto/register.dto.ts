import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator'
export class RegisterDto {
  @IsEmail() email!: string
  @Length(8, 100) password!: string
  @IsOptional() @IsString() name?: string
  @IsNotEmpty() @IsString() tenantName!: string
}