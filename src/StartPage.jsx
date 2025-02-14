import React from "react";
import "./css/Main.css"
import Navigate from "./Navigate";
import Navigate2 from "./Navigate2";
import "./css/StartPage.css"
import {useNavigate} from 'react-router-dom';

function StartPage() {

  const navigate = useNavigate();

  
    const mult = () =>{
      navigate("/TogetherMain");
    }

    const solo = () =>{
      navigate("/main");
    }


  return (
    <div>
        
    <div className="Navigate-Box">
        <Navigate2 />
    </div>
       
   


    <div className="TTP-main-Container">
        <div className="background-elements">
          <div className="circle-decoration left"></div>
          <div className="circle-decoration right"></div>
          <div className="background-text">TimeToPlay</div>
        </div>
        
        <div className="main-content">
          <div className="text-section" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <h1 className="main-title">
              혼자 또는 같이<br />
              여러 흥미로운 게임을<br />
              즐겨 보세요
            </h1>
            <p className="sub-text">
              퀴즈, 라이어게임, 심리테스트 등<br />
              다양한 컨텐츠 게임을 즐겨 보세요
            </p>
            <div className="buttons-wrapper" style={{marginTop: '20px'}}>
              <button 
                className="mode-button solo"
                onClick={() => solo()}
              >
                <span className="button-content">
                  <span className="icon">👤</span>
                  <span className="text">혼자하기</span>
                </span>
              </button>
              <button 
                className="mode-button multi"
                onClick={() => mult()}
              >
                <span className="button-content">
                  <span className="icon">👥</span>
                  <span className="text">같이하기</span>
                </span>
              </button>
            </div>
          </div>
          
          <div className="image-section">
            <div className="preview-stack">
              <div className="preview-item featured">
                <img src="/liar.png" alt="게임 미리보기 1" className="preview-image" />
                <div className="preview-overlay">
                  <span className="preview-text">라이어 게임</span>
                </div>
              </div>
              <div className="preview-item">
                <img src="/speed.png" alt="게임 미리보기 2" className="preview-image" />
                <div className="preview-overlay">
                  <span className="preview-text">스피드 게임</span>
                </div>
              </div>
              <div className="preview-item">
                <img src="/quiz.png" alt="게임 미리보기 3" className="preview-image" />
                <div className="preview-overlay">
                  <span className="preview-text">퀴즈 게임</span>
                </div>
              </div>
              <div className="preview-item">
                <img src="/image4.jpg" alt="게임 미리보기 4" className="preview-image" />
                <div className="preview-overlay">
                  <span className="preview-text">심리 테스트</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartPage;
