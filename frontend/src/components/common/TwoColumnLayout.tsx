// import { Col, Row } from '@geist-ui/react'
import React from 'react'
import { SimpleGrid, Box } from '@chakra-ui/react'

type Props = { leftElement: React.ReactNode; rightElement: React.ReactNode }

export const TwoColumnLayout: React.FC<Props> = ({
  leftElement,
  rightElement
}) => {
  return (
    <SimpleGrid columns={2} spacing={1}>
      <Box>{leftElement}</Box>
      <Box>{rightElement}</Box>
    </SimpleGrid>
  )
}
