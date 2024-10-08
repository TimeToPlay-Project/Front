import React from "react";
import "./css/Main.css"
import Navigate from "./Navigate";


function MainPage() {

    


  return (
    <div>
        
    <div className="Navigate-Box">
        <Navigate />
    </div>
       
   


    <div className="Main-Box" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'  }}>
        메인 페이지 입니다1.
    </div>
    


  
    </div>
  );
}

export default MainPage;
