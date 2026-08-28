import { z } from "zod";
import { AuthSessionSchema, UserRoleSchema } from "../schemas/auth.schema";
import type { User, Profile } from "@/types/entities";
import type { ApiResponseDto, ApiErrorDto, EmptyRequestDto, EmptyResponseData } from "@/types/api/common";

export type UserRole = z.infer<typeof UserRoleSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;

export interface LoginRequestDto {
  email: string;
  password?: string;
  token?: string;
}

export type LoginResponseDto = ApiResponseDto<{
  user: User;
  session?: AuthSession;
}>;

export type LoginErrorDto = ApiErrorDto;

export interface RegisterRequestDto {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  countryCode: string;
  phoneNumber: string;
  gender: string;
  emailVerificationToken?: string;
  phoneVerificationToken?: string;
}

export type RegisterResponseDto = ApiResponseDto<{
  user: User;
  session?: AuthSession;
}>;

export type RegisterErrorDto = ApiErrorDto;

export type RefreshSessionRequestDto = EmptyRequestDto;
export type RefreshSessionResponseDto = ApiResponseDto<{
  accessToken: string;
  expiresAt?: string;
}>;

export type RefreshSessionErrorDto = ApiErrorDto;

export type LogoutRequestDto = EmptyRequestDto;
export type LogoutResponseDto = ApiResponseDto<EmptyResponseData>;
export type LogoutErrorDto = ApiErrorDto;

export type GetProfileRequestDto = EmptyRequestDto;
export type GetProfileResponseDto = ApiResponseDto<Profile>;
export type GetProfileErrorDto = ApiErrorDto;

export type UpdateProfileRequestDto = Profile;
export type UpdateProfileResponseDto = ApiResponseDto<Profile>;
export type UpdateProfileErrorDto = ApiErrorDto;
