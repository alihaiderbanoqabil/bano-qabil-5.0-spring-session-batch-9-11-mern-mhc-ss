import React, { useState } from 'react'
const obj = {
    name: "hasnain",
    age: 28,
    address: {
        city: "Karachi",
        country: "Pakistan"
    },
};
const { age, ...restObj } = obj;
// console.log(age);
// console.log(restObj);

const students = ["Ali", "Hasnain", "Usman", "Muhammad"];
const [std1, std2, ...restStudents] = students;
// console.log(students[0], std1);
// console.log(students[1], std2);
// console.log(restStudents);

export const Counter = () => {
    // const state = useState(0);
    // console.log(state, "state");
    const [count, setCount] = useState(0);

    const add = () => {
        // count = count + 1;
        // state[1](state[0] + 1);
        // setCount(count + 1)
        setCount(prev => {
            // console.log(prev, "prev");

            return prev + 1
        })
        console.log(count, "count add");
    }

    const subtract = () => {
        // count = count - 1;
        // state[1](state[0] - 1);
        // setCount(count - 1)
        setCount(prev => prev - 1)
        console.log(count, "count subtract");
    }

    return (
        <div>
            <button onClick={add}>+</button>
            {/* <span>{count}</span> */}
            {/* <span>{state[0]}</span> */}
            <span>{count}</span>
            <button onClick={subtract}>-</button>
        </div>
    )
}

// export const Counter = () => {
//     let count = 0;
//     function add() {
//         count = count + 1;
//         // count +=1;
//         // count++;
//         console.log(count, "count add");
//     }

//     const subtract = () => {
//         count = count - 1;
//         console.log(count, "count subtract");
//     }
//     return (
//         <div>
//             {/* <button onclick="add()">+</button> */}
//             {/* <button onClick={add}>+</button> */}
//             <button onClick={() => add()}>+</button>
//             <span>{count}</span>
//             <button onClick={subtract}>-</button>
//         </div>
//     )
// }
