import React, { useEffect, useState } from 'react'
import { Editor, EditorState, RichUtils } from 'draft-js'
import { TwoColumnLayout } from '../common/TwoColumnLayout'
import 'draft-js/dist/Draft.css'
import {
  Box,
  Heading,
  Spacer,
  Stack,
  Text,
  useDisclosure,
  useToast
} from '@chakra-ui/react'
import { Header } from './Header'
import { problemInfo, feedbacks, customMap } from './seed'
import { MyModal } from './MyModal'
import { TextScores } from './TextScores'
import { FeedbackCard } from './FeedbackCard'
import { getHighlighPositionNumbers } from './utils'

export type ScoringResult = {
  measurement: string
  score: number
  highlightIndex: number
}

type Props = {}

// https://stackoverflow.com/questions/51665544/how-retrieve-text-from-draftjs

export const EditorTemplate: React.FC<Props> = () => {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [canShowEditor, setCanShowEditor] = useState(false)
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  )
  const [isScoring, setIsScoring] = useState(false)
  const [textMeasurementScores, setTextMeasurementScores] = useState<
    ScoringResult[]
  >([
    { measurement: '論理性', score: 0, highlightIndex: 0 },
    { measurement: '妥当性', score: 0, highlightIndex: 0 },
    { measurement: '理解力', score: 0, highlightIndex: 0 },
    { measurement: '文章力', score: 0, highlightIndex: 0 }
  ])

  useEffect(() => {
    setCanShowEditor(true)
    onOpen()
  }, [])

  const editor: any = React.useRef<Editor>()
  const focusEditor = () => {
    if (editor.current) {
      editor.current.focus()
    }
  }

  const resetTextMeasurementScores = async () => {
    setIsScoring(true)
    // const plainText = editorState.getCurrentContent().getPlainText()

    // const scoringResult = await axios
    //   .post(`http://localhost:8080/predict/scores`, {
    //     text: plainText
    //   })
    //   .then((res: AxiosResponse<ScoringResult[]>) => {
    //     return res.data
    //   })

    const mockScoringResult = [
      { measurement: '論理性', score: 40.0, highlightIndex: 0 },
      { measurement: '妥当性', score: 40.0, highlightIndex: 0 },
      { measurement: '理解力', score: 50.0, highlightIndex: 0 },
      { measurement: '文章力', score: 50.0, highlightIndex: 0 }
    ]

    const splittedText = editorState
      .getCurrentContent()
      .getPlainText()
      .split('。')
    // 。 の分をちゃんと足しておく
    const sentenceCharacterCounts = splittedText.map((e) => e.length + 1)
    const logicalityHighlightIndex = mockScoringResult[0].highlightIndex

    const highlightTargetPosition = getHighlighPositionNumbers(
      sentenceCharacterCounts,
      logicalityHighlightIndex
    )

    const selectionState = editorState.getSelection()
    const newSelection = selectionState.merge({
      anchorOffset: highlightTargetPosition.start,
      focusOffset: highlightTargetPosition.end
    })
    const editorStateWithNewSelection = EditorState.forceSelection(
      editorState,
      newSelection
    )
    const editorStateWithStyles = RichUtils.toggleInlineStyle(
      editorStateWithNewSelection,
      'VALIDNESS_FEED_BACK'
    )
    const editorStateWithStylesAndPreviousSelection =
      EditorState.forceSelection(editorStateWithStyles, selectionState)
    setEditorState(editorStateWithStylesAndPreviousSelection)

    toast({
      title: `採点が完了しました`,
      position: 'bottom-right',
      isClosable: true,
      duration: 2500,
      status: 'success'
    })
    setIsScoring(false)
  }

  const onChange = (editorState: EditorState) => {
    setEditorState(editorState)
  }

  if (!canShowEditor) return <></>

  return (
    <div className="wrapper" onClick={focusEditor}>
      <Header
        isOpen={isOpen}
        onOpen={onOpen}
        resetTextMeasurementScores={resetTextMeasurementScores}
      />

      <TwoColumnLayout
        leftElement={
          <Box overflow="hidden" fontSize="24px" minH={'80vh'} p={6}>
            <Stack mb={2}>
              <Heading fontSize="lg" fontWeight="bold">
                {problemInfo.title}
              </Heading>
              <Text fontSize="md">カテゴリ：{problemInfo.category}</Text>
            </Stack>

            <Editor
              ref={editor}
              editorKey="key"
              editorState={editorState}
              onChange={onChange}
              placeholder="Type something..."
              customStyleMap={customMap}
            />
          </Box>
        }
        rightElement={
          <Box p={6}>
            <TextScores
              isScoring={isScoring}
              textMeasurementScores={textMeasurementScores}
            />
            <Spacer mb={6} />

            <Heading size="md">フィードバック</Heading>
            {feedbacks.map((e, idx) => {
              return (
                // TODO: set correct key
                <FeedbackCard
                  key={idx}
                  title={e.title}
                  message={e.message}
                  measurement={e.measurement}
                  exampleMessage={e.exampleMessage}
                />
              )
            })}
          </Box>
        }
      />
      <MyModal isOpen={isOpen} onClose={onClose} />
    </div>
  )
}

// const saveText = (title: string) => {
//   const contentState = editorState.getCurrentContent()
//   const content = convertToRaw(contentState)
//   const html = stateToHTML(contentState)
//   // 以下DBに保存する処理
//   console.log(content, html)
// }

// const loadFromHtml = (content: any) => {
//   const contentState = convertFromRaw(JSON.parse(content))
//   const editorState = EditorState.createWithContent(contentState)
//   setEditorState(editorState)
// }

// const _sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
