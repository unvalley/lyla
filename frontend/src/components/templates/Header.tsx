import {
  Flex,
  useDisclosure,
  Heading,
  Text,
  Stack,
  Box,
  Button
} from '@chakra-ui/react'
import React from 'react'

type Props = {
  isOpen: boolean
  onOpen: () => void
  resetTextMeasurementScores: () => Promise<void>
}
export const Header: React.FC<Props> = (props) => {
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding={2}
      bg="black"
      color="white"
    >
      <Flex align="center" mr={5}>
        <Heading as="h1" size="lg" letterSpacing={'tighter'} ml={2}>
          文章執筆タスク
        </Heading>
      </Flex>

      <Stack
        direction={{ base: 'column', md: 'row' }}
        display={{ base: 'block', md: 'flex' }}
        width={{ base: 'full', md: 'auto' }}
        alignItems="center"
        flexGrow={1}
        mt={{ base: 4, md: 0 }}
      >
        <Text>課題の説明</Text>
      </Stack>

      <Box
        display={{ base: props.isOpen ? 'block' : 'none', md: 'block' }}
        mt={{ base: 4, md: 0 }}
      >
        <Button
          colorScheme="green"
          onMouseDown={props.resetTextMeasurementScores}
          ml={4}
        >
          採点
        </Button>
        <Button colorScheme="orange" onMouseDown={props.onOpen} ml={4}>
          メモを確認する
        </Button>
      </Box>
    </Flex>
  )
}

{
  /* <Button
          colorScheme="purple"
          onMouseDown={() => {
            const useLessCondition = new Date().getSeconds() % 2 == 0
            onChange(
              RichUtils.toggleInlineStyle(
                editorState,
                useLessCondition
                  ? 'VALIDNESS_FEED_BACK'
                  : 'LOGICALITY_FEED_BACK'
              )
            )
          }}
        >
          ハイライト
        </Button>
        <Button
          colorScheme="red"
          onMouseDown={() => {
            onChange(RichUtils.toggleInlineStyle(editorState, 'RED_FEED_BACK'))
          }}
          ml={4}
        >
          赤でハイライト
        </Button> */
}
{
}
