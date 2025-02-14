import React from "react";
import "./css/Main.css"
import Navigate from "./Navigate";
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const navigate = useNavigate();

  const goToQuiz = () => {
    navigate('/quiz');
  };

  const goToTest = () => {
    navigate('/test');
  };

  return (
    <div>
      <div className="Navigate-Box">
        <Navigate />
      </div>

      <div className="main-container">
        <div className="background-pattern">
          <div className="pattern-circle"></div>
          <div className="pattern-line"></div>
          <div className="pattern-dots"></div>
        </div>
        
        <div className="content-wrapper">
          <div className="hero-section">
            <h1 className="hero-title">
              게임으로 시작하는<br />
              <span className="highlight">새로운 경험</span>
            </h1>
            <p className="hero-description">
              퀴즈와 심리테스트를 통해<br />
              나를 알아가는 여정을 시작해보세요
            </p>
          </div>

          <div className="cards-container">
            <div 
              className="game-card quiz"
              onClick={goToQuiz}
            >
              <div className="card-icon">❓</div>
              <h2 className="card-title">퀴즈 챌린지</h2>
              <p className="card-description">
                다양한 주제의 퀴즈로<br />
                지식을 테스트해보세요
              </p>
              <div className="card-decoration"></div>
            </div>

            <div 
              className="game-card personality"
              onClick={goToTest}
            >
              <div className="card-icon">🎯</div>
              <h2 className="card-title">심리 테스트</h2>
              <p className="card-description">
                재미있는 테스트로<br />
                나의 성향을 발견해보세요
              </p>
              <div className="card-decoration"></div>
            </div>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🎮</span>
              <span className="feature-text">다양한 게임</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <span className="feature-text">독특한 경험</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌟</span>
              <span className="feature-text">매일 업데이트</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤝</span>
              <span className="feature-text">함께하는 즐거움</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
