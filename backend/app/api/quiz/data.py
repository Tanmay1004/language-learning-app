# Sections
SECTIONS = {
    "sections": [
        {
            "id": "sec_articles",
            "title": "Articles",
            "description": "Indefinite and definite articles",
            "order": 1,
            "unitCount": 3,
        },
        {
            "id": "sec_nouns",
            "title": "Nouns",
            "description": "Countable, uncountable, and proper nouns",
            "order": 2,
            "unitCount": 2,
        },
    ]
}

# Units by section
UNITS_BY_SECTION = {
    "sec_articles": {
        "section": {"id": "sec_articles", "title": "Articles"},
        "units": [
            {
                "id": "unit_articles_a_an",
                "sectionId": "sec_articles",
                "title": "Using 'a' and 'an'",
                "description": "Basic rules",
                "order": 1,
                "questionCount": 6,
                "passThreshold": 70,
            },
            {
                "id": "unit_articles_mixed",
                "sectionId": "sec_articles",
                "title": "Articles: a / an / the (Mixed)",
                "description": "Mixed practice with rules & exceptions",
                "order": 2,
                "questionCount": 10,
                "passThreshold": 70,
            },
            {
                "id": "unit_articles_the",
                "sectionId": "sec_articles",
                "title": "Using 'the'",
                "description": "Specific reference, superlatives, uniques",
                "order": 3,
                "questionCount": 6,
                "passThreshold": 70,
            },
        ],
    },
    "sec_nouns": {
        "section": {"id": "sec_nouns", "title": "Nouns"},
        "units": [
            {
                "id": "unit_nouns_countable",
                "sectionId": "sec_nouns",
                "title": "Countable vs Uncountable",
                "description": "Basics and determiners",
                "order": 1,
                "questionCount": 6,
                "passThreshold": 70,
            },
            {
                "id": "unit_nouns_proper",
                "sectionId": "sec_nouns",
                "title": "Proper Nouns",
                "description": "Names and capitalization",
                "order": 2,
                "questionCount": 5,
                "passThreshold": 70,
            },
        ],
    },
}

# Quiz snapshots for ALL units
QUIZ_BY_UNIT = {
    # ---- Articles: a / an (basics) ----
    "unit_articles_a_an": {
        "unit": {"id": "unit_articles_a_an", "title": "Using 'a' and 'an'"},
        "questions": [
            {
                "id": "q_art_a_an_01",
                "order": 1,
                "stem": "Choose the correct article: He is ___ honest man.",
                "choices": [
                    {"id": "c_art_a_an_01_a", "text": "a"},
                    {"id": "c_art_a_an_01_b", "text": "an"},
                    {"id": "c_art_a_an_01_c", "text": "the"},
                    {"id": "c_art_a_an_01_d", "text": "— (no article)"},
                ],
                "explanation": "Use 'an' before vowel sounds (honest → /ˈɒn-/).",
            },
            {
                "id": "q_art_a_an_02",
                "order": 2,
                "stem": "I saw ___ European scientist on TV.",
                "choices": [
                    {"id": "c_art_a_an_02_a", "text": "a"},
                    {"id": "c_art_a_an_02_b", "text": "an"},
                    {"id": "c_art_a_an_02_c", "text": "the"},
                    {"id": "c_art_a_an_02_d", "text": "— (no article)"},
                ],
                "explanation": "'European' starts with a /juː/ sound → consonant sound → 'a'.",
            },
            {
                "id": "q_art_a_an_03",
                "order": 3,
                "stem": "Could I have ___ orange, please?",
                "choices": [
                    {"id": "c_art_a_an_03_a", "text": "a"},
                    {"id": "c_art_a_an_03_b", "text": "an"},
                    {"id": "c_art_a_an_03_c", "text": "the"},
                    {"id": "c_art_a_an_03_d", "text": "— (no article)"},
                ],
                "explanation": "Vowel sound /ˈɔːr-/ → 'an'.",
            },
            {
                "id": "q_art_a_an_04",
                "order": 4,
                "stem": "She adopted ___ cat yesterday.",
                "choices": [
                    {"id": "c_art_a_an_04_a", "text": "a"},
                    {"id": "c_art_a_an_04_b", "text": "an"},
                    {"id": "c_art_a_an_04_c", "text": "the"},
                    {"id": "c_art_a_an_04_d", "text": "— (no article)"},
                ],
                "explanation": "New/unspecified singular countable noun → 'a'.",
            },
            {
                "id": "q_art_a_an_05",
                "order": 5,
                "stem": "He is ___ MBA graduate.",
                "choices": [
                    {"id": "c_art_a_an_05_a", "text": "a"},
                    {"id": "c_art_a_an_05_b", "text": "an"},
                    {"id": "c_art_a_an_05_c", "text": "the"},
                    {"id": "c_art_a_an_05_d", "text": "— (no article)"},
                ],
                "explanation": "MBA begins with an /ɛm/ sound → vowel sound → 'an'.",
            },
            {
                "id": "q_art_a_an_06",
                "order": 6,
                "stem": "We rented ___ house near the beach.",
                "choices": [
                    {"id": "c_art_a_an_06_a", "text": "a"},
                    {"id": "c_art_a_an_06_b", "text": "an"},
                    {"id": "c_art_a_an_06_c", "text": "the"},
                    {"id": "c_art_a_an_06_d", "text": "— (no article)"},
                ],
                "explanation": "First mention, singular countable → 'a'.",
            },
        ],
        "numQuestions": 6,
    },

    # ---- Articles: a / an / the (Mixed) ----
    "unit_articles_mixed": {
        "unit": {"id": "unit_articles_mixed", "title": "Articles: a / an / the (Mixed)"},
        "questions": [
            {
                "id": "q_art_mix_01",
                "order": 1,
                "stem": "Choose the correct article: ___ apple a day keeps the doctor away.",
                "choices": [
                    {"id": "c_art_mix_01_a", "text": "A"},
                    {"id": "c_art_mix_01_b", "text": "An"},
                    {"id": "c_art_mix_01_c", "text": "The"},
                    {"id": "c_art_mix_01_d", "text": "— (no article)"},
                ],
                "explanation": "Use 'an' before vowel sounds; 'apple' starts with a vowel sound.",
            },
            {
                "id": "q_art_mix_02",
                "order": 2,
                "stem": "I bought ___ umbrella because it was raining.",
                "choices": [
                    {"id": "c_art_mix_02_a", "text": "a"},
                    {"id": "c_art_mix_02_b", "text": "an"},
                    {"id": "c_art_mix_02_c", "text": "the"},
                    {"id": "c_art_mix_02_d", "text": "— (no article)"},
                ],
                "explanation": "Before vowel sound 'um-', use 'an'.",
            },
            {
                "id": "q_art_mix_03",
                "order": 3,
                "stem": "___ sun rises in the east.",
                "choices": [
                    {"id": "c_art_mix_03_a", "text": "A"},
                    {"id": "c_art_mix_03_b", "text": "An"},
                    {"id": "c_art_mix_03_c", "text": "The"},
                    {"id": "c_art_mix_03_d", "text": "— (no article)"},
                ],
                "explanation": "Use 'the' for unique nouns known universally (the sun, the moon).",
            },
            {
                "id": "q_art_mix_04",
                "order": 4,
                "stem": "She is ___ honest person.",
                "choices": [
                    {"id": "c_art_mix_04_a", "text": "a"},
                    {"id": "c_art_mix_04_b", "text": "an"},
                    {"id": "c_art_mix_04_c", "text": "the"},
                    {"id": "c_art_mix_04_d", "text": "— (no article)"},
                ],
                "explanation": "H is silent; vowel sound 'on-': use 'an'.",
            },
            {
                "id": "q_art_mix_05",
                "order": 5,
                "stem": "Pass me ___ salt, please.",
                "choices": [
                    {"id": "c_art_mix_05_a", "text": "a"},
                    {"id": "c_art_mix_05_b", "text": "an"},
                    {"id": "c_art_mix_05_c", "text": "the"},
                    {"id": "c_art_mix_05_d", "text": "— (no article)"},
                ],
                "explanation": "Shared situational knowledge/definite reference: 'the salt' on the table.",
            },
            {
                "id": "q_art_mix_06",
                "order": 6,
                "stem": "He works as ___ engineer in Bengaluru.",
                "choices": [
                    {"id": "c_art_mix_06_a", "text": "a"},
                    {"id": "c_art_mix_06_b", "text": "an"},
                    {"id": "c_art_mix_06_c", "text": "the"},
                    {"id": "c_art_mix_06_d", "text": "— (no article)"},
                ],
                "explanation": "Vowel sound 'en-': use 'an'.",
            },
            {
                "id": "q_art_mix_07",
                "order": 7,
                "stem": "She adopted ___ cat and ___ dog.",
                "choices": [
                    {"id": "c_art_mix_07_a", "text": "a / a"},
                    {"id": "c_art_mix_07_b", "text": "an / a"},
                    {"id": "c_art_mix_07_c", "text": "the / the"},
                    {"id": "c_art_mix_07_d", "text": "— / —"},
                ],
                "explanation": "Consonant sound 'c' → 'a'; consonant sound 'd' → 'a'.",
            },
            {
                "id": "q_art_mix_08",
                "order": 8,
                "stem": "He is ___ best player in the team.",
                "choices": [
                    {"id": "c_art_mix_08_a", "text": "a"},
                    {"id": "c_art_mix_08_b", "text": "an"},
                    {"id": "c_art_mix_08_c", "text": "the"},
                    {"id": "c_art_mix_08_d", "text": "— (no article)"},
                ],
                "explanation": "Superlatives take 'the' (the best, the tallest).",
            },
            {
                "id": "q_art_mix_09",
                "order": 9,
                "stem": "We went to ___ cinema last night.",
                "choices": [
                    {"id": "c_art_mix_09_a", "text": "a"},
                    {"id": "c_art_mix_09_b", "text": "an"},
                    {"id": "c_art_mix_09_c", "text": "the"},
                    {"id": "c_art_mix_09_d", "text": "— (no article)"},
                ],
                "explanation": "Specific, shared experience → 'the cinema' (definite).",
            },
            {
                "id": "q_art_mix_10",
                "order": 10,
                "stem": "Mount Everest is ___ highest mountain in the world.",
                "choices": [
                    {"id": "c_art_mix_10_a", "text": "a"},
                    {"id": "c_art_mix_10_b", "text": "an"},
                    {"id": "c_art_mix_10_c", "text": "the"},
                    {"id": "c_art_mix_10_d", "text": "— (no article)"},
                ],
                "explanation": "Superlative: 'the highest'.",
            },
        ],
        "numQuestions": 10,
    },

    # ---- Articles: the (usage) ----
    "unit_articles_the": {
        "unit": {"id": "unit_articles_the", "title": "Using 'the'"},
        "questions": [
            {
                "id": "q_art_the_01",
                "order": 1,
                "stem": "___ Pacific Ocean is the largest on Earth.",
                "choices": [
                    {"id": "c_art_the_01_a", "text": "A"},
                    {"id": "c_art_the_01_b", "text": "An"},
                    {"id": "c_art_the_01_c", "text": "The"},
                    {"id": "c_art_the_01_d", "text": "— (no article)"},
                ],
                "explanation": "Use 'the' with oceans, seas, rivers, mountain ranges, etc.",
            },
            {
                "id": "q_art_the_02",
                "order": 2,
                "stem": "I loved ___ movie you recommended.",
                "choices": [
                    {"id": "c_art_the_02_a", "text": "a"},
                    {"id": "c_art_the_02_b", "text": "an"},
                    {"id": "c_art_the_02_c", "text": "the"},
                    {"id": "c_art_the_02_d", "text": "— (no article)"},
                ],
                "explanation": "Specific/known reference → 'the'.",
            },
            {
                "id": "q_art_the_03",
                "order": 3,
                "stem": "She plays ___ piano very well.",
                "choices": [
                    {"id": "c_art_the_03_a", "text": "a"},
                    {"id": "c_art_the_03_b", "text": "an"},
                    {"id": "c_art_the_03_c", "text": "the"},
                    {"id": "c_art_the_03_d", "text": "— (no article)"},
                ],
                "explanation": "Musical instruments often use 'the' in general statements.",
            },
            {
                "id": "q_art_the_04",
                "order": 4,
                "stem": "He visited ___ Louvre when he was in Paris.",
                "choices": [
                    {"id": "c_art_the_04_a", "text": "a"},
                    {"id": "c_art_the_04_b", "text": "an"},
                    {"id": "c_art_the_04_c", "text": "the"},
                    {"id": "c_art_the_04_d", "text": "— (no article)"},
                ],
                "explanation": "Famous buildings/museums typically take 'the'.",
            },
            {
                "id": "q_art_the_05",
                "order": 5,
                "stem": "We took a boat along ___ Thames.",
                "choices": [
                    {"id": "c_art_the_05_a", "text": "a"},
                    {"id": "c_art_the_05_b", "text": "an"},
                    {"id": "c_art_the_05_c", "text": "the"},
                    {"id": "c_art_the_05_d", "text": "— (no article)"},
                ],
                "explanation": "Rivers take 'the'.",
            },
            {
                "id": "q_art_the_06",
                "order": 6,
                "stem": "___ Earth orbits the Sun.",
                "choices": [
                    {"id": "c_art_the_06_a", "text": "A"},
                    {"id": "c_art_the_06_b", "text": "An"},
                    {"id": "c_art_the_06_c", "text": "The"},
                    {"id": "c_art_the_06_d", "text": "— (no article)"},
                ],
                "explanation": "Unique celestial bodies (in this context) often take 'the Earth', 'the Sun'.",
            },
        ],
        "numQuestions": 6,
    },

    # ---- Nouns: Countable vs Uncountable ----
    "unit_nouns_countable": {
        "unit": {"id": "unit_nouns_countable", "title": "Countable vs Uncountable"},
        "questions": [
            {
                "id": "q_n_count_01",
                "order": 1,
                "stem": "Choose the correct option: We don’t have ___ milk left.",
                "choices": [
                    {"id": "c_n_count_01_a", "text": "many"},
                    {"id": "c_n_count_01_b", "text": "much"},
                    {"id": "c_n_count_01_c", "text": "few"},
                    {"id": "c_n_count_01_d", "text": "a few"},
                ],
                "explanation": "Milk is uncountable → 'much milk'.",
            },
            {
                "id": "q_n_count_02",
                "order": 2,
                "stem": "There are ___ chairs in the room.",
                "choices": [
                    {"id": "c_n_count_02_a", "text": "much"},
                    {"id": "c_n_count_02_b", "text": "many"},
                    {"id": "c_n_count_02_c", "text": "little"},
                    {"id": "c_n_count_02_d", "text": "a little"},
                ],
                "explanation": "Chairs are countable → 'many chairs'.",
            },
            {
                "id": "q_n_count_03",
                "order": 3,
                "stem": "I only have ___ information about the event.",
                "choices": [
                    {"id": "c_n_count_03_a", "text": "a few"},
                    {"id": "c_n_count_03_b", "text": "few"},
                    {"id": "c_n_count_03_c", "text": "a little"},
                    {"id": "c_n_count_03_d", "text": "many"},
                ],
                "explanation": "Information is uncountable → 'a little information'.",
            },
            {
                "id": "q_n_count_04",
                "order": 4,
                "stem": "We bought two ___ of bread.",
                "choices": [
                    {"id": "c_n_count_04_a", "text": "breads"},
                    {"id": "c_n_count_04_b", "text": "loaves"},
                    {"id": "c_n_count_04_c", "text": "slices"},
                    {"id": "c_n_count_04_d", "text": "pieces"},
                ],
                "explanation": "Proper partitive → 'two loaves of bread'.",
            },
            {
                "id": "q_n_count_05",
                "order": 5,
                "stem": "She gave me ___ advice before the interview.",
                "choices": [
                    {"id": "c_n_count_05_a", "text": "an"},
                    {"id": "c_n_count_05_b", "text": "a"},
                    {"id": "c_n_count_05_c", "text": "some"},
                    {"id": "c_n_count_05_d", "text": "many"},
                ],
                "explanation": "Advice is uncountable → 'some advice'.",
            },
            {
                "id": "q_n_count_06",
                "order": 6,
                "stem": "There were very ___ people at the concert.",
                "choices": [
                    {"id": "c_n_count_06_a", "text": "few"},
                    {"id": "c_n_count_06_b", "text": "little"},
                    {"id": "c_n_count_06_c", "text": "a little"},
                    {"id": "c_n_count_06_d", "text": "much"},
                ],
                "explanation": "People (countable plural) → 'few people'.",
            },
        ],
        "numQuestions": 6,
    },

    # ---- Nouns: Proper Nouns ----
    "unit_nouns_proper": {
        "unit": {"id": "unit_nouns_proper", "title": "Proper Nouns"},
        "questions": [
            {
                "id": "q_n_prop_01",
                "order": 1,
                "stem": "Choose the correctly capitalized sentence.",
                "choices": [
                    {"id": "c_n_prop_01_a", "text": "i visited new delhi last summer."},
                    {"id": "c_n_prop_01_b", "text": "I visited New delhi last summer."},
                    {"id": "c_n_prop_01_c", "text": "I visited New Delhi last summer."},
                    {"id": "c_n_prop_01_d", "text": "I visited new delhi last summer."},
                ],
                "explanation": "Capitalize proper nouns: 'New Delhi'.",
            },
            {
                "id": "q_n_prop_02",
                "order": 2,
                "stem": "Which of the following statements does not needs 'the'?",
                "choices": [
                    {"id": "c_n_prop_02_a", "text": "I climbed Mount Everest."},
                    {"id": "c_n_prop_02_b", "text": "I visited Taj Mahal."},
                    {"id": "c_n_prop_02_c", "text": "He went to University of Mumbai."},
                    {"id": "c_n_prop_02_d", "text": "She swam in Pacific Ocean."},
                ],
                "explanation": "Famous buildings/rivers/seas often need 'the': the Taj Mahal, the University of Mumbai, the Pacific Ocean. Mount Everest does not take 'the'.",
            },
            {
                "id": "q_n_prop_03",
                "order": 3,
                "stem": "Pick the correct sentence (articles with proper nouns).",
                "choices": [
                    {"id": "c_n_prop_03_a", "text": "The Rahul is my friend."},
                    {"id": "c_n_prop_03_b", "text": "Rahul is my friend."},
                    {"id": "c_n_prop_03_c", "text": "A Rahul is my friend."},
                    {"id": "c_n_prop_03_d", "text": "An Rahul is my friend."},
                ],
                "explanation": "Personal names typically take no article.",
            },
            {
                "id": "q_n_prop_04",
                "order": 4,
                "stem": "Choose the correctly capitalized title:",
                "choices": [
                    {"id": "c_n_prop_04_a", "text": "the indian express"},
                    {"id": "c_n_prop_04_b", "text": "The Indian Express"},
                    {"id": "c_n_prop_04_c", "text": "The indian express"},
                    {"id": "c_n_prop_04_d", "text": "the Indian Express"},
                ],
                "explanation": "Newspaper titles capitalize all main words.",
            },
            {
                "id": "q_n_prop_05",
                "order": 5,
                "stem": "Select the correct sentence:",
                "choices": [
                    {"id": "c_n_prop_05_a", "text": "He studies at the IIT Bombay."},
                    {"id": "c_n_prop_05_b", "text": "He studies at IIT Bombay."},
                    {"id": "c_n_prop_05_c", "text": "He studies at an IIT Bombay."},
                    {"id": "c_n_prop_05_d", "text": "He studies at a IIT Bombay."},
                ],
                "explanation": "Institution names used as proper nouns often take no article: IIT Bombay.",
            },
        ],
        "numQuestions": 5,
    },
}

# Answer keys for ALL units
ANSWER_KEY = {
    # a/an
    "q_art_a_an_01": "c_art_a_an_01_b",
    "q_art_a_an_02": "c_art_a_an_02_a",
    "q_art_a_an_03": "c_art_a_an_03_b",
    "q_art_a_an_04": "c_art_a_an_04_a",
    "q_art_a_an_05": "c_art_a_an_05_b",
    "q_art_a_an_06": "c_art_a_an_06_a",

    # mixed
    "q_art_mix_01": "c_art_mix_01_b",
    "q_art_mix_02": "c_art_mix_02_b",
    "q_art_mix_03": "c_art_mix_03_c",
    "q_art_mix_04": "c_art_mix_04_b",
    "q_art_mix_05": "c_art_mix_05_c",
    "q_art_mix_06": "c_art_mix_06_b",
    "q_art_mix_07": "c_art_mix_07_a",
    "q_art_mix_08": "c_art_mix_08_c",
    "q_art_mix_09": "c_art_mix_09_c",
    "q_art_mix_10": "c_art_mix_10_c",

    # the
    "q_art_the_01": "c_art_the_01_c",
    "q_art_the_02": "c_art_the_02_c",
    "q_art_the_03": "c_art_the_03_c",
    "q_art_the_04": "c_art_the_04_c",
    "q_art_the_05": "c_art_the_05_c",
    "q_art_the_06": "c_art_the_06_c",

    # countable/uncountable
    "q_n_count_01": "c_n_count_01_b",
    "q_n_count_02": "c_n_count_02_b",
    "q_n_count_03": "c_n_count_03_c",
    "q_n_count_04": "c_n_count_04_b",
    "q_n_count_05": "c_n_count_05_c",
    "q_n_count_06": "c_n_count_06_a",

    # proper nouns
    "q_n_prop_01": "c_n_prop_01_c",
    "q_n_prop_02": "c_n_prop_02_b",  # asks “Which needs 'the'?” → 'the Taj Mahal'
    "q_n_prop_03": "c_n_prop_03_b",
    "q_n_prop_04": "c_n_prop_04_b",
    "q_n_prop_05": "c_n_prop_05_b",
}

