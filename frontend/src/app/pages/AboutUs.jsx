import React from "react";
import './styles/aboutUs.css';
import "./styles/bootstrap-legacy.scoped.css";
import aboutImg1 from './Assets/aboutus1.png';
import aboutImg2 from './Assets/aboutus2.png';


const AboutUs = () => {
    return (
        <div className="legacy-page">
            <div className="about-us bg-light text-dark">
                <section className="py-3 py-md-5 py-xl-8">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 col-md-10 col-lg-8">
                                <h3 className="fs-5 mb-2 text-secondary text-uppercase">About</h3>
                                <h2 className="display-5 mb-4">Our journey began with a vision to redefine the way people improve their typing skills.</h2>
                                <button type="button" className="btn btn-lg btn-primary mb-3 mb-md-4 mb-xl-5">Learn More</button>
                            </div>
                        </div>
                    </div>

                    <div className="container overflow-hidden">
                        <div className="row row-equal-height gy-4 gy-lg-0">
                            <div className="col-12 col-lg-6 d-flex">
                                <article className="w-100">
                                    <div className="card border-0 h-100">
                                        <img className="card-img-top img-fluid m-0" loading="lazy" src={aboutImg1} alt="Our Vision" />
                                        <div className="card-body border bg-white p-4 h-100">
                                            <div className="entry-header mb-3">
                                                <h2 className="card-title entry-title h4 mb-0">
                                                    <a className="link-dark text-decoration-none" href="#!">Our Vision</a>
                                                </h2>
                                            </div>
                                            <p className="card-text entry-summary text-secondary mb-3">Our vision is to create a platform where typing becomes more than just a skill—it evolves into a meaningful journey. By focusing on improving speed, accuracy, and technique, we offer an environment where users can confidently build their typing abilities with engaging tools and personalized guidance.</p>
                                        </div>
                                    </div>
                                </article>
                            </div>
                            <div className="col-12 col-lg-6 d-flex">
                                <article className="w-100">
                                    <div className="card border-0 h-100">
                                        <img className="card-img-top img-fluid m-0" loading="lazy" src={aboutImg2} alt="Our Approach" />
                                        <div className="card-body border bg-white p-4 h-100">
                                            <div className="entry-header mb-3">
                                                <h2 className="card-title entry-title h4 mb-0">
                                                    <a className="link-dark text-decoration-none" href="#!">Our Approach</a>
                                                </h2>
                                            </div>
                                            <p className="card-text entry-summary text-secondary mb-3">Our approach combines interactive tests, detailed analytics, and insightful tutorials to help users track their progress and continuously improve. We emphasize user experience, providing a seamless interface that makes learning enjoyable. With a focus on actionable feedback, users can see their strengths and areas for growth in real-time.</p>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AboutUs;
