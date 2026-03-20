import React from "react";
import './styles/faqPage.css';
import "./styles/bootstrap-legacy.scoped.css";

const faqs = [
    {
        id: "One",
        question: "What is this app used for?",
        answer:
            "This app is designed to help users improve their English language skills through interactive learning tools such as pronunciation practice, quizzes, and conversation-based activities."
    },
    {
        id: "Two",
        question: "Do I need to create an account to use the app?",
        answer:
            "Some features may be available without signing in, but creating an account helps you save progress, track learning activity, and access a more personalized experience."
    },
    {
        id: "Three",
        question: "What kind of English skills can I practice here?",
        answer:
            "You can practice multiple skills including pronunciation, vocabulary, grammar, comprehension, and conversational English through guided exercises and interactive modules."
    },
    {
        id: "Four",
        question: "How does pronunciation practice work?",
        answer:
            "The pronunciation feature helps learners practice speaking by encouraging repetition, listening, and comparison so they can improve clarity, confidence, and spoken English accuracy."
    },
    {
        id: "Five",
        question: "Are the quizzes suitable for beginners?",
        answer:
            "Yes, the quizzes are useful for beginners as well as learners at higher levels. They are meant to reinforce understanding and help users steadily improve over time."
    },
    {
        id: "Six",
        question: "Can I track my learning progress?",
        answer:
            "Yes, the platform is designed to support progress tracking so learners can monitor improvement, stay motivated, and identify areas that need more practice."
    },
    {
        id: "Seven",
        question: "Is this app only for students?",
        answer:
            "No, the app can be used by students, job seekers, professionals, and anyone who wants to strengthen their English communication skills."
    },
    {
        id: "Eight",
        question: "Can I use the app on mobile devices?",
        answer:
            "Yes, the app is designed to be accessible on different devices so learners can continue practicing from desktop or mobile environments."
    },
    {
        id: "Nine",
        question: "How often should I practice?",
        answer:
            "Regular practice is the best way to improve. Even short daily sessions can help build vocabulary, confidence, and better communication habits over time."
    },
    {
        id: "Ten",
        question: "Does the app help with speaking confidence?",
        answer:
            "Yes, the app supports speaking confidence by combining pronunciation work, repeated practice, and conversational activities that encourage active language use."
    },
    {
        id: "Eleven",
        question: "What should I do if something is not working?",
        answer:
            "If you experience a technical issue, try refreshing the page or signing in again. If the problem continues, contact the support team or project administrator for help."
    },
    {
        id: "Twelve",
        question: "Can this app help me prepare for interviews or real conversations?",
        answer:
            "Yes, the app can support interview and conversation preparation by helping you practice listening, speaking, and answering questions more clearly and confidently."
    },
    {
        id: "Thirteen",
        question: "Is the app useful for self-learning?",
        answer:
            "Absolutely. The app is well suited for self-paced learning because users can practice independently, repeat exercises, and build skills step by step."
    },
    {
        id: "Fourteen",
        question: "What makes this app different from basic study materials?",
        answer:
            "Unlike static study materials, this app gives learners interactive practice opportunities that make learning more engaging, practical, and easier to apply in real situations."
    },
    {
        id: "Fifteen",
        question: "How can I give feedback about the app?",
        answer:
            "You can share feedback with the project team or support contact so future improvements can better match learner needs and improve the overall experience."
    }
];

const FAQPage = () => {
    return (
        <div className="legacy-page">
            <div className="faq-page bg-light text-dark">
                <section className="bsb-faq-2 bg-light py-3 py-md-5 py-xl-8">
                    <div className="container">
                        <div className="row gy-5 gy-lg-0">
                            <div className="col-12 col-lg-6">
                                <h2 className="h1 mb-3">
                                    How can we help you with your English learning journey?
                                </h2>
                                <p className="lead fs-4 text-secondary mb-4">
                                    Here are answers to the most common questions about using the platform,
                                    practicing your skills, and getting the most out of your learning experience.
                                </p>
                            </div>

                            <div className="col-12 col-lg-6">
                                <div className="row justify-content-xl-end">
                                    <div className="col-12 col-xl-11">
                                        <div className="accordion accordion-flush" id="accordionExample">
                                            {faqs.map((faq, index) => (
                                                <div key={faq.id} className="accordion-item mb-4 shadow-sm">
                                                    <h2 className="accordion-header" id={`heading${faq.id}`}>
                                                        <button
                                                            className={`accordion-button bg-transparent fw-bold ${index !== 0 ? "collapsed" : ""}`}
                                                            type="button"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target={`#collapse${faq.id}`}
                                                            aria-expanded={index === 0 ? "true" : "false"}
                                                            aria-controls={`collapse${faq.id}`}
                                                        >
                                                            {faq.question}
                                                        </button>
                                                    </h2>
                                                    <div
                                                        id={`collapse${faq.id}`}
                                                        className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                                                        aria-labelledby={`heading${faq.id}`}
                                                        data-bs-parent="#accordionExample"
                                                    >
                                                        <div className="accordion-body">
                                                            {faq.answer}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default FAQPage;