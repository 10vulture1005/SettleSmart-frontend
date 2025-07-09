import React from 'react'
import HomeHero from './Hero'
import './home.css'
import { gsap } from "gsap";
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from 'axios';


gsap.registerPlugin(ScrollTrigger);

import HomeRest from './HomeRest'
import { useState } from 'react';

export default function HomePage() {
  const container = useRef(null);
  const heroRef = useRef(null);
  const featureRef = useRef(null);
  const [user,setUser] = useState(null)


  

  return (
    <>
      <div className='relative ' ref={container}>
          <HomeHero />
        
          <HomeRest />
      </div>
    </>
  )
}