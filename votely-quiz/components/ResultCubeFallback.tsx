"use client"

import React, { useState } from 'react'

type AxisScore = number

interface ResultCubeFallbackProps {
  x: AxisScore
  y: AxisScore
  z: AxisScore
  ideologyLabel: string
  color?: string
}

export default function ResultCubeFallback({ x, y, z, ideologyLabel, color = '#8e6cf0' }: ResultCubeFallbackProps) {
  const [zValue, setZValue] = useState(z)

  const projectPoint = (x: number, y: number, z: number) => {
    const scale = 0.7
    const offsetX = 200
    const offsetY = 200
    
    const projX = offsetX + (x - z * 0.3) * scale
    const projY = offsetY - (y + z * 0.3) * scale
    
    return { x: projX, y: projY }
  }

  const cubeVertices = [
    [-100, -100, -100], [100, -100, -100], [100, 100, -100], [-100, 100, -100],
    [-100, -100, 100], [100, -100, 100], [100, 100, 100], [-100, 100, 100]
  ]

  const cubeEdges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7]
  ]

  const userPoint = projectPoint(x, y, zValue)

  return (
    <div className="w-full max-w-lg mx-auto">
      <svg 
        width="400" 
        height="400" 
        viewBox="0 0 400 400" 
        className="w-full h-auto"
        aria-label={`Political position: Economic ${x}, Social ${y}, Progressive-Conservative ${zValue}`}
      >
        <g>
          {cubeEdges.map(([start, end], index) => {
            const p1 = projectPoint(...cubeVertices[start] as [number, number, number])
            const p2 = projectPoint(...cubeVertices[end] as [number, number, number])
            return (
              <line
                key={index}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#e0e0e0"
                strokeWidth="1"
              />
            )
          })}
          
          <circle
            cx={userPoint.x}
            cy={userPoint.y}
            r="6"
            fill={color}
            stroke="white"
            strokeWidth="2"
          />
          
          <text x={userPoint.x} y={userPoint.y - 10} textAnchor="middle" fontSize="12" fill="black">
            {ideologyLabel}
          </text>
        </g>
        
        <text x="50" y="390" textAnchor="middle" fontSize="12" fill="#666">
          Economic Left
        </text>
        <text x="350" y="390" textAnchor="middle" fontSize="12" fill="#666">
          Economic Right
        </text>
        <text x="20" y="200" textAnchor="middle" fontSize="12" fill="#666" transform="rotate(-90 20 200)">
          Libertarian
        </text>
        <text x="380" y="200" textAnchor="middle" fontSize="12" fill="#666" transform="rotate(90 380 200)">
          Authoritarian
        </text>
      </svg>
      
      <div className="mt-6 space-y-2">
        <label htmlFor="z-slider" className="block text-sm font-medium text-gray-700">
          Progressive ← → Conservative: {zValue}
        </label>
        <input
          id="z-slider"
          type="range"
          min="-100"
          max="100"
          value={zValue}
          onChange={(e) => setZValue(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(zValue + 100) / 2}%, #e5e7eb ${(zValue + 100) / 2}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>Progressive (-100)</span>
          <span>Conservative (+100)</span>
        </div>
      </div>
    </div>
  )
}