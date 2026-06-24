const TRACKS = ["Nayab Subba", "Sakha Adhikrit"];
const SAKHA_ONLY = ["Sakha Adhikrit"];

const opt = (key, en, np = en) => ({ key, en, np });

const q = (id, examTracks, subjectId, subject, topic, difficulty, question_en, question_np, options, correctOption, explanation_en, explanation_np = explanation_en) => ({
  id,
  examTracks,
  subjectId,
  subject,
  topic,
  difficulty,
  question_en,
  question_np,
  options,
  correctOption,
  explanation_en,
  explanation_np,
  source: "Reviewed static mock question bank for PrepQuest prototype",
  reviewed: true,
});

const generalKnowledge = [
  ["gk-mock-011", "History of Nepal", "Who is remembered for starting Nepal's unification campaign?", "Prithvi Narayan Shah", "Bhakti Thapa", "Jung Bahadur Rana", "Bhimsen Thapa", "Prithvi Narayan Shah began the unification campaign that shaped modern Nepal."],
  ["gk-mock-012", "Geography of Nepal", "Which region of Nepal lies between the Himal and Terai?", "Hill region", "Mountain base", "Inner valley", "River plain", "The Hill region lies between the Himalayan region and the Terai plains."],
  ["gk-mock-013", "Civic Facts", "Which institution is responsible for conducting population census in Nepal?", "National Statistics Office", "Election Commission", "Public Service Commission", "Ministry of Foreign Affairs", "The National Statistics Office manages official census and statistical work."],
  ["gk-mock-014", "World Organizations", "Which organization is associated with global public health?", "World Health Organization", "World Bank", "UNESCO", "SAARC", "The World Health Organization coordinates international public health work."],
  ["gk-mock-015", "Nepal Economy", "What is remittance?", "Money sent by workers from abroad", "Tax paid by businesses", "Loan from a bank", "Export duty on goods", "Remittance is money sent home, often by citizens working abroad."],
  ["gk-mock-016", "Environment", "Which gas is most linked with global warming from human activity?", "Carbon dioxide", "Oxygen", "Nitrogen", "Helium", "Carbon dioxide is a major greenhouse gas released by human activity."],
  ["gk-mock-017", "Geography of Nepal", "Which lake is located in Pokhara and is famous for boating?", "Phewa Lake", "Rara Lake", "Tilicho Lake", "Begnas Lake", "Phewa Lake in Pokhara is well known for boating and tourism."],
  ["gk-mock-018", "Culture", "Which festival is widely known as the festival of lights in Nepal?", "Tihar", "Dashain", "Holi", "Maghe Sankranti", "Tihar is popularly known as the festival of lights."],
  ["gk-mock-019", "Government", "Which level of government is closest to citizens in Nepal's federal system?", "Local level", "Federal level", "Provincial level", "Constitutional level", "Local governments provide many services closest to citizens."],
  ["gk-mock-020", "Science Basics", "What is the main source of energy for Earth?", "Sun", "Moon", "Wind", "Coal", "The Sun is Earth's primary natural energy source."],
];

const constitution = [
  ["con-mock-011", "Federal Structure", "Nepal's Constitution establishes Nepal as what kind of state?", "Federal democratic republican state", "Unitary monarchy", "Military state", "Confederation only", "The Constitution defines Nepal as a federal democratic republican state."],
  ["con-mock-012", "Fundamental Rights", "Which right protects citizens from arbitrary detention?", "Right against preventive detention safeguards", "Right to property only", "Right to taxation", "Right to vote only", "Fundamental rights include safeguards related to arrest and detention."],
  ["con-mock-013", "Directive Principles", "Directive principles mainly guide which area?", "State policy and governance", "Private contracts only", "Sports rules", "Foreign citizenship", "Directive principles guide the state in policy and governance."],
  ["con-mock-014", "Constitutional Bodies", "Which body audits public accounts in Nepal?", "Office of the Auditor General", "Election Commission", "Public Service Commission", "National Planning Commission", "The Auditor General audits public accounts and reports findings."],
  ["con-mock-015", "Fundamental Duties", "Respecting the Constitution is mainly considered a citizen's what?", "Duty", "Tax exemption", "Privilege only", "Local holiday", "Citizens are expected to respect the Constitution and law."],
  ["con-mock-016", "Legislature", "Nepal's federal parliament has how many houses?", "Two", "One", "Three", "Four", "The Federal Parliament consists of the House of Representatives and National Assembly."],
  ["con-mock-017", "Judiciary", "Which is the highest court in Nepal?", "Supreme Court", "High Court", "District Court", "Local Judicial Committee", "The Supreme Court is Nepal's highest court."],
  ["con-mock-018", "Executive", "The Council of Ministers is collectively responsible to which body?", "House of Representatives", "Supreme Court", "Election Commission", "Provincial Assembly", "The Council of Ministers is collectively responsible to the House of Representatives."],
  ["con-mock-019", "Citizenship", "Citizenship provisions are part of which broad constitutional concern?", "Membership of the state", "Local tax rates", "School curriculum", "Road safety", "Citizenship provisions define legal membership of the state."],
  ["con-mock-020", "Inclusion", "The Constitution promotes inclusion mainly to ensure what?", "Participation of diverse groups", "Centralization of all power", "End of local government", "Removal of rights", "Inclusion supports participation and representation of diverse groups."],
];

const currentAffairs = [
  ["ca-mock-006", "Public Policy", "Current affairs preparation should rely most on which source type?", "Recent verified public information", "Unverified social media rumor", "Old fiction stories", "Anonymous claims", "Current affairs should be prepared from recent and verified public information."],
  ["ca-mock-007", "Budget", "A national budget mainly presents what?", "Government revenue and expenditure plan", "Only election symbols", "Court verdict list", "Weather forecast", "A budget outlines expected revenue, expenditure, and priorities."],
  ["ca-mock-008", "E-Governance", "Digital public service delivery is commonly called what?", "E-governance", "Manual filing", "Private monopoly", "Traditional farming", "E-governance uses digital tools to improve public service delivery."],
  ["ca-mock-009", "Climate", "Climate adaptation policy focuses on what?", "Reducing harm from climate impacts", "Ignoring weather risks", "Stopping all public services", "Changing national symbols", "Adaptation reduces vulnerability to climate impacts."],
  ["ca-mock-010", "Federalism", "Intergovernmental coordination is important in federalism because it helps what?", "Align work across levels of government", "Remove all local powers", "Avoid public accountability", "End provincial services", "Coordination helps federal, provincial, and local levels work together."],
  ["ca-mock-011", "Public Health", "A vaccination campaign is mainly related to which sector?", "Public health", "Tourism branding", "Road construction", "Foreign trade only", "Vaccination campaigns are public health interventions."],
  ["ca-mock-012", "Disaster Management", "Early warning systems are used mainly to reduce what?", "Disaster risk", "Classroom homework", "Bank interest", "Election ballots", "Early warning helps people prepare before disasters strike."],
  ["ca-mock-013", "Economy", "Inflation means what?", "General rise in prices", "General fall in population", "Increase in rainfall", "Decrease in literacy", "Inflation is a general rise in the price level."],
  ["ca-mock-014", "International Relations", "SAARC is a regional organization of which area?", "South Asia", "Europe", "South America", "Central Africa", "SAARC stands for South Asian Association for Regional Cooperation."],
  ["ca-mock-015", "Governance", "Right to information supports which governance value?", "Transparency", "Secrecy", "Nepotism", "Delay", "Right to information strengthens transparent governance."],
  ["ca-mock-016", "Technology", "Cybersecurity is mainly concerned with protecting what?", "Digital systems and data", "Forest trails", "Traditional dances", "Road markings", "Cybersecurity protects systems, networks, and data."],
  ["ca-mock-017", "Environment", "Waste segregation means separating waste by what?", "Type of waste", "Political ward only", "Road length", "Office rank", "Segregating waste by type helps recycling and safe disposal."],
  ["ca-mock-018", "Public Service", "A citizen charter normally tells service users about what?", "Services, time, fees, and responsible office", "Only staff birthdays", "Private bank profit", "Sports fixtures", "Citizen charters inform people about service standards."],
  ["ca-mock-019", "Infrastructure", "Public procurement rules are used mainly to make purchasing what?", "Fair and accountable", "Secret and random", "Personal and informal", "Unrecorded", "Procurement rules promote fair, competitive, and accountable purchasing."],
  ["ca-mock-020", "Education", "Literacy programs mainly aim to improve what?", "Reading and writing ability", "Road speed", "Bank deposits", "Election campaign music", "Literacy programs improve basic reading and writing skills."],
];

const ability = [
  ["iq-mock-006", "Number Series", "What comes next in the series 2, 4, 8, 16, ?", "32", "24", "30", "36", "Each number is doubled, so the next number is 32."],
  ["iq-mock-007", "Number Series", "What comes next in the series 3, 6, 9, 12, ?", "15", "14", "18", "21", "The pattern adds 3 each time."],
  ["iq-mock-008", "Analogy", "Book is to reading as pen is to what?", "Writing", "Cooking", "Running", "Sleeping", "A book is used for reading and a pen is used for writing."],
  ["iq-mock-009", "Classification", "Which one is different: Apple, Mango, Potato, Banana?", "Potato", "Apple", "Mango", "Banana", "Potato is a vegetable while the others are fruits."],
  ["iq-mock-010", "Direction", "A person faces north and turns right. Which direction is faced?", "East", "West", "South", "North", "Turning right from north points to east."],
  ["iq-mock-011", "Coding", "If CAT is coded as DBU, how is DOG coded?", "EPH", "CNG", "EQH", "FQI", "Each letter moves one step forward: D to E, O to P, G to H."],
  ["iq-mock-012", "Ratio", "If 4 pens cost 40 rupees, what is the cost of 7 pens?", "70 rupees", "60 rupees", "80 rupees", "90 rupees", "One pen costs 10 rupees, so 7 pens cost 70 rupees."],
  ["iq-mock-013", "Percentage", "What is 25% of 200?", "50", "25", "75", "100", "One fourth of 200 is 50."],
  ["iq-mock-014", "Time", "If a meeting starts at 10:15 and lasts 45 minutes, when does it end?", "11:00", "10:45", "11:15", "12:00", "Adding 45 minutes to 10:15 gives 11:00."],
  ["iq-mock-015", "Average", "The average of 4, 6, and 8 is what?", "6", "5", "7", "8", "The sum is 18 and 18 divided by 3 is 6."],
  ["iq-mock-016", "Odd One Out", "Which is the odd one: Square, Triangle, Circle, River?", "River", "Circle", "Square", "Triangle", "River is not a geometric shape."],
  ["iq-mock-017", "Alphabet Series", "What comes next: A, C, E, G, ?", "I", "H", "J", "K", "The pattern skips one letter each time."],
  ["iq-mock-018", "Simple Interest", "What is interest on 1000 at 10% for one year?", "100", "10", "110", "1000", "Simple interest equals principal multiplied by rate and time."],
  ["iq-mock-019", "Logical Order", "Which comes first in writing a letter?", "Address", "Signature", "Postscript", "Envelope sealing", "A formal letter generally begins with an address."],
  ["iq-mock-020", "Calendar", "How many months have 31 days?", "7", "6", "5", "8", "Seven months have 31 days."],
];

const governance = [
  ["gov-mock-006", "Good Governance", "Which value means decisions are made openly and information is accessible?", "Transparency", "Delay", "Favoritism", "Secrecy", "Transparency means openness in decision-making and information."],
  ["gov-mock-007", "Accountability", "Accountability requires public officials to do what?", "Explain and justify actions", "Hide records", "Avoid responsibility", "Reject citizens", "Accountability means officials answer for their decisions and actions."],
  ["gov-mock-008", "Participation", "Citizen participation improves governance by adding what?", "Public voice", "More secrecy", "Less feedback", "Unclear rules", "Participation brings public voice into decisions."],
  ["gov-mock-009", "Rule of Law", "Rule of law requires that public power be exercised according to what?", "Law", "Personal wish", "Family relation", "Rumor", "Rule of law means decisions must follow legal authority."],
  ["gov-mock-010", "Responsiveness", "A responsive office mainly does what?", "Addresses citizen needs in time", "Ignores complaints", "Delays all files", "Hides service standards", "Responsiveness means timely attention to public needs."],
  ["gov-mock-011", "Efficiency", "Efficiency in service delivery means using resources in what way?", "Productive and economical", "Wasteful and unclear", "Secret and biased", "Random and slow", "Efficiency is about productive use of resources."],
  ["gov-mock-012", "Equity", "Equity in governance focuses on what?", "Fair treatment and access", "Only elite access", "Unequal service", "Personal benefit", "Equity supports fairness and access for all groups."],
  ["gov-mock-013", "Integrity", "Integrity in public service means acting with what?", "Honesty", "Bribery", "Nepotism", "Concealment", "Integrity requires honesty and ethical conduct."],
  ["gov-mock-014", "Decentralization", "Decentralization transfers authority closer to whom?", "Citizens and local units", "Only foreign agencies", "Only central offices", "Private clubs", "Decentralization moves authority closer to local levels and citizens."],
  ["gov-mock-015", "Service Standards", "A service standard helps citizens know what?", "Expected service time and process", "Private password", "Staff salary only", "Election result", "Service standards clarify time, process, and responsibility."],
  ["gov-mock-016", "Grievance Handling", "A grievance mechanism lets citizens do what?", "Submit complaints and seek remedy", "Avoid public offices forever", "Change laws alone", "Hide mistakes", "Grievance systems provide complaint and remedy channels."],
  ["gov-mock-017", "Public Ethics", "Conflict of interest should be managed to protect what?", "Public trust", "Private bias", "Hidden profit", "Unfair selection", "Managing conflicts protects trust and fairness."],
  ["gov-mock-018", "Coordination", "Coordination reduces which problem?", "Duplication of work", "Public access", "Timely service", "Clear responsibility", "Coordination helps avoid duplication and gaps."],
  ["gov-mock-019", "Monitoring", "Monitoring is useful because it tracks what?", "Progress and performance", "Only holidays", "Private opinions", "Old myths", "Monitoring tracks progress and performance against plans."],
  ["gov-mock-020", "Inclusiveness", "Inclusive governance aims to include whom?", "Diverse and marginalized groups", "Only one group", "Only office heads", "Only contractors", "Inclusiveness seeks participation of diverse and marginalized groups."],
];

const publicAdministration = [
  ["pa-mock-006", "Management Functions", "Planning in administration is mainly about what?", "Setting goals and actions", "Punishing staff only", "Avoiding records", "Ending supervision", "Planning sets goals and decides actions to achieve them."],
  ["pa-mock-007", "Organization", "Organizing means arranging what?", "People, work, and resources", "Only furniture", "Only holidays", "Only slogans", "Organizing arranges people, work, authority, and resources."],
  ["pa-mock-008", "Leadership", "Leadership helps an organization by doing what?", "Guiding and motivating people", "Hiding goals", "Removing communication", "Avoiding responsibility", "Leadership guides and motivates people toward objectives."],
  ["pa-mock-009", "Control", "Control in management compares performance with what?", "Standards", "Rumors", "Personal likes", "Weather", "Control compares actual performance with standards."],
  ["pa-mock-010", "Bureaucracy", "A hierarchy means authority is arranged in what form?", "Levels", "Circles only", "Lottery", "No order", "Hierarchy arranges authority in levels."],
  ["pa-mock-011", "Delegation", "Delegation assigns authority while retaining what?", "Responsibility", "Secrecy", "Personal profit", "Confusion", "Delegation assigns authority but final responsibility remains."],
  ["pa-mock-012", "Public Policy", "Policy implementation means doing what?", "Putting policy into action", "Only writing slogans", "Ignoring rules", "Ending services", "Implementation puts approved policy into action."],
  ["pa-mock-013", "Civil Service", "Merit-based recruitment emphasizes what?", "Qualification and competence", "Family relation", "Random choice", "Political slogan", "Merit recruitment relies on qualification and competence."],
  ["pa-mock-014", "Motivation", "Motivation is important because it affects what?", "Employee performance", "Office wall color", "File size only", "Weather pattern", "Motivation influences performance and commitment."],
  ["pa-mock-015", "Communication", "Clear communication reduces what?", "Misunderstanding", "Accountability", "Service access", "Public trust", "Clear communication reduces misunderstanding."],
  ["pa-mock-016", "Decision Making", "Evidence-based decisions rely on what?", "Relevant facts and analysis", "Guesswork only", "Personal rumor", "Old habit only", "Evidence-based decisions use facts and analysis."],
  ["pa-mock-017", "Performance Appraisal", "Performance appraisal assesses what?", "Work performance", "Only age", "Only address", "Only festival leave", "Appraisal assesses employee work performance."],
  ["pa-mock-018", "Public Finance", "Financial accountability requires proper what?", "Records and reporting", "Secret spending", "Unrecorded cash", "Personal use", "Financial accountability depends on records and reporting."],
  ["pa-mock-019", "Office Procedure", "File tracking helps an office know what?", "Where a case stands", "Only tea expense", "Private messages", "Weather updates", "File tracking monitors the status and movement of work."],
  ["pa-mock-020", "Service Delivery", "Citizen-centered service focuses primarily on whom?", "Service users", "Office furniture", "Private vendors only", "Old forms only", "Citizen-centered service prioritizes users' needs."],
];

const nepali = [
  ["np-mock-006", "Grammar", "Which word is a noun?", "Teacher", "Quickly", "Beautiful", "Runs", "Teacher names a person, so it is a noun."],
  ["np-mock-007", "Grammar", "Which sentence is in past tense?", "He went to office.", "He goes to office.", "He will go to office.", "He is going to office.", "Went shows past tense."],
  ["np-mock-008", "Vocabulary", "Which word is closest in meaning to 'honest'?", "Truthful", "Lazy", "Angry", "Careless", "Truthful is closest in meaning to honest."],
  ["np-mock-009", "Antonyms", "Which is an antonym of 'dark'?", "Bright", "Black", "Night", "Shadow", "Bright is opposite in meaning to dark."],
  ["np-mock-010", "Spelling", "Which word is correctly spelled?", "Development", "Devlopment", "Developmant", "Develpment", "Development is the correct spelling."],
  ["np-mock-011", "Sentence Use", "Which is a complete sentence?", "Citizens follow the law.", "Because the law", "After the meeting", "In the office", "A complete sentence has a subject and a verb."],
  ["np-mock-012", "Grammar", "Which word shows action?", "Prepare", "Office", "Green", "Policy", "Prepare is a verb because it shows action."],
  ["np-mock-013", "Vocabulary", "Which word means the same as 'rapid'?", "Fast", "Slow", "Late", "Weak", "Fast is a synonym of rapid."],
  ["np-mock-014", "Grammar", "Which option is plural?", "Books", "Book", "A book", "This book", "Books is plural."],
  ["np-mock-015", "Comprehension", "A main idea is the text's what?", "Central point", "Page number", "Font size", "Writer's address", "The main idea is the central point of a text."],
  ["np-mock-016", "Usage", "Which phrase is polite for a request?", "Please help me.", "Do it now.", "You must obey.", "Never ask.", "Please help me is a polite request."],
  ["np-mock-017", "Grammar", "Which word is an adjective?", "Careful", "Run", "Office", "Citizen", "Careful describes a noun, so it is an adjective."],
  ["np-mock-018", "Connectors", "Which word can join two related ideas?", "And", "Very", "Office", "Blue", "And is a conjunction used to join ideas."],
  ["np-mock-019", "Antonyms", "Which is opposite of 'increase'?", "Decrease", "Improve", "Raise", "Expand", "Decrease is the opposite of increase."],
  ["np-mock-020", "Grammar", "Which option is singular?", "Child", "Children", "Books", "Offices", "Child is singular."],
];

const english = [
  ["eng-mock-006", "Articles", "Choose the correct article: She bought ___ umbrella.", "an", "a", "the", "no article", "Use an before a vowel sound."],
  ["eng-mock-007", "Prepositions", "Choose the correct preposition: The file is ___ the table.", "on", "in", "at", "by", "On is used for a surface."],
  ["eng-mock-008", "Tense", "Choose the correct form: They ___ working now.", "are", "is", "was", "be", "They takes the plural auxiliary are."],
  ["eng-mock-009", "Voice", "Choose the passive form: The officer approved the file.", "The file was approved by the officer.", "The file approved the officer.", "The officer was approved by the file.", "Approved file officer.", "The passive form makes the file the subject."],
  ["eng-mock-010", "Antonyms", "Choose the antonym of 'temporary'.", "Permanent", "Brief", "Short", "Interim", "Permanent is the opposite of temporary."],
  ["eng-mock-011", "Synonyms", "Choose the synonym of 'assist'.", "Help", "Harm", "Delay", "Refuse", "Assist means help."],
  ["eng-mock-012", "Subject Verb Agreement", "Choose the correct sentence.", "The team is ready.", "The team are ready.", "The team be ready.", "The team were ready now.", "Team as a unit takes is in this sentence."],
  ["eng-mock-013", "Spelling", "Choose the correctly spelled word.", "Separate", "Seperate", "Separete", "Saperate", "Separate is the correct spelling."],
  ["eng-mock-014", "Vocabulary", "What does 'mandatory' mean?", "Required", "Optional", "Late", "Informal", "Mandatory means required."],
  ["eng-mock-015", "Prepositions", "Choose the correct phrase: responsible ___ the work.", "for", "of", "at", "by", "Responsible for is the correct phrase."],
  ["eng-mock-016", "Tense", "Choose the correct form: I ___ the report yesterday.", "completed", "complete", "will complete", "am completing", "Yesterday requires the past form completed."],
  ["eng-mock-017", "Articles", "Choose the correct article: Nepal is ___ beautiful country.", "a", "an", "the", "no article", "A is used before the consonant sound in beautiful."],
  ["eng-mock-018", "Conditionals", "Choose the correct sentence.", "If it rains, the road may close.", "If it rain, the road may close.", "If it raining, road close.", "If rains, road may.", "The first option has correct conditional structure."],
  ["eng-mock-019", "Pronouns", "Choose the correct pronoun: Ram and Sita finished ___ work.", "their", "his", "her", "its", "Their refers to Ram and Sita together."],
  ["eng-mock-020", "Punctuation", "Which sentence is punctuated correctly?", "Where are you going?", "Where are you going.", "Where are you going!", "Where are you going,", "A direct question ends with a question mark."],
];

const fromRows = (rows, examTracks, subjectId, subject) =>
  rows.map(([id, topic, question, correct, b, c, d, explanation]) =>
    q(
      id,
      examTracks,
      subjectId,
      subject,
      topic,
      "Medium",
      question,
      question,
      [opt("A", correct), opt("B", b), opt("C", c), opt("D", d)],
      "A",
      explanation
    )
  );

export const mockTestQuestions = [
  ...fromRows(generalKnowledge, TRACKS, "general-knowledge", "General Knowledge"),
  ...fromRows(constitution, TRACKS, "constitution", "Constitution of Nepal"),
  ...fromRows(currentAffairs, TRACKS, "current-affairs", "Current Affairs"),
  ...fromRows(ability, TRACKS, "general-ability-iq", "General Ability / IQ"),
  ...fromRows(governance, SAKHA_ONLY, "governance-basics", "Governance Basics"),
  ...fromRows(publicAdministration, SAKHA_ONLY, "public-administration-basics", "Public Administration Basics"),
  ...fromRows(nepali, TRACKS, "nepali", "Nepali"),
  ...fromRows(english, TRACKS, "english", "English"),
];
