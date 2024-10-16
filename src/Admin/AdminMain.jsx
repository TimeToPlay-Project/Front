import React from "react";
import "../css/Main.css"
import AdminNavigate from "./AdminNavigate";


function AdminMain() {

    


  return (
    <div>
        
    <div className="Navigate-Box">
        <AdminNavigate />
    </div>
       
   


    <div className="Main-Box" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'  }}>
        관리자 페이지 입니다1.
    </div>
    


  
    </div>
  );
}

export default AdminMain;
