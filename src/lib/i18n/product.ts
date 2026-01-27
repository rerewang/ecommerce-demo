import { Product } from '@/types/product';

export function getLocalizedProduct(product: Product, locale: string): Product {
  if (locale === 'zh') {
    return {
      ...product,
      name: product.name_zh || product.name,
      description: product.description_zh || product.description,
    };
  }
  return product;
}
