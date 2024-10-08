import React from "react";
import "./css/TestResult.css";
import Navigate from "../Navigate";
import { useLocation } from 'react-router-dom';

function TestResult() {
    const location = useLocation();
    const { result } = location.state || {};

    return (
        <div>
            <div className="Navigate-Box">
                <Navigate />
            </div>
        <div className="Main-Box-Test">
            
            <div className="Test-Result-Box">
                <div className="Test-Result-Img-Box">
                    <img src={`http://localhost:4000${result[2]}`} alt="Result" className="result-image" />
                </div>
                <div className="Test-Result-Description-Box">
                    <div className="Test-Result-Description-Smallbox">
                        <div className="Test-Result-Result">{result[0]}</div>
                        <div className="Test-Result-Description" dangerouslySetInnerHTML={{ __html: result[1] }}></div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default TestResult;
