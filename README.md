# Echo Atlas

See recurring themes in English event feedback and inspect the original responses behind each one. Open the sample, choose a theme, then export a plain-text brief with numbered source notes. Edit responses accepts up to 100 lines and 30,000 characters.

## Run locally

From this directory, run `npm run build` with Node.js 20 or later. Serve the resulting folder with `python -m http.server 8000 --directory dist` and open http://localhost:8000. The build uses only Node built-ins. For Cloudflare Pages, use app as the project root, npm run build as the command and dist as the output directory.

## Browser tests

Run `npm ci`, `npm run build` and `npm test` with Google Chrome installed. Set BROWSER_CHANNEL to msedge to use Microsoft Edge. The runner serves the build on a temporary loopback port and writes three desktop PNGs to the sibling shots folder.

## Implementation

Vanilla JavaScript, HTML, CSS and Canvas. An original unsupervised text-clustering implementation fits TF–IDF to the current batch, computes cosine similarities and repeatedly merges the closest pair of groups using average linkage. Broad, Balanced and Strict use cutoffs of 0.08, 0.15 and 0.30. Summed normalized term weights select each group's two label words. Original line numbers preserve provenance. The signal graphic depicts up to the first 40 responses.

All processing happens in browser memory. Reloading restores the synthetic sample. English tokenization uses ASCII letters and digits. Synonyms may separate and conflicting opinions with shared vocabulary may group together. Theme frequency describes only the supplied batch. Review the evidence before acting.

## AI disclosure and license

OpenAI Codex, an AI coding agent, wrote the code, synthetic examples and project copy under human direction. The runtime algorithm runs locally without an external model or API. Project materials are MIT licensed under the root LICENSE. Playwright is a development dependency distributed under its own license.
