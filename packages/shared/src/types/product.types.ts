export interface ProductImage {
  id: string;
  url: string;
  objectKey: string;
  mimeType: string;
  sizeBytes: number;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  promoPrice?: number;
  status: 'draft' | 'active';
  categoryId?: string;
  tags: string[];
  images: ProductImage[];
  imageScale?: number;
  imagePositionX?: number;
  imagePositionY?: number;
  optionGroups?: MenuOptionGroup[];
}

export interface MenuOptionGroup {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  options: MenuOption[];
}

export interface MenuOption {
  id: string;
  name: string;
  priceDelta: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}
