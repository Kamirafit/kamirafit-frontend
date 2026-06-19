import type { AuthSession, Profile, User } from "../entities";
import type { ApiErrorDto, ApiResponseDto, EmptyRequestDto, EmptyResponseData } from "./common";

export interface LoginRequestDto { email: string; password?: string; token?: string; }
export type LoginResponseDto = ApiResponseDto<{ user: User; session?: AuthSession }>;
export type LoginErrorDto = ApiErrorDto;

export interface RegisterRequestDto { email: string; password?: string; firstName?: string; lastName?: string; mobileNumber?: string; }
export type RegisterResponseDto = ApiResponseDto<{ user: User; session?: AuthSession }>;
export type RegisterErrorDto = ApiErrorDto;

export type RefreshSessionRequestDto = EmptyRequestDto;
export type RefreshSessionResponseDto = ApiResponseDto<{ accessToken: string; expiresAt?: string }>;
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
