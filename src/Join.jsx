import React, {useState} from "react";
import "./css/Join.css"
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'


function Join() {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [nickName, setNickName] = useState("");
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [phoneNumber,setPhoneNumber] = useState("");
    const [loginIdChekState, setLoginIdChekState] = useState(false);



    const handleClickLoginIdCheck = async () =>{
      console.log(JSON.stringify(loginId));

      if(!loginId){
        Swal.fire({
          icon: "warning",
          title: "아이디를 입력해주세요",
        });
        return;
      }




      try{

        const req = await fetch(`${process.env.REACT_APP_API_URL}/api/user/LoginIdCheck`,{
          method : 'POST',
          headers: {
            'Content-Type': 'application/json', 
          },
          body: JSON.stringify({loginId}),
        });
        

        const res = await req.json();

        console.log("!!!!!"+res);

          if(res ==="ok"){
            setLoginIdChekState(true);
            Swal.fire({
              icon: "success",
              title: "사용 가능한 아이디 입니다.",
            });
            return;
          }
          else{
            Swal.fire({
              icon: "warning",
              title: "중복된 아이디 입니다.",
            });
            return;
          }
     


      }
      catch(error){
        console.error('Error:', error);
          Swal.fire({
            icon: "error",
            title: "회원가입 실패-error",
          });
      }


    }






    const handleClickToSumit = async () => {

      if(!name || !nickName || !loginId || !password || !phoneNumber)
      {
        Swal.fire({
          icon: "warning",
          title: "전부 입력해주세요",
        });
        return;
      }

      if(!loginIdChekState){
        Swal.fire({
          icon: "warning",
          title: "아이디 중복확인 해주세요",
        });
        return;
      }

      if(password != passwordCheck){
        console.log("비번 : " + password);
        console.log("비번 확인 : " + passwordCheck);

        Swal.fire({
          icon: "error",
          title: "비밀번호가 다릅니다",
        });
        return;

      }

      if(phoneNumber.length != 11){
        Swal.fire({
          icon: "warning",
          title: "전화번호를 확인해주세요",
        });
        return;
      }

      const JoinData = {
          name,
          nickName,
          loginId,
          password,
          phoneNumber
      };

      try{
        const res = await fetch('/api/user/join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(JoinData),
        });

        if(res.ok){
          Swal.fire({
            icon: "success",
            title: "회원가입 되었습니다.",
          });
          navigate('/login');
        }
        else{
          Swal.fire({
            icon: "error",
            title: "회원가입 실패",
          });
        }
      }catch(error){
          console.error('Error:', error);
          Swal.fire({
            icon: "error",
            title: "회원가입 실패-error",
          });
        }
      }


      










    





    const handleClickToMain = () =>{
        navigate("/main");
    }

    const handleClickToLogin = () =>{
        navigate("/login");
    }

    const handleClickToPWFind = () =>{
        navigate("/pw-find");
    }


  return (
    <div className="JoinPage-Body">
    
    <div className="Join-Box">

            <img 
              className="Login-Logo"
              onClick={handleClickToMain}
              src={`${process.env.PUBLIC_URL}/Login-Logo.PNG`} 
              alt="Logo" 
            />

        <div className="ID-PW-InputBox">
        <div className="Input-Wrapper">
          <input 
            type="text" 
            className="Join-Input" 
            placeholder="이름" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="Input-Wrapper">
          <input 
            type="text" 
            className="Join-Input" 
            placeholder="닉네임" 
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
          />
        </div>
        <div className="Input-Wrapper">
          <input 
            type="text" 
            className="Join-Input-ID" 
            placeholder="아이디"
            vlaue={loginId}
            onChange={(e) => setLoginId(e.target.value)} 
          />
        </div>
        <div className="Check-Button-Box">
          <button className="Check-Button" onClick={handleClickLoginIdCheck}>중복확인</button>
        </div>
        <div className="Input-Wrapper">
          <input 
            type="password" 
            className="Join-Input" 
            placeholder="비밀번호" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="Input-Wrapper">
          <input 
            type="password" 
            className="Join-Input" 
            placeholder="비밀번호 확인" 
            value={passwordCheck}
            onChange={(e) => setPasswordCheck(e.target.value)}
          />
        </div>
        <div className="Input-Wrapper">
          <input 
            type="text" 
            className="Join-Input" 
            placeholder="전화번호  (숫자만 입력)" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        </div>
        <button className="Login-Button" onClick={handleClickToSumit}>회원가입</button>
            <div className="Join-PWFind-Box">
              | &nbsp; &nbsp; <span className="Join" onClick={handleClickToLogin}>로그인</span>  &nbsp; &nbsp;  | 
              &nbsp;&nbsp; <span className="PWFind" onClick={handleClickToPWFind}>비밀번호 찾기</span> &nbsp;&nbsp; |
            </div>
    </div>
    
  
   

  
    </div>
  );
}

export default Join;   
