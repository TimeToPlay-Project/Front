import React from "react";
import "./css/TestMain.css"
import Navigate from "../Navigate";
import TestContent from "./TestContent";


function TestMain() {


   


    



  return (
    <div>
        
    <div className="Navigate-Box">
        <Navigate />
    </div>
       
   


    <div className="Main-Box-Test" style={{ display: 'flex', alignItems: 'center', height: '100vh', justifyContent: 'center'  }}>
        
        <div className="TestContent-Box">
           <TestContent />
        </div>
           
    </div>
    


  
    </div>
  );
}

export default TestMain;
