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
| The question | Yes / No. The No button dodges the cursor, teleports on touch, shrinks to a small pill and keeps running. It never disappears and it can never be caught: the labels cycle (`No` → `Hmm` → `Maybe?` → `So close` → `Never` → back round) and so do the taunts. Every attempt is counted. |
| Celebration | Confetti from six directions, staggered reveal, and a photo if you set one. |
| Activity | Twenty-two of them: food, drinks, bowling, karting, escape room, bikes, the beach, a picnic, a trip, Italy, movie night, live music, dancing, a museum, board games, a spa day, the pool, a long walk, cooking, shopping, surprise me, or nothing at all. |
| Follow-ups | Branch by activity. Cuisine and vibe, which route, which Italian city, who cooks. |
| Suggestions | Real places for Tel Aviv, live Google Maps searches everywhere else, plus a box to type a venue of her own. |
| Dress code | Casual, nice, fancy, or pyjamas. |
| Calendar | Your blocked days are greyed out. |
| Time | If she asked for sunset or golden hour anywhere, this question rebuilds itself around the real sunset for the day and city she picked, offering the half hours either side of it. Otherwise it's the standard slots. |
| Fine print | Joke terms. The last one is pre-checked and cannot be unchecked. |
| Confirming | "Checking his availability… He's free. He was always free." |
| **It's official** | The big one. Sustained confetti, the booking spelled out line by line, both Instagram handles, and a drawn picture of the two of you on the date she just planned, which she can save to her phone. |
| Her details | Phone and email, asked only once the date is already booked. |
| Ticket | A boarding-pass style confirmation, `.ics` download, Google Calendar link, and a live countdown. |
| Receipt | "Attempts to say no: 24. Successful escapes: 0." |

Every question also ends with **Something else**, which opens a text box. Whatever
she types becomes the answer and prints on the ticket, so she is never boxed in
by the options you chose for her.

Pressing **Send it to Eitan** opens WhatsApp with the whole booking already
written out — date, plan, venue, dress code, her contact details, and how many
times she tried to escape.

## Files

```
index.html      the invitation
setup.html      your config page — builds the link
css/style.css   all styling
js/data.js      activities, follow-up questions, recommendations
js/scene.js     draws the picture: skies, backdrops, the couple
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

Sunset times are computed locally from the standard solar equations in
`sunsetFor()`, using the coordinates in `CITY_COORDS`. A city that isn't on that
list simply gets the plain time slots. Better no number than a wrong one.

## The picture

There is no image model behind a static page, so the celebration picture is
drawn rather than fetched. `js/scene.js` composes an SVG postcard from her
answers: the sky comes from the hour (`day`, `golden`, `night`, and sunset
always wins), the backdrop from the activity (sea, skyline, hills, Roman
arches, a pool, shopfronts, a cinema screen, a lamp-lit room), and the props
from the details (bikes, a bistro table with two glasses, shopping bags, a pot
on the stove). Two silhouettes stand on the right third holding hands, in two
tones so they read as two people rather than one dark slab.

It costs nothing, needs no network, renders instantly, and there is no case
where it fails to appear.

### Your faces in it

Add a photo of each of you in setup and **you become the two people in the
scene**. The face crop is clipped into a circle and drawn as the figure's head,
so if she picks cinema night it is the two of you in the cinema, and if she picks
sunset dinner it is the two of you on the sand. Whoever has no photo stays a
silhouette. When either face is present both figures step closer to the camera
and their heads grow, because a face you cannot recognise is pointless: slightly
caricature proportions are the right trade.

There is no face detection. The APIs that exist are unreliable and absent on
iOS, and a wrong guess crops somebody's shoulder, so setup gives you a circular
cropper and you place it yourself with drag and zoom. It renders exactly what
the circle shows to a 168px square at JPEG quality 0.68.

That size is deliberate: the crop is a base64 data URI, and the config carrying
it gets base64'd again, so every kilobyte costs roughly 1.8k characters of link.
The setup page shows the resulting length and warns when it gets unwieldy.

**Save the picture** rasterises the whole thing, faces included, to a 2x PNG.
Data URIs do not taint a canvas, so the export works; it falls back to the SVG
if the canvas route is ever blocked.
