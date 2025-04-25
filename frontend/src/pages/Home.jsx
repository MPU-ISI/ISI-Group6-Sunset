import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import WeeksWinners from '../components/WeeksWinners'
import RecommendForYou from '../components/RecommendForYou'

const Home = () => {
  return (
    <div>
      <Hero />
      <LatestCollection/>
      <RecommendForYou />
      <BestSeller/>
      <WeeksWinners />
      <OurPolicy/>
      <NewsletterBox/>
    </div>
  )
}

export default Home
