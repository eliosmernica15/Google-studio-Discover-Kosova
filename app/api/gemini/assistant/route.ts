import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { KOSOVO_PLACES, KOSOVO_CITIES, KOSOVO_TRAILS, KOSOVO_DISHES, KOSOVO_EVENTS } from '@/lib/kosovo-data';

export async function POST(req: NextRequest) {
  try {
    const { query, language = 'en' } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const cleanQuery = query.toLowerCase();

    // 1. Find matching entities in local curated Kosovo dataset
    const matchedPlaces = KOSOVO_PLACES.filter(
      (p) =>
        p.title.toLowerCase().includes(cleanQuery) ||
        p.tags.some((t) => cleanQuery.includes(t)) ||
        p.category.toLowerCase().includes(cleanQuery) ||
        (p.mustTryDish && cleanQuery.includes(p.mustTryDish.toLowerCase())) ||
        p.cityId.toLowerCase().includes(cleanQuery)
    ).slice(0, 4);

    const matchedTrails = KOSOVO_TRAILS.filter(
      (t) =>
        t.title.toLowerCase().includes(cleanQuery) ||
        t.region.toLowerCase().includes(cleanQuery) ||
        cleanQuery.includes('trail') ||
        cleanQuery.includes('hike') ||
        cleanQuery.includes('mountain')
    ).slice(0, 2);

    const matchedDishes = KOSOVO_DISHES.filter(
      (d) =>
        d.name.toLowerCase().includes(cleanQuery) ||
        d.albanianName.toLowerCase().includes(cleanQuery) ||
        cleanQuery.includes('eat') ||
        cleanQuery.includes('food') ||
        cleanQuery.includes('dish')
    ).slice(0, 2);

    const matchedEvents = KOSOVO_EVENTS.filter(
      (e) =>
        e.title.toLowerCase().includes(cleanQuery) ||
        cleanQuery.includes('festival') ||
        cleanQuery.includes('summer') ||
        cleanQuery.includes('event')
    ).slice(0, 2);

    // Knowledge context summary for grounding
    const contextSummary = `
Discover Kosovo Curated Knowledge Base:
Cities: ${KOSOVO_CITIES.map((c) => `${c.name} (${c.nativeName})`).join(', ')}
Places: ${KOSOVO_PLACES.map((p) => `${p.title} in ${p.cityId} (${p.category}): ${p.description}. Local tip: ${p.localTip}`).join('\n')}
Trails: ${KOSOVO_TRAILS.map((t) => `${t.title} (${t.distanceKm}km, ${t.difficulty}): ${t.description}`).join('\n')}
Dishes: ${KOSOVO_DISHES.map((d) => `${d.name} (${d.albanianName}): ${d.description}. Where to eat: ${d.whereToEat.join(', ')}`).join('\n')}
Events: ${KOSOVO_EVENTS.map((e) => `${e.title} (${e.dates}): ${e.description}`).join('\n')}
`;

    let answerText = '';

    // Check if GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const systemPrompt = `You are 'Ask Kosovo', an intelligent cultural guide for the Discover Kosovo app.
CRITICAL CONSTRAINT: You must ONLY answer using the verified Discover Kosovo knowledge provided below.
If the information is not in the knowledge base, politely explain what you know and that our curated guides do not cover it yet.
Keep answers warm, insightful, concise (2-3 short paragraphs maximum), mentioning specific local tips. Respond in the requested language: ${language}.

${contextSummary}
`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${systemPrompt}\n\nUser Question: ${query}`,
        });
        answerText = response.text || '';
      } catch (err) {
        console.warn('Gemini API call fell back to local curated matcher:', err);
      }
    }

    // High quality deterministic fallback if no Gemini key or network issue
    if (!answerText) {
      if (matchedPlaces.length > 0 || matchedDishes.length > 0 || matchedTrails.length > 0) {
        const placeNames = matchedPlaces.map((p) => p.title).join(', ');
        const dishNames = matchedDishes.map((d) => d.name).join(', ');
        const trailNames = matchedTrails.map((t) => t.title).join(', ');

        answerText = `Based on Discover Kosovo's verified guides:\n\n${
          matchedPlaces.length > 0
            ? `• Recommended places: ${placeNames}. For example, at ${matchedPlaces[0].title}, ${matchedPlaces[0].localTip}\n`
            : ''
        }${
          matchedDishes.length > 0
            ? `• Signature gastronomy: ${dishNames}. Traditional preparation: ${matchedDishes[0].description}\n`
            : ''
        }${
          matchedTrails.length > 0
            ? `• Trails & Outdoors: ${trailNames} (${matchedTrails[0].difficulty}, ${matchedTrails[0].distanceKm} km).\n`
            : ''
        }`;
      } else {
        answerText = `Discover Kosovo curated guide focuses on the 7 city hubs (Pristina, Prizren, Peja, Gjakova, Mitrovica, Gjilan, Ferizaj) and authentic trail and culinary packs. I could not find a verified match for "${query}". Try asking about Prizren Fortress, Rugova Canyon, where to eat flija, or DokuFest!`;
      }
    }

    return NextResponse.json({
      answer: answerText,
      citedPlaces: matchedPlaces.map((p) => ({
        id: p.id,
        title: p.title,
        cityId: p.cityId,
        category: p.category,
        rating: p.rating,
        localTip: p.localTip,
      })),
      citedDishes: matchedDishes.map((d) => ({
        id: d.id,
        name: d.name,
        region: d.region,
      })),
      citedTrails: matchedTrails.map((t) => ({
        id: t.id,
        title: t.title,
        difficulty: t.difficulty,
        distanceKm: t.distanceKm,
      })),
      citedEvents: matchedEvents.map((e) => ({
        id: e.id,
        title: e.title,
        dates: e.dates,
      })),
    });
  } catch (error) {
    console.error('Error in Ask Kosovo API route:', error);
    return NextResponse.json(
      { error: 'Failed to process inquiry' },
      { status: 500 }
    );
  }
}
