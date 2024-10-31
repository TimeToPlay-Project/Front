import React, { useEffect, useState } from "react";


function TournamentEditPage({id}) {
    const [tournamentData, setTournamentData] = useState(null);
    useEffect(() => {
        if (id !== "new") {
            fetch(`${process.env.REACT_APP_API_URL}/api/editor/tournament/${id}`)
            .then(response => response.json())
            .then(data => setTournamentData(data))
            .catch(error => console.error('Error fetching tournamentEditData:', error));
        }
    }, [id]);

    console.log(tournamentData);
    
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

    