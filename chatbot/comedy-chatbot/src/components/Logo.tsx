import { Box } from '@chakra-ui/react'

interface LogoProps {
  size?: string | number
  color?: string
}

export const Logo = ({ size = "40px", color = "currentColor" }: LogoProps) => {
  return (
    <Box
      as="svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="45" fill={color} fillOpacity="0.1" />
      
      {/* Laughing Face */}
      <path
        d="M50 85c19.33 0 35-15.67 35-35S69.33 15 50 15 15 30.67 15 50s15.67 35 35 35z"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Smiling Mouth */}
      <path
        d="M35 55c0 8.284 6.716 15 15 15 8.284 0 15-6.716 15-15"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      {/* Left Eye */}
      <path
        d="M35 40h5"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      {/* Right Eye */}
      <path
        d="M60 40h5"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      {/* Tears of Joy */}
      <path
        d="M30 45l-5 10M70 45l5 10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Box>
  )
} 