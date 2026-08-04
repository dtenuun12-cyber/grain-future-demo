# GRAIN Furniture Co. — Website + AI Chatbot Demo

This is a full working template: 4-page website + an AI shopping assistant
that knows the store's real product catalog and can talk to customers.

No coding required to deploy it or to reuse it for your next client — you
only ever touch `config.json`.

## What's in here

```
index.html      Homepage
products.html   Full product catalog
about.html      Brand story + process
contact.html    Contact info + form
style.css       All styling (colors, fonts, layout)
script.js       Nav menu + contact form behavior
chatbot.js      The chat widget (frontend)
config.json     ALL store-specific content — this is what you edit per client
api/chat.js     Backend function that talks to Claude (keeps your API key safe)
```

## Step 1 — Get a free API key (no card required)

This demo uses **Groq** — it's free with no credit card, and its API works
almost the same way Claude's does, so nothing else about this project changes
if you upgrade later.

1. Go to https://console.groq.com and sign up (email or Google — no card).
2. Go to "API Keys" and create a new key.
3. Copy it somewhere safe — you'll paste it into Vercel in Step 3, not into any file here.

Free tier limits: 30 requests/minute, 14,400 requests/day — more than enough
for demos and even a real small business's daily chat volume. Quality is a
notch below Claude since it runs open-source models (Llama 3.3), but it's
genuinely good for a sales-assistant chatbot.

**When you have a paying client and want the best quality**, `api/chat.js`
has a commented-out block showing exactly how to swap in the Claude API —
same code structure, just a different endpoint and an `ANTHROPIC_API_KEY`
instead of `GROQ_API_KEY`. At that point the API cost (a few cents per
conversation) is easily covered by what you're charging the client.

## Step 2 — Put this project on GitHub (no coding)

1. Create a free account at https://github.com if you don't have one.
2. Create a new repository (e.g. `grain-furniture-demo`).
3. On the repo page, click "uploading an existing file" and drag in every file
   from this folder (keep the `api` folder structure — GitHub preserves it).
4. Commit.

## Step 3 — Deploy on Vercel (no coding, free)

1. Go to https://vercel.com and sign up using your GitHub account.
2. Click "Add New Project" and select the repo you just created.
3. Before deploying, open "Environment Variables" and add:
   - Name: `GROQ_API_KEY`
   - Value: (paste the key from Step 1)
4. Click Deploy. In about a minute you'll get a live link like
   `https://grain-furniture-demo.vercel.app` — this is what you show the client.

## Step 4 — Customize for a real client

Open `config.json` and change:
- `business_name`, `tagline`, `phone`, `email`, `address`, `hours`
- `colors` — swap these hex codes to match their branding
- `products` — replace with their real catalog (name, price, material, dimensions, description)
- `system_prompt` — adjust the assistant's personality/instructions if needed

Then also do a find-and-replace across the `.html` files for the business name,
address, and product cards shown in the page body (the demo hardcodes these
in the HTML for simplicity — the config.json version is what the chatbot's
brain reads from).

Push the changes to GitHub — Vercel redeploys automatically within a minute.

## Reusing this for client #2, #3...

Copy this whole folder, create a new GitHub repo, repeat Steps 2–4 with their
info. The code never changes — only `config.json` and the HTML content do.
This is your reusable template.

## Notes

- The contact form currently just shows a confirmation message — it doesn't
  send real emails yet. Wiring it to send email (e.g. via a free service like
  Formspree) is a quick follow-up if you want that working.
- The chatbot keeps the last 10 messages of context per conversation and
  costs a small fraction of a cent per exchange on Claude's API.
- Product images are currently placeholder blocks with the product name —
  swap in real photos by replacing `.card-media` divs with `<img>` tags.
