import React, { useContext, useState, useEffect } from "react";
import "./css/Navigate.css";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import Swal from 'sweetalert2';
import { AuthContext } from './AuthContext';

function Navigate2() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, setIsLoggedIn, user } = useContext(AuthContext);
    const [selectedMenu, setSelectedMenu] = useState(null);



    const handleClickToLogin = () => {
        navigate('/login');
    };

    const handleClickToMain = () => {
        navigate('/');
    };

    const handleClickToAdmin = () => {
        navigate("/editor/main");
    };



    const handleClickToLogout = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/user/logout`,
                {},
                { withCredentials: true }
            );
            if (response.status === 200) {
                Swal.fire({
                    title: "로그아웃 되었습니다.",
                    icon: "success"
                });
                setIsLoggedIn(false);
                navigate('/main');
            }
        } catch (error) {
            console.error('로그아웃 중 오류 발생', error);
        }
    };

    return (
        <div>
            <div className="Top-navigate">
                <div className="Logo-Box">
                    <img 
                        onClick={handleClickToMain}
                        src={`${process.env.PUBLIC_URL}/Logo.PNG`} 
                        alt="Logo" 
                        className="Logo"
                    />
                </div>
                
                {isLoggedIn ? (
                    <>
                        
                        <div className="login-Box" onClick={handleClickToLogout}>
                            <div className="login-text-Box">
                               {user.name}님 환영합니다.
                            </div>
                                <div className="login">로그아웃</div>
                            </div>
                    </>
                ) : (
                    <>
                        <div className="login-Box" onClick={handleClickToLogin}>
                            <div className="login">로그인</div>
                        </div>
                        <div className="start-Box" onClick={handleClickToAdmin}>
                            <div className="start">시작하기</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Navigate2;
