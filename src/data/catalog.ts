import content from './content-details.json'

export type CatalogProduct = {
  sku: string
  name: string
  cat: string
  price: number
  stock: number
  lowStock?: boolean
  image: string
}

const posProductsEl = content.pages.pos.elements.find((e) => e.id === 'product-grid') as {
  content: { products: CatalogProduct[] }
}

export function getCatalogProducts(): CatalogProduct[] {
  return posProductsEl.content.products
}

export function getCatalogProduct(sku: string): CatalogProduct | undefined {
  return getCatalogProducts().find((p) => p.sku === sku)
}
