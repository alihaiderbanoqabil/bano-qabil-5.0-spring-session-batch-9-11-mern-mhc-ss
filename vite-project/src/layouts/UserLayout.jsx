import React from 'react'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'
import { Footer } from '../components/Footer'

export const UserLayout = () => {
    return (
        <div>
            <Header />
            <Sidebar />
            <Footer />
        </div>
    )
}
