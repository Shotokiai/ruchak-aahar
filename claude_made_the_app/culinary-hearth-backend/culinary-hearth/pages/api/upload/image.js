// pages/api/upload/image.js
// POST multipart/form-data { file, path? } → uploads to Supabase Storage → returns public URL

import { getServerSession } from 'next-auth/next';
import { authOptions }      from '../auth/[...nextauth]';
import { supabaseAdmin }    from '../../../lib/supabase-admin';

export const config = { api: { bodyParser: false } };

async function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw      = Buffer.concat(chunks);
      const ct       = req.headers['content-type'] || '';
      const boundary = ct.split('boundary=')[1];
      if (!boundary) return reject(new Error('No boundary'));

      const sep    = Buffer.from(`--${boundary}`);
      const parts  = [];
      let start    = 0;
      while (start < raw.length) {
        const idx = raw.indexOf(sep, start);
        if (idx === -1) break;
        parts.push(raw.slice(start, idx));
        start = idx + sep.length;
      }

      let fileBuffer = null, fileMime = 'image/jpeg', folder = 'dishes';

      for (const part of parts) {
        const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
        if (headerEnd === -1) continue;
        const headers  = part.slice(0, headerEnd).toString();
        const dataStart = headerEnd + 4;
        const data      = part.slice(dataStart, part.length - 2); // strip trailing \r\n

        if (headers.includes('name="path"')) {
          folder = data.toString().trim() || 'dishes';
        } else if (headers.includes('filename')) {
          const mimeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);
          fileMime   = mimeMatch ? mimeMatch[1].trim() : 'image/jpeg';
          fileBuffer = data;
        }
      }

      if (!fileBuffer) return reject(new Error('No file found in form'));
      resolve({ buffer: fileBuffer, mime: fileMime, folder });
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const { buffer, mime, folder } = await parseMultipart(req);
    const ext      = mime.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: upErr } = await supabaseAdmin
      .storage
      .from('dish-images')
      .upload(filename, buffer, { contentType: mime, upsert: false });

    if (upErr) return res.status(500).json({ error: upErr.message });

    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('dish-images')
      .getPublicUrl(filename);

    return res.status(200).json({ url: publicUrl });
  } catch (err) {
    console.error('[upload/image]', err);
    return res.status(500).json({ error: err.message });
  }
}
