import { Stack, Button, Text } from '@chakra-ui/react'
import { EditorState } from 'draft-js'
import React, { useState } from 'react'
import { updateEditorStyle } from './features/Editor'
import { measurementToColor } from './seed'

type FeedbackCardProps = {
  title: string
  message: string
  measurement: string
  exampleMessage: string
  highlightTargetPosition: {
    start: number
    end: number
  }
}

type Props = {
  editorState: EditorState
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>
  getExampleText: (measurement: string) => Promise<void>
} & FeedbackCardProps

export const FeedbackCard: React.FC<Props> = (props) => {
  // TODO: OK押したら消えるようにする
  const [isHighlighted, setIsHighlighted] = useState(false)
  return (
    <Stack
      p="4"
      boxShadow="lg"
      borderRadius="sm"
      id={String(isHighlighted)}
      onMouseOver={() => {
        if (isHighlighted) {
          return
        }
        props.setEditorState(
          updateEditorStyle(
            props.editorState,
            props.measurement,
            props.highlightTargetPosition
          )
        )
        setIsHighlighted(true)
      }}
    >
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
          onClick={() => props.getExampleText(props.measurement)}
        >
          例文を取得
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

// <Button
//   variant="ghost"
//   colorScheme={measurementToColor[props.measurement]}
//   size="sm"
//   onClick={() => {
//     props.setEditorState(
//       removeHighlightStyle(
//         props.editorState,
//         props.measurement,
//         props.highlightTargetPosition
//       )
//     )
//     setIsHighlighted(false)
//   }}
// >
//   ハイライト解除
// </Button>
