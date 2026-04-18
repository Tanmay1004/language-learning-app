# 🌍 Language Learning App

A full-stack **Language Learning Web App** with AI-powered pronunciation scoring, quizzes with XP & levels, and a conversational chatbot.

Built with:
- **Frontend:** React (Vite)
- **Backend:** FastAPI (Python)
- **AI:** Local LLM via Ollama
- **Speech-to-Text:** Vosk (offline)
- **Audio Processing:** FFmpeg
- **Auth & Database:** Firebase

---

## ✨ Features

- 🎙️ **Pronunciation Scoring**
  - Speech-to-text (offline)
  - Word-level accuracy, fluency & WER
  - Detailed feedback with highlights

- 🧠 **Conversational Chatbot**
  - Local LLM (no cloud API)
  - Grammar correction + natural replies
  - Streaming responses (SSE)

- 🏆 **Quiz Module**
  - XP & Level system
  - Progress bars & results summary
  - Local persistence (Firebase planned)

---


## ⚙️ Prerequisites

Make sure you have these installed:

- Python **3.12.10**
- Node.js **18+**
- Git

---

## 🐍 Backend Setup (FastAPI)

### 1️⃣ Create and activate virtual environment

```bash
cd backend
python -m venv venv
```

**Windows**
```bash
venv\Scripts\activate
```

**Linux / macOS**
```bash
source venv/bin/activate
```

---

### 2️⃣ Install Python dependencies

```bash
inside /backend
pip install -r requirements.txt
```

---

## 🎧 FFmpeg Installation (Required)

FFmpeg is required for audio processing.

### 🔹 Windows

1. Download FFmpeg:
   https://www.gyan.dev/ffmpeg/builds/
   download: ffmpeg-release-essentials.zip

3. Extract example:
```
C:\ffmpeg\
  └── bin\
      ├── ffmpeg.exe
      ├── ffprobe.exe
```

3. Add to **PATH**:
```
C:\ffmpeg\bin
run the command: 
Windows:
setx FFMPEG_PATH "C:\ffmpeg\bin\ffmpeg.exe"

macOS:
echo 'export FFMPEG_PATH="$(which ffmpeg)"' >> ~/.zshrc
source ~/.zshrc

```

4. Verify:
```bash
ffmpeg -version
```

---

### 🔹 Linux

```bash
sudo apt update
sudo apt install ffmpeg
```

---

### 🔹 macOS

```bash
brew install ffmpeg
```

---

## 🗣️ Vosk Speech-to-Text Model Setup

This project uses **Vosk** for offline speech recognition.

The Vosk model is **not included** in the repository due to its size.

---

### 1️⃣ Download the English Model

Download the model from the official Vosk models page:

https://alphacephei.com/vosk/models

Recommended model:
- **vosk-model-en-us-0.22**

---

### 2️⃣ Extract the Model

After downloading, extract the folder so the structure looks like this:

```
backend/app/models/
└── vosk-model-en-us-0.22/
    ├── am/
    ├── conf/
    ├── graph/
    └── ivector/
```

⚠️ The folder name must match exactly:
```
vosk-model-en-us-0.22
```

---


## 🤖 Ollama Setup (Local LLM)

### 1️⃣ Install Ollama

Download from:  
https://ollama.com/download

Verify:
```bash
ollama --version
```

---

### 2️⃣ Pull the required model

```bash
ollama pull llama3.2:3b
```

---

### 3️⃣ Start Ollama service

```bash
ollama serve
```

> Ollama must be running while using the chatbot.

---
##  Firebase Setup (Authentication + Firestore)

### 1️⃣ Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project**
3. Disable Google Analytics (optional)

---

### 2️⃣ Create Web App

- Project Settings → General → Add app → Web
- Copy the Firebase config

---

### 3️⃣ Enable Authentication

- Go to **Authentication → Sign-in method**
- Enable:
  - Email / Password
  - Google

---

### 4️⃣ Create Firestore Database

- Go to **Firestore Database** in Build
- Create database in **production mode**
- Select region

---

### 5️⃣ Frontend Firebase Config

Create `frontend/src/auth/firebase.js`

```js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

// Firebase Auth
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
```

---

### 6️⃣ Firestore Security Rules (Dev)

1. Open the Firestore Database and go to the "Rules" section
2. Change the rules to the ones given below and "Publish"


```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // =========================
    // Users root document
    // =========================
    match /users/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;

      // =========================
      // Chatbot analytics
      // =========================
      match /chatErrors/{docId} {
        allow read, write: if request.auth != null
                           && request.auth.uid == userId;
      }

      match /chatAttempts/{attemptId} {
        allow read, write: if request.auth != null
                           && request.auth.uid == userId;
      }

      // =========================
      // Pronunciation (already working)
      // =========================
      match /pronunciationAttempts/{attemptId} {
        allow read, write: if request.auth != null
                           && request.auth.uid == userId;
      }

      match /pronunciationStats/{docId} {
        allow read, write: if request.auth != null
                           && request.auth.uid == userId;
      }
    }
  }
}

```
The backend uses **Firebase Admin SDK** to securely access Firestore for user data, XP, sessions, etc.

---

## 1️⃣ Create a Firebase Service Account Key

1. Go to **Firebase Console**
2. Project Settings → **Service accounts**
3. Click **Generate new private key**
4. Select Python and download the JSON file

Rename it to:
```
serviceAccountKey.json
```

---

## 2️⃣ Place the File Correctly

Move the file to:

```
backend/firebase/serviceAccountKey.json
```

⚠️ **IMPORTANT:**  
This file must **never** be committed to Git.

Add this to `.gitignore`:

```gitignore
backend/firebase/serviceAccountKey.json
```

---
## ▶️ Start the Backend Server

```bash
uvicorn app.main:app --reload
```

Backend runs at:
```
http://localhost:8000
```

---

## 🌐 Frontend Setup (React + Vite)

### 1️⃣ Install dependencies

```bash
cd frontend
npm install
```

---

### 2️⃣ Start frontend dev server

```bash
npm run dev
```

Frontend runs at:
```
http://localhost:5173
```

---

## 🔗 API Configuration

Frontend expects backend at:
```
http://localhost:8000
```

---

## 🧪 Tested On

- Windows 10 / 11
- macOS 26
- Python 3.12+
- Node 18+
- Ollama (local)

---

## 🧠 Notes

- Runs fully **offline**
- No paid APIs required
- First run may be slow due to model loading

---

