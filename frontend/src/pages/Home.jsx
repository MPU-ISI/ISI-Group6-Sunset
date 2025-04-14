import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import WeeksWinners from '../components/WeeksWinners'

const Home = () => {
  return (
    <div>
      <Hero />
      <LatestCollection/>
      <BestSeller/>
      <WeeksWinners />
      <OurPolicy/>
      <NewsletterBox/>
    </div>
  )
}

export default Home
