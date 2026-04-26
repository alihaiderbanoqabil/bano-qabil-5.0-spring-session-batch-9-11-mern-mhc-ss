import React from 'react'
const properties = {
    "isStudent": true,
    "name": "ali",
    "age": 28,
    "hobbies": [
        {
            "id": 1,
            "name": "playing"
        },
        {
            "id": 2,
            "name": "coding"
        },
        {
            "id": 3,
            "name": "teaching"
        }
    ],
    "studentInfo": {
        "name": "ali",
        "age": 28,
        "address": {
            "city": "Karachi",
            "country": "Pakistan"
        }
    }
}

// let name = "hasnain";
// if (name === undefined) {
//     name = "ali"
// }
// const name = "hansain" || "Default" ;
// const name = "" || "Default" ;
// const name = undefined || "Default" ;
// const name = "" ?? "Default" ;
// const name = 0 ?? "Default" ;
const name = undefined ?? "Default";

console.log(name, "name");

// const {
//     isStudent,
//     name,
//     age,
//     studentInfo,
//     hobbies } = properties
export const Greeting = ({
    isStudent: _isStudent,
    name = "Anwar",
    age,
    // studentInfo: { address: { city } },
    studentInfo,
    hobbies
}) => {
    // const { address } = studentInfo

    return (
        <div>
            Hello Good Morning, <strong>{name}</strong>, your age is <strong>{age}</strong>,
            {_isStudent ? "You are a student" : "You are not a student"},

            Student Info : <pre>{JSON.stringify(studentInfo, null, 4)}</pre>
            {/* {studentInfo.address.city} */}
            {/* {studentInfo && studentInfo.address && studentInfo.address.city} */}
            {studentInfo?.address?.city}

            <ol>
                {hobbies.map((hobby, index, array) => {
                    console.log(hobby, index, array);
                    return (
                        <li key={hobby.id}>{hobby.name.toUpperCase()}
                            <strong> ({index})</strong>
                        </li>
                    )
                })}
            </ol>
        </div>
    )
}

// export const Greeting = (props) => {
//     const isStudent = false;
//     const {
//         isStudent: _isStudent,
//         name = "Anwar",
//         age,
//         studentInfo: { address: { city } },
//         studentInfo,
//         hobbies
//     } = props
//     // const { address } = studentInfo
//     console.log(props, "props", props.hobbies);

//     return (
//         <div>
//             {props.studentInfo.address.city}
//             Hello Good Morning, <strong>{name}</strong>, your age is <strong>{age}</strong>,
//             {_isStudent ? "You are a student" : "You are not a student"},

//             Student Info : <pre>{JSON.stringify(studentInfo, null, 4)}</pre>
//             {city}
//             <ol>
//                 {hobbies.map((hobby, index, array) => {
//                     console.log(hobby, index, array);
//                     return (
//                         <li key={hobby.id}>{hobby.name.toUpperCase()}
//                             <strong> ({index})</strong>
//                         </li>
//                     )
//                 })}
//             </ol>
//         </div>
//     )
// }

// export const Greeting = (props) => {
//     console.log(props, "props", props.hobbies);

//     return (
//         <div>Hello Good Morning, <strong>{props.name}</strong>, your age is <strong>{props.age}</strong>,
//             {/* {props.isStudent === true ? "You are a student" : "You are not a student"} */}
//             {props.isStudent ? "You are a student" : "You are not a student"}
//             {/* your hobbies are {props.hobbies} */}
//             {/* Student Info : {props.studentInfo.name} */}
//             {/* Student Info : <pre>{JSON.stringify(props.studentInfo)}</pre> */}
//             Student Info : <pre>{JSON.stringify(props.studentInfo, null, 4)}</pre>
//             {/* <ol>
//                 {props.hobbies.map((hobby, index, array) => {
//                     console.log(hobby, index, array);
//                     return (
//                         // <li key={index}>{hobby.toUpperCase()}
//                         <li key={`${index}-${Math.random()}`}>{hobby.toUpperCase()}
//                             <strong> ({index})</strong>
//                         </li>
//                     )
//                 })}
//             </ol> */}
//             <ol>
//                 {props.hobbies.map((hobby, index, array) => {
//                     console.log(hobby, index, array);
//                     return (
//                         <li key={hobby.id}>{hobby.name.toUpperCase()}
//                             <strong> ({index})</strong>
//                         </li>
//                     )
//                 })}
//             </ol>
//         </div>
//     )
// }
