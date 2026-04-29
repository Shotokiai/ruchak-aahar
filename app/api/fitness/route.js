import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ steps: 0, calories: 0, error: 'not_authenticated' });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  try {
    const res = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startOfDay.getTime(),
        endTimeMillis: Date.now(),
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Google Fit error:', err);
      return Response.json({ steps: 0, calories: 0, error: 'fit_error' });
    }

    const data = await res.json();
    const steps = data.bucket?.[0]?.dataset?.[0]?.point
      ?.reduce((sum, p) => sum + (p.value?.[0]?.intVal || 0), 0) ?? 0;

    // calories = steps × 0.04 (average; ~400 kcal per 10,000 steps)
    const calories = Math.round(steps * 0.04);

    return Response.json({ steps, calories });
  } catch (e) {
    console.error('Fitness API fetch failed:', e);
    return Response.json({ steps: 0, calories: 0, error: 'network_error' });
  }
}
