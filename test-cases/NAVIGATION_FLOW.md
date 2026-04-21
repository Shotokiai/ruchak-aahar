# Navigation & Screen Flow Test Cases

## Test Case 1: Full Navigation Between Screens
**Status:** ✅ PASSED  
**Date Tested:** April 21, 2026  
**Flow:**
1. User on Hearth (home) screen
2. Bottom nav shows 3 icons: Hearth, Match, Planner
3. Click "Match" → MatchScreen opens
4. Click "Planner" → PlannerScreen opens
5. Click "Hearth" → Back to Hearth screen
6. **Expected:** All navigation smooth, no errors
7. **Actual:** ✅ Navigation working correctly

---

## Test Case 2: Profile Screen Full Features
**Status:** ✅ PASSED  
**Date Tested:** April 21, 2026  
**Flow:**
1. Click profile icon (👤) in navbar
2. ProfileScreen loads with:
   - User profile card (name, email, age)
   - Body Metrics section with Edit button
   - Food Preferences section with Edit button
   - Fitness & Goals section with Edit button
   - WhatsApp Support card (clickable)
   - Log Out button (red button)
3. **Expected:** All elements visible and clickable
4. **Actual:** ✅ All features rendered correctly

---

## Test Case 3: Edit Sheet Modal - Body Metrics
**Status:** ✅ PASSED  
**Date Tested:** April 21, 2026  
**Flow:**
1. On ProfileScreen, click "Edit" for Body Metrics
2. Bottom sheet modal opens with:
   - Age display (read-only)
   - Weight input field
   - Height input field
   - "Save Changes" button
   - Close (×) button
3. Change weight value
4. Click "Save Changes"
5. Modal closes
6. Profile updates
7. **Expected:** Values persist in profile state
8. **Actual:** ✅ Edit modal works correctly

---

## Test Case 4: Edit Sheet Modal - Food Preferences
**Status:** ✅ PASSED  
**Date Tested:** April 21, 2026  
**Flow:**
1. On ProfileScreen, click "Edit" for Food Preferences
2. Bottom sheet opens with 3 options:
   - Vegetarian 🥗
   - Non-Vegetarian 🍗
   - Vegan 🥑
3. Select different option
4. Click "Save Changes"
5. **Expected:** Selection updates
6. **Actual:** ✅ Food preference selection works

---

## Test Case 5: Edit Sheet Modal - Fitness & Goals
**Status:** ✅ PASSED  
**Date Tested:** April 21, 2026  
**Flow:**
1. On ProfileScreen, click "Edit" for Fitness & Goals
2. Bottom sheet opens with:
   - Activity Level section (3 options)
   - Body Goal section (3 options)
3. Select different activity level
4. Select different body goal
5. Click "Save Changes"
6. **Expected:** Selections update in profile
7. **Actual:** ✅ Fitness options selectable and saveable

---

## Test Case 6: Notifications Screen Empty State
**Status:** ✅ PASSED  
**Date Tested:** April 21, 2026  
**Flow:**
1. Click notification bell (🔔) in navbar
2. NotificationsScreen opens
3. No dishes added yet → shows empty state:
   - Icon: 📝
   - Message: "No dishes added yet"
   - "Go back" button
4. Click "Go back"
5. **Expected:** Return to Hearth
6. **Actual:** ✅ Navigation and empty state work

---

## Test Case 7: Back Navigation from Screens
**Status:** ✅ PASSED  
**Date Tested:** April 21, 2026  
**Flow:**
1. Open ProfileScreen
2. Click back arrow (←)
3. Return to Hearth
4. Open NotificationsScreen
5. Click back arrow (←)
6. Return to Hearth
7. **Expected:** Back button always returns to home
8. **Actual:** ✅ Back navigation working on all screens

---

## Test Case 8: Modal Overlay - Close on Outside Click
**Status:** ✅ PASSED  
**Date Tested:** April 21, 2026  
**Flow:**
1. Open ProfileScreen
2. Click "Edit" on any section (opens edit sheet)
3. Click on the dark overlay area (outside the modal)
4. **Expected:** Modal closes
5. **Actual:** ✅ Outside click closes modal

---
