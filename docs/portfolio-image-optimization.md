# Portfolio image optimization

Full-size image dimensions, mockup ratios, and portfolio database URLs are preserved. Originals remain at their existing R2 keys; this feature does not delete or replace them.

## New uploads

The authenticated upload handler stores the original first. The `IMAGES` Cloudflare binding then creates a lossless WebP with `quality: 100`, without resize/crop transformations, and a separate 16-pixel loading preview. The full-size output must contain a static lossless WebP stream and match the source dimensions. Only a smaller full-size copy is stored for serving.

Animation, EXIF orientation, embedded color profiles and higher bit depth are treated conservatively in new uploads: unsupported inputs stay original rather than silently losing those properties. Encoding outages and quota errors preserve successful uploads and use the original file. The offline backfill preserves ICC profiles and compares decoded pixels before publishing any copy.

Derivatives have content-hash filenames with immutable caching. A private manifest at `portfolio/optimized-v1/<original filename>.json` associates each original with its served URL, dimensions, sizes and loading preview. Public page rendering reads these manifests; missing or corrupt metadata falls back to the original. External image links are left unchanged.

## Existing uploads

Run `npm run media:optimize` to measure savings without modifying R2. Run `npm run media:optimize -- --apply` to store copies and manifests. The tool uses the existing Cloudflare account configuration in `.env.local`, the same R2 object API as Wrangler, and the `corstack-media` bucket. It processes only media referenced by the public portfolio, with no database updates.

Every candidate is checked against its original for identical dimensions and decoded sRGB/alpha pixels. Each uploaded object is downloaded again and compared byte-for-byte before continuing. Original objects are never written. The operation is safe to rerun; derived filenames are content hashes. A partial failure leaves existing records and images working.

Reports and temporary files are saved beneath the ignored `.wrangler/image-optimization/` directory. The optional `--filename <referenced filename>` argument limits processing to one image.

## Visitor loading

- The loading preview fills the existing mockup while the full-size image downloads.
- Images stay transparent until their full image has decoded, then fade in. Reduced-motion users get an immediate reveal. Native image load events handle device-breakpoint changes in the surrounding picture element.
- A `<picture>` media source prevents downloading the full image for the hidden desktop/mobile mockup.
- The active carousel image loads first. Only its next slide is warmed, after decoding and when the card is near the viewport; other slides load when selected.
- First slides retain server-rendered image markup and native lazy loading. A noscript style keeps those previews visible when JavaScript is unavailable.
- A missing derivative falls back to the unchanged original image.

## Verification

The initial measurement of all 30 existing uploads produced 42,266,786 source bytes and 14,666,030 served bytes: 65.3% smaller. Decoded pixels were identical for every image. Actual uploaded source dimensions (mostly 3200×2400 and 2400×3200) were preserved, including one 2400×3199 source.

The full backfill completed successfully: 30 derivatives and 30 manifests were uploaded and downloaded again for byte comparison. All 30 original files and their database URLs remain unchanged. No deletion or re-upload is required.

Cloudflare's remote production encoder was independently checked using the largest portfolio screenshot: 3200×2400, 7,296,848 source bytes, 3,315,804 lossless bytes, 102 preview bytes, with identical decoded pixels. The local offline Images emulator does not support every encoding parameter; lossless fidelity was verified remotely.

The regression suite passed all 28 tests when run serially. Parallel build/test/backfill execution exhausted this Windows machine's system resources; the work was resumed sequentially, and the test command now uses one test-file worker.

Production deployment completed on October 8, 2026, with Worker version `cfece976-7980-40a9-a996-35ed1f44237c`. The final Cloudflare build, TypeScript checks and lint passed. The Worker exposes both the existing R2 bucket and the new `IMAGES` binding; existing production variables were retained.

Live checks passed for the homepage and portfolio page, all 30 optimized WebP URLs, and all 30 original PNG URLs. Public portfolio records still reference the originals. Images return immutable cache headers and ETags; conditional requests return 304. Unauthenticated upload requests return 401. The deployed stylesheet explicitly uses 4:3 for the desktop display and 3:4 for the phone display, with zero inner padding and border.

Browser visual verification could not be completed: the browser tool failed to initialize its local kernel assets after an interruption, including after a reset. No visual screenshot or browser-interaction pass is claimed. An authenticated production upload was not submitted; upload authentication and encoder-outage fallback are covered by the regression suite, and the real remote Cloudflare encoder was verified independently as described above.

## References

- [Cloudflare Images binding](https://developers.cloudflare.com/images/optimization/binding/)
- [Cloudflare lossless WebP options](https://developers.cloudflare.com/images/optimization/features/#format--f)
- [Cloudflare Images pricing](https://developers.cloudflare.com/images/pricing/)
- [Sharp lossless WebP encoding](https://sharp.pixelplumbing.com/api-output/#webp)
