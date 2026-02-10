import React, { useRef, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import './styles/homepage.css';
import "./styles/bootstrap-legacy.scoped.css";
import keyboard from './Assets/keyboard1.png';
import Tutorial from './Assets/TutorialSS.png';
import Stats from './Assets/StatsSS.png';
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
            strings: ['Get started on<br>your typing journey<br>with <span style="color: white; background: black; padding:7px 10px; border-radius: 5px;">Type<span style="color: black; background: orange; padding:2px 5px; border-radius: 5px;">hub</span></span>'],
            typeSpeed: 100,
            startDelay: 0,
            backSpeed: 25,
            backDelay: 700,
            loop: true,
            loopCount: Infinity,
            showCursor: false,
        });

        return () => {
            // Destroy Typed instance during cleanup to stop animation
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
                    // Add the corresponding show class based on the initial class
                    if (entry.target.classList.contains('hiddenleft')) {
                        entry.target.classList.add('showleft');
                    } else if (entry.target.classList.contains('hiddenright')) {
                        entry.target.classList.add('showright');
                    } else if (entry.target.classList.contains('hiddenup')) {
                        entry.target.classList.add('showup');
                    }
                } else {
                    // Remove the corresponding show class when not intersecting
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

        // Select and observe all hidden elements
        const hiddenElements = document.querySelectorAll('.hiddenleft, .hiddenright, .hiddenup');
        hiddenElements.forEach((el) => observer.observe(el));

        // Cleanup function to unobserve elements
        return () => {
            hiddenElements.forEach((el) => observer.unobserve(el));
        };
    }, []);

    return (
        <div className="legacy-page">
            <div className="homepage">
                <section className="section-1 w-100">
                    <div className="container-left px-5">
                        <h1 className="display-5 fw-bold text-body-emphasis">Master Speed and Precision, One Key at a Time!</h1>
                        <button
                            onClick={handleScrollToSection}
                            type="button"
                            className="btn btn-light btn-lg px-4 gap-3 align-self-start mt-3"
                        >
                            <KeyboardDoubleArrowDownOutlinedIcon fontSize="large" />Get Started
                        </button>
                    </div>
                    <div className="container-right">
                        <div className="monitor"><span ref={autoText}></span></div>
                        <div className="keyboard">
                            <img src={keyboard} alt="keyboard" />
                        </div>
                    </div>
                </section>

                <section ref={section2Ref} className="section-2 bg-white">
                    <div className="container px-4 py-5 pb-0 mx-auto">
                        <h2 className="pb-2 custom-border-bottom text-primary-emphasis">Beginner to Pro</h2>

                        <div className="row row-cols-1 row-cols-md-2 align-items-md-center g-5 py-5 pb-0">
                            <div className="hiddenleft col-md-5 d-flex flex-column align-items-start gap-2">
                                <h2 className="fw-bold text-body-emphasis">Unlock Your Typing Potential</h2>
                                <p className="text-body-secondary">Our typing tutorials are an excellent way to significantly boost your typing speed and accuracy. Experience a fun and engaging learning journey that keeps you motivated.</p>
                                <Link to="/quiz" className="btn btn-primary btn-lg">
                                    Start Learning
                                </Link>
                            </div>

                            <div className="col-md-7 d-flex align-items-end">
                                <img className="mb-0 flex-auto" src={Tutorial} alt="Tutorial-ss" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section-3 bg-body-secondary">
                    <div className="container px-4 py-5 pb-0 mx-auto">
                        <h2 className="pb-2 custom-border-bottom text-primary-emphasis text-end">Challenge Yourself</h2>

                        <div className="row row-cols-1 row-cols-md-2 align-items-md-center g-5 py-5 pb-0">
                            <div className="col-md-7 d-flex align-items-end">
                                <img className="mb-0 flex-auto" src={Stats} alt="Stats-ss" />
                            </div>

                            <div className="hiddenright col-md-5 d-flex flex-column align-items-start gap-2">
                                <h2 className="fw-bold text-body-emphasis">Master Your Typing Skills</h2>
                                <p className="text-body-secondary">Join our interactive typing tests designed to challenge your skills and improve your speed. Track your progress and see how far you can go by challenging yourself.</p>
                                <Link to="/pronunciation" className="btn btn-primary btn-lg">
                                    Test Yourself
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section-4 bg-white">
                    <div className="container py-4">
                        <div className="row  my-5 text-center">
                            <div className="hiddenup col-md-6 px-5">
                                <h3 className="text-dark">How Does it Work?</h3>
                                <p className="text-secondary">Keep practicing each lesson until you get all five stars. It really doesn't take much to learn, a few minutes a day for one to two weeks and you will be a pro!</p>
                            </div>
                            <div className="hiddenup col-md-6 px-5">
                                <h3 className="text-dark">Do I need an account?</h3>
                                <p className="text-secondary">You do not need to create an account. However, as you go through the lessons, you can create an optional profile in order to save your progress. </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section-5 bg-body-secondary">
                    <div className="container text-center py-5">

                        <div className="row mb-4">
                            <div className="col-10 offset-1 col-sm-8 offset-sm-2 col-lg-6 offset-lg-3">
                                <h6 className="text-muted text-uppercase text-body-tertiary fw-bold">Inside TYPEHUB</h6>
                                <h3 className="mt-0 mb-4 text-dark fw-bold">All the reasons to start learning how to type right now</h3>
                            </div>
                        </div>

                        <div className="hiddenup row text-body-tertiary">
                            <div className="col-sm-4 px-md-3 mb-5">
                                <img className="mb-2" src={featureStars} style={{ width: '180px', paddingTop: '25px' }} />
                                <p><strong>It's a game.</strong> An engaging and interactive experience while you are learning how to type.</p>
                            </div>
                            <div className="col-sm-4 px-md-3 mb-5">
                                <img className="mb-2" src={featureFingerMap} style={{ width: '170px' }} />
                                <p><strong>Proper finger guide.</strong> Will show you the correct finger mapping for every key as you type.</p>
                            </div>
                            <div className="col-sm-4 px-md-3 mb-5">
                                <img className="mb-2" src={featureBadge} style={{ width: '90px' }} />
                                <p><strong>Levels, Badges and Stars.</strong> All the reasons to keep you going, and build your muscle memory.</p>
                            </div>
                        </div>

                        <div className="hiddenup row text-body-tertiary">
                            <div className="col-sm-4 px-md-3 mb-5">
                                <img className="mb-2" src={featureAccessibility} style={{ width: '80px' }} />
                                <p><strong>Accessibility.</strong> TypeHub is the most accessible typing program available.</p>
                            </div>
                            <div className="col-sm-4 px-md-3 mb-5">
                                <img className="mb-2" src={featureKeyboard} style={{ width: '100px' }} />
                                <p><strong>100% Online.</strong> All you need is a keyboard and a web browser.</p>
                            </div>
                            <div className="col-sm-4 px-md-3 mb-5">
                                <img className="mb-2" src={featureCharts} style={{ width: '80px' }} />
                                <p><strong>Charts and Analysis.</strong> Get insights into your progress with detailed charts and performance analysis.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default HomePage;
