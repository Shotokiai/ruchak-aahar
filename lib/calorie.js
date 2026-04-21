const ACTIVITY_MULT = { sedentary: 1.2, light: 1.375, moderate: 1.55 };
const GOAL_ADJ = { lean: -400, fit: 0, athletic: 250 };

export function calcCalories(age, weightKg, heightCm, activity = 'sedentary', bodyGoal = 'fit', gender = 'm') {
  const bmr = gender === 'm'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  const maintenance = Math.round(bmr * (ACTIVITY_MULT[activity] ?? 1.2) / 10) * 10;
  return { maintenance, target: maintenance + (GOAL_ADJ[bodyGoal] ?? 0) };
}
