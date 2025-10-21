export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
  employeeNumber: string;
  phoneNumber?: string;
  imageUrl?: string;
  isAdmin: boolean;
  company: {
    companyName: string;
  };
}

export interface ContractUserListItemDto {
  id: number;
  data: string;
}

export type SignupResponseDto = UserResponseDto;
export type GetMeResponseDto = UserResponseDto;
export type UpdateMeResponseDto = UserResponseDto;
export type GetUserResponseDto = UserResponseDto;
export type GetContractUsersResponseDto = ContractUserListItemDto[];
