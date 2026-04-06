export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // In production, save to disk or cloud storage
    const url = `/uploads/${Date.now()}-${file.name}`;

    return Response.json({ url, name: file.name, size: file.size });
  } catch (error) {
    return Response.json({ error: 'Upload failed', details: String(error) }, { status: 500 });
  }
}
