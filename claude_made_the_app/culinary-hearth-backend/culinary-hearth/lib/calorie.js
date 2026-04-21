// lib/calorie.js
// Mifflin-St Jeor BMR → maintenance × activity → ± goal adjustment

const ACTIVITY_MULT = {
  sedentary: 1.2,
  light:     1.375,
  moderate:  1.55,
};

const GOAL_ADJ = {
  lean:     -400,   // fat-loss deficit
  fit:          0,   // maintain
  athletic:  +250,  // muscle-gain surplus
};

/**
 * @param {number} age
 * @param {number} weightKg
 * @param {number} heightCm
 * @param {'sedentary'|'light'|'moderate'} activity
 * @param {'lean'|'fit'|'athletic'} bodyGoal
 * @param {'m'|'f'} gender
 * @returns {{ maintenance: number, target: number }}
 */
export function calcCalories(age, weightKg, heightCm, activity = 'sedentary', bodyGoal = 'fit', gender = 'm') {
  const bmr = gender === 'm'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const maintenance = Math.round(bmr * (ACTIVITY_MULT[activity] ?? 1.2) / 10) * 10;
  const target      = maintenance + (GOAL_ADJ[bodyGoal] ?? 0);

  return { maintenance, target };
}
