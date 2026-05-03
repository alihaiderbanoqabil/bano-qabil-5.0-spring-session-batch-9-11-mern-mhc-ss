import React, { useState } from 'react'
import { Child1 } from './Child1'

export const Parent = () => {
    const [search, setSearch] = useState("");
    const [count, setCount] = useState(0)
    console.log("Parent component rerender");

    return (
        <div>Parent
            <div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users"
                />
                <button onClick={() => setCount(count + 1)}>+</button>
                <span>{count}</span>
                <button onClick={() => setCount(count - 1)}>-</button>
            </div>
            <Child1 count={count} update={() => {
                console.log('updating');
            }} />
        </div>
    )
}
