import { NextApiResponse } from "next";

type ResponseData = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function success(res: NextApiResponse, data: any, message?: string, pagination?: any): void {
  const response: ResponseData = {
    success: true,
    message: message || "Success",
    data,
  };
  if (pagination) response.pagination = pagination;
  res.status(200).json(response);
}

export function created(res: NextApiResponse, data: any, message?: string): void {
  res.status(201).json({
    success: true,
    message: message || "Created successfully",
    data,
  });
}

export function badRequest(res: NextApiResponse, message: string, error?: string): void {
  res.status(400).json({
    success: false,
    message,
    error,
  });
}

export function unauthorized(res: NextApiResponse, message?: string): void {
  res.status(401).json({
    success: false,
    message: message || "Unauthorized",
  });
}

export function forbidden(res: NextApiResponse, message?: string): void {
  res.status(403).json({
    success: false,
    message: message || "Forbidden",
  });
}

export function notFound(res: NextApiResponse, message?: string): void {
  res.status(404).json({
    success: false,
    message: message || "Not found",
  });
}

export function serverError(res: NextApiResponse, message?: string, error?: string): void {
  console.error("Server error:", error || message);
  res.status(500).json({
    success: false,
    message: message || "Internal server error",
  });
}
