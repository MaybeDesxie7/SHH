import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const { message } = await req.json();

    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant for Smart Hustle Hub users.' },
        { role: 'user', content: message }
      ]
    });

    return Response.json({
      status: 'success',
      reply: chat.choices[0].message.content
    });
  } catch (error) {
    console.error('AI Error:', error);
    return Response.json({ status: 'error', message: 'AI assistant failed to respond.' }, { status: 500 });
  }
}
