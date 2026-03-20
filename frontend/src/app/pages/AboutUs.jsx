import React from "react";
import './styles/aboutUs.css';
import "./styles/bootstrap-legacy.scoped.css";
import aboutImg1 from './Assets/Our-vision.png';
import aboutImg2 from './Assets/Our-mission.png';

const teamMembers = [
    { name: "Taniya Shrivastava", role: "22ESKCX117" },
    { name: "Tanmay Sharma", role: "22ESKCX118" },
    { name: "Vaibhav Upadhyay", role: "22ESKCX119" },
    { name: "Sourav Poonia", role: "22ESKCX111" },
];

const AboutUs = () => {
    return (
        <div className="legacy-page">
            <div className="about-us bg-light text-dark">
                <section className="py-3 py-md-5 py-xl-8">

                    {/* HERO SECTION */}
                    <div className="container">
                        <div className="row">
                            <div className="col-12 col-md-10 col-lg-8">
                                <h3 className="fs-5 mb-2 text-secondary text-uppercase">About</h3>
                                <h2 className="display-6 mb-4">
                                    Our journey began with a vision to make language learning interactive, practical, and accessible.
                                </h2>
                                <button type="button" className="btn btn-lg btn-primary mb-3 mb-md-4 mb-xl-5">
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* VISION + MISSION */}
                    <div className="container overflow-hidden mb-5">
                        <div className="row row-equal-height gy-4 gy-lg-0">

                            <div className="col-12 col-lg-6 d-flex">
                                <article className="w-100">
                                    <div className="card border-0 h-100">
                                        <img
                                            className="card-img-top img-fluid m-0"
                                            loading="lazy"
                                            src={aboutImg1}
                                            alt="Our Vision"
                                        />
                                        <div className="card-body border bg-white p-4 h-100">
                                            <h2 className="h4 mb-3">Our Vision</h2>
                                            <p className="text-secondary">
                                                Our vision is to create a platform where language learning becomes
                                                more engaging, effective, and accessible. We want learners to build
                                                confidence in their communication skills through continuous practice
                                                and supportive learning tools.
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            </div>

                            <div className="col-12 col-lg-6 d-flex">
                                <article className="w-100">
                                    <div className="card border-0 h-100">
                                        <img
                                            className="card-img-top img-fluid m-0"
                                            loading="lazy"
                                            src={aboutImg2}
                                            alt="Our Mission"
                                        />
                                        <div className="card-body border bg-white p-4 h-100">
                                            <h2 className="h4 mb-3">Our Mission</h2>
                                            <p className="text-secondary">
                                                Our mission is to help users improve pronunciation, understanding, and speaking confidence through interactive lessons, quizzes, and real learning experiences that support steady progress, consistency, and long-term language mastery.
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            </div>

                        </div>
                    </div>

                    {/* PROJECT TEAM (MOVED DOWN HERE) */}
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <h3 className="mb-4 text-center">Project Team</h3>
                            </div>
                        </div>

                        <div className="row gy-4">
                            {teamMembers.map((member, index) => (
                                <div key={index} className="col-12 col-sm-6 col-lg-3 d-flex">
                                    <div className="card border-0 shadow-sm w-100 h-100 text-center">
                                        <div className="card-body bg-white p-4">
                                            <h5 className="card-title mb-2">{member.name}</h5>
                                            <p className="text-primary fw-semibold mb-0">{member.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </section>
            </div>
        </div>
    );
};

export default AboutUs;