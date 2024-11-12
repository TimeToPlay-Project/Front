import React, { useState } from "react";
import "./css/Login.css"
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'

function Login() {

  const [loginInfo, setLoginInfo] = useState({
    loginId:'' ,
    loginPW :'' 
  })


  const handleChangeLoginId = (e) =>{
    setLoginInfo((prevInfo) => ({
      ...prevInfo,
      loginId: e
    }));
  }

  const handleChangeLoginPW = (e) =>{
    setLoginInfo((prevInfo)=> ({
      ...prevInfo,
      loginPW: e
    }))
  }



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

      const loginData ={
        loginId : loginInfo.loginId,
        loginPW : loginInfo.loginPW
      }
    


      e.preventDefault();

      try{
        const req2 = await axios.post(`${process.env.REACT_APP_API_URL}/api/user/login`, loginData, {
          headers: {
            'Content-Type': 'application/json', 
          },
          withCredentials: true,  

        });
        console.log(req2.status);
        if(req2.status===200){
          Swal.fire({
            icon: "success",
            title: "로그인 성공",
          });
          navigate('/main');
        }
        else{
          Swal.fire({
            icon: "error",
            title: "비밀번호가 다릅니다2",
          });
        }
      }
      catch(error){
        Swal.fire({
          icon: "error",
          title: "아이디 또는 비밀번호를 확인해주세요",
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

      <form>
        <div className="ID-PW-InputBox">
        <div className="Input-Wrapper">
          <input 
            type="text" 
            className="Login-Input-ID" 
            placeholder="아이디" 
            value={loginInfo.loginId}
            onChange={(e) => {
              handleChangeLoginId(e.target.value)
            }}
          />
        </div>
        <div className="Input-Wrapper">
          <input 
            type="password" 
            className="Login-Input-PW" 
            placeholder="비밀번호" 
            value={loginInfo.loginPW}
            onChange={(e) => {
              handleChangeLoginPW(e.target.value)
            }}
            />
        </div>
        </div>
        <button className="Login-Button" onClick={handleLogin}>로그인</button>
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
