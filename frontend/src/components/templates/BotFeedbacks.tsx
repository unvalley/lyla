import { Text, Heading, Stack, Button } from '@chakra-ui/react'
import React from 'react'
import { questionAndSuggestions } from './seed'

export const BotFeedbacks: React.VFC = () => {
  return (
    <>
      <Heading size="md">From Bot</Heading>

      {questionAndSuggestions.map((e, idx) => {
        return (
          <Stack key={idx} p="4" boxShadow="lg" borderRadius="sm">
            <Stack direction="row" alignItems="center">
              <Text fontSize={{ base: 'md' }} fontWeight="medium">
                {e.title}
              </Text>
            </Stack>

            <Stack direction={{ base: 'column', md: 'row' }}>
              <Text fontSize={{ base: 'sm' }} textAlign={'left'} maxW={'4xl'}>
                {e.message}
              </Text>
            </Stack>

            <Stack direction={{ base: 'column', md: 'row' }}>
              <Button
                variant="outline"
                fontWeight="medium"
                colorScheme={'black'}
                size="sm"
              >
                Details
              </Button>
              <Button
                colorScheme={'whatsapp'}
                size="sm"
                onClick={() => alert('削除')}
              >
                Yes
              </Button>
            </Stack>
          </Stack>
        )
      })}
    </>
  )
}
