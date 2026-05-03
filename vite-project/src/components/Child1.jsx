import React, { memo } from 'react'
import { Child2 } from './Child2'

export const Child1 = memo(({ count }) => {
    console.log("Child1 component rerender");
    return (
        <div>Child1 {count}
            <Child2 count={count} />
        </div>
    )
})
