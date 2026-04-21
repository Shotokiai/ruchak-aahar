// lib/api.js  — all client-side fetch wrappers in one file

async function req(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // Profile
  getProfile:  ()     => req('GET',  '/api/profile'),
  saveProfile: (body) => req('POST', '/api/profile', body),

  // Rooms
  createRoom:    (name)        => req('POST',  '/api/rooms/create', { name }),
  joinRoom:      (invite_code) => req('POST',  '/api/rooms/join',   { invite_code }),
  getRoomMembers:()            => req('GET',   '/api/rooms/join'),
  updateEating:  (room_id, eating_tonight)    => req('PATCH', '/api/rooms/join', { room_id, eating_tonight }),
  transferCook:  (room_id, target_user_id)    => req('PATCH', '/api/rooms/join', { room_id, target_user_id, transfer_cook: true }),

  // Dishes
  importUrl:     (url, room_id) => req('POST', '/api/dishes/import-url', { url, room_id }),
  getDishPool:   (room_id)      => req('GET',  `/api/dishes/pool?room_id=${room_id}`),
  addDishManual: (body)         => req('POST', '/api/dishes/pool', body),
  removeDish:    (dish_id, room_id) => req('DELETE', `/api/dishes/pool?dish_id=${dish_id}&room_id=${room_id}`),

  // Votes
  getMyVotes: (room_id) => req('GET',  `/api/votes?room_id=${room_id}`),
  castVote:   (dish_id, liked) => req('POST', '/api/votes', { dish_id, liked }),

  // Planner
  getMeals:   (room_id, start_date, end_date) => {
    const p = new URLSearchParams({ room_id, start_date });
    if (end_date) p.set('end_date', end_date);
    return req('GET', `/api/planner?${p}`);
  },
  addMeal:    (body)                       => req('POST',   '/api/planner', body),
  deleteMeal: (meal_id, room_id)           => req('DELETE', `/api/planner?meal_id=${meal_id}&room_id=${room_id}`),
  confirmMeal:(meal_id, room_id)           => req('PATCH',  '/api/planner', { meal_id, room_id, is_confirmed: true }),

  // Calorie log
  getTodayLog: (date) => req('GET',  `/api/calorie-log${date ? `?date=${date}` : ''}`),
  logMeal:     (body) => req('POST', '/api/calorie-log', body),
};
