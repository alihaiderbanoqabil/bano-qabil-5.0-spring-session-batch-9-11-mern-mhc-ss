import React from 'react'

export const Home = ({ name, children }) => {
    return (
        <div>Hello, {name} {children}</div>
    )
}
