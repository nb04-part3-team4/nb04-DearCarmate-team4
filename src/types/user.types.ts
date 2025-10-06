// User 관련 공통 타입 정의 (Single Source of Truth)

/**
 * 기본 User DTO
 * 모든 User 응답 DTO의 베이스 타입
 */
export interface BaseUserDto {
  id: number;
  email: string;
  name: string;
  employeeNumber: string;
  phoneNumber?: string;
  imageUrl?: string;
  isAdmin: boolean;
  companyId: number;
}

/**
 * Timestamp를 포함한 User DTO
 */
export interface UserDtoWithTimestamps extends BaseUserDto {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 생성 시간만 포함한 User DTO
 */
export interface UserDtoWithCreatedAt extends BaseUserDto {
  createdAt: Date;
}
