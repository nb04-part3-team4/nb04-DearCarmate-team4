// src/controllers/customer.controller.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createCustomerSchema, updateCustomerSchema } from '../schemas/customer.schema';

const prisma = new PrismaClient();

// 미들웨어를 통해 사용자 정보에서 companyId를 추출한다고 가정합니다.
// 실제 프로젝트에서는 Request 객체에 사용자 정보가 담겨있을 겁니다.
type AuthenticatedRequest = Request & { user?: { companyId: number } };

// --- 1. 새로운 고객 등록 (Create) ---
export const createCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId; // 로그인된 사용자의 companyId 사용
    if (!companyId) {
      return res.status(401).json({ message: "인증 정보가 누락되었습니다." });
    }

    // Zod를 이용한 요청 데이터 검증
    const validatedData = createCustomerSchema.parse(req.body);

    const newCustomer = await prisma.customer.create({
      data: {
        ...validatedData,
        companyId: companyId, // 회사를 연결
      },
    });

    res.status(201).json({ message: '고객 정보가 성공적으로 등록되었습니다.', data: newCustomer });

  } catch (error) {
    if (error instanceof z.ZodError) {
        // Zod 유효성 검사 실패
        return res.status(400).json({ message: "입력 데이터 형식이 올바르지 않습니다.", errors: error.errors });
    }
    console.error('고객 등록 오류:', error);
    res.status(500).json({ message: '서버 오류로 고객 등록에 실패했습니다.' });
  }
};


// --- 2. 고객 목록 조회 (Read - All/List) ---
export const getCustomers = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(401).json({ message: "인증 정보가 누락되었습니다." });
        }

        // TODO: 실제 프로젝트에서는 페이지네이션(limit, offset) 및 검색(name, phone) 기능을 추가해야 합니다.
        const customers = await prisma.customer.findMany({
            where: {
                companyId: companyId, // 현재 회사 소속 고객만 조회
            },
            orderBy: {
                createdAt: 'desc', // 최신 등록 고객이 먼저 오도록 정렬
            }
        });

        res.status(200).json({ data: customers, count: customers.length });

    } catch (error) {
        console.error('고객 목록 조회 오류:', error);
        res.status(500).json({ message: '서버 오류로 고객 목록 조회에 실패했습니다.' });
    }
};

// --- 3. 특정 고객 상세 조회 (Read - Single) ---
export const getCustomerById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        const customerId = parseInt(req.params.id);

        if (!companyId || isNaN(customerId)) {
            return res.status(400).json({ message: "유효하지 않은 요청입니다." });
        }

        const customer = await prisma.customer.findUnique({
            where: {
                id: customerId,
                companyId: companyId, // 반드시 해당 회사 소속 고객인지 확인
            },
            // 필요하다면 계약(Contracts) 정보 등 관계 데이터도 include 가능
        });

        if (!customer) {
            return res.status(404).json({ message: '해당 고객을 찾을 수 없습니다.' });
        }

        res.status(200).json({ data: customer });

    } catch (error) {
        console.error('고객 상세 조회 오류:', error);
        res.status(500).json({ message: '서버 오류로 고객 상세 조회에 실패했습니다.' });
    }
};

// --- 4. 고객 정보 수정 (Update) ---
export const updateCustomer = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        const customerId = parseInt(req.params.id);

        if (!companyId || isNaN(customerId)) {
            return res.status(400).json({ message: "유효하지 않은 요청입니다." });
        }

        // Zod를 이용한 요청 데이터 검증 (부분 수정이므로 partial schema 사용)
        const validatedData = updateCustomerSchema.parse(req.body);

        // 수정할 데이터가 없을 경우
        if (Object.keys(validatedData).length === 0) {
            return res.status(400).json({ message: "수정할 데이터가 없습니다." });
        }

        const updatedCustomer = await prisma.customer.update({
            where: {
                id: customerId,
                companyId: companyId, // 회사 소속 확인
            },
            data: validatedData,
        });

        res.status(200).json({ message: '고객 정보가 성공적으로 수정되었습니다.', data: updatedCustomer });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "입력 데이터 형식이 올바르지 않습니다.", errors: error.errors });
        }
        console.error('고객 정보 수정 오류:', error);
        res.status(500).json({ message: '서버 오류로 고객 정보 수정에 실패했습니다.' });
    }
};

// --- 5. 고객 정보 삭제 (Delete) ---
export const deleteCustomer = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        const customerId = parseInt(req.params.id);

        if (!companyId || isNaN(customerId)) {
            return res.status(400).json({ message: "유효하지 않은 요청입니다." });
        }

        // 삭제 전, 해당 고객이 계약에 연결되어 있는지 확인하는 로직이 필요할 수 있습니다.
        // Prisma의 onDelete: Cascade 설정에 따라 계약도 함께 삭제될 수 있으니 주의해야 합니다.

        await prisma.customer.delete({
            where: {
                id: customerId,
                companyId: companyId, // 회사 소속 확인
            },
        });

        res.status(204).json({ message: '고객 정보가 성공적으로 삭제되었습니다.' }); // 204 No Content

    } catch (error) {
        // P2025: 삭제하려는 레코드를 찾지 못했을 때의 에러 코드
        if (error.code === 'P2025') {
            return res.status(404).json({ message: '삭제하려는 고객을 찾을 수 없습니다.' });
        }
        console.error('고객 정보 삭제 오류:', error);
        res.status(500).json({ message: '서버 오류로 고객 정보 삭제에 실패했습니다.' });
    }
};