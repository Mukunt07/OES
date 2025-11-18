# Gamification System Integration TODO

## 1. Update ResultPage.jsx
- [x] Add points calculation: +10 per correct, +2 completion, +5 speed (<2min)
- [x] Add XP calculation: XP = score * 5
- [x] Update Firestore user stats: totalPoints, xp, level, totalQuizzes, averageScore, maxScore
- [x] Implement badge logic: Beginner, Sharp Mind, Speedster, Streak Master, Quiz King/Queen, Category Pro
- [x] Add level up popup if user leveled up
- [x] Add badge earned animation

## 2. Update ProfilePage.jsx
- [ ] Load user stats from Firestore (totalPoints, xp, level, etc.)
- [ ] Load user badges
- [ ] Add new UI sections: Total Points, Level + XP Progress Bar, Total Quizzes, Average Score, Earned Badges Grid, Last 5 Quiz Results
- [ ] Ensure mobile responsive

## 3. Update Leaderboard.jsx
- [ ] Change query to collection("users") orderBy("stats.totalPoints", "desc") limit(20)
- [ ] Display: Rank, Name, Level, Points, Highest Score Badge
- [ ] Handle real-time updates

## 4. Update Dashboard.jsx
- [ ] Add XP/points preview section
- [ ] Load and display user's current XP and points

## 5. Testing and Final Checks
- [ ] Test points/XP calculation
- [ ] Test badge awarding
- [ ] Test level up
- [ ] Test leaderboard display
- [ ] Ensure no breaking changes to existing functionality
- [ ] Mobile responsiveness check
