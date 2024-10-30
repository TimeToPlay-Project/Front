import React from "react";
import "./css/Login.css"
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'

function Login() {


    const navigate = useNavigate();

    const handleClickToMain = () =>{
        navigate("/main");
    }

    const handleClickToJoin = () =>{
        navigate("/join");
    }

    const handleClickToPWFind = () =>{
        navigate("/pw-find");
    }

    const handleLogin = async (e) =>{

      e.preventDefault();

      try{
        const req = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/session`, { withCredentials: true });
      }
      catch(error){
        Swal.fire({
          icon: "error",
          title: "비밀번호가 다릅니다",
        });

      }
    }


  return (
    <div className="LoginPage-Body">
    
    <div className="Login-Box">

            <img 
              className="Login-Logo"
              onClick={handleClickToMain}
              src={`${process.env.PUBLIC_URL}/Login-Logo.PNG`} 
              alt="Logo" 
            />

      <form onSubmit={handleLogin}>
        <div className="ID-PW-InputBox">
        <div className="Input-Wrapper">
          <input type="text" className="Login-Input-ID" placeholder="아이디" />
        </div>
        <div className="Input-Wrapper">
          <input type="password" className="Login-Input-PW" placeholder="비밀번호" />
        </div>
        </div>
        <button className="Login-Button">로그인</button>
      </form>
            <div className="Join-PWFind-Box">
              | &nbsp; &nbsp; <span className="Join" onClick={handleClickToJoin}>회원가입</span>  &nbsp; &nbsp;  | 
              &nbsp;&nbsp; <span className="PWFind" onClick={handleClickToPWFind}>비밀번호 찾기</span> &nbsp;&nbsp; |
            </div>
    </div>
    
  
   

  
    </div>
  );
}

export default Login;   
