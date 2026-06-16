import { FaBalanceScale, FaBook, FaBrain, FaBuilding, FaGlobeAsia, FaLanguage, FaNewspaper, FaPenNib } from "react-icons/fa";

export const subjects = [
  {
    id: "general-knowledge",
    name: "General Knowledge",
    description: "Build a broad foundation across Nepal, world affairs, history, and civic facts.",
    icon: FaGlobeAsia,
  },
  {
    id: "constitution",
    name: "Constitution of Nepal",
    description: "Master constitutional provisions, fundamental rights, and state structure.",
    icon: FaBalanceScale,
  },
  {
    id: "current-affairs",
    name: "Current Affairs",
    description: "Practice recent national and international events for Loksewa readiness.",
    icon: FaNewspaper,
  },
  {
    id: "general-ability-iq",
    name: "General Ability / IQ",
    description: "Sharpen reasoning, logic, series, and analytical problem solving.",
    icon: FaBrain,
  },
  {
    id: "governance-basics",
    name: "Governance Basics",
    description: "Understand governance principles, institutions, and public accountability.",
    icon: FaBuilding,
  },
  {
    id: "public-administration-basics",
    name: "Public Administration Basics",
    description: "Review administration theories, bureaucracy, and service delivery concepts.",
    icon: FaBook,
  },
  {
    id: "nepali",
    name: "Nepali",
    description: "Improve Nepali language, grammar, comprehension, and expression.",
    icon: FaPenNib,
  },
  {
    id: "english",
    name: "English",
    description: "Practice English grammar, vocabulary, reading, and usage.",
    icon: FaLanguage,
  },
  {
    id: "iq-mental-ability",
    name: "IQ / Mental Ability",
    description: "Develop mental ability through patterns, logic, and quantitative reasoning.",
    icon: FaBrain,
  },
  {
    id: "nepali-grammar",
    name: "Nepali Grammar",
    description: "Strengthen grammar, spelling, sentence correction, and comprehension.",
    icon: FaPenNib,
  },
  {
    id: "english-grammar",
    name: "English Grammar",
    description: "Improve grammar, vocabulary, sentence structure, and reading skills.",
    icon: FaLanguage,
  },
];

export const getSubjectById = (subjectId) => subjects.find((subject) => subject.id === subjectId);
