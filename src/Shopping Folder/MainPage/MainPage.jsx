import React from 'react'
import { Header } from '../AllComponents/Header'
import { Banner } from '../AllComponents/Banner'
import { Collections } from '../AllComponents/Collections'
import { Footer } from '../AllComponents/Footer'
import { Products } from './Products'

export const MainPage = () => {
  return (
    <div>
    <Header />
    <Banner />
    <Collections />
    <Footer />
    <Products />
    
    </div>
  )
}
