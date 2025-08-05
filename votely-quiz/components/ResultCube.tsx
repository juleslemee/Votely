"use client"

import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
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
  hideHint?: boolean
  disableAutoRotate?: boolean
  fixedRotationAngle?: number // For GIF generation - overrides camera position
}

interface CubeContentProps extends ResultCubeProps {
  showHint: boolean
  setShowHint: (show: boolean) => void
}

// Define the colors for the 3x3 macro-cell grid
const MACRO_CELL_COLORS = {
  topLeft: '#ff9ea0',      // Revolutionary Communism & State Socialism
  topCenter: '#ff9fff',    // Authoritarian Statist Centrism
  topRight: '#9f9fff',     // Authoritarian Right & Corporatist Monarchism
  middleLeft: '#ffcfa1',   // Democratic Socialism & Left Populism
  middleCenter: '#e5e5e5', // Mixed-Economy Liberal Center
  middleRight: '#9ffffe',  // Conservative Capitalism & National Conservatism
  bottomLeft: '#9fff9e',   // Libertarian Socialism & Anarcho-Communism
  bottomCenter: '#d4fe9a', // Social-Market Libertarianism
  bottomRight: '#ffff9f'   // Anarcho-Capitalism & Ultra-Free-Market Libertarianism
}

function ColoredMacroCells({ userX, userY, userZ }: { userX: number, userY: number, userZ: number }) {
  // Determine which macro-cell the user is in based on their position
  // X axis: -100 to -33.4 (left), -33.3 to 33.3 (center), 33.4 to 100 (right)
  // Y axis: 33.4 to 100 (top), -33.3 to 33.3 (middle), -100 to -33.4 (bottom)
  
  const getUserMacroCell = (x: number, y: number) => {
    let xPos = 'center'
    let yPos = 'middle'
    
    if (x <= -33.4) xPos = 'left'
    else if (x >= 33.4) xPos = 'right'
    
    if (y >= 33.4) yPos = 'top'
    else if (y <= -33.4) yPos = 'bottom'
    
    return `${yPos}${xPos.charAt(0).toUpperCase() + xPos.slice(1)}`
  }
  
  const userMacroCell = getUserMacroCell(userX, userY)
  
  // Function to calculate opacity based on user position
  const getOpacity = (isUserCell: boolean) => {
    return isUserCell ? 0.15 : 0.35  // More transparent in user's cell
  }
  
  // Create 3x3 grid of macro-cells
  const cellSize = 66.67  // 200/3
  const positions = [
    // Top row
    { pos: [-66.67, 66.67, 0], color: MACRO_CELL_COLORS.topLeft, key: 'topLeft' },
    { pos: [0, 66.67, 0], color: MACRO_CELL_COLORS.topCenter, key: 'topCenter' },
    { pos: [66.67, 66.67, 0], color: MACRO_CELL_COLORS.topRight, key: 'topRight' },
    // Middle row
    { pos: [-66.67, 0, 0], color: MACRO_CELL_COLORS.middleLeft, key: 'middleLeft' },
    { pos: [0, 0, 0], color: MACRO_CELL_COLORS.middleCenter, key: 'middleCenter' },
    { pos: [66.67, 0, 0], color: MACRO_CELL_COLORS.middleRight, key: 'middleRight' },
    // Bottom row
    { pos: [-66.67, -66.67, 0], color: MACRO_CELL_COLORS.bottomLeft, key: 'bottomLeft' },
    { pos: [0, -66.67, 0], color: MACRO_CELL_COLORS.bottomCenter, key: 'bottomCenter' },
    { pos: [66.67, -66.67, 0], color: MACRO_CELL_COLORS.bottomRight, key: 'bottomRight' }
  ]
  
  return (
    <>
      {positions.map(({ pos, color, key }) => (
        <Box key={key} args={[cellSize, cellSize, 200]} position={pos as [number, number, number]}>
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={getOpacity(userMacroCell === key)} 
          />
        </Box>
      ))}
    </>
  )
}

function GridLines() {
  const lines = []
  
  // Create a 3x3x3 grid for macro-cells
  const gridSize = 3
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
  const { camera } = useThree()
  const [visibleLabels, setVisibleLabels] = useState({
    showEconLeft: true,
    showEconRight: false,
    showLibertarian: true,
    showAuthoritarian: false,
    showProgressive: true,
    showConservative: false
  })
  
  useFrame(() => {
    // Get camera position
    const camPos = camera.position
    
    // Determine which labels should be visible based on camera distance
    // For X axis (Economic)
    const distToEconLeft = camPos.distanceTo(new THREE.Vector3(-120, 0, 0))
    const distToEconRight = camPos.distanceTo(new THREE.Vector3(120, 0, 0))
    
    // For Y axis (Authority)
    const distToLibertarian = camPos.distanceTo(new THREE.Vector3(0, -120, 0))
    const distToAuthoritarian = camPos.distanceTo(new THREE.Vector3(0, 120, 0))
    
    // For Z axis (Social)
    const distToProgressive = camPos.distanceTo(new THREE.Vector3(0, 0, -120))
    const distToConservative = camPos.distanceTo(new THREE.Vector3(0, 0, 120))
    
    setVisibleLabels({
      showEconLeft: distToEconLeft < distToEconRight,
      showEconRight: distToEconLeft >= distToEconRight,
      showLibertarian: distToLibertarian < distToAuthoritarian,
      showAuthoritarian: distToLibertarian >= distToAuthoritarian,
      showProgressive: distToProgressive < distToConservative,
      showConservative: distToProgressive >= distToConservative
    })
  })
  
  return (
    <>
      {/* Economic axis labels */}
      {visibleLabels.showEconLeft && (
        <Html position={[-120, 0, 0]} center>
          <div className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded pointer-events-none whitespace-nowrap select-none">
            Economic Left
          </div>
        </Html>
      )}
      {visibleLabels.showEconRight && (
        <Html position={[120, 0, 0]} center>
          <div className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded pointer-events-none whitespace-nowrap select-none">
            Economic Right
          </div>
        </Html>
      )}
      
      {/* Social axis labels */}
      {visibleLabels.showLibertarian && (
        <Html position={[0, -120, 0]} center>
          <div className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded pointer-events-none whitespace-nowrap select-none">
            Libertarian
          </div>
        </Html>
      )}
      {visibleLabels.showAuthoritarian && (
        <Html position={[0, 120, 0]} center>
          <div className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded pointer-events-none whitespace-nowrap select-none">
            Authoritarian
          </div>
        </Html>
      )}
      
      {/* Progressive-Conservative axis labels */}
      {visibleLabels.showProgressive && (
        <Html position={[0, 0, -120]} center>
          <div className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded pointer-events-none whitespace-nowrap select-none">
            Progressive
          </div>
        </Html>
      )}
      {visibleLabels.showConservative && (
        <Html position={[0, 0, 120]} center>
          <div className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded pointer-events-none whitespace-nowrap select-none">
            Conservative
          </div>
        </Html>
      )}
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

function CubeContent({ x, y, z, ideologyLabel, onInteraction, color, showHint, setShowHint, disableAutoRotate, fixedRotationAngle }: CubeContentProps) {
  const hasRotated = useRef(false)
  const controlsRef = useRef<any>(null)
  const autoRotateRef = useRef(!disableAutoRotate)
  const { camera, gl } = useThree()
  const startTime = useRef(Date.now())
  
  // Add mouse event listeners to detect interaction
  useEffect(() => {
    const handleMouseDown = () => {
      if (autoRotateRef.current) {
        autoRotateRef.current = false
        if (!hasRotated.current) {
          hasRotated.current = true
          if (onInteraction) onInteraction('rotate')
          if (showHint) setShowHint(false)
        }
      }
    }
    
    gl.domElement.addEventListener('mousedown', handleMouseDown)
    gl.domElement.addEventListener('touchstart', handleMouseDown)
    
    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown)
      gl.domElement.removeEventListener('touchstart', handleMouseDown)
    }
  }, [gl.domElement, onInteraction, showHint, setShowHint])
  
  useFrame(() => {
    // Update OrbitControls autoRotate property
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotateRef.current
    }
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[150, 150, 150]} intensity={0.5} />
      <directionalLight position={[-150, -150, -150]} intensity={0.3} />
      
      {/* Colored macro-cells */}
      <ColoredMacroCells userX={x} userY={y} userZ={z} />
      
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
      
      {/* Only show OrbitControls if not using fixed rotation */}
      {fixedRotationAngle === undefined && (
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={320}
          maxDistance={800}
          target={[0, 0, 0]}
          enableDamping
          dampingFactor={0.08}
          autoRotate={autoRotateRef.current}
          autoRotateSpeed={1.7}
          enableZoom={true}
        />
      )}
    </>
  )
}

export default function ResultCube({ x, y, z, ideologyLabel, onInteraction, color = '#8e6cf0', hideHint = false, disableAutoRotate = false, fixedRotationAngle }: ResultCubeProps) {
  const [showHint, setShowHint] = useState(!hideHint)

  useEffect(() => {
    if (!hideHint) {
      const timer = setTimeout(() => setShowHint(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [hideHint])

  // Calculate camera position based on fixed rotation angle if provided
  const getCameraPosition = (): [number, number, number] => {
    if (fixedRotationAngle !== undefined) {
      const distance = 566; // Math.sqrt(400² + 400²)
      const angleInRadians = (fixedRotationAngle * Math.PI) / 180;
      return [
        distance * Math.cos(angleInRadians),
        350,
        distance * Math.sin(angleInRadians)
      ];
    }
    return [400, 350, 400]; // Default position
  };

  return (
    <div 
      className="relative w-full aspect-square bg-gray-50 rounded-lg select-none"
      style={{ 
        userSelect: 'none',
        // @ts-ignore
        WebkitUserDrag: 'none',
        // @ts-ignore
        WebkitTouchCallout: 'none'
      }}
      aria-label={`Political position: Economic ${x}, Social ${y}, Progressive-Conservative ${z}`}
    >
      <Canvas 
        camera={{ 
          position: getCameraPosition(), 
          fov: 35,
          near: 10,
          far: 1200
        }}
        style={{ 
          background: 'transparent',
          userSelect: 'none',
          // @ts-ignore
          WebkitUserDrag: 'none'
        }}
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
            disableAutoRotate={disableAutoRotate}
            fixedRotationAngle={fixedRotationAngle}
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