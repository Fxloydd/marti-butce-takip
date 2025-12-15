import { NextResponse } from 'next/server';

// Cache fuel price for 1 hour
let cachedPrice: { price: number; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET() {
    try {
        // Check cache
        if (cachedPrice && Date.now() - cachedPrice.timestamp < CACHE_DURATION) {
            return NextResponse.json({
                price: cachedPrice.price,
                cached: true,
                updatedAt: new Date(cachedPrice.timestamp).toISOString()
            });
        }

        // Try to fetch from a public source
        // Using CollectAPI for Turkey fuel prices (free tier available)
        const response = await fetch('https://api.collectapi.com/gasPrice/turkeyGasoline', {
            headers: {
                'content-type': 'application/json',
                'authorization': `apikey ${process.env.COLLECTAPI_KEY || ''}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            // Get Istanbul 95 octane price as default
            const istanbulPrice = data.result?.find((item: any) =>
                item.city?.toLowerCase().includes('istanbul')
            );

            if (istanbulPrice?.gasolinePrice) {
                const price = parseFloat(istanbulPrice.gasolinePrice.replace(',', '.'));
                cachedPrice = { price, timestamp: Date.now() };
                return NextResponse.json({
                    price,
                    cached: false,
                    updatedAt: new Date().toISOString()
                });
            }
        }

        // Fallback: Return a reasonable default price if API fails
        // This can be updated manually
        const fallbackPrice = 48.50; // TL per liter (approximate)
        return NextResponse.json({
            price: cachedPrice?.price || fallbackPrice,
            cached: true,
            fallback: true,
            updatedAt: cachedPrice ? new Date(cachedPrice.timestamp).toISOString() : new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching fuel price:', error);
        return NextResponse.json({
            price: cachedPrice?.price || 48.50,
            cached: true,
            error: true
        });
    }
}

// Force refresh price
export async function POST() {
    cachedPrice = null;
    return GET();
}
