import React from "react";
import { ReactComponent as MainIcon } from './logo.svg';
import { useNavigate } from 'react-router-dom';

function StartPage() {
    const navigate = useNavigate();

  const handleClick = () => {
    navigate('/main');
  };


  return (
    <div>
    
       
   


    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    시작 페이지 입니다.
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  <MainIcon style={{ width: '100px', height: '100px' }} onClick = {handleClick} />
</div>

  
    </div>
  );
}

export default StartPage;
