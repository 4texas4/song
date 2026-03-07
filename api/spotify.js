// Vercel Serverless Function - Spotify Proxy with Signature Generation
// Deploy this to: /api/spotify.js

export default async function handler(req, res) {
    // Enable CORS for all origins (or specify your domain)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ 
                error: 'Missing URL parameter',
                usage: '/api/spotify?url=open.spotify.com/track/...'
            });
        }

        // Extract and validate Spotify URL
        const spotifyUrl = extractSpotifyUrl(url);
        
        if (!spotifyUrl) {
            return res.status(400).json({ 
                error: 'Invalid Spotify URL',
                provided: url
            });
        }

        // Generate signature using the exact algorithm
        const signature = generateSignature(spotifyUrl);

        // Construct API URL
        const apiUrl = `https://api.spotidown.co/search/${spotifyUrl}?sig=${signature}`;

        console.log('Proxying request:', {
            spotifyUrl,
            signature,
            apiUrl
        });

        // Fetch from Spotidown API
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://spotidown.co/',
                'Origin': 'https://spotidown.co'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            
            return res.status(response.status).json({
                error: `Spotidown API returned ${response.status}`,
                details: errorText,
                signature: signature,
                url: spotifyUrl
            });
        }

        const data = await response.json();

        // Return the data with additional metadata
        return res.status(200).json({
            success: true,
            signature: signature,
            spotifyUrl: spotifyUrl,
            data: data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Proxy error:', error);
        
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

// ============================================
// SIGNATURE GENERATION FUNCTIONS
// ============================================

function generateSignature(spotifyUrl) {
    const DOMAIN_OFFSET = -4666;
    const CHECKSUM_MULTIPLIER = 666111444;
    const VERIFY_MULTIPLIER = 666;

    // Step 1: Encode to base64
    const encoded = Buffer.from(spotifyUrl).toString('base64');
    
    // Step 2: Generate random position
    const randomPos = Math.floor(Math.random() * encoded.length);
    
    // Step 3: Create shuffled string (random subset)
    const shuffled = encoded
        .split('')
        .filter(() => Math.random() > 0.5)
        .sort(() => Math.random() - 0.5)
        .join('');
    
    // Step 4: Calculate checksum
    const checksum = (randomPos * CHECKSUM_MULTIPLIER + DOMAIN_OFFSET)
        .toString(16);
    
    // Step 5: Rotate and reverse the encoded string
    const rotated = (encoded.slice(randomPos) + encoded.slice(0, randomPos))
        .split('')
        .reverse()
        .join('');
    
    // Step 6: Calculate verification value
    const verification = (randomPos * VERIFY_MULTIPLIER).toString(16);
    
    // Step 7: Combine all parts
    return `${checksum}_${rotated}_${verification}_${shuffled}`;
}

function extractSpotifyUrl(input) {
    // Remove protocol if present
    input = input.replace(/^https?:\/\//, '');
    
    // Match Spotify URL patterns
    const match = input.match(/(open\.spotify\.com\/.+|spotify\.link|spotify\.app\.link)\/([^?]+)/i);
    
    return match ? match[0] : null;
}

// ============================================
// SIGNATURE VALIDATION (for debugging)
// ============================================

function validateSignature(signature) {
    const CHECKSUM_MULTIPLIER = 666111444;
    const VERIFY_MULTIPLIER = 666;
    
    const parts = signature.split('_');
    
    if (parts.length !== 4) {
        throw new Error('Invalid signature format: expected 4 parts');
    }
    
    const [checksumHex, rotated, verifyHex, shuffled] = parts;
    
    // Parse hex values
    const randomPos = parseInt(checksumHex, 16) / CHECKSUM_MULTIPLIER;
    const verifyPos = parseInt(verifyHex, 16);
    
    // Validate position consistency
    if (Math.abs(verifyPos / VERIFY_MULTIPLIER - randomPos) > 0.001) {
        throw new Error('Signature verification failed: position mismatch');
    }
    
    // Reverse the rotation
    const reversed = rotated.split('').reverse().join('');
    const unrotated = reversed.slice(-randomPos) + reversed.slice(0, -randomPos);
    
    // Decode from base64
    const decoded = Buffer.from(unrotated, 'base64').toString('utf-8');
    
    return decoded;
}
