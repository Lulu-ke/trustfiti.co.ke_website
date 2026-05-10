export interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "REVIEWER" | "COMPANY_OWNER" | "ADMIN";
  phoneNumber: string;
}

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  isFeatured: boolean;
  isPublished: boolean;
  status: "PUBLISHED" | "HIDDEN" | "FLAGGED" | "REMOVED";
  createdAt: string;
  updatedAt: string;
  reviewerId: string;
  companyId: string;
  reviewer?: {
    id: string;
    fullName: string | null;
    avatar: string | null;
  };
  company?: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    industry: string | null;
  };
  replies?: ReviewReply[];
  _count?: {
    flags: number;
    replies: number;
  };
}

export interface ReviewReply {
  id: string;
  content: string;
  createdAt: string;
  reviewId: string;
  authorId: string;
  author?: {
    id: string;
    fullName: string | null;
    avatar: string | null;
  };
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  website: string | null;
  industry: string | null;
  address: string | null;
  city: string | null;
  country: string;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

export interface Invitation {
  id: string;
  token: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
  company: {
    id: string;
    name: string;
    logo: string | null;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
