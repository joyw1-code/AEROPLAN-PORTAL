import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to initialize Gemini SDK lazily
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is missing or using default placeholder. Gemini features will run in high-fidelity simulation mode.");
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// 1. API: Recommendations on places in that area with coordinates for map markers
app.post("/api/recommendations", async (req, res) => {
  const { destination } = req.body;
  if (!destination) {
    return res.status(400).json({ error: "Destination is required" });
  }

  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `Provide a curated list of exactly 6 top-rated spots/places in "${destination}" for a traveler. 
Include historic landmarks, culinary highlights, scenic viewpoints, or hidden gems.
For each place, provide a realistic latitude and longitude coordinate set within "${destination}" region (or close vicinity) so they can be plotted on a map. 
Return the data structured as a JSON list.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the place" },
                category: { type: Type.STRING, description: "Category of place (e.g., Landmark, Dining, Nature, Museum)" },
                description: { type: Type.STRING, description: "Brief interesting description or tip (1-2 sentences)" },
                rating: { type: Type.NUMBER, description: "Rating from 1.0 to 5.0" },
                address: { type: Type.STRING, description: "Brief physical address or location descriptive indicator" },
                latitude: { type: Type.NUMBER, description: "Realistic latitude coordinate" },
                longitude: { type: Type.NUMBER, description: "Realistic longitude coordinate" }
              },
              required: ["name", "category", "description", "rating", "latitude", "longitude"]
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        const places = JSON.parse(text);
        return res.json({ source: "gemini", places });
      }
    } catch (err: any) {
      console.error("Gemini recommendation error:", err);
    }
  }

  // High-fidelity fallback simulated places for common destinations
  const fallbackPlaces: Record<string, any[]> = {
    "london": [
      { name: "The British Museum", category: "Museum", description: "Incredible historical artifacts, including the Rosetta Stone and Egyptian mummies.", rating: 4.8, address: "Great Russell St, London", latitude: 51.5194, longitude: -0.1270 },
      { name: "Tower of London", category: "Landmark", description: "Historic castle housing the Crown Jewels and guarded by Yeoman Warders.", rating: 4.7, address: "London EC3N 4AB", latitude: 51.5081, longitude: -0.0759 },
      { name: "Borough Market", category: "Dining", description: "Vibrant food market with gourmet ingredients, hot street food, and bustling crowds.", rating: 4.6, address: "8 Southwark St, London", latitude: 51.5055, longitude: -0.0905 },
      { name: "Sky Garden", category: "Landmark", description: "Spectacular 3-story glass dome offering 360-degree views and beautiful lush gardens.", rating: 4.7, address: "20 Fenchurch St, London", latitude: 51.5113, longitude: -0.0837 },
      { name: "Hyde Park", category: "Nature", description: "Enormous royal park with beautiful walking lanes, Serpentine lake, and boat rentals.", rating: 4.5, address: "London W2 2UH", latitude: 51.5073, longitude: -0.1657 },
      { name: "Tate Modern", category: "Museum", description: "Iconic modern and contemporary art gallery situated on the banks of the River Thames.", rating: 4.6, address: "Bankside, London SE1 9TG", latitude: 51.5076, longitude: -0.0994 }
    ],
    "new york": [
      { name: "Central Park", category: "Nature", description: "The iconic green heart of NYC, featuring bridges, trails, castles, and boat rides.", rating: 4.8, address: "New York, NY", latitude: 40.7829, longitude: -73.9654 },
      { name: "The Metropolitan Museum of Art", category: "Museum", description: "World-renowned art museum covering 5,000+ years of global culture.", rating: 4.9, address: "1000 5th Ave, New York", latitude: 40.7794, longitude: -73.9632 },
      { name: "High Line Park", category: "Landmark", description: "Fabulous linear elevated public park built on a historic freight rail line.", rating: 4.6, address: "New York, NY 10011", latitude: 40.7480, longitude: -74.0048 },
      { name: "Empire State Building", category: "Landmark", description: "Legendary Art Deco skyscraper offering breathtaking high-rise city views.", rating: 4.7, address: "20 W 34th St, New York", latitude: 40.7484, longitude: -73.9857 },
      { name: "Chelsea Market", category: "Dining", description: "Enclosed food and retail concourse bursting with legendary international eateries.", rating: 4.5, address: "75 9th Ave, New York", latitude: 40.7420, longitude: -74.0060 },
      { name: "Brooklyn Bridge", category: "Landmark", description: "Classic neo-Gothic suspension bridge perfect for breezy panoramic walks to Brooklyn.", rating: 4.8, address: "Brooklyn Bridge, New York", latitude: 40.7061, longitude: -73.9969 }
    ],
    "paris": [
      { name: "Eiffel Tower", category: "Landmark", description: "The definitive symbol of Paris, stunningly lit up at night with magical sparkling lights.", rating: 4.7, address: "Champ de Mars, Paris", latitude: 48.8584, longitude: 2.2945 },
      { name: "Louvre Museum", category: "Museum", description: "The world's largest art museum, home to the Mona Lisa and spectacular glass pyramid.", rating: 4.8, address: "Rue de Rivoli, Paris", latitude: 48.8606, longitude: 2.3376 },
      { name: "Sacré-Cœur Basilica", category: "Landmark", description: "White-domed hilltop church offering sweeping romance and panoramic vistas of Paris.", rating: 4.7, address: "35 Rue du Chevalier de la Barre, Paris", latitude: 48.8867, longitude: 2.3431 },
      { name: "Champs-Élysées & Arc de Triomphe", category: "Landmark", description: "Gorgeously tree-lined avenue celebrating French victories with boutique shops.", rating: 4.6, address: "Place Charles de Gaulle, Paris", latitude: 48.8738, longitude: 2.2950 },
      { name: "Jardin du Luxembourg", category: "Nature", description: "Serene 17th-century royal gardens perfect for sitting by fountains and reading.", rating: 4.7, address: "Paris 75006", latitude: 48.8462, longitude: 2.3372 },
      { name: "Le Marais", category: "Dining", description: "Historic neighborhood with outstanding bakeries, chic boutiques, and superb street food.", rating: 4.6, address: "Marais, Paris", latitude: 48.8575, longitude: 2.3601 }
    ],
    "tokyo": [
      { name: "Senso-ji Temple", category: "Landmark", description: "Tokyo's oldest and most iconic Buddhist temple with vibrant market stalls.", rating: 4.7, address: "Asakusa, Tokyo", latitude: 35.7148, longitude: 139.7967 },
      { name: "Shibuya Crossing", category: "Landmark", description: "The world's busiest pedestrian scramble, dazzling with giant video screens.", rating: 4.5, address: "Shibuya, Tokyo", latitude: 35.6595, longitude: 139.7005 },
      { name: "Meiji Jingu Shrine", category: "Landmark", description: "Tranquil Shinto shrine nestled inside a majestic, densely forested parkland.", rating: 4.6, address: "Yoyogikamizonocho, Tokyo", latitude: 35.6764, longitude: 139.6993 },
      { name: "Shinjuku Gyoen National Garden", category: "Nature", description: "Gorgeous blending of Japanese traditional, English landscape, and French formal gardens.", rating: 4.7, address: "Naitomachi, Tokyo", latitude: 35.6852, longitude: 139.7101 },
      { name: "Tsukiji Outer Market", category: "Dining", description: "A legendary culinary bazaar loaded with incredibly fresh sushi and seafood skewers.", rating: 4.5, address: "Tsukiji, Tokyo", latitude: 35.6655, longitude: 139.7702 },
      { name: "Tokyo Skytree", category: "Landmark", description: "Futuristic broadcasting tower holding the title as Japan's tallest architectural structure.", rating: 4.6, address: "Oshiage, Tokyo", latitude: 35.7101, longitude: 139.8107 }
    ]
  };

  const key = String(destination).toLowerCase().trim();
  let selectedPlaces = fallbackPlaces[key];

  if (!selectedPlaces) {
    // Generate a set of generic coordinates around a random hub for any other destination
    const randomBaseLat = 30 + Math.random() * 20;
    const randomBaseLng = -100 + Math.random() * 150;
    selectedPlaces = [
      { name: `${destination} Cathedral`, category: "Landmark", description: "Stunning historic architecture capturing the soul of the city.", rating: 4.7, address: "City Center", latitude: randomBaseLat, longitude: randomBaseLng },
      { name: `Grand ${destination} Park`, category: "Nature", description: "Lush green pathways with scenic fountains and local flora.", rating: 4.6, address: "Downtown Greenery", latitude: randomBaseLat + 0.015, longitude: randomBaseLng - 0.012 },
      { name: "The Gastronomy Boulevard", category: "Dining", description: "Excellent collection of local bistros serving traditional delicacies.", rating: 4.8, address: "Old Quarter", latitude: randomBaseLat - 0.008, longitude: randomBaseLng + 0.018 },
      { name: `${destination} History Museum`, category: "Museum", description: "Fascinating local exhibits charting centuries of cultural heritage.", rating: 4.5, address: "Museum Mile", latitude: randomBaseLat + 0.022, longitude: randomBaseLng + 0.005 },
      { name: "Panorama Viewpoint", category: "Nature", description: "Breathtaking spot looking out over the entire skyline.", rating: 4.9, address: "Hilltop Avenue", latitude: randomBaseLat - 0.025, longitude: randomBaseLng - 0.025 },
      { name: "Craft & Artisan Alley", category: "Landmark", description: "Vibrant market showcasing local handmade crafts and souvenirs.", rating: 4.4, address: "South Port", latitude: randomBaseLat + 0.005, longitude: randomBaseLng - 0.009 }
    ];
  }

  res.json({ source: "simulation", places: selectedPlaces });
});

// 2. API: Dynamic Itinerary Planner powered by Gemini
app.post("/api/generate-itinerary", async (req, res) => {
  const { destination, days, travelStyle } = req.body;
  const numDays = parseInt(days) || 3;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `Create a highly tailored ${numDays}-day travel itinerary for "${destination}" focusing on a "${travelStyle || 'Balanced'}" style.
For each day, structure an array of events/activities (Morning, Afternoon, Evening) with descriptions and tips.
Return the response in JSON format.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.INTEGER },
                    theme: { type: Type.STRING, description: "Theme for the day" },
                    activities: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          timeOfDay: { type: Type.STRING, description: "Morning, Afternoon, Evening" },
                          title: { type: Type.STRING, description: "Name of the activity" },
                          description: { type: Type.STRING, description: "Details of what to do" },
                          tip: { type: Type.STRING, description: "Handy traveler tip" }
                        },
                        required: ["timeOfDay", "title", "description"]
                      }
                    }
                  },
                  required: ["dayNumber", "theme", "activities"]
                }
              }
            },
            required: ["title", "summary", "days"]
          }
        }
      });

      const text = response.text;
      if (text) {
        return res.json({ source: "gemini", itinerary: JSON.parse(text) });
      }
    } catch (err) {
      console.error("Gemini itinerary generation error:", err);
    }
  }

  // Fallback high-fidelity itinerary builder
  const sampleItinerary = {
    title: `${numDays} Days of Adventure in ${destination}`,
    summary: `A premium curated ${travelStyle || 'Balanced'} exploration of ${destination} crafted for seamless travel and unforgettable memories.`,
    days: Array.from({ length: numDays }, (_, i) => ({
      dayNumber: i + 1,
      theme: i === 0 ? "Grand Arrival & Sightseeing" : i === numDays - 1 ? "Cultural Immersion & Shopping" : "Hidden Gems Exploration",
      activities: [
        {
          timeOfDay: "Morning",
          title: `Discover Landmark Treasures`,
          description: `Kick off your day visiting the most celebrated architecture and historical focal points of ${destination}. Capture early photos with perfect light.`,
          tip: "Arrive 15 minutes before opening to avoid any crowds."
        },
        {
          timeOfDay: "Afternoon",
          title: `Gourmet Food Walk & Local Flavors`,
          description: `Stroll through legendary food markets or local culinary alleys. Sample local ingredients, pastries, or traditional street lunch options.`,
          tip: "Look for stalls with lines of locals - they are always the finest!"
        },
        {
          timeOfDay: "Evening",
          title: `Sunset Views & Rooftop Dinner`,
          description: `Wind down with high-altitude views of the skyline or a relaxing river promenade, followed by a delicious regional cuisine dinner experience.`,
          tip: "Reservations are recommended, especially on weekends."
        }
      ]
    }))
  };

  res.json({ source: "simulation", itinerary: sampleItinerary });
});

// 3. API: Dynamic pricing alerts & 30-day historical pricing trends
app.get("/api/price-history", (req, res) => {
  const { type, from, to } = req.query;
  const itemType = String(type || "flight");
  
  // Create simulated 30-day price trend with some fluctuations
  const basePrices: Record<string, number> = {
    flight: 450,
    hotel: 180,
    car: 65
  };
  
  const base = basePrices[itemType] || 100;
  const history: any[] = [];
  
  // Seed-based random generation depending on inputs to ensure stable charts
  const seedString = `${itemType}-${from || 'NYC'}-${to || 'LON'}`;
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed += seedString.charCodeAt(i);
  }
  
  const randomWithSeed = (day: number) => {
    const x = Math.sin(seed + day) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 30; i >= 0; i--) {
    const dayFactor = randomWithSeed(i) * 30 - 15;
    // Price drops a bit early on, then fluctuates, then ticks up closer to day 0 (today) due to last-minute pricing
    const timeTrend = i < 7 ? (7 - i) * 12 : 0;
    const price = Math.round(base + dayFactor + timeTrend);
    const date = new Date();
    date.setDate(date.getDate() - i);
    history.push({
      day: 30 - i,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: price,
      average: base,
    });
  }

  // Calculate recommendation metrics
  const currentPrice = history[history.length - 1].price;
  const lowestPrice = Math.min(...history.map(h => h.price));
  const highestPrice = Math.max(...history.map(h => h.price));
  
  let recommendation = "GOOD PRICE";
  let analysis = "Current price is average for this route. Recommended to book if dates are fixed.";
  
  if (currentPrice < base * 0.93) {
    recommendation = "GREAT VALUE";
    analysis = "Prices are currently 10% lower than average! Highly recommended to book immediately.";
  } else if (currentPrice > base * 1.08) {
    recommendation = "HIGH COST";
    analysis = "Prices are elevated due to peak demand. Set a Price Alert and wait if your schedule is flexible.";
  }

  res.json({
    type: itemType,
    from: from || "New York",
    to: to || "London",
    currentPrice,
    lowestPrice,
    highestPrice,
    averagePrice: base,
    recommendation,
    analysis,
    history
  });
});

// 4. API: Simulated Real-Time Card Validation & Ticket Issuance
app.post("/api/pay", (req, res) => {
  const { cart, paymentMethod } = req.body;

  if (!cart || cart.length === 0) {
    return res.status(400).json({ success: false, error: "Shopping cart is empty." });
  }
  
  if (!paymentMethod || !paymentMethod.cardNumber || !paymentMethod.cardHolder) {
    return res.status(400).json({ success: false, error: "Invalid payment credentials." });
  }

  // Basic card simulation rules
  const cleanCard = paymentMethod.cardNumber.replace(/\s+/g, '');
  if (cleanCard.length < 13 || cleanCard.length > 19) {
    return res.status(400).json({ success: false, error: "Invalid card number length. Please check your digits." });
  }

  if (paymentMethod.cvv && (paymentMethod.cvv.length < 3 || paymentMethod.cvv.length > 4)) {
    return res.status(400).json({ success: false, error: "Invalid CVV code." });
  }

  // Simulate payment processing latency
  setTimeout(() => {
    // Generate secure booking confirmation codes
    const reference = "BK-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const tickets = cart.map((item: any) => {
      const ticketCode = "TIX-" + Math.random().toString(36).substr(2, 6).toUpperCase();
      return {
        id: item.id,
        type: item.type,
        title: item.title,
        ticketCode: ticketCode,
        status: "CONFIRMED"
      };
    });

    res.json({
      success: true,
      transactionId: "TXN-" + Math.random().toString(36).substr(2, 10).toUpperCase(),
      bookingReference: reference,
      tickets: tickets,
      message: "Payment successfully authorized and tickets issued."
    });
  }, 1200); // realistic latency
});


// 5. Serve Vite application
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
