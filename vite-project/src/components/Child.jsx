import React, { useState } from "react";

export function Child({ sendData }) {
    const [name, setName] = useState("")

    const handleClick = () => {
        // sendData("Hello from Child!");
        sendData(name);
    };

    return (
        <div>
            <h3>Child Component</h3>
            <input type="text" placeholder="Enter your name to send into parent" value={name} onChange={e => setName(e.target.value)} />
            <button onClick={handleClick}>
                Send Data to Parent
            </button>
        </div>
    );
}
