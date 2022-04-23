import {
  Heading,
  Spacer,
  SimpleGrid,
  Spinner,
  Box,
  Flex,
  Progress,
  Text,
  Tooltip
} from '@chakra-ui/react'
import React from 'react'
import { ScoringResult } from './features/Editor'
import { measurementToColor } from './seed'

type Props = {
  isScoring: boolean
  textMeasurementScores: ScoringResult[]
}

export const TextScores: React.FC<Props> = ({
  isScoring,
  textMeasurementScores
}) => {
  return (
    <>
      <Heading size="md">
        文章スコア
        <Tooltip
          label={`説得的な文章であればあるほど，点数は高くなります．`}
          fontSize="xs"
        >
          ◎
        </Tooltip>
      </Heading>
      <Spacer mb={4} />
      <SimpleGrid columns={1} spacing={4}>
        {isScoring ? (
          <Spinner
            thickness="4px"
            speed="0.80s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        ) : (
          <>
            {textMeasurementScores.map((e) => (
              <Box key={e.measurement}>
                <Flex spacing={4}>
                  <Text fontSize="md" pr={3}>
                    {e.measurement}
                  </Text>
                  <Text>{Math.round(e.score)}</Text>
                </Flex>
                <Progress
                  value={Math.round(e.score)}
                  colorScheme={measurementToColor[e.measurement]}
                />
              </Box>
            ))}
          </>
        )}
      </SimpleGrid>
    </>
  )
}
