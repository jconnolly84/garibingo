# GariBingo!

A festive, teacher-controlled 90-ball bingo show. Static HTML, CSS and JavaScript; no install, build, database or accounts required.

## Preview

Run `node server.cjs` and open http://localhost:4173. Audio is enabled by the Play/Draw interaction. The first version uses your browser's speech voice when recorded audio is absent; voice quality depends on the device. For the final deep trailer voice, add recordings as `audio/01.mp3` through `audio/90.mp3` (67 gets the special celebration).

## Add videos

Place `Intro.mp4`, `Lineprize1.mp4` through `Lineprize6.mp4`, and `Houseprize1.mp4` through `Houseprize6.mp4` in `videos/`. Names are case sensitive on GitHub. Missing videos show a three-second placeholder. Existing videos advance when they finish, with a Continue button for the teacher.

## Publish on GitHub Pages

Upload this directory's contents to a GitHub repository. In Settings → Pages select Deploy from a branch → main → / (root). All asset paths are relative, so repository subpaths work. GitHub Pages sites must remain under 1 GB. Compress MP4s before uploading; GitHub rejects individual files above 100 MiB through normal Git pushes.

## Game behaviour

Each round draws from 1–90 without replacement using browser cryptographic randomness. Line and full-house actions require confirmation. The line-prize transition preserves drawn numbers. Rounds and numbers save in local storage on the same browser; New event clears them after confirmation. No automatic ticket checking or ticket generation is included; use paper tickets and check against the board.

The shell is cached for later offline use after a successful online visit. Media caches after successful full downloads, so offline video readiness is not guaranteed. Browser voices may require internet on some devices. Test on the actual school device before the event. Fonts have local fallbacks.

Respect reduced-motion preferences. Fullscreen support depends on the browser. Source logo is `logo.svg`.

## British bingo calls

Calls use a school-friendly selection from the supplied British bingo list, with the number spoken after each phrase. 67 retains the special Six! Seven! celebration. Browser speech prefers a locally installed en-GB voice where available. Recorded MP3s, if supplied, take priority and should use the same updated wording.
