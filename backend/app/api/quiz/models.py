from pydantic import BaseModel, Field
from typing import List, Optional, Dict

# ----- Content models -----
class Section(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    order: Optional[int] = None
    unitCount: Optional[int] = None

class Unit(BaseModel):
    id: str
    sectionId: str
    title: str
    description: Optional[str] = None
    order: Optional[int] = None
    questionCount: Optional[int] = None
    passThreshold: Optional[int] = None

class Choice(BaseModel):
    id: str
    text: str

class Question(BaseModel):
    id: str
    order: int
    stem: str
    choices: List[Choice]
    explanation: Optional[str] = None

class QuizSnapshot(BaseModel):
    unit: Dict[str, str]
    questions: List[Question]
    numQuestions: int

# ----- Attempt models -----
class AttemptCreate(BaseModel):
    unitId: str

class AnswerUpsert(BaseModel):
    questionId: str
    choiceId: str

class AttemptSummary(BaseModel):
    attemptId: str
    unitId: str
    numCorrect: int
    numTotal: int
    scorePercent: int
    submittedAt: Optional[str] = None

class AttemptItem(BaseModel):
    questionId: str
    stem: str
    yourChoiceId: Optional[str] = None
    yourChoiceText: Optional[str] = None
    correctChoiceId: str
    correctChoiceText: str
    isCorrect: bool
    explanation: Optional[str] = None

class AttemptResult(BaseModel):
    attemptId: str
    unitId: str
    numCorrect: int
    numTotal: int
    scorePercent: int
    items: List[AttemptItem]
