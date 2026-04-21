# Sign-In Flow Test Cases

## Test Case 1: Complete Onboarding → Sign-Out → Sign-In
**Status:** ✅ PASSED  
**Date Tested:** April 21, 2026  
**Flow:**
1. User clicks "Sign in with Google"
2. User selects Google account from account chooser
3. Onboarding Flow 1: User enters age, weight, height
4. Onboarding Flow 2: User selects food preference & allergies
5. Onboarding Flow 3: User selects activity level & body goal
6. User completes setup → redirected to CreateJoinScreen
7. User logs out
8. User signs in again with same Google account
9. **Expected:** User should land on CreateJoinScreen (not back on onboarding)
10. **Actual:** ✅ User lands on CreateJoinScreen (fixed Apr 21)

---

## Test Case 2: New User Sign-In → Onboarding Required
**Status:** ✅ PASSED  
**Date Tested:** April 21, 2026  
**Flow:**
1. User clicks "Sign in with Google"
2. First-time user (no profile data in DB)
3. **Expected:** User directed to Onboarding Flow 1
4. **Actual:** ✅ User correctly shown onboarding screens

---

## Test Case 3: Returning User with Complete Profile
**Status:** ✅ PASSED  
**Date Tested:** April 21, 2026  
**Flow:**
1. User has completed onboarding before
2. User signs in with Google
3. API fetches profile (has age, DOB, weight, height, etc.)
4. **Expected:** 
   - Check if user has room in localStorage → show Hearth
   - Check if user has room in DB → show Hearth
   - If no room → show CreateJoinScreen
5. **Actual:** ✅ Routing logic correctly follows fallback chain

---

## Test Case 4: Bug - Age Not Saved After Onboarding (FIXED)
**Status:** ✅ FIXED on Apr 21  
**Date Reported:** April 21, 2026  
**Issue:** 
- User completes onboarding (all 3 flows)
- User signs out
- User signs in again
- User was redirected to onboarding instead of homepage

**Root Cause:** 
- `age` field was NOT being saved to database in POST /api/profile
- Only `date_of_birth` was saved, but no `age` field
- On re-login, check `if (p.age || p.date_of_birth)` failed

**Fix Applied:**
- Added `if (age !== null) update.age = age;` to profile API POST method
- Now age is persisted to database on onboarding completion

---

## Test Case 5: Profile & Notification Icons - Navigation
**Status:** ✅ PASSED  
**Date Tested:** April 21, 2026  
**Flow:**
1. User on Hearth (home) screen
2. Click profile icon (👤) in top-left navbar
3. **Expected:** Open ProfileScreen with user details
4. **Actual:** ✅ ProfileScreen opens correctly

5. From ProfileScreen, click back arrow
6. **Expected:** Return to Hearth
7. **Actual:** ✅ Navigation works

8. Click notification bell (🔔) in top-right
9. **Expected:** Open NotificationsScreen
10. **Actual:** ✅ NotificationsScreen opens

---

## Test Case 6: Profile Edit Functionality
**Status:** ✅ PASSED  
**Date Tested:** April 21, 2026  
**Flow:**
1. User on ProfileScreen
2. Click "Edit" button on Body Metrics section
3. Edit sheet opens with weight/height inputs
4. Change weight value
5. Click "Save Changes"
6. **Expected:** Values update in profile state
7. **Actual:** ✅ Edit modal works and state updates

---

## Test Case 7: Tailwind CSS v4 Compatibility
**Status:** ✅ FIXED on Apr 21  
**Date Issue Found:** April 21, 2026  
**Issue:** 
- Dev server crashes on startup
- Webpack error in CSS loader for globals.css
- PostCSS unable to process @tailwind directives

**Root Cause:** 
- Project uses Tailwind v4 (installed in package.json)
- CSS file was using Tailwind v3 syntax: `@tailwind base; @components; @utilities;`
- v4 uses new syntax: `@import "tailwindcss";`

**Fix Applied:**
- Updated [app/globals.css](app/globals.css) line 1
- Changed from `@tailwind base;` to `@import "tailwindcss";`
- Added `@config "../tailwind.config.js";` for configuration

---
