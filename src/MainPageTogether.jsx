import React from "react";
import "./css/Main.css"
import Navigate from "./Navigate";
import Navigate3 from "./Navigate3";



function MainPageTogether() {
  
    


  return (
    <div>
        
    <div className="Navigate-Box">
        <Navigate3 />
    </div>
       
   


    <div className="Main-Box" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'  }}>
        같이하기 메인 페이지 입니다1.
    </div>
    


  
    </div>
  );
}

export default MainPageTogether;
