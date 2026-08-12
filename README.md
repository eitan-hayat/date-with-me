# A date app

A one-question-at-a-time date invitation you send as a link. The "no" button
runs away, so there is only one possible outcome. It ends with a printed ticket
and a real calendar invite.

## How to use it

1. Open **`/setup.html`** — this page is for you, not for her.
2. Fill in the names, your WhatsApp number, your city, which activities she gets
   to choose from, and any days you genuinely can't do.
3. Copy the link and send it.

There is no server and no database. Everything you type into setup is encoded
into the link itself (`index.html#c=…`), so each person you send it to gets
their own configuration and nothing is stored anywhere.

## What she sees

| Stage | What happens |
| --- | --- |
| Envelope | "You have one unopened invitation." |
| The question | Yes / No. The No button dodges the cursor, teleports on touch, shrinks, and its label degrades — `No` → `Hmm` → `Maybe?` → `Fine` → `Ok yes` — until it gives up and merges into Yes. Every attempt is counted. |
| Celebration | Confetti, and a photo if you set one. |
| Activity | Food, bikes, a trip, Italy, movie night, pool, a walk, cooking, shopping, surprise me, or nothing at all. |
| Follow-ups | Branch by activity — cuisine and vibe, which route, which Italian city, who cooks. |
| Suggestions | Real places for Tel Aviv, live Google Maps searches everywhere else. She can lock one in as the venue. |
| Dress code | Casual, nice, fancy, or pyjamas. |
| Calendar | Your blocked days are greyed out. Then a time slot. |
| Her details | Phone and email, so you can send the real invite. |
| Fine print | Joke terms. The last one is pre-checked and cannot be unchecked. |
| Ticket | A boarding-pass style confirmation, `.ics` download, Google Calendar link, and a live countdown. |
| Receipt | "Attempts to say no: 7. Successful escapes: 0." |

Pressing **Send it to Eitan** opens WhatsApp with the whole booking already
written out — date, plan, venue, dress code, her contact details, and how many
times she tried to escape.

## Files

```
index.html      the invitation
setup.html      your config page — builds the link
css/style.css   all styling
js/data.js      activities, follow-up questions, recommendations
js/config.js    reads and writes the config packed into the URL
js/app.js       the flow engine, the calendar, the .ics export, the runaway button
```

No build step, no dependencies. It's static files — open `index.html` or drop
the folder on any host.

## Changing the content

Everything she reads lives in `js/data.js`: the activity list, every follow-up
question, the taunts the No button throws, the dress codes, the time slots and
the joke terms. Add an entry to `ACTIVITIES`, give it a matching key in `FLOWS`,
and the flow engine picks it up automatically.

Hand-picked venues are in `TLV_PICKS`. Any city other than Tel Aviv falls back
to Google Maps searches built from her answers, so it still works anywhere.
