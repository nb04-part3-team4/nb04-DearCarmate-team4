// src/schemas/customer.schema.ts

import { z } from 'zod';

// 고객 등록 시 필요한 필드들을 정의합니다.
// ageGroup과 region에는 특정 값만 허용하도록 enum을 사용했습니다.
export const createCustomerSchema = z.object({
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다."),
  gender: z.enum(['male', 'female'], { 
    errorMap: () => ({ message: "성별은 'male' 또는 'female' 중 하나여야 합니다." })
  }),
  phoneNumber: z.string().regex(/^01[0-9]{8,9}$/, "유효한 휴대폰 번호 형식이 아닙니다."),
  ageGroup: z.enum([
    '10대', '20대', '30대', '40대', '50대', '60대', '70대', '80대'
  ], {
    errorMap: () => ({ message: "유효하지 않은 연령대입니다." })
  }),
  region: z.enum([
    '서울', '경기', '인천', '강원', '충북', '충남', '세종', '대전', '전북', '전남', 
    '광주', '경북', '경남', '대구', '울산', '부산', '제주'
  ], {
    errorMap: () => ({ message: "유효하지 않은 지역입니다." })
  }),
  email: z.string().email("유효한 이메일 형식이 아닙니다.").optional().or(z.literal('')),
  memo: z.string().max(500, "메모는 500자를 초과할 수 없습니다.").optional(),
  // companyId는 인증 미들웨어를 통해 얻는다고 가정하고, 요청 본문에서는 제외합니다.
});

// 고객 정보 수정 시 필요한 필드들. 모두 필수는 아닙니다.
export const updateCustomerSchema = createCustomerSchema.partial();