import { NextResponse } from 'next/server';

// Cache fuel price for 6 hours
let cachedPrice: { price: number; timestamp: number; city: string } | null = null;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

async function fetchOPETPrice(): Promise<number | null> {
    try {
        // OPET's fuel price page for Eskişehir
        const response = await fetch('https://www.opet.com.tr/akaryakit-fiyatlari', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            console.error('OPET fetch failed:', response.status);
            return null;
        }

        const html = await response.text();

        // Find Eskişehir row and extract benzin (95 oktan) price
        // OPET page structure: city name followed by fuel prices
        const eskisehirMatch = html.match(/ESKİŞEHİR[\s\S]*?<td[^>]*>([0-9]+[,\.][0-9]+)<\/td>/i);

        if (eskisehirMatch && eskisehirMatch[1]) {
            // First price after city name is usually benzin
            const priceStr = eskisehirMatch[1].replace(',', '.');
            const price = parseFloat(priceStr);
            if (!isNaN(price) && price > 0) {
                return price;
            }
        }

        // Alternative: Try to find any benzin price pattern
        // Look for the price table structure
        const pricePattern = /ESK[İI]ŞEH[İI]R.*?(\d{2}[,.]\d{2})/is;
        const altMatch = html.match(pricePattern);

        if (altMatch && altMatch[1]) {
            const price = parseFloat(altMatch[1].replace(',', '.'));
            if (!isNaN(price) && price > 30 && price < 100) {
                return price;
            }
        }

        // Try fetching from EPDK (Turkish Energy Market Regulatory Authority)
        return await fetchEPDKPrice();

    } catch (error) {
        console.error('Error fetching OPET price:', error);
        return null;
    }
}

async function fetchEPDKPrice(): Promise<number | null> {
    try {
        // EPDK provides official fuel prices
        const response = await fetch('https://www.epdk.gov.tr/Detay/Icerik/3-0-107/akaryakit-fiyatlari', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (!response.ok) return null;

        const html = await response.text();

        // Look for benzin price in the page
        const priceMatch = html.match(/benzin[^0-9]*(\d{2}[,.]\d{2})/i);
        if (priceMatch && priceMatch[1]) {
            return parseFloat(priceMatch[1].replace(',', '.'));
        }

        return null;
    } catch (error) {
        console.error('Error fetching EPDK price:', error);
        return null;
    }
}

async function fetchFromPetrolOfisi(): Promise<number | null> {
    try {
        // Petrol Ofisi API endpoint (if available)
        const response = await fetch('https://www.petrolofisi.com.tr/api/fuel-prices', {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            // Extract Eskişehir price
            const eskisehir = data.cities?.find((c: any) =>
                c.name?.toLowerCase().includes('eskişehir') ||
                c.name?.toLowerCase().includes('eskisehir')
            );
            if (eskisehir?.benzin || eskisehir?.gasoline) {
                return eskisehir.benzin || eskisehir.gasoline;
            }
        }
        return null;
    } catch {
        return null;
    }
}

export async function GET() {
    try {
        // Check cache first
        if (cachedPrice && Date.now() - cachedPrice.timestamp < CACHE_DURATION) {
            return NextResponse.json({
                price: cachedPrice.price,
                cached: true,
                city: 'Eskişehir',
                source: 'OPET',
                updatedAt: new Date(cachedPrice.timestamp).toISOString()
            });
        }

        // Try to fetch fresh price
        let price = await fetchOPETPrice();

        if (!price) {
            price = await fetchFromPetrolOfisi();
        }

        // If we got a valid price, cache it
        if (price && price > 30 && price < 100) {
            cachedPrice = {
                price,
                timestamp: Date.now(),
                city: 'Eskişehir'
            };

            return NextResponse.json({
                price,
                cached: false,
                city: 'Eskişehir',
                source: 'OPET',
                updatedAt: new Date().toISOString()
            });
        }

        // Fallback to cached price or default
        const fallbackPrice = cachedPrice?.price || 55.71; // Current approximate price

        return NextResponse.json({
            price: fallbackPrice,
            cached: true,
            city: 'Eskişehir',
            source: 'fallback',
            updatedAt: cachedPrice ? new Date(cachedPrice.timestamp).toISOString() : new Date().toISOString(),
            note: 'Güncel fiyat alınamadı, lütfen manuel güncelleyin'
        });

    } catch (error) {
        console.error('Error in fuel price API:', error);
        return NextResponse.json({
            price: cachedPrice?.price || 55.71,
            cached: true,
            error: true,
            city: 'Eskişehir'
        });
    }
}

// Force refresh price
export async function POST() {
    cachedPrice = null;
    return GET();
}
