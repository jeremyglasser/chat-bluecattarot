import React from "react";
import Image from "next/image";

const ProfilePage = ({ name = "Jeremy Glasser" }: { name?: string }) => {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    return (
        <div className="profile-container">
            <header className="profile-header">
                <div className="header-overlay"></div>
                <div className="header-content" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="profile-pic-container">
                        <div className="profile-pic-placeholder">{initials}</div>
                    </div>
                    <h1 className="name">{name}</h1>
                    <p className="title">Senior Software Engineer & Technical Leader</p>
                    <div className="contact-info">
                        <a href="mailto:jaglasser[at]gmail.com">jaglasser[at]gmail.com</a>
                    </div>

                    <div className="social-links">
                        <a href="https://linkedin.com/in/jeremyglasser" target="_blank" className="social-icon" title="LinkedIn">
                            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                        </a>
                        <a href="https://github.com/jeremyglasser" target="_blank" className="social-icon" title="GitHub">
                            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                        </a>
                    </div>
                </div>
            </header>

            <section className="profile-section bio-section">
                <p className="bio-text">
                    Adaptable and innovative software engineer with a solid foundation in computer science and over 20 years of experience.
                    Adept in a wide range of technologies, with a specialized focus on Cloud Architecture (AWS),
                    AI/ML Integration (RAG, LLMs), and Technical Leadership.
                </p>
            </section>

            <section className="profile-section">
                <h2>Featured Projects</h2>
                <div className="projects-grid">
                    <div className="project-card">
                        <div className="project-image">
                            <Image src="/projects/diner-components.png" alt="McDonald's Component Library" fill />
                        </div>
                        <div className="project-info">
                            <h3>McDonald&apos;s Component Library</h3>
                            <p>Led cross-team efforts to implement component-first development using Figma and Storybook, standardizing UI patterns for global applications.</p>
                            <div className="project-tags">
                                <span className="project-tag">Figma</span>
                                <span className="project-tag">Storybook</span>
                                <span className="project-tag">Design Systems</span>
                            </div>
                        </div>
                    </div>

                    <div className="project-card">
                        <div className="project-image">
                            <Image src="/projects/rag-llm.png" alt="RAG LLM Pipeline" fill />
                        </div>
                        <div className="project-info">
                            <h3>Financial Risk RAG Pipeline</h3>
                            <p>Developed a high-scale document management and RAG pipeline for analyzing financial risk using LLMs and vector databases.</p>
                            <div className="project-tags">
                                <span className="project-tag">Python</span>
                                <span className="project-tag">LangChain</span>
                                <span className="project-tag">OpenSearch</span>
                            </div>
                        </div>
                    </div>

                    <div className="project-card">
                        <div className="project-image">
                            <Image src="/projects/uav-mission.png" alt="UAV Mission Planning" fill />
                        </div>
                        <div className="project-info">
                            <h3>UAV Mission Planning Dashboard</h3>
                            <p>Built a real-time Angular-based telemetry and mission planning interface for critical mission operations and drone swarms.</p>
                            <div className="project-tags">
                                <span className="project-tag">Angular</span>
                                <span className="project-tag">WebSockets</span>
                                <span className="project-tag">GIS</span>
                            </div>
                        </div>
                    </div>

                    <div className="project-card">
                        <div className="project-image fit-image">
                            <Image src="/projects/parroty.png" alt="Card Game Projects" fill />
                        </div>
                        <div className="project-info">
                            <h3>Card Game Projects</h3>
                            <p>A web application that allows users to design and customize card templates for card games with a real-time editor.</p>
                            <a href="https://design.parrotycube.com" target="_blank" className="project-link" style={{ fontSize: '0.9rem', color: 'var(--palette-secondary)', textDecoration: 'underline', marginBottom: '12px', display: 'inline-block' }}>design.parrotycube.com</a>
                            <div className="project-tags">
                                <span className="project-tag">React</span>
                                <span className="project-tag">Canvas API</span>
                                <span className="project-tag">Web App</span>
                            </div>
                        </div>
                    </div>

                    <div className="project-card">
                        <div className="project-image">
                            <Image src="/projects/fantasy-baseball.png" alt="Fantasy Baseball Draft Wizard" fill />
                        </div>
                        <div className="project-info">
                            <h3>Fantasy Baseball Draft Wizard</h3>
                            <p>Architected and developed a full-featured fantasy baseball mobile application with live scoring and roster management.</p>
                            <div className="project-tags">
                                <span className="project-tag">Android</span>
                                <span className="project-tag">Java</span>
                                <span className="project-tag">SQL</span>
                            </div>
                        </div>
                    </div>

                    <div className="project-card">
                        <div className="project-image">
                            <Image src="/projects/patent-tees.jpeg" alt="Custom T-shirt Tools" fill />
                        </div>
                        <div className="project-info">
                            <h3>Custom T-shirt Scripts</h3>
                            <p>Developed Python scripts to automate T-shirt design workflows via the Printify API, including PDF to SVG conversion and image manipulation.</p>
                            <div className="project-tags">
                                <span className="project-tag">Python</span>
                                <span className="project-tag">API Integration</span>
                                <span className="project-tag">Image Processing</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="profile-section">
                <h2>Professional Experience</h2>
                <div className="experience-list">
                    <div className="experience-item">
                        <div className="exp-header">
                            <h3>Senior Software Engineer / Technical Lead / Coach</h3>
                            <span className="exp-date">Mar 2013 — Present</span>
                        </div>
                        <p className="exp-company">Aviture, Omaha, NE</p>
                        <ul className="exp-bullets">
                            <li>Developed and implemented best practices for maintainable, testable code in high-traffic applications supporting hundreds of thousands of users.</li>
                            <li>Created a custom document management system for a RAG LLM pipeline used for corporate sentiment analysis.</li>
                            <li>Produced AWS cloud-centric microservices for financial risk applications, handling everything from API design to automated deployment.</li>
                            <li>Standardized code style and significantly improved test coverage (~83% vs ~36% previously).</li>
                            <li>Built a GraphQL API and integrated with Redis for real-time data and decision support in critical operations.</li>
                        </ul>
                    </div>

                    <div className="experience-item">
                        <div className="exp-header">
                            <h3>Senior Software Engineer</h3>
                            <span className="exp-date">May 2011 — Mar 2013</span>
                        </div>
                        <p className="exp-company">Persistent Sentinel, Omaha, NE</p>
                        <ul className="exp-bullets">
                            <li>Technical lead on a sensor placement tool optimizing hardware placement with 3D line-of-sight visualization.</li>
                            <li>Developed a border-protection system in Java built on Eclipse and specialized GIS tools.</li>
                        </ul>
                    </div>

                    <div className="experience-item">
                        <div className="exp-header">
                            <h3>Software Engineer IV</h3>
                            <span className="exp-date">Sep 2004 — May 2011</span>
                        </div>
                        <p className="exp-company">21st Century Systems, Inc.</p>
                        <ul className="exp-bullets">
                            <li>Led development on critical decision support tools for Department of Defense (DoD) projects.</li>
                            <li>Specialized in PostgreSQL/MS SQL performance tuning and complex GIS data visualizations.</li>
                            <li>Implemented robust backend services using the Spring framework and Java.</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="profile-section">
                <h2>Technical Proficiency</h2>
                <div className="skills-grid">
                    <div className="skill-category">
                        <h4>Languages <span className="proficiency-level"></span></h4>
                        <div className="skill-tags">
                            {["JavaScript", "TypeScript", "Python", "Java", "GoLang"].map(s => <span key={s} className="skill-tag">{s}</span>)}
                        </div>
                    </div>
                    <div className="skill-category">
                        <h4>Cloud & AI <span className="proficiency-level"></span></h4>
                        <div className="skill-tags">
                            {["AWS", "GraphQL", "RAG", "LLM", "CDK", "Docker", "Kubernetes", "LangChain"].map(s => <span key={s} className="skill-tag">{s}</span>)}
                        </div>
                    </div>
                    <div className="skill-category">
                        <h4>Frontend <span className="proficiency-level"></span></h4>
                        <div className="skill-tags">
                            {["React", "Next.js", "Angular", "Redux", "D3.js", "SASS"].map(s => <span key={s} className="skill-tag">{s}</span>)}
                        </div>
                    </div>
                    <div className="skill-category">
                        <h4>Data <span className="proficiency-level"></span></h4>
                        <div className="skill-tags">
                            {["PostgreSQL", "Redis", "OpenSearch", "Elasticsearch", "MS SQL", "GIS Tools"].map(s => <span key={s} className="skill-tag">{s}</span>)}
                        </div>
                    </div>
                </div>
            </section>

            <section className="profile-section">
                <h2>Education</h2>
                <div className="education-item">
                    <h3>Master of Computer Science (Machine Learning)</h3>
                    <p>University of Nebraska-Lincoln</p>
                    <span className="edu-focus">Focus in Machine Learning and Multi-Agent Systems</span>
                </div>
                <div className="education-item">
                    <h3>Bachelor of Computer Science and Math</h3>
                    <p>University of Nebraska-Lincoln</p>
                </div>
            </section>
        </div >
    );
};

export default ProfilePage;
