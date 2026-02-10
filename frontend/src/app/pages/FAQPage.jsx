import React from "react";
import './styles/faqPage.css';
import "./styles/bootstrap-legacy.scoped.css";


const FAQPage = () => {
    return (
        <div className="legacy-page">
            <div className="faq-page bg-light text-dark">
                <section className="bsb-faq-2 bg-light py-3 py-md-5 py-xl-8">
                    <div className="container">
                        <div className="row gy-5 gy-lg-0">
                            <div className="col-12 col-lg-6">
                                <h2 className="h1 mb-3">How can we help you? Unlocking possibilities for your touch typing journey.</h2>
                                <p className="lead fs-4 text-secondary mb-4">We hope you find answers to your questions here. For further assistance, please explore our Support Center or contact us via email.</p>
                                <button type="button" className="btn btn-lg bsb-btn-2xl btn-primary">All FAQs</button>
                            </div>
                            <div className="col-12 col-lg-6">
                                <div className="row justify-content-xl-end">
                                    <div className="col-12 col-xl-11">
                                        <div className="accordion accordion-flush" id="accordionExample">
                                            <div className="accordion-item mb-4 shadow-sm">
                                                <h2 className="accordion-header" id="headingOne">
                                                    <button className="accordion-button bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                                        What is touch typing?
                                                    </button>
                                                </h2>
                                                <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                                    <div className="accordion-body">
                                                        Touch typing is a method of typing without looking at the keyboard, using all fingers and relying on muscle memory to find keys.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-item mb-4 shadow-sm">
                                                <h2 className="accordion-header" id="headingTwo">
                                                    <button className="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                                        How can I improve my typing speed?
                                                    </button>
                                                </h2>
                                                <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo">
                                                    <div className="accordion-body">
                                                        Consistent practice using our typing tests and tutorials, focusing on accuracy over speed, and setting personal goals can greatly improve your typing speed.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-item mb-4 shadow-sm">
                                                <h2 className="accordion-header" id="headingThree">
                                                    <button className="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                                                        Do I need to create an account to use the typing tests?
                                                    </button>
                                                </h2>
                                                <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree">
                                                    <div className="accordion-body">
                                                        No, signing up is optional. You can access many of our features and tests without creating an account. However, creating an account allows you to save your progress and access personalized analysis.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-item mb-4 shadow-sm">
                                                <h2 className="accordion-header" id="headingFour">
                                                    <button className="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                                                        What kind of analysis does your app provide?
                                                    </button>
                                                </h2>
                                                <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="headingFour">
                                                    <div className="accordion-body">
                                                        Our app provides comprehensive analysis of your typing speed, accuracy, and progress over time, helping you identify areas for improvement.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-item mb-4 shadow-sm">
                                                <h2 className="accordion-header" id="headingFive">
                                                    <button className="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
                                                        How often should I practice touch typing?
                                                    </button>
                                                </h2>
                                                <div id="collapseFive" className="accordion-collapse collapse" aria-labelledby="headingFive">
                                                    <div className="accordion-body">
                                                        Regular practice is key. Aim for at least 15-30 minutes a day, several times a week, to see significant improvements in your typing skills.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-item mb-4 shadow-sm">
                                                <h2 className="accordion-header" id="headingSix">
                                                    <button className="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSix" aria-expanded="false" aria-controls="collapseSix">
                                                        Can I track my progress?
                                                    </button>
                                                </h2>
                                                <div id="collapseSix" className="accordion-collapse collapse" aria-labelledby="headingSix">
                                                    <div className="accordion-body">
                                                        Yes! If you create an account, you can track your progress over time, view your best scores, and analyze your typing patterns.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-item mb-4 shadow-sm">
                                                <h2 className="accordion-header" id="headingSeven">
                                                    <button className="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSeven" aria-expanded="false" aria-controls="collapseSeven">
                                                        Are there any tips for beginners?
                                                    </button>
                                                </h2>
                                                <div id="collapseSeven" className="accordion-collapse collapse" aria-labelledby="headingSeven">
                                                    <div className="accordion-body">
                                                        Start with home row keys, practice regularly, maintain proper posture, and avoid looking at the keyboard. Use our beginner tutorials for guidance.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-item mb-4 shadow-sm">
                                                <h2 className="accordion-header" id="headingEight">
                                                    <button className="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEight" aria-expanded="false" aria-controls="collapseEight">
                                                        What is the benefit of touch typing?
                                                    </button>
                                                </h2>
                                                <div id="collapseEight" className="accordion-collapse collapse" aria-labelledby="headingEight">
                                                    <div className="accordion-body">
                                                        Touch typing increases typing speed and accuracy, reduces strain on your hands, and allows you to focus on your screen rather than your keyboard.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-item mb-4 shadow-sm">
                                                <h2 className="accordion-header" id="headingNine">
                                                    <button className="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseNine" aria-expanded="false" aria-controls="collapseNine">
                                                        How long does it take to learn touch typing?
                                                    </button>
                                                </h2>
                                                <div id="collapseNine" className="accordion-collapse collapse" aria-labelledby="headingNine">
                                                    <div className="accordion-body">
                                                        The time it takes to learn touch typing varies, but with consistent practice, many users see improvement within a few weeks to a couple of months.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-item mb-4 shadow-sm">
                                                <h2 className="accordion-header" id="headingTen">
                                                    <button className="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTen" aria-expanded="false" aria-controls="collapseTen">
                                                        Can I use your app on mobile devices?
                                                    </button>
                                                </h2>
                                                <div id="collapseTen" className="accordion-collapse collapse" aria-labelledby="headingTen">
                                                    <div className="accordion-body">
                                                        Yes, our app is optimized for both desktop and mobile devices, allowing you to practice touch typing wherever you are.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-item mb-4 shadow-sm">
                                                <h2 className="accordion-header" id="headingEleven">
                                                    <button className="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEleven" aria-expanded="false" aria-controls="collapseEleven">
                                                        What if I encounter technical issues?
                                                    </button>
                                                </h2>
                                                <div id="collapseEleven" className="accordion-collapse collapse" aria-labelledby="headingEleven">
                                                    <div className="accordion-body">
                                                        If you experience any technical issues, please contact our support team through the Support Center, and we’ll be happy to assist you.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-item mb-4 shadow-sm">
                                                <h2 className="accordion-header" id="headingTwelve">
                                                    <button className="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwelve" aria-expanded="false" aria-controls="collapseTwelve">
                                                        Are there any additional resources for advanced typists?
                                                    </button>
                                                </h2>
                                                <div id="collapseTwelve" className="accordion-collapse collapse" aria-labelledby="headingTwelve">
                                                    <div className="accordion-body">
                                                        Yes, we provide advanced typing tests, drills, and tutorials designed to challenge experienced typists and help them refine their skills.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-item mb-4 shadow-sm">
                                                <h2 className="accordion-header" id="headingThirteen">
                                                    <button className="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThirteen" aria-expanded="false" aria-controls="collapseThirteen">
                                                        Can I customize my typing practice sessions?
                                                    </button>
                                                </h2>
                                                <div id="collapseThirteen" className="accordion-collapse collapse" aria-labelledby="headingThirteen">
                                                    <div className="accordion-body">
                                                        Yes! Our app allows you to customize practice sessions by selecting specific lessons, words, or typing styles to match your learning needs.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-item mb-4 shadow-sm">
                                                <h2 className="accordion-header" id="headingFourteen">
                                                    <button className="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFourteen" aria-expanded="false" aria-controls="collapseFourteen">
                                                        Is there a way to compete with others on your platform?
                                                    </button>
                                                </h2>
                                                <div id="collapseFourteen" className="accordion-collapse collapse" aria-labelledby="headingFourteen">
                                                    <div className="accordion-body">
                                                        Yes, we offer leaderboards and challenges where you can compete with other users, track your progress, and earn rewards for your achievements.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-item mb-4 shadow-sm">
                                                <h2 className="accordion-header" id="headingFifteen">
                                                    <button className="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFifteen" aria-expanded="false" aria-controls="collapseFifteen">
                                                        How can I provide feedback about the app?
                                                    </button>
                                                </h2>
                                                <div id="collapseFifteen" className="accordion-collapse collapse" aria-labelledby="headingFifteen">
                                                    <div className="accordion-body">
                                                        We value your feedback! You can provide feedback through our Support Center or by emailing us directly. Your input helps us improve the app for everyone.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    )
}

export default FAQPage;