const keys = {
  user: "prepquest_user",
  subjectProgress: "prepquest_subject_progress",
  practiceHistory: "prepquest_practice_history",
  reviewQuestions: "prepquest_review_questions",
  lastPracticeResult: "prepquest_last_practice_result",
};

const sampleUser = {
  name: "Prajal Danai",
  selectedExam: "Sakha Adhikrit",
  preferredLanguage: "English",
  totalXp: 1250,
  coins: 340,
  level: 5,
  rank: "Focused Learner",
  streak: 4,
  freeMocksLeft: 2,
};

function readJson(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getUser() {
  const user = readJson(keys.user, null);
  if (user) return user;

  writeJson(keys.user, sampleUser);
  localStorage.setItem("selectedExam", "sakha-adhikrit");
  localStorage.setItem("preferredLanguage", "english");
  localStorage.setItem("userName", sampleUser.name);
  return sampleUser;
}

export function saveUser(user) {
  writeJson(keys.user, user);
}

export function getSubjectProgress() {
  return readJson(keys.subjectProgress, {});
}

export function saveSubjectProgress(progress) {
  writeJson(keys.subjectProgress, progress);
}

export function getPracticeHistory() {
  return readJson(keys.practiceHistory, []);
}

export function savePracticeHistory(history) {
  writeJson(keys.practiceHistory, history);
}

export function getReviewQuestions() {
  return readJson(keys.reviewQuestions, []);
}

export function saveReviewQuestions(questions) {
  writeJson(keys.reviewQuestions, questions);
}

export function getLastPracticeResult() {
  return readJson(keys.lastPracticeResult, null);
}

export function saveLastPracticeResult(result) {
  writeJson(keys.lastPracticeResult, result);
}
