import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(process.env.GEMENI_API_KEY);

async function fetchImageAsBase64(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data).toString('base64');
  } catch (error) {
    console.error('Error fetching image:', error);
    throw new Error('Failed to fetch image');
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageUrl = formData.get('imageUrl');

    if (!imageUrl || typeof imageUrl !== 'string') {
      return new Response('Invalid URL provided.', { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = 'What is this?';
    const base64Image = await fetchImageAsBase64(imageUrl);

    const image = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg', // Set the correct MIME type if known
      },
    };

    const result = await model.generateContent([prompt, image]);
    const responseText = await result.response.text();

    return new Response(JSON.stringify({ text: responseText }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
