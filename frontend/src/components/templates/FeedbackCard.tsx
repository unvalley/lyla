import { Stack, Button, Text } from '@chakra-ui/react'
import React from 'react'
import { measurementToColor } from './seed'

type FeedbackCardProps = {
  title: string
  message: string
  measurement: string
  exampleMessage: string
}

export const FeedbackCard: React.FC<FeedbackCardProps> = (props) => {
  // TODO: OK押したら消えるようにする
  return (
    <Stack p="4" boxShadow="lg" borderRadius="sm">
      <Stack direction="row" alignItems="center">
        <Text fontSize={{ base: 'md' }} fontWeight="medium">
          {props.title}
        </Text>
      </Stack>

      <Stack direction={{ base: 'column', md: 'row' }}>
        <Text fontSize={{ base: 'sm' }} textAlign={'left'} maxW={'4xl'}>
          {props.message}
        </Text>
      </Stack>

      <hr />

      <Stack>
        <Text
          fontSize={{ base: 'sm' }}
          fontWeight="medium"
          textAlign={'left'}
          maxW={'4xl'}
        >
          修正のための参考例文
        </Text>
        <Text fontSize={{ base: 'sm' }} textAlign={'left'} maxW={'4xl'}>
          {props.exampleMessage}
        </Text>
      </Stack>

      <Stack direction={{ base: 'column', md: 'row' }}>
        <Button
          variant="outline"
          colorScheme={measurementToColor[props.measurement]}
          size="sm"
        >
          Details
        </Button>
        <Button
          colorScheme={measurementToColor[props.measurement]}
          size="sm"
          onClick={() => alert('削除')}
        >
          OK
        </Button>
      </Stack>
    </Stack>
  )
}
