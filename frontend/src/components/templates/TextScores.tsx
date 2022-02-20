import {
  Heading,
  Spacer,
  SimpleGrid,
  Spinner,
  Box,
  Flex,
  Progress,
  Text
} from '@chakra-ui/react'
import React from 'react'
import { ScoringResult } from './EditorTemplate'
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
      <Heading size="md">文章スコア</Heading>
      <Spacer mb={4} />

      <Text>
        全てのスコアは最大100です．説得的な文章であればあるほど，点数は高くなります．
      </Text>
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
                  <Text>{e.score}</Text>
                </Flex>
                <Progress
                  value={e.score}
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
