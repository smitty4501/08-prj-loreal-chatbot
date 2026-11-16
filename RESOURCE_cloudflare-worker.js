export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed." }), {
        status: 405,
        headers: { ...corsHeaders, Allow: "POST, OPTIONS" },
      });
    }

    // Store this secret in the Cloudflare dashboard, never in the website files.
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "The Worker is missing its OpenAI API secret." }),
        { status: 500, headers: corsHeaders }
      );
    }

    let requestData;
    try {
      requestData = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Request body must be valid JSON." }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const messages = requestData?.messages;
    const validMessages =
      Array.isArray(messages) &&
      messages.length > 0 &&
      messages.every(
        (message) =>
          message &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string" &&
          message.content.trim().length > 0
      );

    if (!validMessages) {
      return new Response(
        JSON.stringify({ error: "Provide a non-empty messages array with user or assistant messages." }),
        { status: 400, headers: corsHeaders }
      );
    }

    const requestBody = {
      model: "gpt-4.1",
      // Keep the topic guidance on the Worker so the browser cannot replace it.
      messages: [
        {
          role: "system",
          content:
            "You are a friendly L'Oréal beauty advisor. Help with L'Oréal makeup, skincare, haircare, fragrance, beauty products, and relevant beauty routines and recommendations. Politely decline questions unrelated to L'Oréal or beauty, and invite the user to ask about those topics instead. Do not invent product details, ingredients, availability, or results. For medical or skin-health concerns, provide general information only and recommend consulting a qualified professional.",
        },
        ...messages,
      ],
      max_completion_tokens: 500,
    };

    let response;
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    } catch {
      return new Response(
        JSON.stringify({ error: "Could not connect to the OpenAI service." }),
        { status: 502, headers: corsHeaders }
      );
    }

    const responseText = await response.text();

    return new Response(responseText, {
      status: response.status,
      headers: corsHeaders,
    });
  },
};
