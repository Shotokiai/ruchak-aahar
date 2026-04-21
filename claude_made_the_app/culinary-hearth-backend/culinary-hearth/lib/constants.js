// Color theme
export const COLORS = {
  bg: '#F5EFE0',
  primary: '#7B2525',
  dark: '#1A1A1A',
  card: '#FFFFFF',
  text: '#1A1A1A',
  muted: '#9A8E82',
  green: '#4CAF50',
  border: '#E8DDD0',
  light: '#F0E8DC',
};

// Calorie formula (Mifflin-St Jeor)
export const calcTarget = (age, wKg, hCm, activity = 'sedentary', bodyGoal = 'fit', gender = 'm') => {
  const bmr =
    gender === 'm'
      ? 10 * wKg + 6.25 * hCm - 5 * age + 5
      : 10 * wKg + 6.25 * hCm - 5 * age - 161;
  const mult = { sedentary: 1.2, light: 1.375, moderate: 1.55 };
  const maint = Math.round((bmr * (mult[activity] || 1.2)) / 10) * 10;
  const adj = { lean: -400, fit: 0, athletic: 250 };
  return { maintenance: maint, target: maint + (adj[bodyGoal] || 0) };
};

// Dish pool
export const DISH_POOL = [
  {
    id: 1,
    name: 'Dal Makhani',
    img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80',
    protein: 32,
    carbs: 18,
    fiber: 6,
    cal: 280,
    desc: '"Yeh sirf dal nahi, emotional support system hai foodie logon ka"',
    ingredients: ['1 cup whole black lentils', '¼ cup kidney beans', '2 tbsp butter', '1 cup tomato puree', '1 tsp cumin', '½ cup cream', 'Salt'],
    steps: ['Soak lentils overnight', 'Pressure cook 6-8 whistles', 'Cook butter + tomato till oil separates', 'Add cream + lentils, simmer 25 mins', 'Garnish with cream, serve hot'],
  },
  {
    id: 2,
    name: 'Roasted Salmon',
    img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80',
    protein: 38,
    carbs: 15,
    fiber: 9,
    cal: 320,
    desc: '"Light, fresh, 20-min prep. Perfect weeknight dinner."',
    ingredients: ['2 salmon fillets', 'Asparagus', 'Baby spinach', '1 lemon', 'Olive oil', 'Garlic'],
    steps: ['Preheat oven 200°C', 'Season salmon with garlic, lemon, salt', 'Roast 15-18 mins', 'Sauté spinach', 'Plate with lemon wedge'],
  },
  {
    id: 3,
    name: 'Butter Chicken',
    img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80',
    protein: 28,
    carbs: 22,
    fiber: 4,
    cal: 340,
    desc: '"The OG comfort food. A warm hug in curry form."',
    ingredients: ['500g chicken', '200ml cream', 'Tomato puree', '3 tbsp butter', 'Garam masala'],
    steps: ['Marinate chicken 1hr', 'Grill till charred', 'Butter + tomato sauce', 'Add cream 15 mins', 'Add chicken 10 mins'],
  },
  {
    id: 4,
    name: 'Paneer Tikka',
    img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80',
    protein: 24,
    carbs: 14,
    fiber: 3,
    cal: 260,
    desc: '"Vegetarians deserve drama too — every single time."',
    ingredients: ['400g paneer', 'Yogurt', 'Tikka masala', 'Capsicum', 'Lemon'],
    steps: ['Marinate 2 hours', 'Thread on skewers', 'Grill 10-12 mins', 'Chaat masala + lemon', 'Mint chutney'],
  },
  {
    id: 5,
    name: 'Chicken Biryani',
    img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80',
    protein: 35,
    carbs: 52,
    fiber: 5,
    cal: 480,
    desc: '"Sunday ki feeling, any day of the week."',
    ingredients: ['500g chicken', '2 cups basmati', 'Whole spices', 'Saffron milk', 'Fried onions', 'Ghee'],
    steps: ['Marinate chicken 3hrs', 'Par-cook rice 70%', 'Layer in pot', 'Add saffron milk + onions', 'Dum cook 25-30 mins'],
  },
];

export const VEG_IDS = [1, 4]; // Dal Makhani & Paneer Tikka
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const BASE_DATES = [7, 8, 9, 10, 11, 12, 13]; // Apr 7–13
export const HOURS = ['7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM'];
