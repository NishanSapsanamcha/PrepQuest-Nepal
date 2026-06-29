import { normalizeLanguageMode } from "../utils/practiceUtils";

export const translations = {
  english: {
    dashboard: "Dashboard", practice: "Practice", leaderboard: "Leaderboard", profile: "Profile", badges: "Badges", progression: "Progression", mockTest: "Mock Test", dailyQuiz: "Daily Quiz", tournament: "Tournament",
    chooseSubject: "Choose Your Practice Subject", practiceNow: "Practice Now", startPractice: "Start Practice", reviewMistakes: "Review & Mistakes", savedQuestions: "Saved Questions", wrongAnswers: "Wrong Answers", weakTopics: "Weak Topic",
    todayMission: "Today's Mission", startDailyQuiz: "Start Daily Quiz", practiceWeakSubject: "Practice your weak subject", totalXP: "Total XP", coins: "Coins", streak: "Streak", currentStreak: "Current Streak", level: "Level", rank: "Rank", accuracy: "Accuracy", questionsSolved: "Questions Solved",
    notStartedYet: "Not Started Yet", viewProfile: "View Profile", noDataYet: "No data yet", continue: "Continue", changeLanguage: "Change Language", changePreferences: "Change Preferences", language: "Language", exam: "Exam", freeMocksLeft: "Free Mocks Left", recommendedPractice: "Recommended Practice",
    earnedBadges: "Badges Earned", studyHistory: "Study History", overallRankJourney: "Overall Rank Journey", currentRank: "Current Rank", learner: "Learner", examTrack: "Exam Track", points: "Points", correct: "Correct", wrong: "Wrong", nextQuestion: "Next Question", saveForReview: "Save for Review", reviewWrongAnswers: "Review Wrong Answers",
    startDailyQuizPrompt: "Start a daily quiz", keepLevelingUp: "Keep leveling up!", keepItAliveToday: "Keep it alive today", preferredLanguage: "Preferred language", xpEarned: "XP earned", bestStreak: "Best streak", completeDailyQuiz: "Complete 1 daily quiz", takeMockTest: "Take 1 mock test", completeBonusCoins: "Complete all to earn bonus coins!",
    yourProgress: "Your Progress", viewProgression: "View Progression", nextRank: "Next Rank", quickActions: "Quick Actions", subjectPractice: "Subject Practice", practiceWeakAreas: "Practice Weak Areas", subject: "Subject", solved: "Solved", mistakes: "Mistakes", status: "Status", nextLevel: "Next Level", action: "Action",
    starting: "Starting", developing: "Developing", beginner: "Beginner", strong: "Strong", examReady: "Exam Ready", mastered: "Mastered", question: "Question", of: "of", submitAnswer: "Submit Answer", skip: "Skip", exit: "Exit", correctAnswer: "Correct answer", explanation: "Explanation",
    practiceComplete: "Practice Complete", practiceAgain: "Practice Again", backToPractice: "Back to Practice", selectedExamTrack: "Selected exam track", selectedLanguage: "Selected language", todaysStatus: "Today's status", open: "Open", todaysLoksewaDailyQuiz: "Today's Loksewa Daily Quiz", tenQuestions: "10 Questions",
    dailyQuizDescription: "Complete today's 10-question challenge and keep your Loksewa streak alive.", dailyQuizFeatureMixed: "10 mixed questions based on your selected exam track", dailyQuizFeatureCovers: "Covers GK, Constitution, IQ, English, Nepali, Current Affairs, and available subjects", estimatedTime: "Estimated time",
    dailyQuizFeatureStreak: "Complete today to keep your streak active", startTodaysQuiz: "Start Today's Quiz", dailyStatus: "Daily Status", ready: "Ready", completed: "Completed", notCompleted: "Not Completed", oneRewardToday: "One reward can be earned today", questionBank: "Question bank", rewardPreview: "Reward Preview", streakReminder: "Streak Reminder", dailyQuizRules: "Daily Quiz Rules", recentDailyQuizHistory: "Recent Daily Quiz History",
    insightSummary: "Insight Summary", whatProgressShows: "What Your Progress Shows", insightsRealHistory: "These insights are calculated from your real practice history.", strongestSubject: "Strongest Subject", needsMostAttention: "Needs Most Attention", mostPracticed: "Most Practiced", leastPracticed: "Least Practiced",
    growthTracking: "Growth Tracking", xpGrowthRoadmap: "XP Growth & Learning Roadmap", xpGrowthRoadmapDesc: "See where your XP came from and what subject levels unlock next.", xpActivity: "XP Activity", recentGrowth: "Recent Growth", latestXpSource: "Latest XP Source", learningRoadmap: "Learning Roadmap", subjectLevelUnlocks: "Subject Level Unlocks", currentHighestSubjectLevel: "Current highest subject level",
    unlocked: "Unlocked", locked: "Locked", learningSnapshot: "Learning Snapshot", overallProgress: "Overall Progress", realData: "Real Data", attempted: "Attempted", subjects: "Subjects", bestMastery: "Best Mastery", nextBestAction: "Next Best Action", openReviewCenter: "Open Review Center", consistencyBuildsMastery: "Consistency builds mastery. Keep going!",
    subjectMastery: "Subject Mastery", masteryBySubject: "Mastery by Subject", filterSubjects: "Filter Subjects", all: "All", practiced: "Practiced", needsPractice: "Needs Practice", notStarted: "Not Started",
    trackRanking: "Track your ranking, earn XP, and rise to the top.", fridayBattle: "Friday Battle", privacySafeRanking: "Privacy-safe ranking", myTournamentRank: "My Tournament Rank", everyQuestionTop: "Every question you answer brings you closer to the top!", viewTournamentDetails: "View Tournament Details", chooseRankingType: "Choose Ranking Type", weekly: "Weekly", monthly: "Monthly", subjectWise: "Subject-wise", hallOfFame: "Hall of Fame", fullLeaderboard: "Full Leaderboard", view: "View", logout: "Logout",
    editProfile: "Edit Profile", current: "Current", nextTarget: "Next Target", xpNeeded: "XP Needed", coinBalance: "Coin Balance", earnedFromQuizzes: "Earned from quizzes and tournaments", dailyHabitStatus: "Daily habit status", acrossAllPractice: "Across all practice sessions", accountLevel: "Account Level", tournamentHistory: "Tournament History", recentActivity: "Recent Activity", noBadgesYet: "No badges earned yet", startPracticingXp: "Start practicing to earn XP",
    badgeShowcase: "Badge Showcase", viewAllBadges: "View All Badges", studyIdentity: "Study Identity", weakestSubject: "Weakest Subject", recommendedNext: "Recommended Next", preferencesSummary: "Preferences Summary", selectedExamTrackTitle: "Selected Exam Track", publicLeaderboard: "Public Leaderboard", on: "On", off: "Off", notifications: "Notifications", futureFeature: "Future feature", soundEffects: "Sound Effects", muted: "Muted", subjectsPracticed: "Subjects Practiced", studyBreadth: "Study breadth",
    achievementShowcase: "Achievement showcase", yourAchievementShowcase: "Your achievement showcase", howToEarnCoins: "How to Earn Coins", recentCoinActivity: "Recent Coin Activity", availableBalance: "Available balance", coinWalletNote: "Coins are earned from real completed activities. Spend them later on optional extras like additional mock tests after your 3 free daily mocks.", noCoinActivity: "No coin activity yet. Complete a daily quick challenge or practice session to start earning coins.", maxed: "Maxed", statusWord: "Status", days: "Days", day: "Day", pts: "pts",
    notEnoughDataYet: "Not enough data yet", startPracticingRecommendation: "Start practicing to get a recommendation", noTournamentHistory: "No tournament history yet. Play the Friday Loksewa Battle to build your record.", topRankReachedLegend: "Top rank reached — you're a PrepQuest Legend.", days1: "Day",
    reviewDailyQuiz: "Review Daily Quiz", topRankReached: "Top rank reached", earnedSuffix: "earned", notEnoughPracticeYet: "Not enough practice yet", completePracticeReveal: "Complete a practice session to reveal your focus area.", generalKnowledge: "General Knowledge",
    welcomeBack: "Welcome back,", dashboardSubtitlePrefix: "Track progress, earn rewards, and prepare smarter for", dashboardSubtitleSuffix: ".",
    exitMock: "Exit Mock", timeIsUp: "Time is up.", submitToSeeResult: "Submit your mock to see your result.", submitMock: "Submit Mock", positionProgress: "Position Progress", answeredLabel: "Answered", remainingLabel: "Remaining", previousQuestion: "Previous Question", questionNavigator: "Question Navigator", finishStrong: "Finish strong. Your result will show weak areas and exam readiness.", leaveMockTest: "Leave Mock Test?", leaveMockDesc: "Your current attempt has not been submitted yet. If you leave now, your answers may not be saved.", leaveMock: "Leave Mock", submitMockTest: "Submit Mock Test?", languageColon: "Language", subjectsColon: "Subjects",
    start: "Start", submit: "Submit", next: "Next", back: "Back", cancel: "Cancel", save: "Save", close: "Close", viewDetails: "View Details", edit: "Edit", delete: "Delete", startQuiz: "Start Quiz", tryAgain: "Try Again", review: "Review", more: "More", goToTournament2: "Go to Tournament",
    examReadinessTitle: "Exam Readiness", mockTestsTitle: "Mock Tests", mockTestsSubtitle: "Take exam-style Loksewa mock tests, track accuracy, find weak areas, and improve your exam readiness.", bestMockScore: "Best Mock Score", averageAccuracy: "Average Accuracy", completedMocks: "Completed Mocks", noAttempts: "No attempts", notReadyStat: "Not ready", highestCompletedMock: "Highest completed mock", completeMockToSet: "Complete a mock to set this", basedOnCompletedMocks: "Based on completed mocks", realAttemptsOnly: "Real attempts only", recentMockAverage: "Recent mock average", takeMockToCalculate: "Take a mock to calculate", realCompletedAttempts: "Real completed attempts", todaysFullMock: "Today's Full Mock Test", notReadyYet: "Not Ready Yet", mockHeroSubtitle: "A balanced 25-question mock to check your current exam readiness.", mockFormat: "Mock Format", questions25: "25 Questions", minutes20: "20 Minutes", mixedSubjects: "Mixed Subjects", afterCompletion: "After Completion", scoreReport: "Score Report", weakAreas: "Weak Areas", rewardsWord: "Rewards", badgeProgressWord: "Badge progress", startFreeMock: "Start Free Mock", use100Start: "Use 100 Coins & Start Mock", notEnoughCoins: "Not Enough Coins", use100Coins: "Use 100 Coins", dailyMockAccess: "Daily Mock Access", freeMocksRemainingToday: "free mocks remaining today", useFreeMockCheck: "Use your free mock to check today's exam readiness.", usedAllFreeMocks: "You used all free mock tests for today.", dailyFreeMockProgress: "Daily free mock progress", usedLabel: "used", extraAttempt: "Extra attempt", yourCoins: "Your coins", freeAttemptsReset: "Free attempts reset daily. Extra attempts use coins but basic practice remains free.", viewMockOptions: "View Mock Options", mockTypeSelection: "Mock Type Selection", recentMockHistory: "Recent Mock History", recentLabel: "recent", reviewResult: "Review Result", noMockCompleted: "No mock tests completed yet. Take your first mock to see score, weak areas, and rewards.", examReadinessPreview: "Exam Readiness Preview", takeMock: "Take a mock", recentMockReadiness: "Recent mock accuracy becomes your readiness checkpoint.", badgeProgressPreview: "Badge Progress Preview", mockTestRulesTitle: "Mock Test Rules", use100CoinsQ: "Use 100 Coins?", useCoinsStart: "Use Coins & Start", difficultyLabel: "Difficulty", needsMoreQuestions: "Needs more questions", balancedMockReady: "Balanced mixed mock ready.", notEnoughQuestionsMock: "Not enough validated questions are available for this mock test yet. Add more reviewed questions to the question bank before starting this mock.", usedAllFreeMocksMsg: "You used all 3 free mock tests today. Extra mock tests cost 100 coins. Earn more coins through daily quiz, practice, or tomorrow's free mocks.", willUseFreeAttempt: "This will use 1 of your 3 free mock attempts for today after submission.", extraCosts100: "You used all free mocks today. This extra attempt costs 100 coins.", completeToEarnCoins: "Complete daily quiz or practice to earn more coins.", scoreLabel: "Score", timeLabel: "Time", weakSubjectLabel: "Weak Subject",
    learningAnalytics: "Learning Analytics", progressionSubtitle: "Track real learning growth, subject mastery, XP activity, and review progress.", goToPractice: "Go to Practice", compareSubjectXp: "Compare real subject XP, accuracy, solved questions, and level progress.", viewByPracticeStatus: "View subjects by practice status.", maxLevelReached: "Max level reached", noSubjectsMatchFilter: "No subjects match this filter", completeToCompareMastery: "Complete a practice session to compare subject mastery.", noXpActivityYet: "No XP activity yet", noXpActivityDesc: "No XP activity yet. Correct answers in practice will appear here.", reviewNextSteps: "Review & Next Steps", mistakeReviewGoals: "Mistake Review and Learning Goals", useReviewData: "Use review data and weak-area history to decide what to do next.", reviewProgress: "Review Progress", savedAndMistakes: "Saved & Mistakes", masteredMistakes: "Mastered Mistakes", mostMissedTopic: "Most Missed Topic", noReviewData: "No review data yet", noSavedOrWrong: "No saved or wrong questions yet. Save difficult questions during practice.", nextSteps: "Next Steps", next3Goals: "Next 3 Learning Goals", futureAnalytics: "Future Analytics", futureAnalyticsDesc: "Mock test, tournament, and badge analytics will appear here after those systems are connected.", noSubjectAnalysis: "No subject analysis yet", noWeakSubject: "No weak subject detected yet", completeToReveal: "Complete a practice session to reveal this.", wrongLowAccuracyAppear: "Wrong answers and low accuracy will appear here.", noSolvedRecorded: "No solved questions recorded yet.",
    achievementSystem: "Achievement System", badgesUnlockDesc: "Unlock achievements through quizzes, practice, mock tests, streaks, tournaments, and accuracy.", lockedBadges: "Locked Badges", visibleUnlockGoals: "Visible unlock goals", nextBadge: "Next Badge", closestToUnlocking: "Closest to unlocking", rareBadgesAvailable: "Rare Badges Available", premiumAchievementPaths: "Premium achievement paths", nextBadgeProgress: "Next Badge Progress", hiddenAchievementReach: "A hidden achievement is within reach.", keepPlayingDiscover: "Keep playing to discover this badge.", noBadgesMatchFilter: "No badges match this filter yet.", keepPracticingUnlock: "Keep practicing to unlock more achievements.", earnedWord: "Earned", lockedWord: "Locked", hidden: "Hidden", requirement: "Requirement", rarityWord: "Rarity", previewUnlock: "Preview unlock animation",
    resultsAfterFinish: "Results will appear after the tournament finishes.", resultWord: "Result", finalTournamentResults: "Final Tournament Results", podiumWinners: "Podium Winners", pending: "Pending", yourBattleResult: "Your Battle Result", rewardsSavedOnce: "Rewards have been saved once and will not duplicate on refresh.", reviewAnswers: "Review Answers", viewFullLeaderboard: "View Full Leaderboard", finalRank: "Final rank", correctAnswersLabel: "Correct answers", wrongAnswersLabel: "Wrong answers", totalMissed: "Total missed", coinsEarned: "Coins earned", badgeEarnedLabel: "Badge earned", nameWord: "Name", rewardWord: "Reward", participantsWord: "participants", answeredWord: "answered", coinsWord: "coins",
    liveBattleUnavailable: "Live battle is unavailable.", answerLockedWaiting: "Answer locked. Waiting for reveal.", youreReady: "You're ready. Question 1 starts on server time.", couldNotMarkReady: "Could not mark you ready.", chooseAnswerBeforeLock: "Choose an answer before locking it.", couldNotLockAnswer: "Could not lock answer.", noAnswerSubmitted: "No answer submitted", mustRegisterBattle: "You must be registered before entering a live tournament battle.", backToTournament: "Back to Tournament", liveBattle: "Live Battle", exitBattle: "Exit Battle", getReadyFriday: "Get Ready for Friday Live Tournament", totalRegistered: "Total registered", mixedWord: "Mixed", languageModeLabel: "Language mode", formatLabel: "Format", twentyMixedQuestions: "20 mixed questions", ruleSpeedBonus50: "Speed bonus up to +50 points", ruleAnswersLock: "Answers lock after submission", ruleSpeedRewards: "Speed bonus rewards faster correct answers", registeredParticipants: "Registered Participants", noUsersRegistered: "No users registered yet.", enteredTournament: "Entered Tournament", q1StartsShared: "Question 1 starts from the shared server clock for everyone together.", battleStartingSoon: "Battle Starting Soon", nextStarts15: "Next question starts in 15 seconds.", liveRankingCheckpoint: "Live Ranking Checkpoint", notRankedYet: "Not ranked yet", chooseCarefullyChange: "Choose carefully. You can change your answer before locking it.", timesUpZero: "Time's up · +0 points", scoringPreview: "Correct Answer: +100 · Speed Bonus: +0 to +50 · Max: 150", locking: "Locking...", lockAnswer: "Lock Answer", battleWord: "Battle", unanswered: "Unanswered", notCorrect: "Not correct", timesUp: "Time's up", yourAnswerNotCorrect: "Your selected answer was not correct.", noAnswerWasSubmitted: "No answer was submitted.", pointsEarned: "Points earned", basePoints: "Base points", liveState: "Live State", answerBeforeTimer: "Answer before the server timer ends", revealAfter15: "Correct or wrong is revealed only after the 15-second timer closes.", notEnoughTournamentQuestions: "Not enough validated tournament questions are available yet.", points0: "+0 points", unansweredWord: "unanswered", reveal: "Reveal",
    fridayLiveTournament: "Friday Live Tournament", tournamentIntro: "Register once, wait for the server countdown, then enter a timed live Loksewa battle with checkpoint rankings and final podium results.", startsIn: "Starts in", noBettingNoCoinLoss: "No betting. No coin loss.", viewRules: "View Rules", pleaseWait: "Please wait...", unavailable: "Unavailable", joinTournament: "Join Tournament", registered: "Registered", enterTournament: "Enter Tournament", registrationClosed: "Registration Closed", enterBattle: "Enter Battle", viewResults: "View Results", alreadyRegistered: "You're already registered for this tournament.", tournamentServerUnavailable: "Tournament server is unavailable.", couldNotRegister: "Could not register for this tournament.",
    registrationCountdown: "Registration Countdown", battleStartsAuto: "Battle starts automatically", registeredUsers: "Registered Users", notRegistered: "Not Registered", yourStatus: "Your Status", joinBeforeCountdown: "Join before countdown reaches zero", tournamentStatus: "Tournament Status", serverControlled: "Server controlled", readyRoom: "Ready Room", countdown: "Countdown", questionsWord: "Questions", ranking: "Ranking", afterQuestions51015: "After questions 5, 10, and 15", registrationClosedDot: "Registration Closed.",
    liveBattleRules: "Live Battle Rules", fairScoring: "Fair scoring", rule20Questions: "20 mixed Loksewa questions", rule15Seconds: "15 seconds per question", ruleCorrect100: "Correct answer gives +100 points", ruleSpeedBonus: "Faster correct answers earn +0 to +50 speed bonus", ruleMax150: "Maximum per question: 150 points", ruleWrong0: "Wrong or unanswered gives 0 points", ruleAnswerLocks: "Answer locks after submit and cannot be changed", ruleRevealAfterTimer: "Correct/wrong reveals only after timer closes", ruleCheckpoints: "Checkpoints after questions 5, 10, and 15", ruleMissedUnanswered: "Missed questions count as unanswered", ruleNoBetting: "No betting. Users never lose coins.", correctAnswerLabel: "Correct Answer", speedBonus: "Speed Bonus", maxPerQuestion: "Max Per Question", wrongUnanswered: "Wrong / Unanswered", scoringNote: "Choose carefully - once submitted, your answer cannot be changed. Correct with 15s left = 150 points; with 8s left = about 127; with 1s left = about 103.",
    leaderboardWillAppear: "Leaderboard will appear after participants answer live questions.", tournamentRewards: "Tournament Rewards", podium: "Podium", rewardsAppliedOnce: "Rewards are applied once when results are published.", firstPlace: "1st Place", secondPlace: "2nd Place", thirdPlace: "3rd Place", top10: "Top 10", allParticipants: "All Participants", goldChampionBadge: "Gold Champion Badge", silverChampionBadge: "Silver Champion Badge", bronzeChampionBadge: "Bronze Champion Badge", topPerformerBadge: "Top Performer Badge", notSelected: "Not selected", both: "Both",
    tournamentRankDesc: "Ranking based on Friday Loksewa Battle performance.", weeklyRankDesc: "Ranking by XP earned over the last 7 days.", monthlyRankDesc: "Ranking by XP earned over the last 30 days.", subjectRankDesc: "Ranking by subject XP, accuracy, and solved questions.", examTrackRankDesc: "Ranking by total XP within the exam track.", hallOfFameRankDesc: "Lifetime XP, badges, and long-term consistency.",
    thisWeek: "This Week", lastWeek: "Last Week", thisMonth: "This Month", lastMonth: "Last Month", lifetimeXPFilter: "Lifetime XP", lifetimeTournamentWins: "Lifetime Tournament Wins", lifetimeBadges: "Lifetime Badges",
    subjectXP: "Subject XP", lifetimeXPHeader: "Lifetime XP", wins: "Wins", monthlyXP: "Monthly XP", examXP: "Exam XP", weeklyXP: "Weekly XP", rankingSuffix: "Ranking", you: "You", youHaventJoined: "You haven't joined yet", youHaventPlayed: "You haven't played yet", finalPublicRankings: "Final public rankings are shown below. Join the next Friday Loksewa Battle to appear on the board.", takeFridayBattle: "Take the Friday Loksewa Battle and start your climb!", leaderboardPrivacyNote: "Your row reflects your real saved progress. Other learners are shown for ranking context and only public, privacy-safe details are displayed.", goldChampion: "Gold Champion", silverChampion: "Silver Champion", bronzeChampion: "Bronze Champion", lvAbbr: "Lv",
    climbingRanks: "Climbing the ranks", defaultLearnerAbout: "This learner is building progress on PrepQuest Nepal.", aboutWord: "About", pointsLower: "points",
    retry: "Retry", goToTournament: "Go to Tournament", startPractice: "Start Practice", practiceSubjectBtn: "Practice Subject", emptyTournamentErrorTitle: "Unable to load tournament results right now.", emptyTournamentErrorBody: "Please check your connection or try again later.", emptyTournamentTitle: "No tournament results yet.", emptyTournamentBody: "Rankings will appear after learners complete the Friday Loksewa Battle.", emptyWeeklyTitle: "No weekly ranking yet.", emptyWeeklyBody: "Complete quizzes, practice sessions, or mock tests this week to appear here.", emptyMonthlyTitle: "No monthly ranking yet.", emptyMonthlyBody: "Earn XP this month to appear on the monthly leaderboard.", emptySubjectTitle: "No subject-wise ranking yet.", emptyExamTrackTitle: "No ranking yet for this exam track.", emptyExamTrackBody: "Your real progress will appear here as you earn XP.", emptyHallOfFameTitle: "No Hall of Fame ranking yet.", emptyHallOfFameBody: "Long-term rankings will appear as you build total XP.", emptyDefaultTitle: "No ranking data yet.", emptyDefaultBody: "Start practicing to build your real stats.",
    dailyQuizCompleted: "Daily Quiz Completed", dailyQuizCompletedDesc: "You already completed today's quiz and earned today's reward. Come back tomorrow for a new challenge.", weakest: "Weakest", none: "None", reviewTodaysResult: "Review Today's Result", practiceWeakSubjectAction: "Practice Weak Subject", goToDashboard: "Go to Dashboard", notEnoughValidatedQuestions: "Not enough validated questions are available for today's quiz yet.", addMoreQuestions: "Add more reviewed questions to the question bank before starting Daily Quiz.", validatedQuestionsAvailable: "validated questions available", estimatedTimeValue: "8-10 minutes", streakReminderDesc: "Complete today to keep your daily habit active. Daily Quiz completion is stored as today's activity.", previousResult: "Previous Result", rule10Mixed: "10 mixed questions", ruleOneReward: "One reward per day", ruleInstantFeedback: "Instant feedback after each answer", ruleWrongSaved: "Wrong answers are saved for review", ruleCompleteHabit: "Complete the quiz to keep your daily habit active", noDailyQuizAttempts: "No Daily Quiz attempts yet.",
    complete: "complete", rewardsAfterCompletion: "Rewards calculated after completion", answerSavedFinal: "Answer saved for final scoring", selectOneOption: "Select one option to submit", savedState: "Saved", sessionWord: "Session", savedLabel: "Saved", currentQuestion: "Current Question", weakSubjectRecommendation: "Weak-subject recommendation will be calculated from missed answers.", submitToGenerateInsights: "Submit answers to generate your result insights.", feedbackWord: "Feedback", answerWhenReady: "Answer when ready", timerAwarenessNote: "The timer is only for awareness. It will not auto-submit or penalize slow answers.", noXpPerQuestion: "No XP is awarded per question", scoreWord: "Score", rewardColon: "reward:", reviewExplanationBelow: "Review the explanation below", noValidatedQuestions: "No validated practice questions found", subjectBankNotReady: "This subject question bank is not ready yet.", highestLevelReached: "Highest subject level reached.", yourAnswer: "Your answer", niceWorkCorrect: "Nice work - your answer was correct.", goodAttempt: "Good attempt. Review the correction and continue.", xpGained: "XP gained:", progressSaved: "Progress saved", reviewThisTopic: "Review this topic before your next practice.",
    practicePageSubtitle: "Master each subject step by step and level up your knowledge.", maxLevel: "Max", toLabel: "to", reviewSaved: "Review Saved", savedWord: "saved", bookmarkedQuestions: "Questions you bookmarked during practice.", toReviewSuffix: "to review", noMistakesYet: "No mistakes yet", learnFromMistakes: "Learn from mistakes with explanations.", reviewMistakesAction: "Review Mistakes", mostMissedRecent: "Most missed topic from recent practice.", practiceTopic: "Practice Topic", revisitSaved: "Revisit saved questions and correct your weak areas before your next practice.",
    howXpWorks: "How XP & Gamification Works", howXpWorksDesc: "A quick guide to how progress, rewards, and unlocks are earned.", earnXp: "Earn XP", earnXpDesc: "Each correct practice answer gives +10 XP.", levelUpSubjects: "Level Up Subjects", levelUpSubjectsDesc: "Subject XP unlocks new practice modes and harder challenges.", buildStreaks: "Build Streaks", buildStreaksDesc: "Daily learning increases your streak and can unlock streak badges.", earnCoins: "Earn Coins", earnCoinsDesc: "Coins come from daily challenges, mocks, tournaments, badges, and strong practice.", unlockBadges: "Unlock Badges", unlockBadgesDesc: "Badges unlock automatically when real requirements are completed.", improveWeakAreas: "Improve Weak Areas", improveWeakAreasDesc: "Wrong answers and weak topics are tracked so you can review and improve.", consistentPracticeBold: "Consistent practice makes perfect!", consistentPracticeRest: "Keep your streak alive and climb the leaderboard.", questionBankNotReadyTitle: "Question bank not ready", questionsNotAvailable: "Validated practice questions are not available yet.", saved: "saved",
  },
  nepali: {
    dashboard: "ड्यासबोर्ड", practice: "अभ्यास", leaderboard: "लिडरबोर्ड", profile: "प्रोफाइल", badges: "ब्याज", progression: "प्रगति", mockTest: "मोक टेस्ट", dailyQuiz: "दैनिक क्विज", tournament: "प्रतियोगिता",
    chooseSubject: "अभ्यास विषय छान्नुहोस्", practiceNow: "अहिले अभ्यास गर्नुहोस्", startPractice: "अभ्यास सुरु गर्नुहोस्", reviewMistakes: "समीक्षा र गल्तीहरू", savedQuestions: "सुरक्षित प्रश्नहरू", wrongAnswers: "गलत उत्तरहरू", weakTopics: "कमजोर विषय",
    todayMission: "आजको मिशन", startDailyQuiz: "दैनिक क्विज सुरु गर्नुहोस्", practiceWeakSubject: "कमजोर विषय अभ्यास गर्नुहोस्", totalXP: "जम्मा XP", coins: "सिक्का", streak: "स्ट्रीक", currentStreak: "हालको स्ट्रीक", level: "स्तर", rank: "स्थान", accuracy: "शुद्धता", questionsSolved: "हल गरिएका प्रश्न",
    notStartedYet: "अझै सुरु गरिएको छैन", viewProfile: "प्रोफाइल हेर्नुहोस्", noDataYet: "अहिलेसम्म डाटा छैन", continue: "जारी राख्नुहोस्", changeLanguage: "भाषा परिवर्तन गर्नुहोस्", changePreferences: "प्राथमिकता परिवर्तन गर्नुहोस्", language: "भाषा", exam: "परीक्षा", freeMocksLeft: "आज बाँकी निःशुल्क मोक टेस्ट", recommendedPractice: "सिफारिस गरिएको अभ्यास",
    earnedBadges: "प्राप्त ब्याज", studyHistory: "अध्ययन इतिहास", overallRankJourney: "समग्र र्याङ्क यात्रा", currentRank: "हालको र्याङ्क", learner: "विद्यार्थी", examTrack: "परीक्षा ट्र्याक", points: "अंक", correct: "सही भयो", wrong: "गलत भयो", nextQuestion: "अर्को प्रश्न", saveForReview: "समीक्षाका लागि सुरक्षित गर्नुहोस्", reviewWrongAnswers: "गलत उत्तर समीक्षा गर्नुहोस्",
    startDailyQuizPrompt: "दैनिक क्विज सुरु गर्नुहोस्", keepLevelingUp: "स्तर बढाउँदै जानुहोस्!", keepItAliveToday: "आज पनि जारी राख्नुहोस्", preferredLanguage: "रुचाइएको भाषा", xpEarned: "XP प्राप्त", bestStreak: "उत्कृष्ट स्ट्रीक", completeDailyQuiz: "1 दैनिक क्विज पूरा गर्नुहोस्", takeMockTest: "1 मोक टेस्ट दिनुहोस्", completeBonusCoins: "बोनस सिक्का कमाउन सबै पूरा गर्नुहोस्!",
    yourProgress: "तपाईंको प्रगति", viewProgression: "प्रगति हेर्नुहोस्", nextRank: "अर्को र्याङ्क", quickActions: "छिटो कार्यहरू", subjectPractice: "विषय अभ्यास", practiceWeakAreas: "कमजोर भाग अभ्यास गर्नुहोस्", subject: "विषय", solved: "हल गरिएको", mistakes: "गल्तीहरू", status: "अवस्था", nextLevel: "अर्को स्तर", action: "कार्य",
    starting: "सुरु हुँदै", developing: "विकास हुँदै", beginner: "प्रारम्भिक", strong: "बलियो", examReady: "परीक्षा तयार", mastered: "पूर्ण दक्ष", question: "प्रश्न", of: "मध्ये", submitAnswer: "उत्तर पेश गर्नुहोस्", skip: "छोड्नुहोस्", exit: "बाहिर निस्कनुहोस्", correctAnswer: "सही उत्तर", explanation: "व्याख्या",
    practiceComplete: "अभ्यास पूरा भयो", practiceAgain: "फेरि अभ्यास गर्नुहोस्", backToPractice: "अभ्यासमा फर्कनुहोस्", selectedExamTrack: "चयन गरिएको परीक्षा ट्र्याक", selectedLanguage: "चयन गरिएको भाषा", todaysStatus: "आजको अवस्था", open: "खुला", todaysLoksewaDailyQuiz: "आजको लोकसेवा दैनिक क्विज", tenQuestions: "10 प्रश्न",
    dailyQuizDescription: "आजको 10-प्रश्न चुनौती पूरा गरी आफ्नो लोकसेवा स्ट्रीक कायम राख्नुहोस्।", dailyQuizFeatureMixed: "चयन गरिएको परीक्षा ट्र्याकमा आधारित 10 मिश्रित प्रश्न", dailyQuizFeatureCovers: "सामान्य ज्ञान, संविधान, IQ, English, नेपाली, समसामयिक घटना र उपलब्ध विषयहरू समेट्छ", estimatedTime: "अनुमानित समय",
    dailyQuizFeatureStreak: "आज पूरा गरी आफ्नो स्ट्रीक सक्रिय राख्नुहोस्", startTodaysQuiz: "आजको क्विज सुरु गर्नुहोस्", dailyStatus: "दैनिक अवस्था", ready: "तयार", completed: "पूरा भयो", notCompleted: "पूरा भएको छैन", oneRewardToday: "आज एउटा पुरस्कार कमाउन सकिन्छ", questionBank: "प्रश्न बैंक", rewardPreview: "पुरस्कार पूर्वावलोकन", streakReminder: "स्ट्रीक सम्झना", dailyQuizRules: "दैनिक क्विज नियम", recentDailyQuizHistory: "हालको दैनिक क्विज इतिहास",
    insightSummary: "अन्तर्दृष्टि सारांश", whatProgressShows: "तपाईंको प्रगतिले के देखाउँछ", insightsRealHistory: "यी अन्तर्दृष्टिहरू तपाईंको वास्तविक अभ्यास इतिहासबाट गणना गरिएका हुन्।", strongestSubject: "सबैभन्दा बलियो विषय", needsMostAttention: "सबैभन्दा बढी ध्यान चाहिने", mostPracticed: "सबैभन्दा बढी अभ्यास गरिएको", leastPracticed: "सबैभन्दा कम अभ्यास गरिएको",
    growthTracking: "वृद्धि ट्र्याकिङ", xpGrowthRoadmap: "XP वृद्धि र सिकाइ रोडम्याप", xpGrowthRoadmapDesc: "तपाईंको XP कहाँबाट आयो र कुन विषय स्तर अर्को अनलक हुन्छ हेर्नुहोस्।", xpActivity: "XP गतिविधि", recentGrowth: "हालको वृद्धि", latestXpSource: "पछिल्लो XP स्रोत", learningRoadmap: "सिकाइ रोडम्याप", subjectLevelUnlocks: "विषय स्तर अनलकहरू", currentHighestSubjectLevel: "हालको उच्चतम विषय स्तर",
    unlocked: "अनलक भएको", locked: "लक भएको", learningSnapshot: "सिकाइ झलक", overallProgress: "समग्र प्रगति", realData: "वास्तविक डाटा", attempted: "प्रयास गरिएको", subjects: "विषयहरू", bestMastery: "उत्कृष्ट दक्षता", nextBestAction: "अर्को राम्रो कार्य", openReviewCenter: "समीक्षा केन्द्र खोल्नुहोस्", consistencyBuildsMastery: "निरन्तरताले दक्षता बनाउँछ। अघि बढ्नुहोस्!",
    subjectMastery: "विषय दक्षता", masteryBySubject: "विषयअनुसार दक्षता", filterSubjects: "विषय फिल्टर गर्नुहोस्", all: "सबै", practiced: "अभ्यास गरिएको", needsPractice: "अभ्यास चाहिन्छ", notStarted: "सुरु नभएको",
    trackRanking: "आफ्नो र्याङ्क ट्र्याक गर्नुहोस्, XP कमाउनुहोस् र माथि बढ्नुहोस्।", fridayBattle: "शुक्रबार प्रतिस्पर्धा", privacySafeRanking: "गोपनीयता-सुरक्षित र्याङ्किङ", myTournamentRank: "मेरो प्रतियोगिता र्याङ्क", everyQuestionTop: "हरेक उत्तरले तपाईंलाई शीर्ष स्थान नजिक पुर्‍याउँछ!", viewTournamentDetails: "प्रतियोगिता विवरण हेर्नुहोस्", chooseRankingType: "र्याङ्किङ प्रकार छान्नुहोस्", weekly: "साप्ताहिक", monthly: "मासिक", subjectWise: "विषयगत", hallOfFame: "सम्मान सूची", fullLeaderboard: "पूरा लिडरबोर्ड", view: "हेर्नुहोस्", logout: "लगआउट",
    editProfile: "प्रोफाइल सम्पादन गर्नुहोस्", current: "हालको", nextTarget: "अर्को लक्ष्य", xpNeeded: "आवश्यक XP", coinBalance: "सिक्का ब्यालेन्स", earnedFromQuizzes: "क्विज र प्रतियोगिताबाट प्राप्त", dailyHabitStatus: "दैनिक बानी अवस्था", acrossAllPractice: "सबै अभ्यास सत्रहरूमा", accountLevel: "खाता स्तर", tournamentHistory: "प्रतियोगिता इतिहास", recentActivity: "पछिल्लो गतिविधि", noBadgesYet: "अझै कुनै ब्याज प्राप्त भएको छैन", startPracticingXp: "XP कमाउन अभ्यास सुरु गर्नुहोस्",
    badgeShowcase: "ब्याज प्रदर्शन", viewAllBadges: "सबै ब्याज हेर्नुहोस्", studyIdentity: "अध्ययन पहिचान", weakestSubject: "सबैभन्दा कमजोर विषय", recommendedNext: "सिफारिस गरिएको अर्को", preferencesSummary: "प्राथमिकता सारांश", selectedExamTrackTitle: "चयन गरिएको परीक्षा ट्र्याक", publicLeaderboard: "सार्वजनिक लिडरबोर्ड", on: "सक्रिय", off: "निष्क्रिय", notifications: "सूचनाहरू", futureFeature: "भविष्यको सुविधा", soundEffects: "ध्वनि प्रभाव", muted: "म्युट", subjectsPracticed: "अभ्यास गरिएका विषयहरू", studyBreadth: "अध्ययन दायरा",
    achievementShowcase: "उपलब्धि प्रदर्शन", yourAchievementShowcase: "तपाईंको उपलब्धि प्रदर्शन", howToEarnCoins: "सिक्का कसरी कमाउने", recentCoinActivity: "हालको सिक्का गतिविधि", availableBalance: "उपलब्ध ब्यालेन्स", coinWalletNote: "सिक्का वास्तविक पूरा भएका गतिविधिहरूबाट कमाइन्छ। तपाईंका ३ निःशुल्क दैनिक मोक पछि थप मोक टेस्ट जस्ता वैकल्पिक सुविधामा पछि खर्च गर्नुहोस्।", noCoinActivity: "अहिलेसम्म कुनै सिक्का गतिविधि छैन। सिक्का कमाउन दैनिक क्विक च्यालेन्ज वा अभ्यास सत्र पूरा गर्नुहोस्।", maxed: "पूर्ण", statusWord: "अवस्था", days: "दिन", day: "दिन", pts: "अंक",
    notEnoughDataYet: "अझै पर्याप्त डाटा छैन", startPracticingRecommendation: "सिफारिस पाउन अभ्यास सुरु गर्नुहोस्", noTournamentHistory: "अझै कुनै प्रतियोगिता इतिहास छैन। आफ्नो रेकर्ड बनाउन शुक्रबार लोकसेवा ब्याटल खेल्नुहोस्।", topRankReachedLegend: "उच्चतम र्याङ्क प्राप्त भयो — तपाईं PrepQuest Legend हुनुहुन्छ।", days1: "दिन",
    reviewDailyQuiz: "दैनिक क्विज समीक्षा गर्नुहोस्", topRankReached: "उच्चतम र्याङ्क प्राप्त", earnedSuffix: "प्राप्त", notEnoughPracticeYet: "अझै पर्याप्त अभ्यास छैन", completePracticeReveal: "आफ्नो फोकस क्षेत्र देखाउन एउटा अभ्यास सत्र पूरा गर्नुहोस्।", generalKnowledge: "सामान्य ज्ञान",
    welcomeBack: "फेरि स्वागत छ,", dashboardSubtitlePrefix: "को लागि प्रगति ट्र्याक गर्नुहोस्, पुरस्कार कमाउनुहोस्, र अझ राम्रोसँग तयारी गर्नुहोस्", dashboardSubtitleSuffix: "।",
    start: "सुरु गर्नुहोस्", submit: "पेश गर्नुहोस्", next: "अर्को", back: "पछाडि", cancel: "रद्द गर्नुहोस्", save: "सुरक्षित गर्नुहोस्", close: "बन्द गर्नुहोस्", viewDetails: "विवरण हेर्नुहोस्", edit: "सम्पादन गर्नुहोस्", delete: "मेटाउनुहोस्", startQuiz: "क्विज सुरु गर्नुहोस्", tryAgain: "फेरि प्रयास गर्नुहोस्", review: "समीक्षा", more: "थप", goToTournament2: "प्रतियोगितामा जानुहोस्",
    examReadinessTitle: "परीक्षा तयारी", mockTestsTitle: "मोक टेस्ट", mockTestsSubtitle: "परीक्षा-शैलीका लोकसेवा मोक टेस्ट दिनुहोस्, शुद्धता ट्र्याक गर्नुहोस्, कमजोर क्षेत्रहरू पत्ता लगाउनुहोस्, र आफ्नो परीक्षा तयारी सुधार गर्नुहोस्।", bestMockScore: "उत्कृष्ट मोक स्कोर", averageAccuracy: "औसत शुद्धता", completedMocks: "पूरा भएका मोक", noAttempts: "कुनै प्रयास छैन", notReadyStat: "तयार छैन", highestCompletedMock: "उच्चतम पूरा भएको मोक", completeMockToSet: "यो सेट गर्न मोक पूरा गर्नुहोस्", basedOnCompletedMocks: "पूरा भएका मोकमा आधारित", realAttemptsOnly: "वास्तविक प्रयास मात्र", recentMockAverage: "हालैको मोक औसत", takeMockToCalculate: "गणना गर्न मोक दिनुहोस्", realCompletedAttempts: "वास्तविक पूरा प्रयासहरू", todaysFullMock: "आजको पूर्ण मोक टेस्ट", notReadyYet: "अझै तयार छैन", mockHeroSubtitle: "तपाईंको हालको परीक्षा तयारी जाँच्न सन्तुलित २५-प्रश्नको मोक।", mockFormat: "मोक ढाँचा", questions25: "२५ प्रश्न", minutes20: "२० मिनेट", mixedSubjects: "मिश्रित विषय", afterCompletion: "पूरा भएपछि", scoreReport: "स्कोर रिपोर्ट", weakAreas: "कमजोर क्षेत्र", rewardsWord: "पुरस्कार", badgeProgressWord: "ब्याज प्रगति", startFreeMock: "निःशुल्क मोक सुरु गर्नुहोस्", use100Start: "१०० सिक्का प्रयोग गरी मोक सुरु गर्नुहोस्", notEnoughCoins: "पर्याप्त सिक्का छैन", use100Coins: "१०० सिक्का प्रयोग गर्नुहोस्", dailyMockAccess: "दैनिक मोक पहुँच", freeMocksRemainingToday: "आज बाँकी निःशुल्क मोक", useFreeMockCheck: "आजको परीक्षा तयारी जाँच्न आफ्नो निःशुल्क मोक प्रयोग गर्नुहोस्।", usedAllFreeMocks: "तपाईंले आजका सबै निःशुल्क मोक टेस्ट प्रयोग गर्नुभयो।", dailyFreeMockProgress: "दैनिक निःशुल्क मोक प्रगति", usedLabel: "प्रयोग गरिएको", extraAttempt: "अतिरिक्त प्रयास", yourCoins: "तपाईंका सिक्का", freeAttemptsReset: "निःशुल्क प्रयासहरू दैनिक रिसेट हुन्छन्। अतिरिक्त प्रयासले सिक्का प्रयोग गर्छ तर आधारभूत अभ्यास निःशुल्क रहन्छ।", viewMockOptions: "मोक विकल्पहरू हेर्नुहोस्", mockTypeSelection: "मोक प्रकार चयन", recentMockHistory: "हालैको मोक इतिहास", recentLabel: "हालैको", reviewResult: "नतिजा समीक्षा गर्नुहोस्", noMockCompleted: "अझै कुनै मोक टेस्ट पूरा भएको छैन। स्कोर, कमजोर क्षेत्र, र पुरस्कार हेर्न आफ्नो पहिलो मोक दिनुहोस्।", examReadinessPreview: "परीक्षा तयारी पूर्वावलोकन", takeMock: "मोक दिनुहोस्", recentMockReadiness: "हालैको मोक शुद्धता तपाईंको तयारी चेकपोइन्ट बन्छ।", badgeProgressPreview: "ब्याज प्रगति पूर्वावलोकन", mockTestRulesTitle: "मोक टेस्ट नियम", use100CoinsQ: "१०० सिक्का प्रयोग गर्ने?", useCoinsStart: "सिक्का प्रयोग गरी सुरु गर्नुहोस्", difficultyLabel: "कठिनाइ", needsMoreQuestions: "थप प्रश्न चाहिन्छ", balancedMockReady: "सन्तुलित मिश्रित मोक तयार।", notEnoughQuestionsMock: "यो मोक टेस्टका लागि अहिले पर्याप्त प्रमाणित प्रश्नहरू उपलब्ध छैनन्। यो मोक सुरु गर्नुअघि प्रश्न बैंकमा थप समीक्षा गरिएका प्रश्नहरू थप्नुहोस्।", usedAllFreeMocksMsg: "तपाईंले आजका सबै ३ निःशुल्क मोक टेस्ट प्रयोग गर्नुभयो। अतिरिक्त मोक टेस्टको मूल्य १०० सिक्का हो। दैनिक क्विज, अभ्यास, वा भोलिको निःशुल्क मोकबाट थप सिक्का कमाउनुहोस्।", willUseFreeAttempt: "पेश गरेपछि यसले आजका लागि तपाईंका ३ निःशुल्क मोक प्रयासमध्ये १ प्रयोग गर्नेछ।", extraCosts100: "तपाईंले आज सबै निःशुल्क मोक प्रयोग गर्नुभयो। यो अतिरिक्त प्रयासको मूल्य १०० सिक्का हो।", completeToEarnCoins: "थप सिक्का कमाउन दैनिक क्विज वा अभ्यास पूरा गर्नुहोस्।", scoreLabel: "स्कोर", timeLabel: "समय", weakSubjectLabel: "कमजोर विषय",
    learningAnalytics: "सिकाइ विश्लेषण", progressionSubtitle: "वास्तविक सिकाइ वृद्धि, विषय दक्षता, XP गतिविधि, र समीक्षा प्रगति ट्र्याक गर्नुहोस्।", goToPractice: "अभ्यासमा जानुहोस्", compareSubjectXp: "वास्तविक विषय XP, शुद्धता, हल गरिएका प्रश्न, र स्तर प्रगति तुलना गर्नुहोस्।", viewByPracticeStatus: "अभ्यास अवस्था अनुसार विषयहरू हेर्नुहोस्।", maxLevelReached: "अधिकतम स्तर पुगियो", noSubjectsMatchFilter: "कुनै विषय यो फिल्टरसँग मेल खाँदैन", completeToCompareMastery: "विषय दक्षता तुलना गर्न एउटा अभ्यास सत्र पूरा गर्नुहोस्।", noXpActivityYet: "अझै कुनै XP गतिविधि छैन", noXpActivityDesc: "अझै कुनै XP गतिविधि छैन। अभ्यासमा सही उत्तरहरू यहाँ देखिनेछन्।", reviewNextSteps: "समीक्षा र अर्को कदम", mistakeReviewGoals: "गल्ती समीक्षा र सिकाइ लक्ष्यहरू", useReviewData: "अब के गर्ने भनी निर्णय गर्न समीक्षा डाटा र कमजोर क्षेत्र इतिहास प्रयोग गर्नुहोस्।", reviewProgress: "समीक्षा प्रगति", savedAndMistakes: "सुरक्षित र गल्तीहरू", masteredMistakes: "सुधारिएका गल्तीहरू", mostMissedTopic: "सबैभन्दा धेरै छुटेको विषय", noReviewData: "अझै कुनै समीक्षा डाटा छैन", noSavedOrWrong: "अझै कुनै सुरक्षित वा गलत प्रश्न छैन। अभ्यासको क्रममा कठिन प्रश्नहरू सुरक्षित गर्नुहोस्।", nextSteps: "अर्को कदम", next3Goals: "अर्को ३ सिकाइ लक्ष्यहरू", futureAnalytics: "भविष्यको विश्लेषण", futureAnalyticsDesc: "ती प्रणालीहरू जोडिएपछि मोक टेस्ट, प्रतियोगिता, र ब्याज विश्लेषण यहाँ देखिनेछन्।", noSubjectAnalysis: "अझै कुनै विषय विश्लेषण छैन", noWeakSubject: "अझै कुनै कमजोर विषय पत्ता लागेको छैन", completeToReveal: "यो देखाउन एउटा अभ्यास सत्र पूरा गर्नुहोस्।", wrongLowAccuracyAppear: "गलत उत्तर र कम शुद्धता यहाँ देखिनेछ।", noSolvedRecorded: "अझै कुनै हल गरिएको प्रश्न रेकर्ड भएको छैन।",
    achievementSystem: "उपलब्धि प्रणाली", badgesUnlockDesc: "क्विज, अभ्यास, मोक टेस्ट, स्ट्रीक, प्रतियोगिता, र शुद्धताबाट उपलब्धिहरू अनलक गर्नुहोस्।", lockedBadges: "लक भएका ब्याज", visibleUnlockGoals: "देखिने अनलक लक्ष्य", nextBadge: "अर्को ब्याज", closestToUnlocking: "अनलक हुन सबैभन्दा नजिक", rareBadgesAvailable: "दुर्लभ ब्याज उपलब्ध", premiumAchievementPaths: "प्रिमियम उपलब्धि मार्ग", nextBadgeProgress: "अर्को ब्याज प्रगति", hiddenAchievementReach: "एउटा लुकेको उपलब्धि पहुँचभित्र छ।", keepPlayingDiscover: "यो ब्याज पत्ता लगाउन खेल्दै रहनुहोस्।", noBadgesMatchFilter: "अझै कुनै ब्याज यो फिल्टरसँग मेल खाँदैन।", keepPracticingUnlock: "थप उपलब्धिहरू अनलक गर्न अभ्यास गर्दै रहनुहोस्।", earnedWord: "प्राप्त", lockedWord: "लक", hidden: "लुकेको", requirement: "आवश्यकता", rarityWord: "दुर्लभता", previewUnlock: "अनलक एनिमेसन पूर्वावलोकन गर्नुहोस्",
    resultsAfterFinish: "प्रतियोगिता सकिएपछि नतिजा देखिनेछ।", resultWord: "नतिजा", finalTournamentResults: "अन्तिम प्रतियोगिता नतिजा", podiumWinners: "पोडियम विजेता", pending: "बाँकी", yourBattleResult: "तपाईंको ब्याटल नतिजा", rewardsSavedOnce: "पुरस्कार एकपटक सुरक्षित गरिएको छ र रिफ्रेसमा दोहोरिँदैन।", reviewAnswers: "उत्तर समीक्षा गर्नुहोस्", viewFullLeaderboard: "पूरा लिडरबोर्ड हेर्नुहोस्", finalRank: "अन्तिम र्‍याङ्क", correctAnswersLabel: "सही उत्तरहरू", wrongAnswersLabel: "गलत उत्तरहरू", totalMissed: "जम्मा छुटेका", coinsEarned: "कमाएका सिक्का", badgeEarnedLabel: "प्राप्त ब्याज", nameWord: "नाम", rewardWord: "पुरस्कार", participantsWord: "सहभागी", answeredWord: "उत्तर दिइएको", coinsWord: "सिक्का",
    liveBattleUnavailable: "लाइभ ब्याटल अनुपलब्ध छ।", answerLockedWaiting: "उत्तर लक भयो। रिभिलको पर्खाइमा।", youreReady: "तपाईं तयार हुनुहुन्छ। प्रश्न १ सर्भर समयमा सुरु हुन्छ।", couldNotMarkReady: "तपाईंलाई तयार चिन्ह लगाउन सकिएन।", chooseAnswerBeforeLock: "लक गर्नुअघि एउटा उत्तर छान्नुहोस्।", couldNotLockAnswer: "उत्तर लक गर्न सकिएन।", noAnswerSubmitted: "कुनै उत्तर पेश गरिएन", mustRegisterBattle: "लाइभ प्रतियोगिता ब्याटलमा प्रवेश गर्नुअघि तपाईं दर्ता हुनुपर्छ।", backToTournament: "प्रतियोगितामा फर्कनुहोस्", liveBattle: "लाइभ ब्याटल", exitBattle: "ब्याटलबाट बाहिर निस्कनुहोस्", getReadyFriday: "शुक्रबार लाइभ प्रतियोगिताका लागि तयार हुनुहोस्", totalRegistered: "जम्मा दर्ता", mixedWord: "मिश्रित", languageModeLabel: "भाषा मोड", formatLabel: "ढाँचा", twentyMixedQuestions: "२० मिश्रित प्रश्न", ruleSpeedBonus50: "गति बोनस +५० अंकसम्म", ruleAnswersLock: "पेश गरेपछि उत्तर लक हुन्छ", ruleSpeedRewards: "गति बोनसले छिटो सही उत्तरलाई पुरस्कृत गर्छ", registeredParticipants: "दर्ता भएका सहभागी", noUsersRegistered: "अझै कुनै प्रयोगकर्ता दर्ता छैन।", enteredTournament: "प्रतियोगितामा प्रवेश गरियो", q1StartsShared: "प्रश्न १ सबैका लागि साझा सर्भर घडीबाट एकैसाथ सुरु हुन्छ।", battleStartingSoon: "ब्याटल चाँडै सुरु हुँदै", nextStarts15: "अर्को प्रश्न १५ सेकेन्डमा सुरु हुन्छ।", liveRankingCheckpoint: "लाइभ र्‍याङ्किङ चेकपोइन्ट", notRankedYet: "अझै र्‍याङ्क भएको छैन", chooseCarefullyChange: "ध्यानपूर्वक छान्नुहोस्। लक गर्नुअघि तपाईं आफ्नो उत्तर परिवर्तन गर्न सक्नुहुन्छ।", timesUpZero: "समय सकियो · +० अंक", scoringPreview: "सही उत्तर: +१०० · गति बोनस: +० देखि +५० · अधिकतम: १५०", locking: "लक गर्दै...", lockAnswer: "उत्तर लक गर्नुहोस्", battleWord: "ब्याटल", unanswered: "नदिएको", notCorrect: "सही होइन", timesUp: "समय सकियो", yourAnswerNotCorrect: "तपाईंले छानेको उत्तर सही थिएन।", noAnswerWasSubmitted: "कुनै उत्तर पेश गरिएन।", pointsEarned: "प्राप्त अंक", basePoints: "आधार अंक", liveState: "लाइभ अवस्था", answerBeforeTimer: "सर्भर टाइमर सकिनुअघि उत्तर दिनुहोस्", revealAfter15: "१५-सेकेन्ड टाइमर बन्द भएपछि मात्र सही वा गलत देखिन्छ।", notEnoughTournamentQuestions: "अझै पर्याप्त प्रमाणित प्रतियोगिता प्रश्नहरू उपलब्ध छैनन्।", points0: "+० अंक", unansweredWord: "नदिएको", reveal: "रिभिल",
    fridayLiveTournament: "शुक्रबार लाइभ प्रतियोगिता", tournamentIntro: "एकपटक दर्ता गर्नुहोस्, सर्भर काउन्टडाउन कुर्नुहोस्, त्यसपछि चेकपोइन्ट र्‍याङ्किङ र अन्तिम पोडियम नतिजासहित समयबद्ध लाइभ लोकसेवा ब्याटलमा प्रवेश गर्नुहोस्।", startsIn: "सुरु हुन्छ", noBettingNoCoinLoss: "कुनै बाजी छैन। कुनै सिक्का घाटा छैन।", viewRules: "नियम हेर्नुहोस्", pleaseWait: "कृपया पर्खनुहोस्...", unavailable: "अनुपलब्ध", joinTournament: "प्रतियोगितामा सहभागी हुनुहोस्", registered: "दर्ता भयो", enterTournament: "प्रतियोगितामा प्रवेश गर्नुहोस्", registrationClosed: "दर्ता बन्द", enterBattle: "ब्याटलमा प्रवेश गर्नुहोस्", viewResults: "नतिजा हेर्नुहोस्", alreadyRegistered: "तपाईं यो प्रतियोगिताका लागि पहिले नै दर्ता हुनुभएको छ।", tournamentServerUnavailable: "प्रतियोगिता सर्भर अनुपलब्ध छ।", couldNotRegister: "यो प्रतियोगिताका लागि दर्ता गर्न सकिएन।",
    registrationCountdown: "दर्ता काउन्टडाउन", battleStartsAuto: "ब्याटल स्वतः सुरु हुन्छ", registeredUsers: "दर्ता भएका प्रयोगकर्ता", notRegistered: "दर्ता भएको छैन", yourStatus: "तपाईंको अवस्था", joinBeforeCountdown: "काउन्टडाउन शून्य पुग्नुअघि सहभागी हुनुहोस्", tournamentStatus: "प्रतियोगिता अवस्था", serverControlled: "सर्भर नियन्त्रित", readyRoom: "रेडी रूम", countdown: "काउन्टडाउन", questionsWord: "प्रश्नहरू", ranking: "र्‍याङ्किङ", afterQuestions51015: "प्रश्न ५, १०, र १५ पछि", registrationClosedDot: "दर्ता बन्द।",
    liveBattleRules: "लाइभ ब्याटल नियम", fairScoring: "निष्पक्ष स्कोरिङ", rule20Questions: "२० मिश्रित लोकसेवा प्रश्न", rule15Seconds: "प्रति प्रश्न १५ सेकेन्ड", ruleCorrect100: "सही उत्तरले +१०० अंक दिन्छ", ruleSpeedBonus: "छिटो सही उत्तरले +० देखि +५० गति बोनस कमाउँछ", ruleMax150: "प्रति प्रश्न अधिकतम: १५० अंक", ruleWrong0: "गलत वा नदिएको उत्तरले ० अंक दिन्छ", ruleAnswerLocks: "पेश गरेपछि उत्तर लक हुन्छ र परिवर्तन गर्न सकिँदैन", ruleRevealAfterTimer: "टाइमर बन्द भएपछि मात्र सही/गलत देखिन्छ", ruleCheckpoints: "प्रश्न ५, १०, र १५ पछि चेकपोइन्ट", ruleMissedUnanswered: "छुटेका प्रश्नहरू नदिएको रूपमा गनिन्छ", ruleNoBetting: "कुनै बाजी छैन। प्रयोगकर्ताले कहिल्यै सिक्का गुमाउँदैनन्।", correctAnswerLabel: "सही उत्तर", speedBonus: "गति बोनस", maxPerQuestion: "प्रति प्रश्न अधिकतम", wrongUnanswered: "गलत / नदिएको", scoringNote: "ध्यानपूर्वक छान्नुहोस् - एकपटक पेश गरेपछि, तपाईंको उत्तर परिवर्तन गर्न सकिँदैन। १५ सेकेन्ड बाँकी हुँदा सही = १५० अंक; ८ सेकेन्डमा = लगभग १२७; १ सेकेन्डमा = लगभग १०३।",
    leaderboardWillAppear: "सहभागीहरूले लाइभ प्रश्नहरूको उत्तर दिएपछि लिडरबोर्ड देखिनेछ।", tournamentRewards: "प्रतियोगिता पुरस्कार", podium: "पोडियम", rewardsAppliedOnce: "नतिजा प्रकाशित हुँदा पुरस्कार एकपटक लागू हुन्छ।", firstPlace: "पहिलो स्थान", secondPlace: "दोस्रो स्थान", thirdPlace: "तेस्रो स्थान", top10: "शीर्ष १०", allParticipants: "सबै सहभागी", goldChampionBadge: "स्वर्ण च्याम्पियन ब्याज", silverChampionBadge: "रजत च्याम्पियन ब्याज", bronzeChampionBadge: "कांस्य च्याम्पियन ब्याज", topPerformerBadge: "शीर्ष प्रदर्शक ब्याज", notSelected: "चयन गरिएको छैन", both: "दुवै",
    tournamentRankDesc: "शुक्रबार लोकसेवा ब्याटल प्रदर्शनमा आधारित र्‍याङ्किङ।", weeklyRankDesc: "पछिल्लो ७ दिनमा कमाएको XP अनुसार र्‍याङ्किङ।", monthlyRankDesc: "पछिल्लो ३० दिनमा कमाएको XP अनुसार र्‍याङ्किङ।", subjectRankDesc: "विषय XP, शुद्धता, र हल गरिएका प्रश्न अनुसार र्‍याङ्किङ।", examTrackRankDesc: "परीक्षा ट्र्याकभित्र जम्मा XP अनुसार र्‍याङ्किङ।", hallOfFameRankDesc: "जम्मा XP, ब्याज, र दीर्घकालीन निरन्तरता।",
    thisWeek: "यो हप्ता", lastWeek: "गत हप्ता", thisMonth: "यो महिना", lastMonth: "गत महिना", lifetimeXPFilter: "जम्मा XP", lifetimeTournamentWins: "जम्मा प्रतियोगिता जित", lifetimeBadges: "जम्मा ब्याज",
    subjectXP: "विषय XP", lifetimeXPHeader: "जम्मा XP", wins: "जित", monthlyXP: "मासिक XP", examXP: "परीक्षा XP", weeklyXP: "साप्ताहिक XP", rankingSuffix: "र्‍याङ्किङ", you: "तपाईं", youHaventJoined: "तपाईं अझै सहभागी हुनुभएको छैन", youHaventPlayed: "तपाईंले अझै खेल्नुभएको छैन", finalPublicRankings: "अन्तिम सार्वजनिक र्‍याङ्किङ तल देखाइएको छ। बोर्डमा देखिन अर्को शुक्रबार लोकसेवा ब्याटलमा सहभागी हुनुहोस्।", takeFridayBattle: "शुक्रबार लोकसेवा ब्याटल खेल्नुहोस् र आफ्नो चढाइ सुरु गर्नुहोस्!", leaderboardPrivacyNote: "तपाईंको पङ्क्तिले तपाईंको वास्तविक सुरक्षित प्रगति देखाउँछ। अन्य विद्यार्थीहरू र्‍याङ्किङ सन्दर्भका लागि देखाइएका हुन् र केवल सार्वजनिक, गोपनीयता-सुरक्षित विवरण मात्र देखाइन्छ।", goldChampion: "स्वर्ण च्याम्पियन", silverChampion: "रजत च्याम्पियन", bronzeChampion: "कांस्य च्याम्पियन", lvAbbr: "स्तर",
    climbingRanks: "र्‍याङ्कमा माथि चढ्दै", defaultLearnerAbout: "यो विद्यार्थीले PrepQuest Nepal मा प्रगति बनाउँदै छ।", aboutWord: "बारेमा", pointsLower: "अंक",
    retry: "पुनः प्रयास", goToTournament: "प्रतियोगितामा जानुहोस्", startPractice: "अभ्यास सुरु गर्नुहोस्", practiceSubjectBtn: "विषय अभ्यास गर्नुहोस्", emptyTournamentErrorTitle: "अहिले प्रतियोगिता नतिजा लोड गर्न सकिएन।", emptyTournamentErrorBody: "कृपया आफ्नो जडान जाँच गर्नुहोस् वा पछि फेरि प्रयास गर्नुहोस्।", emptyTournamentTitle: "अझै कुनै प्रतियोगिता नतिजा छैन।", emptyTournamentBody: "विद्यार्थीहरूले शुक्रबार लोकसेवा ब्याटल पूरा गरेपछि र्‍याङ्किङ देखिनेछ।", emptyWeeklyTitle: "अझै कुनै साप्ताहिक र्‍याङ्किङ छैन।", emptyWeeklyBody: "यहाँ देखिन यो हप्ता क्विज, अभ्यास सत्र, वा मोक टेस्ट पूरा गर्नुहोस्।", emptyMonthlyTitle: "अझै कुनै मासिक र्‍याङ्किङ छैन।", emptyMonthlyBody: "मासिक लिडरबोर्डमा देखिन यो महिना XP कमाउनुहोस्।", emptySubjectTitle: "अझै कुनै विषयगत र्‍याङ्किङ छैन।", emptyExamTrackTitle: "यो परीक्षा ट्र्याकका लागि अझै कुनै र्‍याङ्किङ छैन।", emptyExamTrackBody: "तपाईंले XP कमाउँदै जाँदा तपाईंको वास्तविक प्रगति यहाँ देखिनेछ।", emptyHallOfFameTitle: "अझै कुनै सम्मान सूची र्‍याङ्किङ छैन।", emptyHallOfFameBody: "तपाईंले जम्मा XP बनाउँदै जाँदा दीर्घकालीन र्‍याङ्किङ देखिनेछ।", emptyDefaultTitle: "अझै कुनै र्‍याङ्किङ डाटा छैन।", emptyDefaultBody: "आफ्नो वास्तविक तथ्याङ्क बनाउन अभ्यास सुरु गर्नुहोस्।",
    dailyQuizCompleted: "दैनिक क्विज पूरा भयो", dailyQuizCompletedDesc: "तपाईंले आजको क्विज पहिले नै पूरा गरिसक्नुभयो र आजको पुरस्कार कमाउनुभयो। नयाँ चुनौतीका लागि भोलि फेरि आउनुहोस्।", weakest: "सबैभन्दा कमजोर", none: "कुनै छैन", reviewTodaysResult: "आजको नतिजा हेर्नुहोस्", practiceWeakSubjectAction: "कमजोर विषय अभ्यास गर्नुहोस्", goToDashboard: "ड्यासबोर्डमा जानुहोस्", notEnoughValidatedQuestions: "आजको क्विजका लागि अहिले पर्याप्त प्रमाणित प्रश्नहरू उपलब्ध छैनन्।", addMoreQuestions: "दैनिक क्विज सुरु गर्नुअघि प्रश्न बैंकमा थप समीक्षा गरिएका प्रश्नहरू थप्नुहोस्।", validatedQuestionsAvailable: "प्रमाणित प्रश्न उपलब्ध", estimatedTimeValue: "८-१० मिनेट", streakReminderDesc: "आफ्नो दैनिक बानी सक्रिय राख्न आज पूरा गर्नुहोस्। दैनिक क्विज पूरा गरेको आजको गतिविधिको रूपमा भण्डारण गरिन्छ।", previousResult: "अघिल्लो नतिजा", rule10Mixed: "१० मिश्रित प्रश्न", ruleOneReward: "दिनको एक पुरस्कार", ruleInstantFeedback: "प्रत्येक उत्तरपछि तुरुन्त प्रतिक्रिया", ruleWrongSaved: "गलत उत्तरहरू समीक्षाका लागि सुरक्षित गरिन्छ", ruleCompleteHabit: "आफ्नो दैनिक बानी सक्रिय राख्न क्विज पूरा गर्नुहोस्", noDailyQuizAttempts: "अझै कुनै दैनिक क्विज प्रयास छैन।",
    complete: "पूरा", rewardsAfterCompletion: "पुरस्कार पूरा भएपछि गणना गरिन्छ", answerSavedFinal: "अन्तिम स्कोरिङका लागि उत्तर सुरक्षित गरियो", selectOneOption: "पेश गर्न एउटा विकल्प छान्नुहोस्", savedState: "सुरक्षित गरियो", sessionWord: "सत्र", savedLabel: "सुरक्षित", currentQuestion: "हालको प्रश्न", weakSubjectRecommendation: "कमजोर विषयको सिफारिस छुटेका उत्तरहरूबाट गणना गरिनेछ।", submitToGenerateInsights: "आफ्नो नतिजा अन्तर्दृष्टि उत्पन्न गर्न उत्तरहरू पेश गर्नुहोस्।", feedbackWord: "प्रतिक्रिया", answerWhenReady: "तयार भएपछि उत्तर दिनुहोस्", timerAwarenessNote: "टाइमर केवल जानकारीका लागि हो। यसले स्वतः पेश गर्दैन वा ढिलो उत्तरलाई दण्ड दिँदैन।", noXpPerQuestion: "प्रति प्रश्न कुनै XP दिइँदैन", scoreWord: "स्कोर", rewardColon: "पुरस्कार:", reviewExplanationBelow: "तलको व्याख्या हेर्नुहोस्", noValidatedQuestions: "कुनै प्रमाणित अभ्यास प्रश्न फेला परेन", subjectBankNotReady: "यो विषयको प्रश्न बैंक अहिले तयार छैन।", highestLevelReached: "उच्चतम विषय स्तर प्राप्त।", yourAnswer: "तपाईंको उत्तर", niceWorkCorrect: "राम्रो काम — तपाईंको उत्तर सही थियो।", goodAttempt: "राम्रो प्रयास। सुधार हेरेर अघि बढ्नुहोस्।", xpGained: "प्राप्त XP:", progressSaved: "प्रगति सुरक्षित गरियो", reviewThisTopic: "अर्को अभ्यास अघि यो विषय समीक्षा गर्नुहोस्।",
    practicePageSubtitle: "प्रत्येक विषय चरणबद्ध रूपमा सिक्नुहोस् र आफ्नो ज्ञानको स्तर बढाउनुहोस्।", maxLevel: "अधिकतम", toLabel: "सम्म", reviewSaved: "सुरक्षित समीक्षा गर्नुहोस्", savedWord: "सुरक्षित", bookmarkedQuestions: "अभ्यासको क्रममा तपाईंले बुकमार्क गरेका प्रश्नहरू।", toReviewSuffix: "समीक्षा गर्न बाँकी", noMistakesYet: "अझै कुनै गल्ती छैन", learnFromMistakes: "व्याख्यासहित गल्तीबाट सिक्नुहोस्।", reviewMistakesAction: "गल्ती समीक्षा गर्नुहोस्", mostMissedRecent: "हालैको अभ्यासबाट सबैभन्दा धेरै छुटेको विषय।", practiceTopic: "विषय अभ्यास गर्नुहोस्", revisitSaved: "अर्को अभ्यास अघि सुरक्षित प्रश्नहरू हेर्नुहोस् र आफ्ना कमजोर क्षेत्रहरू सुधार्नुहोस्।",
    howXpWorks: "XP र ग्यामिफिकेसन कसरी काम गर्छ", howXpWorksDesc: "प्रगति, पुरस्कार, र अनलकहरू कसरी कमाइन्छ भन्ने छोटो मार्गदर्शन।", earnXp: "XP कमाउनुहोस्", earnXpDesc: "प्रत्येक सही अभ्यास उत्तरले +१० XP दिन्छ।", levelUpSubjects: "विषयको स्तर बढाउनुहोस्", levelUpSubjectsDesc: "विषय XP ले नयाँ अभ्यास मोड र कठिन चुनौतीहरू अनलक गर्छ।", buildStreaks: "स्ट्रीक बनाउनुहोस्", buildStreaksDesc: "दैनिक सिकाइले तपाईंको स्ट्रीक बढाउँछ र स्ट्रीक ब्याज अनलक गर्न सक्छ।", earnCoins: "सिक्का कमाउनुहोस्", earnCoinsDesc: "सिक्का दैनिक च्यालेन्ज, मोक, प्रतियोगिता, ब्याज, र बलियो अभ्यासबाट आउँछ।", unlockBadges: "ब्याज अनलक गर्नुहोस्", unlockBadgesDesc: "वास्तविक आवश्यकताहरू पूरा हुँदा ब्याज स्वतः अनलक हुन्छ।", improveWeakAreas: "कमजोर क्षेत्र सुधार्नुहोस्", improveWeakAreasDesc: "गलत उत्तर र कमजोर विषयहरू ट्र्याक गरिन्छ ताकि तपाईं समीक्षा गरी सुधार गर्न सक्नुहोस्।", consistentPracticeBold: "निरन्तर अभ्यासले पूर्णता ल्याउँछ!", consistentPracticeRest: "आफ्नो स्ट्रीक जीवित राख्नुहोस् र लिडरबोर्डमा माथि चढ्नुहोस्।", questionBankNotReadyTitle: "प्रश्न बैंक तयार छैन", questionsNotAvailable: "प्रमाणित अभ्यास प्रश्नहरू अहिले उपलब्ध छैनन्।", saved: "सुरक्षित",
  },
};

const subjectTranslations = {
  "General Knowledge": "सामान्य ज्ञान",
  "Constitution of Nepal": "नेपालको संविधान",
  "Current Affairs": "समसामयिक घटनाक्रम",
  "IQ / Mental Ability": "आईक्यू / मानसिक क्षमता",
  "General Ability / IQ": "सामान्य क्षमता / आईक्यू",
  "Governance Basics": "शासनका आधारभूत कुरा",
  "Public Administration Basics": "सार्वजनिक प्रशासनका आधारभूत कुरा",
  "Public Administration": "सार्वजनिक प्रशासन",
  "Nepali Grammar": "नेपाली व्याकरण",
  Nepali: "नेपाली",
  // Common topic labels (non-English subjects) shown as question chips.
  Citizenship: "नागरिकता",
  "Geography of Nepal": "नेपालको भूगोल",
  "Nepal Economy": "नेपालको अर्थतन्त्र",
  "Public Policy": "सार्वजनिक नीति",
  "Rule of Law": "कानूनको शासन",
  Environment: "वातावरण",
  "Science Basics": "विज्ञानका आधारभूत कुरा",
  "Public Health": "सार्वजनिक स्वास्थ्य",
  "World Organizations": "विश्व संगठनहरू",
};

const rankTranslations = {
  "New Aspirant": "नयाँ आकांक्षी",
  "Focused Learner": "केन्द्रित विद्यार्थी",
  "Kharidar Candidate": "खरिदार उम्मेदवार",
  "Nayab Subba Candidate": "नायब सुब्बा उम्मेदवार",
  "Officer Candidate": "अधिकृत उम्मेदवार",
  "Loksewa Warrior": "लोकसेवा योद्धा",
  "Public Service Master": "सार्वजनिक सेवा मास्टर",
};

const examTranslations = {
  "Nayab Subba": "नायब सुब्बा",
  "Sakha Adhikrit": "शाखा अधिकृत",
  Kharidar: "खरिदार",
  "Computer Operator": "कम्प्युटर अपरेटर",
  "Banking Exam": "बैंकिङ परीक्षा",
  "Teacher Service Commission": "शिक्षक सेवा आयोग",
};

// Badge display names (best-effort; English fallback when no entry). Internal
// badge IDs are unaffected — only the shown label changes.
const badgeTextTranslations = {
  "First Step Badge": "पहिलो कदम ब्याज",
  "Constitution Starter": "संविधान सुरुवातकर्ता",
  "Daily Learner": "दैनिक विद्यार्थी",
  "GK Champion": "सामान्य ज्ञान च्याम्पियन",
  "Gold Champion Badge": "स्वर्ण च्याम्पियन ब्याज",
  "Silver Champion Badge": "रजत च्याम्पियन ब्याज",
  "Bronze Champion Badge": "कांस्य च्याम्पियन ब्याज",
  "Top Performer Badge": "शीर्ष प्रदर्शक ब्याज",
};

const rarityTranslations = {
  Common: "सामान्य",
  Rare: "दुर्लभ",
  Epic: "इपिक",
  Legendary: "लिजेन्डरी",
  Mythic: "पौराणिक",
};

const difficultyTranslations = {
  Easy: "सजिलो",
  Medium: "मध्यम",
  Hard: "कठिन",
  easy: "सजिलो",
  medium: "मध्यम",
  hard: "कठिन",
};

const badgeCategoryTranslations = {
  Starter: "सुरुवाती",
  Practice: "अभ्यास",
  "Daily Quiz": "दैनिक क्विज",
  Streak: "स्ट्रीक",
  Tournament: "प्रतियोगिता",
  Accuracy: "शुद्धता",
  "Subject Mastery": "विषय दक्षता",
  Rare: "दुर्लभ",
  Mythic: "पौराणिक",
  Common: "सामान्य",
  Mock: "मोक टेस्ट",
  "Mock Test": "मोक टेस्ट",
};

const levelNameTranslations = {
  Beginner: "प्रारम्भिक",
  Learner: "विद्यार्थी",
  Developing: "विकास हुँदै",
  Strong: "बलियो",
  "Exam Ready": "परीक्षा तयार",
  Mastered: "पूर्ण दक्ष",
  "Not Started": "सुरु नभएको",
};

const textTranslations = {
  "Not Started": "सुरु नभएको",
  "Not Started Yet": "अझै सुरु गरिएको छैन",
  Starting: "सुरु हुँदै",
  Developing: "विकास हुँदै",
  Strong: "बलियो",
  "Exam Ready": "परीक्षा तयार",
  "Needs Practice": "अभ्यास चाहिन्छ",
  "Question Bank Not Ready": "प्रश्न बैंक तयार छैन",
  "View Profile": "प्रोफाइल हेर्नुहोस्",
  "Practice Now": "अहिले अभ्यास गर्नुहोस्",
  "Open Review Center": "समीक्षा केन्द्र खोल्नुहोस्",
  "Start Practice": "अभ्यास सुरु गर्नुहोस्",
  "Go to Practice": "अभ्यासमा जानुहोस्",
  "Review wrong answers": "गलत उत्तर समीक्षा गर्नुहोस्",
  "Practice Weak Subject": "कमजोर विषय अभ्यास गर्नुहोस्",
  "View Progression": "प्रगति हेर्नुहोस्",
  "No data yet": "अहिलेसम्म डाटा छैन",
  // Coin "how to earn" guide (Profile coin wallet)
  "Complete daily quick challenge": "दैनिक क्विक च्यालेन्ज पूरा गर्नुहोस्",
  "Score 80%+ in daily challenge": "दैनिक च्यालेन्जमा ८०%+ स्कोर गर्नुहोस्",
  "Score 80%+ in practice": "अभ्यासमा ८०%+ स्कोर गर्नुहोस्",
  "Complete recommended weak subject practice": "सिफारिस गरिएको कमजोर विषय अभ्यास पूरा गर्नुहोस्",
  "Level up a subject": "विषयको स्तर बढाउनुहोस्",
  "Master a subject": "विषयमा दक्ष बन्नुहोस्",
  "Complete a mock test": "मोक टेस्ट पूरा गर्नुहोस्",
  "Score 80%+ in a mock test": "मोक टेस्टमा ८०%+ स्कोर गर्नुहोस्",
  "Join / complete Friday tournament": "शुक्रबार प्रतियोगितामा सहभागी / पूरा गर्नुहोस्",
  "Rank top 3 in tournament": "प्रतियोगितामा शीर्ष ३ मा स्थान बनाउनुहोस्",
  "Unlock badges with coin rewards": "सिक्का पुरस्कारसहितका ब्याज अनलक गर्नुहोस्",
  bonus: "बोनस",
  varies: "फरक-फरक",
  "XP Earned": "XP प्राप्त",
  // Progression next-best-action titles / labels + subject filter labels
  "Review wrong answers": "गलत उत्तर समीक्षा गर्नुहोस्",
  "Start Subject": "विषय सुरु गर्नुहोस्",
  "Continue Practice": "अभ्यास जारी राख्नुहोस्",
  "Start Quick Practice": "द्रुत अभ्यास सुरु गर्नुहोस्",
  "Start First Practice": "पहिलो अभ्यास सुरु गर्नुहोस्",
  Practiced: "अभ्यास गरिएको",
  "Needs Practice": "अभ्यास चाहिन्छ",
};

export function getPreferredLanguage() {
  if (typeof window === "undefined") return "english";
  return normalizeLanguageMode(localStorage.getItem("preferredLanguage"));
}

export function t(key, language = getPreferredLanguage()) {
  const mode = normalizeLanguageMode(language);
  return translations[mode]?.[key] || translations.english[key] || key;
}

export function languageLabel(language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali" ? "नेपाली" : "English";
}

const subjectTranslationsLower = Object.fromEntries(
  Object.entries(subjectTranslations).map(([key, value]) => [key.toLowerCase(), value])
);

export function translateSubjectName(name, language = getPreferredLanguage()) {
  if (normalizeLanguageMode(language) !== "nepali" || !name) return name;
  const lower = String(name).toLowerCase();
  if (lower === "english" || lower === "english grammar") return name;
  return subjectTranslations[name] || subjectTranslationsLower[lower] || name;
}

export function translateRankName(name, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali" ? rankTranslations[name] || name : name;
}

export function translateExamName(name, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali" ? examTranslations[name] || name : name;
}

export function translateLevelName(name, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali" ? levelNameTranslations[name] || name : name;
}

export function trText(text, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali" ? textTranslations[text] || text : text;
}

export function translateBadgeCategory(name, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali" ? badgeCategoryTranslations[name] || name : name;
}

export function translateDifficulty(name, language = getPreferredLanguage()) {
  if (!name) return name;
  return normalizeLanguageMode(language) === "nepali" ? difficultyTranslations[name] || name : name;
}

export function translateRarity(name, language = getPreferredLanguage()) {
  if (!name) return name;
  return normalizeLanguageMode(language) === "nepali" ? rarityTranslations[name] || name : name;
}

// Translates the Badges page filter pills (mix of All/Earned/Locked, rarities,
// and category names).
export function translateBadgeFilter(filter, language = getPreferredLanguage()) {
  if (normalizeLanguageMode(language) !== "nepali") return filter;
  const special = {
    All: "सबै", Earned: "प्राप्त", Locked: "लक", Rare: "दुर्लभ", Mythic: "पौराणिक",
  };
  return special[filter] || badgeCategoryTranslations[filter] || filter;
}

// Best-effort badge name/description translation (falls back to English when no
// Nepali entry exists, mirroring how question content behaves).
export function translateBadgeText(text, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali" ? badgeTextTranslations[text] || text : text;
}

export function formatLevel(level, name, language = getPreferredLanguage()) {
  const label = `${t("level", language)} ${level}`;
  return name ? `${label}: ${translateLevelName(name, language)}` : label;
}

// ---- Dynamic / interpolated text helpers (language-aware) ----
// These keep numbers/symbols intact while translating the surrounding words so
// generated sentences never come out half-English in Nepali mode.

export function formatDays(days, language = getPreferredLanguage()) {
  if (normalizeLanguageMode(language) === "nepali") return `${days} ${t("days", language)}`;
  return `${days} ${Number(days) === 1 ? "Day" : "Days"}`;
}

export function formatXpEarned(xp, language = getPreferredLanguage()) {
  const value = Number(xp).toLocaleString();
  return normalizeLanguageMode(language) === "nepali" ? `${value} XP प्राप्त` : `${value} XP earned`;
}

export function formatBestStreak(days, language = getPreferredLanguage()) {
  return `${t("bestStreak", language)}: ${formatDays(days, language)}`;
}

export function formatCorrectAnswers(count, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali" ? `${count} सही उत्तरहरू` : `${count} correct answers`;
}

export function formatQuestionsSolved(count, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali" ? `${count} प्रश्न हल गरिएको` : `${count} questions solved`;
}

export function formatXpLeftForLevel(xp, level, language = getPreferredLanguage()) {
  const value = Number(xp).toLocaleString();
  return normalizeLanguageMode(language) === "nepali"
    ? `स्तर ${level} पुग्न ${value} XP बाँकी`
    : `${value} XP left for Level ${level}`;
}

// "12,500 / 18,000 XP toward Nayab Subba Candidate." (rank label is translated)
export function formatXpTowardRank(current, target, rankName, language = getPreferredLanguage()) {
  const rank = translateRankName(rankName, language);
  const a = Number(current).toLocaleString();
  const b = Number(target).toLocaleString();
  return normalizeLanguageMode(language) === "nepali"
    ? `${rank} तर्फ ${a} / ${b} XP।`
    : `${a} / ${b} XP toward ${rank}.`;
}

// "Practice General Knowledge today" recommendation line.
export function formatPracticeToday(subjectName, language = getPreferredLanguage()) {
  const subject = translateSubjectName(subjectName, language);
  return normalizeLanguageMode(language) === "nepali"
    ? `आज ${subject} अभ्यास गर्नुहोस्`
    : `Practice ${subject} today`;
}

export function formatStartWith(subjectName, language = getPreferredLanguage()) {
  const subject = translateSubjectName(subjectName, language);
  return normalizeLanguageMode(language) === "nepali"
    ? `${subject} बाट सुरु गर्नुहोस्`
    : `Start with ${subject}`;
}

export function formatLowestAccuracy(subjectName, language = getPreferredLanguage()) {
  const subject = translateSubjectName(subjectName, language);
  return normalizeLanguageMode(language) === "nepali"
    ? `${subject} मा तपाईंको हालको सबैभन्दा कम शुद्धता छ। यसलाई सुधार्न केन्द्रित अभ्यास पूरा गर्नुहोस्।`
    : `${subject} has your lowest current accuracy. Complete a focused practice to improve it.`;
}

// "Review Citizenship before your next practice." feedback tip.
export function formatReviewTopic(topic, language = getPreferredLanguage()) {
  const label = translateSubjectName(topic, language);
  return normalizeLanguageMode(language) === "nepali"
    ? `अर्को अभ्यास अघि ${label} समीक्षा गर्नुहोस्।`
    : `Review ${label} before your next practice.`;
}

export function formatYouAreRank(rank, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali" ? ` · तपाईं #${rank}` : ` · You are #${rank}`;
}

export function formatRankHash(rank, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali" ? `स्थान #${rank}` : `Rank #${rank}`;
}

export function formatFinishedRank(rank, total, accuracy, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali"
    ? `तपाईंले ${total} मध्ये #${rank} स्थान ${accuracy}% शुद्धतासहित प्राप्त गर्नुभयो।`
    : `You finished rank #${rank} of ${total} with ${accuracy}% accuracy.`;
}

export function formatParticipants(count, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali" ? `${count} सहभागी` : `${count} participants`;
}

export function formatRewardText(coins, xp, badge, language = getPreferredLanguage()) {
  if (!coins && !xp && !badge) return "";
  const np = normalizeLanguageMode(language) === "nepali";
  const base = np ? `${coins} सिक्का + ${xp} XP` : `${coins} coins + ${xp} XP`;
  return badge ? `${base} + ${badge}` : base;
}

export function formatAnswered(count, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali" ? `${count} उत्तर दिइएको` : `${count} answered`;
}

export function formatAccuracyFromSolved(accuracy, solved, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali"
    ? `${solved} हल गरिएकामा ${accuracy}% शुद्धता`
    : `${accuracy}% accuracy from ${solved} solved`;
}

export function formatEarnedOn(dateText, language = getPreferredLanguage()) {
  if (!dateText) return t("earnedWord", language);
  return normalizeLanguageMode(language) === "nepali" ? `${dateText} मा प्राप्त` : `Earned ${dateText}`;
}

export function formatBeginsInSeconds(seconds, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali" ? `प्रतियोगिता ${seconds} सेकेन्डमा सुरु हुन्छ` : `Tournament begins in ${seconds} seconds`;
}

export function formatNextAfterReg(seconds, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali"
    ? `दर्ता बन्द भएको ${seconds} सेकेन्डपछि अर्को प्रश्न सुरु हुन्छ।`
    : `Next question starts after registration closes in ${seconds} seconds.`;
}

export function formatAfterQuestion(n, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali" ? `प्रश्न ${n} पछि` : `After Question ${n}`;
}

export function formatQuestionOf(current, total, language = getPreferredLanguage()) {
  return `${t("question", language)} ${current} ${t("of", language)} ${total}`;
}

export function formatCWU(correct, wrong, unanswered, language = getPreferredLanguage()) {
  if (normalizeLanguageMode(language) === "nepali") return `${correct} सही · ${wrong} गलत · ${unanswered} नदिएको`;
  return `${correct} correct · ${wrong} wrong · ${unanswered} unanswered`;
}

export function formatScorePts(score, correct, language = getPreferredLanguage()) {
  if (normalizeLanguageMode(language) === "nepali") return `स्कोर: ${score} अंक · ${correct} सही`;
  return `Score: ${score} pts · ${correct} correct`;
}

export function formatYourRank(rank, score, correct, language = getPreferredLanguage()) {
  const np = normalizeLanguageMode(language) === "nepali";
  const prefix = np ? "तपाईंको र्‍याङ्क: " : "Your rank: ";
  if (!rank) return prefix + (np ? "अझै र्‍याङ्क भएको छैन" : "Not ranked yet");
  return np ? `${prefix}#${rank} · ${score} अंक · ${correct} सही` : `${prefix}#${rank} · ${score} pts · ${correct} correct`;
}

export function formatPointsEarned(points, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali" ? `+${points} अंक` : `+${points} points`;
}

export function formatMixedQuestions(count, seconds, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali"
    ? `${count} मिश्रित प्रश्न, प्रत्येक ${seconds}s`
    : `${count} mixed questions, ${seconds}s each`;
}

export function formatRegisteredCount(count, language = getPreferredLanguage()) {
  if (normalizeLanguageMode(language) === "nepali") return `${count} प्रयोगकर्ता दर्ता`;
  return `${count} ${Number(count) === 1 ? "user" : "users"} registered`;
}

export function formatTopPercent(percent, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali"
    ? `PrepQuest Nepal को शीर्ष ${percent}%`
    : `Top ${percent}% of PrepQuest Nepal`;
}

export function formatPracticeToUnlock(subjectName, language = getPreferredLanguage()) {
  const subject = subjectName ? translateSubjectName(subjectName, language) : (normalizeLanguageMode(language) === "nepali" ? "यो विषय" : "this subject");
  return normalizeLanguageMode(language) === "nepali"
    ? `आफ्नो विषय लिडरबोर्ड स्थान अनलक गर्न ${subject} अभ्यास गर्नुहोस्।`
    : `Practice ${subject} to unlock your subject leaderboard position.`;
}

// "Completed in 6:42" daily-quiz status line.
export function formatCompletedIn(timeText, language = getPreferredLanguage()) {
  return normalizeLanguageMode(language) === "nepali" ? `${timeText} मा पूरा भयो` : `Completed in ${timeText}`;
}

// "5 questions in a row" in-session streak line.
export function formatInARow(count, language = getPreferredLanguage()) {
  if (normalizeLanguageMode(language) === "nepali") return `लगातार ${count} प्रश्न`;
  return `${count} ${Number(count) === 1 ? "question" : "questions"} in a row`;
}

export function formatBuildFoundation(subjectName, language = getPreferredLanguage()) {
  const subject = translateSubjectName(subjectName, language);
  return normalizeLanguageMode(language) === "nepali"
    ? `आफ्नो आधार बलियो बनाउन ${subject} बाट सुरु गर्नुहोस्।`
    : `Start with ${subject} to build your foundation.`;
}
