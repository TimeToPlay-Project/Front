import React from "react";
import "./css/MainTogether.css"
import Navigate3 from "./Navigate3";
import { useNavigate } from 'react-router-dom';

function MainPageTogether() {
  const navigate = useNavigate();

  const goToLiar = () => {
    navigate('/liar');
  };

  const goToSpeed = () => {
    navigate('/speedQuiz');
  };

  return (
    <div>
      <div className="Navigate-Box">
        <Navigate3 />
      </div>

      <div className="main-container">
        <div className="background-pattern">
          <div className="pattern-circle"></div>
          <div className="pattern-line"></div>
          <div className="pattern-dots"></div>
        </div>
        
        <div className="content-wrapper_T">
          <div className="hero-section">
            <h1 className="hero-title">
              친구들과 함께<br />
              <span className="highlight">즐거운 시간</span>
            </h1>
            <p className="hero-description">
              실시간으로 친구들과 함께<br />
              게임을 즐겨보세요
            </p>
          </div>

          <div className="cards-container">
            <div 
              className="game-card liar"
              onClick={goToLiar}
            >
              <div className="card-icon">🎭</div>
              <h2 className="card-title">라이어 게임</h2>
              <p className="card-description">
                숨어있는 라이어를<br />
                찾아내보세요
              </p>
              <div className="card-decoration"></div>
            </div>

            <div 
              className="game-card speed"
              onClick={goToSpeed}
            >
              <div className="card-icon">⚡</div>
              <h2 className="card-title">스피드 퀴즈</h2>
              <p className="card-description">
                빠르게 답을 맞추고<br />
                승리를 쟁취하세요
              </p>
              <div className="card-decoration"></div>
            </div>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <span className="feature-text">실시간 대결</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💬</span>
              <span className="feature-text">실시간 채팅</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <span className="feature-text">승리 보상</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎲</span>
              <span className="feature-text">다양한 주제</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPageTogether;
