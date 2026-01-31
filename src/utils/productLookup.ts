export interface ProductInfo {
  name: string | null;
  imageUrl: string | null;
}

const cache = new Map<string, ProductInfo>();

/**
 * Looks up a product by barcode using the Open Food Facts API.
 * Returns name and image URL if found, null values otherwise.
 * Results are cached in memory for the session.
 */
export async function lookupProduct(barcode: string): Promise<ProductInfo> {
  const cached = cache.get(barcode);
  if (cached) return cached;

  const fallback: ProductInfo = { name: null, imageUrl: null };

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,image_small_url`,
      {
        headers: {
          "User-Agent": "Barcoder/1.0 (personal shopping helper)",
        },
      }
    );

    if (!res.ok) {
      cache.set(barcode, fallback);
      return fallback;
    }

    const data = await res.json();

    if (data.status !== 1 || !data.product) {
      cache.set(barcode, fallback);
      return fallback;
    }

    const result: ProductInfo = {
      name: data.product.product_name || null,
      imageUrl: data.product.image_small_url || null,
    };

    cache.set(barcode, result);
    return result;
  } catch {
    // Network error — likely offline in store, fail silently
    cache.set(barcode, fallback);
    return fallback;
  }
}
