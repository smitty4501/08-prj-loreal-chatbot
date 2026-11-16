# Project 8: L'Oréal Chatbot

L’Oréal is exploring the power of AI, and your job is to showcase what's possible. Your task is to build a chatbot that helps users discover and understand L’Oréal’s extensive range of products—makeup, skincare, haircare, and fragrances—as well as provide personalized routines and recommendations.

## 🚀 Launch via GitHub Codespaces

1. In the GitHub repo, click the **Code** button and select **Open with Codespaces → New codespace**.
2. Once your codespace is ready, open `index.html` with the live preview.

## ☁️ Connect the Cloudflare Worker

The chat sends requests through a Cloudflare Worker. The Worker keeps the OpenAI API key out of the public website.

1. Create a Cloudflare Worker and use the code in `RESOURCE_cloudflare-worker.js`.
2. In the Worker settings, add an encrypted secret named `OPENAI_API_KEY` and paste your OpenAI key there. **Do not put the key in this repository or in a frontend file.**
3. Deploy the Worker and copy its `https://...workers.dev/` URL.
4. In `script.js`, replace `https://YOUR_WORKER_SUBDOMAIN.workers.dev/` in `WORKER_URL` with your deployed URL.
5. Reload the website and ask a L'Oréal beauty question. The Worker sends the conversation as a `messages` array and returns the assistant's reply.

Until you add the Worker URL, the chat displays a setup message when you submit a question. The Worker adds its own system prompt so it can politely decline unrelated questions.

## ✨ Conversation features

- The chat keeps questions and answers in the current page session so follow-up questions have context.
- User questions appear above the corresponding assistant responses in distinct chat bubbles.
- The chat layout adapts to smaller screens.

Enjoy building your L’Oréal beauty assistant! 💄
