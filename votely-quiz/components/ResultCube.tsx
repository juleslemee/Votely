"use client"

import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Sphere, Box, Html } from '@react-three/drei'
import * as THREE from 'three'

type AxisScore = number

interface ResultCubeProps {
  x: AxisScore
  y: AxisScore
  z: AxisScore
  ideologyLabel: string
  onInteraction?: (type: 'rotate' | 'tooltip') => void
  color?: string
}

interface CubeContentProps extends ResultCubeProps {
  showHint: boolean
  setShowHint: (show: boolean) => void
}

// Define the colors from the original 2D compass
const QUADRANT_COLORS = {
  topLeft: '#fecaca',     // Light red - authoritarian left
  topRight: '#bfdbfe',    // Light blue - authoritarian right  
  bottomLeft: '#bbf7d0',  // Light green - libertarian left
  bottomRight: '#fef3c7'  // Light yellow - libertarian right
}

function ColoredQuadrants({ userX, userY, userZ }: { userX: number, userY: number, userZ: number }) {
  // Calculate which quadrant the user is in and proximity to center
  const leftSide = userX < 0
  const topSide = userY > 0
  const nearCenterX = Math.abs(userX) < 30  // Within 30 units of center X
  const nearCenterY = Math.abs(userY) < 30  // Within 30 units of center Y
  
  // Function to calculate opacity based on user position
  const getOpacity = (isUserQuadrant: boolean, isNearX: boolean, isNearY: boolean) => {
    if (isUserQuadrant) return 0.10  // Very transparent in user's quadrant
    if (isNearX || isNearY) return 0.25  // Somewhat transparent if near center
    return 0.40  // Normal opacity for distant quadrants
  }
  
  return (
    <>
      {/* Top Left - Authoritarian Left (red) */}
      <Box args={[100, 100, 200]} position={[-50, 50, 0]}>
        <meshBasicMaterial 
          color={QUADRANT_COLORS.topLeft} 
          transparent 
          opacity={getOpacity(leftSide && topSide, nearCenterX && topSide, nearCenterY && leftSide)} 
        />
      </Box>
      
      {/* Top Right - Authoritarian Right (blue) */}
      <Box args={[100, 100, 200]} position={[50, 50, 0]}>
        <meshBasicMaterial 
          color={QUADRANT_COLORS.topRight} 
          transparent 
          opacity={getOpacity(!leftSide && topSide, nearCenterX && topSide, nearCenterY && !leftSide)} 
        />
      </Box>
      
      {/* Bottom Left - Libertarian Left (green) */}
      <Box args={[100, 100, 200]} position={[-50, -50, 0]}>
        <meshBasicMaterial 
          color={QUADRANT_COLORS.bottomLeft} 
          transparent 
          opacity={getOpacity(leftSide && !topSide, nearCenterX && !topSide, nearCenterY && leftSide)} 
        />
      </Box>
      
      {/* Bottom Right - Libertarian Right (yellow) */}
      <Box args={[100, 100, 200]} position={[50, -50, 0]}>
        <meshBasicMaterial 
          color={QUADRANT_COLORS.bottomRight} 
          transparent 
          opacity={getOpacity(!leftSide && !topSide, nearCenterX && !topSide, nearCenterY && !leftSide)} 
        />
      </Box>
    </>
  )
}

function GridLines() {
  const lines = []
  
  // Create a 4x4x4 grid
  const gridSize = 4
  const step = 200 / gridSize
  
  // YZ plane grids (at x = -100 and x = 100)
  for (let i = 0; i <= gridSize; i++) {
    const pos = -100 + i * step
    // Horizontal lines
    lines.push(
      <Line key={`yz-h-left-${i}`} points={[[-100, pos, -100], [-100, pos, 100]]} color="#e5e7eb" lineWidth={1} />,
      <Line key={`yz-h-right-${i}`} points={[[100, pos, -100], [100, pos, 100]]} color="#e5e7eb" lineWidth={1} />
    )
    // Vertical lines
    lines.push(
      <Line key={`yz-v-left-${i}`} points={[[-100, -100, pos], [-100, 100, pos]]} color="#e5e7eb" lineWidth={1} />,
      <Line key={`yz-v-right-${i}`} points={[[100, -100, pos], [100, 100, pos]]} color="#e5e7eb" lineWidth={1} />
    )
  }
  
  // XZ plane grids (at y = -100 and y = 100)
  for (let i = 0; i <= gridSize; i++) {
    const pos = -100 + i * step
    lines.push(
      <Line key={`xz-h-bottom-${i}`} points={[[pos, -100, -100], [pos, -100, 100]]} color="#e5e7eb" lineWidth={1} />,
      <Line key={`xz-h-top-${i}`} points={[[pos, 100, -100], [pos, 100, 100]]} color="#e5e7eb" lineWidth={1} />,
      <Line key={`xz-v-bottom-${i}`} points={[[-100, -100, pos], [100, -100, pos]]} color="#e5e7eb" lineWidth={1} />,
      <Line key={`xz-v-top-${i}`} points={[[-100, 100, pos], [100, 100, pos]]} color="#e5e7eb" lineWidth={1} />
    )
  }
  
  // XY plane grids (at z = -100 and z = 100)
  for (let i = 0; i <= gridSize; i++) {
    const pos = -100 + i * step
    lines.push(
      <Line key={`xy-h-back-${i}`} points={[[pos, -100, -100], [pos, 100, -100]]} color="#e5e7eb" lineWidth={1} />,
      <Line key={`xy-h-front-${i}`} points={[[pos, -100, 100], [pos, 100, 100]]} color="#e5e7eb" lineWidth={1} />,
      <Line key={`xy-v-back-${i}`} points={[[-100, pos, -100], [100, pos, -100]]} color="#e5e7eb" lineWidth={1} />,
      <Line key={`xy-v-front-${i}`} points={[[-100, pos, 100], [100, pos, 100]]} color="#e5e7eb" lineWidth={1} />
    )
  }
  
  return <>{lines}</>
}

function AxisLines() {
  return (
    <>
      {/* Main axes through center - much thicker and darker */}
      <Line points={[[-100, 0, 0], [100, 0, 0]]} color="#374151" lineWidth={4} />
      <Line points={[[0, -100, 0], [0, 100, 0]]} color="#374151" lineWidth={4} />
      <Line points={[[0, 0, -100], [0, 0, 100]]} color="#374151" lineWidth={4} />
    </>
  )
}

function MovingLabels() {
  return (
    <>
      {/* Economic axis labels */}
      <Html position={[-120, 0, 0]} center>
        <div className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded pointer-events-none whitespace-nowrap">
          Economic Left
        </div>
      </Html>
      <Html position={[120, 0, 0]} center>
        <div className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded pointer-events-none whitespace-nowrap">
          Economic Right
        </div>
      </Html>
      
      {/* Social axis labels */}
      <Html position={[0, -120, 0]} center>
        <div className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded pointer-events-none whitespace-nowrap">
          Libertarian
        </div>
      </Html>
      <Html position={[0, 120, 0]} center>
        <div className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded pointer-events-none whitespace-nowrap">
          Authoritarian
        </div>
      </Html>
      
      {/* Progressive-Conservative axis labels */}
      <Html position={[0, 0, -120]} center>
        <div className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded pointer-events-none whitespace-nowrap">
          Progressive
        </div>
      </Html>
      <Html position={[0, 0, 120]} center>
        <div className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded pointer-events-none whitespace-nowrap">
          Conservative
        </div>
      </Html>
    </>
  )
}

function CubeFrame() {
  const vertices = [
    [-100, -100, -100], [100, -100, -100], [100, 100, -100], [-100, 100, -100], // Back face
    [-100, -100, 100], [100, -100, 100], [100, 100, 100], [-100, 100, 100]    // Front face
  ]
  
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0], // Back face
    [4, 5], [5, 6], [6, 7], [7, 4], // Front face
    [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting edges
  ]
  
  return (
    <>
      {edges.map((edge, index) => (
        <Line
          key={index}
          points={[vertices[edge[0]] as [number, number, number], vertices[edge[1]] as [number, number, number]]}
          color="#9ca3af"
          lineWidth={1}
        />
      ))}
    </>
  )
}

function UserPoint({ x, y, z, color = '#8e6cf0' }: { x: number, y: number, z: number, color?: string }) {
  const meshRef = useRef<any>(null)
  
  // Animate the point with a subtle pulse
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
    }
  })

  return (
    <>
      <Sphere
        ref={meshRef}
        args={[6, 32, 32]}
        position={[x, y, z]}
      >
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.5}
          metalness={0.3}
          roughness={0.1}
        />
      </Sphere>
      
      {/* Drop lines to each axis */}
      <Line points={[[x, y, z], [x, y, -100]]} color="#8e6cf0" lineWidth={1} opacity={0.3} transparent />
      <Line points={[[x, y, z], [x, -100, z]]} color="#8e6cf0" lineWidth={1} opacity={0.3} transparent />
      <Line points={[[x, y, z], [-100, y, z]]} color="#8e6cf0" lineWidth={1} opacity={0.3} transparent />
    </>
  )
}

function CubeContent({ x, y, z, ideologyLabel, onInteraction, color, showHint, setShowHint }: CubeContentProps) {
  const hasRotated = useRef(false)
  const controlsRef = useRef<any>(null)

  useFrame(() => {
    if (controlsRef.current && controlsRef.current.getAzimuthalAngle() !== 0 && !hasRotated.current) {
      hasRotated.current = true
      if (onInteraction) onInteraction('rotate')
      if (showHint) setShowHint(false)
    }
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[150, 150, 150]} intensity={0.5} />
      <directionalLight position={[-150, -150, -150]} intensity={0.3} />
      
      {/* Colored quadrants */}
      <ColoredQuadrants userX={x} userY={y} userZ={z} />
      
      {/* Grid lines */}
      <GridLines />
      
      {/* Cube edges */}
      <CubeFrame />
      
      {/* Axis lines */}
      <AxisLines />
      
      {/* Moving labels */}
      <MovingLabels />
      
      {/* User's position */}
      <UserPoint x={x} y={y} z={z} color={color} />
      
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={280}
        maxDistance={600}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  )
}

export default function ResultCube({ x, y, z, ideologyLabel, onInteraction, color = '#8e6cf0' }: ResultCubeProps) {
  const [showHint, setShowHint] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative w-full aspect-square bg-gray-50 rounded-lg" aria-label={`Political position: Economic ${x}, Social ${y}, Progressive-Conservative ${z}`}>
      <Canvas 
        camera={{ 
          position: [250, 180, 250], 
          fov: 40,
          near: 10,
          far: 1000
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <CubeContent
            x={x}
            y={y}
            z={z}
            ideologyLabel={ideologyLabel}
            onInteraction={onInteraction}
            color={color}
            showHint={showHint}
            setShowHint={setShowHint}
          />
        </Suspense>
      </Canvas>
      
      
      
      {showHint && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">
            Drag to rotate
          </div>
        </div>
      )}
    </div>
  )
}