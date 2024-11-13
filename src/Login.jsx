import React, { useState, useContext } from "react";
import "./css/Login.css"
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'
import { AuthContext } from "./AuthContext";

function Login() {
  const { setIsLoggedIn, setUser } = useContext(AuthContext);
  const [loginInfo, setLoginInfo] = useState({
    loginId:'' ,
    loginPW :'' 
  });

  const handleChangeLoginId = (e) => {
    setLoginInfo((prevInfo) => ({
      ...prevInfo,
      loginId: e
    }));
  }

  const handleChangeLoginPW = (e) => {
    setLoginInfo((prevInfo) => ({
      ...prevInfo,
      loginPW: e
    }));
  }

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    const loginData = {
      loginId: loginInfo.loginId,
      loginPW: loginInfo.loginPW
    }

    e.preventDefault();

    try {
      const req2 = await axios.post(`${process.env.REACT_APP_API_URL}/api/user/login`, loginData, {
        headers: {
          'Content-Type': 'application/json', 
        },
        withCredentials: true,
      });

      if(req2.status === 200) {
        Swal.fire({
          icon: "success",
          title: "로그인 성공",
        });
        console.log(req2.data);
        

        setUser(req2.data);
        setIsLoggedIn(true);
        navigate('/main');
      } else {
        Swal.fire({
          icon: "error",
          title: "비밀번호가 다릅니다",
        });
      }
    } catch (error) {
      console.log(error);
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
          onClick={() => navigate("/main")}
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
                onChange={(e) => handleChangeLoginId(e.target.value)}
              />
            </div>
            <div className="Input-Wrapper">
              <input 
                type="password" 
                className="Login-Input-PW" 
                placeholder="비밀번호" 
                value={loginInfo.loginPW}
                onChange={(e) => handleChangeLoginPW(e.target.value)}
              />
            </div>
          </div>
          <button className="Login-Button" onClick={handleLogin}>로그인</button>
        </form>

        <div className="Join-PWFind-Box">
          | &nbsp; &nbsp; <span className="Join" onClick={() => navigate("/join")}>회원가입</span>  &nbsp; &nbsp;  | 
          &nbsp;&nbsp; <span className="PWFind" onClick={() => navigate("/pw-find")}>비밀번호 찾기</span> &nbsp;&nbsp; |
        </div>
      </div>
    </div>
  );
}

export default Login;
