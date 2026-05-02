import React, { useState, useRef } from "react";

export const Form = () => {

    return (
        <div>
            <h1>Controlled Form:</h1>
            <ControlledForm />
            <h1>Uncontrolled Form:</h1>
            <UncontrolledForm />
        </div>
    )
}


// export function ControlledForm() {
//     const [name, setName] = useState("");
//     console.log({ name });

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         alert("Name: " + name);
//     };

//     return (
//         // <form onSubmit={(e)=>handleSubmit(e)}>
//         <form onSubmit={handleSubmit}>
//             <label htmlFor="name">Name:
//                 {/* {name} */}
//             </label>
//             <input
//                 id="name"
//                 type="text"
//                 value={name}
//                 // onChange={(e) => {
//                 //     console.log(e.target.value, "e.target.value");

//                 //     setName(e.target.value)
//                 // }}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="Enter your name"
//             />
//             {/* <button disabled={name === ""} type="submit">Submit</button> */}
//             <button disabled={!name} type="submit">Submit</button>
//         </form>
//     );
// }


// export function UncontrolledForm() {
//     const inputRef = useRef();
//     // console.log({ name: inputRef.current });
//     console.log(inputRef);

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         // inputRef.current.style.backgroundColor = "red"
//         alert("Name: " + inputRef.current.value);
//     };

//     return (
//         <form onSubmit={handleSubmit}>
//              <label htmlFor="name">Name: </label>
//             <input
//             id="name"
//                 type="text"
//                 ref={inputRef}
//                 placeholder="Enter your name"
//             />
//             <button 
//             // disabled={ inputRef.current?.value === ""}
//              type="submit">Submit</button>
//         </form>
//     );
// }


export function ControlledForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        username: ""
    });
    const { name, email, password, username } = formData

    const handleChange = (e) => {
        // console.log(e, e.target, e.target.value, e.target.name);
        console.log(e.target.value, e.target.name);

        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
            // name: value
            // [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
    };
    console.log(formData, "formData");

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                // value={formData.name}
                value={name}
                // onChange={(e) => handleChange(e)}
                onChange={handleChange}
                // onChange={(e) => setFormData({ ...formData, name: e.target.value })}

                placeholder="Enter name"
            />

            <input
                type="email"
                name="email"
                // value={formData.email}
                value={email}
                onChange={handleChange}
                // onChange={(e) => setFormData({ ...formData, email: e.target.value })}

                placeholder="Enter email"
            />

            <input
                type="password"
                name="password"
                // value={formData.password}
                value={password}
                onChange={handleChange}
                // onChange={(e) => setFormData({ ...formData, password: e.target.value })}

                placeholder="Enter password"
            />

            <input
                type="text"
                name="username"
                // value={formData.username}
                value={username}
                onChange={handleChange}
                // onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
            />

            <button type="submit">Submit</button>
        </form>
    );
}

// export function ControlledForm() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const data = {
//       name,
//       email,
//       password
//     };

//     console.log(data);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input
//         type="text"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         placeholder="Enter name"
//       />

//       <input
//         type="email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         placeholder="Enter email"
//       />

//       <input
//         type="password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         placeholder="Enter password"
//       />

//       <button type="submit">Submit</button>
//     </form>
//   );
// }


export function UncontrolledForm() {
    const nameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = {
            name: nameRef.current.value,
            email: emailRef.current.value,
            password: passwordRef.current.value
        };

        console.log(data);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                ref={nameRef}
                placeholder="Enter name"
            />

            <input
                type="email"
                ref={emailRef}
                placeholder="Enter email"
            />

            <input
                type="password"
                ref={passwordRef}
                placeholder="Enter password"
            />

            <button type="submit">Submit</button>
        </form>
    );
}
