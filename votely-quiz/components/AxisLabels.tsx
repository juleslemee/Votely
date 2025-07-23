import React from 'react'
import { Text } from '@react-three/drei'

export default function AxisLabels() {
  return (
    <>
      <Text
        position={[-120, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={10}
        color="#666"
        anchorX="center"
        anchorY="middle"
      >
        Economic Left
      </Text>
      <Text
        position={[120, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={10}
        color="#666"
        anchorX="center"
        anchorY="middle"
      >
        Economic Right
      </Text>
      
      <Text
        position={[0, -120, 0]}
        rotation={[0, 0, 0]}
        fontSize={10}
        color="#666"
        anchorX="center"
        anchorY="middle"
      >
        Libertarian
      </Text>
      <Text
        position={[0, 120, 0]}
        rotation={[0, 0, 0]}
        fontSize={10}
        color="#666"
        anchorX="center"
        anchorY="middle"
      >
        Authoritarian
      </Text>
      
      <Text
        position={[0, 0, -120]}
        rotation={[0, 0, 0]}
        fontSize={10}
        color="#666"
        anchorX="center"
        anchorY="middle"
      >
        Progressive
      </Text>
      <Text
        position={[0, 0, 120]}
        rotation={[0, Math.PI, 0]}
        fontSize={10}
        color="#666"
        anchorX="center"
        anchorY="middle"
      >
        Conservative
      </Text>
    </>
  )
}