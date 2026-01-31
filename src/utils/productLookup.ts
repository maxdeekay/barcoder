export interface ProductInfo {
  name: string | null;
  imageUrl: string | null;
}

const STORAGE_KEY = "barcoder-products";

// Load persisted cache from localStorage on startup
const cache: Map<string, ProductInfo> = (() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const entries: [string, ProductInfo][] = JSON.parse(stored);
      return new Map(entries);
    }
  } catch {
    // Corrupted data — start fresh
  }
  return new Map();
})();

function persistCache() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Array.from(cache.entries())),
    );
  } catch {
    // Storage full — fail silently
  }
}

/**
 * Looks up a product by barcode using the Open Food Facts API.
 * Returns name and image URL if found, null values otherwise.
 * Results are cached in localStorage for offline access.
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
      },
    );

    if (!res.ok) {
      // Don't persist network errors — retry next time
      cache.set(barcode, fallback);
      return fallback;
    }

    const data = await res.json();

    if (data.status !== 1 || !data.product) {
      cache.set(barcode, fallback);
      persistCache();
      return fallback;
    }

    const result: ProductInfo = {
      name: data.product.product_name || null,
      imageUrl: data.product.image_small_url || null,
    };

    cache.set(barcode, result);
    persistCache();
    return result;
  } catch {
    // Network error — don't persist, so we retry when online
    cache.set(barcode, fallback);
    return fallback;
  }
}
