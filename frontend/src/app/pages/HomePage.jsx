import React, { useRef, useEffect } from "react";
import { Link } from 'react-router-dom';
import './styles/homepage.css';
import "./styles/bootstrap-legacy.scoped.css";
import interactive from './Assets/interactive-session.png';
import pronunciation from './Assets/pronunciation.png';
import chatbot from './Assets/chatbot.png';
import Typed from 'typed.js';
import KeyboardDoubleArrowDownOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';
import featureStars from './Assets/feature-stars.svg';
import featureFingerMap from './Assets/feature-hand-fingers.svg';
import featureBadge from './Assets/feature-badge.svg';
import featureAccessibility from './Assets/feature-accessibility.svg';
import featureKeyboard from './Assets/feature-online-keyboard.png';
import featureCharts from './Assets/feature-Charts.png';

const HomePage = () => {
    const autoText = useRef(null);
    const section2Ref = useRef(null);

    useEffect(() => {
        const typed = new Typed(autoText.current, {
            strings: [

                'Start your<br>language learning journey<br>with <span style="color: white; background: black; padding:3px 8px; border-radius: 5px; display:inline-block;">Lang<span style="color: black; background: orange; padding:0px 4px; border-radius: 4px;">Hub</span></span>'
            ],
            typeSpeed: 100,
            startDelay: 0,
            backSpeed: 25,
            backDelay: 700,
            loop: true,
            loopCount: Infinity,
            showCursor: false,
        });

        return () => {
            typed.destroy();
        };
    }, []);

    const handleScrollToSection = () => {
        section2Ref.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('hiddenleft')) {
                        entry.target.classList.add('showleft');
                    } else if (entry.target.classList.contains('hiddenright')) {
                        entry.target.classList.add('showright');
                    } else if (entry.target.classList.contains('hiddenup')) {
                        entry.target.classList.add('showup');
                    }
                } else {
                    if (entry.target.classList.contains('hiddenleft')) {
                        entry.target.classList.remove('showleft');
                    } else if (entry.target.classList.contains('hiddenright')) {
                        entry.target.classList.remove('showright');
                    } else if (entry.target.classList.contains('hiddenup')) {
                        entry.target.classList.remove('showup');
                    }
                }
            });
        });

        const hiddenElements = document.querySelectorAll('.hiddenleft, .hiddenright, .hiddenup');
        hiddenElements.forEach((el) => observer.observe(el));

        return () => {
            hiddenElements.forEach((el) => observer.unobserve(el));
        };
    }, []);

    return (
        <div className="legacy-page">
            <div className="homepage">
                <section className="section-1 w-100">
                    <div className="container-left px-5">
                        <h1 className="display-5 fw-bold text-body-emphasis">
                            Build Your English Skills with Ease, Confidence, and Fluency
                        </h1>
                        <button
                            onClick={handleScrollToSection}
                            type="button"
                            className="btn btn-light btn-lg px-4 gap-3 align-self-start mt-3"
                        >
                            <KeyboardDoubleArrowDownOutlinedIcon fontSize="large" />
                            Get Started
                        </button>
                    </div>
                    <div className="container-right">
                        <div className="monitor">
                            <span ref={autoText}></span>
                        </div>
                        {/* <div className="keyboard">
                            <img src={keyboard} alt="learning tools" />
                        </div> */}
                    </div>
                </section>

                <section ref={section2Ref} className="section-2 bg-white">
                    <div className="container px-4 py-5 pb-0 mx-auto">
                        <h2 className="pb-2 custom-border-bottom text-primary-emphasis">
                            Learn Step by Step
                        </h2>

                        <div className="row row-cols-1 row-cols-md-2 align-items-md-center g-5 py-5 pb-0">
                            <div className="hiddenleft col-md-5 d-flex flex-column align-items-start gap-2">
                                <h2 className="fw-bold text-body-emphasis">
                                    Practice with Interactive Lessons
                                </h2>
                                <p className="text-body-secondary">
                                    Explore activities designed to strengthen vocabulary, grammar,
                                    and comprehension in a simple and engaging way. Our lessons help
                                    learners build a strong foundation and improve steadily with regular practice.
                                </p>
                                <Link to="/quiz" className="btn btn-primary btn-lg">
                                    Start Learning
                                </Link>
                            </div>

                            <div className="col-md-7 d-flex align-items-end">
                                <img className="mb-0 flex-auto" src={interactive} alt="Learning lessons preview" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section-3 bg-body-secondary">
                    <div className="container px-4 py-5 pb-0 mx-auto">
                        <h2 className="pb-2 custom-border-bottom text-primary-emphasis text-end">
                            Practice and Improve
                        </h2>

                        <div className="row row-cols-1 row-cols-md-2 align-items-md-center g-5 py-5 pb-0">
                            <div className="col-md-7 d-flex align-items-end">
                                <img className="mb-0 flex-auto" src={pronunciation} alt="Progress and practice preview" />
                            </div>

                            <div className="hiddenright col-md-5 d-flex flex-column align-items-start gap-2">
                                <h2 className="fw-bold text-body-emphasis">
                                    Strengthen Speaking and Pronunciation
                                </h2>
                                <p className="text-body-secondary">
                                    Use guided pronunciation practice and interactive exercises to improve
                                    clarity, confidence, and real communication skills. Keep learning through
                                    repeated practice and practical language use.
                                </p>
                                <Link to="/pronunciation" className="btn btn-primary btn-lg">
                                    Practice Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section-2 bg-white">
                    <div className="container px-4 py-5 pb-0 mx-auto">
                        <h2 className="pb-2 custom-border-bottom text-primary-emphasis">
                            Learn with Practice
                        </h2>

                        <div className="row row-cols-1 row-cols-md-2 align-items-md-center g-5 py-5 pb-0">
                            <div className="hiddenleft col-md-5 d-flex flex-column align-items-start gap-2">
                                <h2 className="fw-bold text-body-emphasis">
                                    Practice with Chatbot
                                </h2>
                                <p className="text-body-secondary">
                                    Explore activities designed to strengthen vocabulary, grammar,
                                    and comprehension in a simple and engaging way. Our lessons help
                                    learners build a strong foundation and improve steadily with regular practice.
                                </p>
                                <Link to="/chat" className="btn btn-primary btn-lg">
                                    Start Learning
                                </Link>
                            </div>

                            <div className="col-md-7 d-flex align-items-end">
                                <img className="mb-0 flex-auto" src={chatbot} alt="Learning lessons preview" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section-4 bg-body-secondary">
                    <div className="container py-4">
                        <div className="row my-5 text-center">
                            <div className="hiddenup col-md-6 px-5">
                                <h3 className="text-dark">How does it work?</h3>
                                <p className="text-secondary">
                                    Choose a learning activity, practice at your own pace, and build your
                                    skills over time. The platform is designed to make learning English more
                                    practical, interactive, and easier to stay consistent with.
                                </p>
                            </div>
                            <div className="hiddenup col-md-6 px-5">
                                <h3 className="text-dark">Do I need an account?</h3>
                                <p className="text-secondary">
                                    You may be able to explore some features without signing in, but creating
                                    an account helps you save progress, follow your learning journey, and get
                                    a more personalized experience.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section-5 section-dark-gray">
                    <div className="container text-center py-5">
                        <div className="row mb-4">
                            <div className="col-10 offset-1 col-sm-8 offset-sm-2 col-lg-6 offset-lg-3">
                                <h6 className="text-muted text-uppercase text-body-tertiary fw-bold">
                                    Inside the Platform
                                </h6>
                                <h3 className="mt-0 mb-4 text-dark fw-bold">
                                    Everything you need to grow your English skills
                                </h3>
                            </div>
                        </div>

                        <div className="hiddenup row text-body-tertiary">
                            <div className="col-sm-4 px-md-3 mb-5">
                                <img
                                    className="mb-2"
                                    src={featureStars}
                                    style={{ width: '180px', paddingTop: '25px' }}
                                    alt="Motivating progress"
                                />
                                <p>
                                    <strong>Motivating learning.</strong> Practice through engaging activities
                                    that keep learners focused, active, and encouraged to continue improving.
                                </p>
                            </div>
                            <div className="col-sm-4 px-md-3 mb-5">
                                <img
                                    className="mb-2"
                                    src={featureFingerMap}
                                    style={{ width: '170px' }}
                                    alt="Guided learning support"
                                />
                                <p>
                                    <strong>Guided practice.</strong> Learn step by step with structured exercises
                                    that support pronunciation, understanding, and language development.
                                </p>
                            </div>
                            <div className="col-sm-4 px-md-3 mb-5">
                                <img
                                    className="mb-2"
                                    src={featureBadge}
                                    style={{ width: '90px' }}
                                    alt="Progress tracking"
                                />
                                <p>
                                    <strong>Goals and progress.</strong> Stay motivated with learning milestones,
                                    achievements, and a sense of progress as you improve.
                                </p>
                            </div>
                        </div>

                        <div className="hiddenup row text-body-tertiary">
                            <div className="col-sm-4 px-md-3 mb-5">
                                <img
                                    className="mb-2"
                                    src={featureAccessibility}
                                    style={{ width: '80px' }}
                                    alt="Accessible learning"
                                />
                                <p>
                                    <strong>Accessible design.</strong> The platform is built to make learning
                                    approachable and usable for a wide range of learners.
                                </p>
                            </div>
                            <div className="col-sm-4 px-md-3 mb-5">
                                <img
                                    className="mb-2"
                                    src={featureKeyboard}
                                    style={{ width: '100px' }}
                                    alt="Online learning access"
                                />
                                <p>
                                    <strong>Learn anywhere.</strong> Access the platform online and continue
                                    practicing from wherever it is most convenient for you.
                                </p>
                            </div>
                            <div className="col-sm-4 px-md-3 mb-5">
                                <img
                                    className="mb-2"
                                    src={featureCharts}
                                    style={{ width: '80px' }}
                                    alt="Insights and improvement"
                                />
                                <p>
                                    <strong>Track improvement.</strong> Use feedback and progress insights to
                                    understand strengths, identify weak areas, and keep moving forward.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;