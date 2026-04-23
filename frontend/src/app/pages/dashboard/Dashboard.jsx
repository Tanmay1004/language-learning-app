import { useEffect, useState } from "react";
import { auth, db } from "../../../auth/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell
} from "recharts";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [error, setError] = useState("");
  const [firebaseUser, setFirebaseUser] = useState(null);

  const [quizStats, setQuizStats] = useState({
    accuracy: 0,
    completion: 0,
    consistency: 0,
  });

  const [chatStats, setChatStats] = useState({
    messages: 0,
    sessions: 0,
    quality: 0,
  });

  const API_BASE = "http://localhost:8000";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`${API_BASE}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchAttempts = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`${API_BASE}/api/pronunciation/recent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAttempts(data.attempts || []);
        }
      } catch { }
    };

    const fetchDashboardStats = async () => {
      try {
        const uid = firebaseUser.uid;

        // QUIZ
        const quizSnap = await getDocs(
          collection(db, "users", uid, "quizAttempts")
        );

        let totalCorrect = 0;
        let totalQuestions = 0;
        let totalAttempts = 0;

        quizSnap.forEach(doc => {
          const d = doc.data();
          totalCorrect += d.numCorrect || 0;
          totalQuestions += d.numTotal || 0;
          totalAttempts++;
        });

        setQuizStats({
          accuracy: totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
          completion: Math.min(totalAttempts * 10, 100),
          consistency: Math.min((totalAttempts / 10) * 100, 100),
        });

        // CHAT
        const chatSnap = await getDocs(
          collection(db, "users", uid, "chatAttempts")
        );

        let totalMessages = 0;
        let sessions = 0;

        chatSnap.forEach(doc => {
          const d = doc.data();
          totalMessages += d.turns || 0;
          sessions++;
        });

        setChatStats({
          messages: totalMessages,
          sessions,
          quality: sessions ? Math.min((totalMessages / sessions) * 10, 100) : 0,
        });

      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
    fetchAttempts();
    fetchDashboardStats();

  }, [firebaseUser]);

  if (loading) return <Center text="Loading..." />;
  if (!firebaseUser) return <Center text="Login required" error />;
  if (error) return <Center text={error} error />;

  // 📊 Chart Data
  const quizChart = [
    { name: "Accuracy", value: quizStats.accuracy },
    { name: "Completion", value: quizStats.completion },
    { name: "Consistency", value: quizStats.consistency },
  ];

  const chatChart = [
    { name: "Messages", value: chatStats.messages },
    { name: "Sessions", value: chatStats.sessions },
  ];

  const COLORS = ["#6366f1", "#3b82f6", "#22c55e"];

  return (
    <>
      <style>{styles}</style>

      <div className="dashboard">

        <div className="header">
          <h1>Dashboard</h1>
          <p>AI Learning Analytics</p>
        </div>

        {/* OVERALL */}
        <Section title="📊 Overall">
          <div className="grid">
            <Card label="XP" value={user?.totalXP ?? 0} />
            <Card label="Level" value={user?.level ?? 1} />
            <Card label="Streak" value={user?.streak ?? 0} />
            <Card label="Tags" value={Object.keys(user?.tag_xp || {}).length} />
          </div>
        </Section>

        {/* QUIZ CHARTS */}
        <Section title="🧠 Quiz Analytics">
          <div className="charts">

            <ChartBox title="Bar">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={quizChart}>
                  <XAxis dataKey="name" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Trend">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={quizChart}>
                  <XAxis dataKey="name" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>

          </div>
        </Section>

        {/* CHAT */}
        <Section title="💬 Chat Analytics">
          <div className="charts">

            <ChartBox title="Distribution">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={chatChart} dataKey="value" outerRadius={80}>
                    {chatChart.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Stats">
              <p>Messages: <b>{chatStats.messages}</b></p>
              <p>Sessions: <b>{chatStats.sessions}</b></p>
              <Progress value={chatStats.quality} />
            </ChartBox>

          </div>
        </Section>

        {/* PRONUNCIATION */}
        <Section title="🎤 Pronunciation">
          {attempts.map((a, i) => (
            <div key={i} className="attempt">
              <b>{a.label}</b> - {a.overall}%
              <p>{a.reference}</p>
            </div>
          ))}
        </Section>

      </div>
    </>
  );
}

/* COMPONENTS */

const Section = ({ title, children }) => (
  <div className="section"><h2>{title}</h2>{children}</div>
);

const Card = ({ label, value }) => (
  <div className="card">
    <div className="value">{value}</div>
    <div className="label">{label}</div>
  </div>
);

const ChartBox = ({ title, children }) => (
  <div className="chart-box">
    <h4>{title}</h4>
    {children}
  </div>
);

const Progress = ({ value }) => (
  <div className="bar-bg">
    <div className="bar-fill" style={{ width: `${value}%` }} />
  </div>
);

const Center = ({ text, error }) => (
  <div className={`center ${error ? "error" : ""}`}>{text}</div>
);

/* CSS */

const styles = `
.dashboard { padding:24px; background:#020617; color:white; }
.header { padding:20px; background:linear-gradient(#4f46e5,#3b82f6); border-radius:12px; }
.section { margin-top:20px; padding:20px; background:#020617; border-radius:12px; }
.grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
.card { padding:15px; background:#111827; border-radius:10px; text-align:center; }
.value { font-size:22px; color:#818cf8; }
.label { font-size:12px; color:gray; }

.charts { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
.chart-box { background:#111827; padding:15px; border-radius:12px; }

.bar-bg { height:8px; background:#1e293b; border-radius:999px; }
.bar-fill { height:100%; background:#6366f1; }

.attempt { margin-top:10px; padding:10px; background:#111827; border-radius:8px; }

.center { height:100vh; display:flex; justify-content:center; align-items:center; }
.error { color:red; }
`;