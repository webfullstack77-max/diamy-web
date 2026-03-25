export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  parent?: Category | null;
  children?: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number | null;
  images: string[];
  materials: string[];
  categoryId: string;
  category?: Category;
  subcategoryId: string | null;
  subcategory?: Category | null;
  isActive: boolean;
  isFeatured: boolean;
  isCollection: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string | null;
  text: string;
  rating: number;
  avatar: string | null;
  createdAt: Date;
}
