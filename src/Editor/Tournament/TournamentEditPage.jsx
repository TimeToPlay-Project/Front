import React, { useEffect, useState } from "react";


function TournamentEditPage(id) {
    const [tournamentData, setTournamentData] = useState([]);

    useEffect(() => {
        if (id !== "new") {
            
        }
    }, [id])
    
    return (
        <div>
            <div>sss</div>
            <div>
                <button>Main</button>
            </div>
        </div>
    );
}

export default TournamentEditPage;

    