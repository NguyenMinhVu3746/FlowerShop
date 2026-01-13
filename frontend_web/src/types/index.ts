// ============================================
// COMMON TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================
// USER & AUTH TYPES
// ============================================

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export interface User {
  id: string;
  email: string;
  phone: string;
  fullname: string;
  avatar: string | null;
  birthday: string | null;
  gender: Gender | null;
  role: Role;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  title: string;
  fullAddress: string;
  ward: string;
  district: string;
  province: string;
  phoneReceiver: string;
  nameReceiver: string;
  isDefault: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ============================================
// PRODUCT TYPES
// ============================================

export enum ProductSize {
  S = 'S',
  M = 'M',
  L = 'L',
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  parent?: Category | null;
  children?: Category[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: ProductSize;
  price: number;
  description: string | null;
  stock: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  categoryId: string;
  category: Category;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  avgRating?: number;
  totalReviews?: number;
  relatedProducts?: Product[];
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  images: string[];
  isHidden: boolean;
  createdAt: string;
  user: {
    fullname: string;
    avatar: string | null;
  };
  adminReply?: {
    content: string;
    createdAt: string;
  } | null;
}

export interface ReviewStats {
  avgRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// ============================================
// ORDER TYPES
// ============================================

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  DELIVERING = 'DELIVERING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum SenderType {
  NAMED = 'NAMED',
  ANONYMOUS = 'ANONYMOUS',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  COD = 'COD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOMO = 'MOMO',
  VNPAY = 'VNPAY',
}

export interface OrderReceiver {
  name: string;
  phone: string;
  address: string;
  deliveryDate: string;
  deliverySlot: string;
}

export interface OrderItem {
  id: string;
  variantId: string;
  quantity: number;
  price: number;
  addons: any;
  variant: ProductVariant & { product: Product };
}

export interface Payment {
  id: string;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  note: string | null;
  messageCard: string | null;
  senderType: SenderType;
  createdAt: string;
  updatedAt: string;
  receiver: OrderReceiver;
  items: OrderItem[];
  payment: Payment;
}

// ============================================
// CART TYPES
// ============================================

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  image: string;
  size: ProductSize;
  price: number;
  quantity: number;
  stock: number;
}

// ============================================
// VOUCHER & BANNER TYPES
// ============================================

export enum VoucherType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export interface Voucher {
  id: string;
  code: string;
  type: VoucherType;
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  startDate: string;
  endDate: string;
  quantity: number;
  used: number;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  link: string | null;
  description: string | null;
  order: number;
  isActive: boolean;
}

// ============================================
// CHECKOUT TYPES
// ============================================

export interface CheckoutData {
  items: {
    variantId: string;
    quantity: number;
    addons?: any;
  }[];
  receiver: {
    name: string;
    phone: string;
    address: string;
    deliveryDate: string;
    deliverySlot: string;
  };
  paymentMethod: PaymentMethod;
  voucherCode?: string;
  note?: string;
  messageCard?: string;
  senderType: SenderType;
}

// ============================================
// AI TYPES
// ============================================

export interface AIProductSuggestion {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  category: { name: string };
  prices: Array<{ size: ProductSize; price: number; stock: number }>;
  reviewCount: number;
}

export interface AIChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text?: string; image?: string }>;
  suggestions?: AIProductSuggestion[];
  imageAnalysis?: string;
}

export interface AIChatResponse {
  response: string;
  suggestions: AIProductSuggestion[] | null;
  imageAnalysis?: string | null;
}

export interface AIImageSearchResponse {
  analysis: {
    description: string;
    keywords: string[];
    suggestions: string;
  };
  products: Product[];
  total: number;
}

// ============================================
// AI SCAN TYPES (Flower Detection with YOLO)
// ============================================

export interface FlowerDetection {
  name: string;
  displayName: string;
  count: number;
  price: number;
  total: number;
}

export interface AIScanResponse {
  success: boolean;
  data?: Record<string, number>; // e.g. { "Hoa hong": 3, "Hoa ly": 2 }
  error?: string;
}

// ============================================
// DASHBOARD TYPES (Admin)
// ============================================

export interface DashboardOverview {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: string;
  title: string;
  image: string;
  totalSold: number;
  revenue: number;
}
