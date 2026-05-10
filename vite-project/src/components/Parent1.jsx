import React, { useState } from "react";
import { Child } from "./Child";

export function Parent1() {
    const [message, setMessage] = useState("");

    const sendData = (data) => {
        console.log("data", data);

        setMessage(data);
    };

    return (
        <div>
            <h2>Parent Component</h2>
            <p>Message from child: {message}</p>

            <Child sendData={sendData} />
        </div>
    );
}
