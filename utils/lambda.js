import OpenAI from 'openai';
import openaiTokenCounter from 'openai-gpt-token-counter';

const System_Message = `You are provided with an HTML news article that may contain political bias. Your task is to neutralize any political biases while preserving the original HTML markup and styling. The styling of the neutralized article should remain the same as the original article. No part should be missing. Write each and every line, word, and character. Please neutralize the political bias in the provided HTML content and return the revised HTML. Also, ensure that the revised article:
Presents facts without taking sides.
Includes responses or counterpoints from all parties involved.
Avoids inflammatory or subjective language.
Provides context for any claims or accusations made.`;

export const handler = awslambda.streamifyResponse(
  async (event, responseStream, _context) => {
    const html = event.body;
    console.log(html);
    const token = [
      { role: 'system', content: System_Message },
      { role: 'user', content: `${html}` },
    ];

    const Number_of_InputTokens = openaiTokenCounter.chat(
      token,
      'gpt-3.5-turbo'
    );
    console.log(`Total tokens: ${Number_of_InputTokens}`);

    const avgToken =
      Number_of_InputTokens >= 15000
        ? Math.ceil(Number_of_InputTokens / 15000)
        : 1;
    console.log(`avgToken: ${avgToken}`);

    const openai = new OpenAI({ apiKey: process.env.first });

    async function processPart(part) {
      const messages = [
        { role: 'system', content: System_Message },
        { role: 'user', content: part },
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        stream: true,
      });

      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        responseStream.write(content);
      }
    }

    const partLength = Math.ceil(html.length / avgToken);
    console.log(`Part length: ${partLength}`);

    let start = 0;
    for (let i = 0; i < avgToken; i++) {
      let end = (i + 1) * partLength;
      if (i < avgToken - 1) {
        end = html.lastIndexOf('>', end) + 1;
      }
      const part = html.slice(start, end);
      console.log(`Part ${i + 1} length: ${part.length}`);
      console.log(`Part ${i + 1}: ${part}`);
      await processPart(part);
      start = end;
    }
    responseStream.end();
  }
);
