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
       
   


    <div className="Main-Box" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'  }}>
    <div className="game-mode-container">
            <h2 className="mode-title">모드 선택</h2>
            <div className="buttons-wrapper">
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

    </div>
    


  
    </div>
  );
}

export default StartPage;
