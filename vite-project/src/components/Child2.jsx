import React, { memo } from 'react'

export const Child2 = memo(({ count }) => {
    console.log("Child2 component rerender");

    return (
        <div>Child2 {count}</div>
    )
})
