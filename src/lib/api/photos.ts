/**
 * Photo handling (mock).
 *
 * ──────────────────────────────────────────────────────────────────────────────
 *  REPLACE-WITH-REAL-CLOUD-STORAGE NOTE
 * ──────────────────────────────────────────────────────────────────────────────
 *  Right now we read the file with FileReader and store the resulting
 *  `data:` URL directly inside the event in localStorage.
 *
 *  In production:
 *    1. Request a pre-signed upload URL: POST /api/uploads -> { url, key }
 *    2. PUT the File blob to `url` (S3/GCS/etc.).
 *    3. Save the resulting public URL (or signed read URL) on the event.
 *
 *  Consider also: server-side image compression, EXIF stripping, virus scan.
 * ──────────────────────────────────────────────────────────────────────────────
 */

/** Convert an uploaded File into a data: URL we can preview/persist. */
export async function fileToDataUrl(file: File, opts?: { maxDimension?: number }): Promise<string> {
  const max = opts?.maxDimension ?? 1600;

  // Quickly read into an Image so we can downscale before persisting.
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      if (width <= max && height <= max) return resolve(dataUrl);
      const scale = Math.min(max / width, max / height);
      const w = Math.round(width * scale);
      const h = Math.round(height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      // JPEG to keep localStorage usage reasonable.
      resolve(canvas.toDataURL("image/jpeg", 0.86));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
