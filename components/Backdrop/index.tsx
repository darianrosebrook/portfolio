'use client'
import { useRef } from 'react';
import Spline from '@splinetool/react-spline';

export default function Backdrop() {
  const spline = useRef();

  function onLoad(splineApp) {
    // save the app in a ref for later use
    spline.current = splineApp;
  }

  function triggerAnimation() {
    if (spline.current) {
      console.log('triggering animation');
       
    }
  }

  return ( 
      <Spline onMouseHover={triggerAnimation} scene="https://prod.spline.design/nxJyxVaUbfcOw6ST/scene.splinecode" />
    
  );
}
