import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import logoBg from '../assets/logo.CC.png'; // Use the correct logo

const featureCards = [
  {
    title: "YOUR PROFILE",
    icon: "👨‍💻",
    description: "Track progress and achievements",
    link: "/profile",
    color: "#bd93f9"
  },
  {
    title: "COLLABORATION HUB",
    icon: "🤝",
    description: "Pair-program in real-time",
    link: "/rooms",
    color: "#8be9fd"
  },
  {
    title: "CONTEST SCHEDULE",
    icon: "🏆",
    description: "Never miss a coding contest",
    link: "/calendar",
    color: "#ff79c6"
  }
];

const Home = () => {
  return (
    <div className="home-page">
      <main className="main">
        <div className="hero-container">
          <div className="logo-bg">
            <img 
              src={logoBg} 
              alt="" 
              aria-hidden="true"
            />
          </div>
          <div className="hero-content">
            <h1 className="app-name">CodeCanvas</h1>
            <p className="tagline">
              Elevate your coding journey with challenges, contests & collaboration
            </p>
          </div>
        </div>

        <div className="app-description">
          <p>
            CodeCanvas is a dedicated platform for competitive programmers to 
            practice problems, track contests, and collaborate with peers. 
            Access curated challenges from LeetCode and Codeforces, join 
            real-time coding rooms, and monitor your progress through 
            personalized analytics.
          </p>
        </div>

        <section className="features-grid">
          {featureCards.map((card) => (
            <Link to={card.link} key={card.title} className="feature-card" style={{ '--card-color': card.color }}>
              <div className="icon">{card.icon}</div>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
            </Link>
          ))}
        </section>
      </main>

      <footer className="app-footer">
        <div>© {new Date().getFullYear()} CodeCanvas</div>
        <div>Empowering coders worldwide</div>
      </footer>
    </div>
  );
};

export default Home;
