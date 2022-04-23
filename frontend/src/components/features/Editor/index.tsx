import React, { useEffect, useState } from 'react'
import { Editor, EditorState, RichUtils } from 'draft-js'
import { TwoColumnLayout } from '../../Layout/TwoColumnLayout'
import 'draft-js/dist/Draft.css'
import createCounterPlugin from '@draft-js-plugins/counter'
import {
  Box,
  Heading,
  HStack,
  Radio,
  RadioGroup,
  Spacer,
  Stack,
  Text,
  useDisclosure,
  useRadio,
  useRadioGroup,
  useToast
} from '@chakra-ui/react'
import { Header } from '../../Header'
import { problemInfo, customMap, measurementToDraftStyle } from '../../seed'
import { MyModal } from '../../MyModal'
import { TextScores } from '../../TextScores'
import { FeedbackCard } from '../../FeedbackCard'
import { getHighlighPositionNumbers } from '../../utils'
import axios, { AxiosResponse } from 'axios'

const jaToEn: { [key: string]: string } = {
  妥当性: 'validness',
  論理性: 'logicality',
  理解力: 'understanding',
  文章力: 'writing'
}
const counterPlugin = createCounterPlugin()
const { CharCounter } = counterPlugin

export type ScoringResult = {
  measurement: string
  score: number
  highlightIndex: number
}

export type ExampleTextResult = {
  exampleTexts: string[]
}

type Props = {}

// https://stackoverflow.com/questions/51665544/how-retrieve-text-from-draftjs

type Feedback = {
  title: string
  measurement: string
  message: string
  exampleMessage: string
  highlightTargetPosition: {
    start: number
    end: number
  }
}[]

const useEditor = () => {
  const [canShowEditor, setCanShowEditor] = useState(false)
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  )

  useEffect(() => {
    setCanShowEditor(true)
  }, [])

  return { editorState, setEditorState, canShowEditor }
}

const useFetchScore = () => {}

const useScoring = () => {
  const [textMeasurementScores, setTextMeasurementScores] = useState<
    ScoringResult[]
  >([
    { measurement: '論理性', score: 0, highlightIndex: 0 },
    { measurement: '妥当性', score: 0, highlightIndex: 0 },
    { measurement: '理解力', score: 0, highlightIndex: 0 },
    { measurement: '文章力', score: 0, highlightIndex: 0 }
  ])
  return { textMeasurementScores, setTextMeasurementScores }
}

const useFetchFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback>([
    {
      title: 'タイトル',
      measurement: '論理性',
      message: 'ここがダメです',
      exampleMessage: 'こうすると良いです',
      highlightTargetPosition: {
        start: 0,
        end: 0
      }
    }
  ])
  return { feedbacks, setFeedbacks }
}

export const EditorTemplate: React.FC<Props> = () => {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isScoring, setIsScoring] = useState(false)

  const { editorState, setEditorState, canShowEditor } = useEditor()
  const { textMeasurementScores, setTextMeasurementScores } = useScoring()
  const { feedbacks, setFeedbacks } = useFetchFeedbacks()

  const editor: any = React.useRef<Editor>()
  const focusEditor = () => {
    if (editor.current) {
      editor.current.focus()
    }
  }

  useEffect(() => {
    // onOpen()
  }, [])

  const getExampleText = async (measurement: string) => {
    const plainText = editorState.getCurrentContent().getPlainText()

    const targetScoringResult = textMeasurementScores.find(
      (e) => e.measurement === measurement
    )
    if (!targetScoringResult || targetScoringResult.highlightIndex === 0) {
      alert('ハイライトが先頭の場合，例文生成機能は使えません．')
      return
    }

    const usingForexampleTextEndPosition = getHighlightTargetPosition(
      editorState,
      targetScoringResult.highlightIndex
    ).start

    const text = plainText.slice(0, usingForexampleTextEndPosition)

    const exampleTextResult = await axios
      .post(`http://localhost:8080/predict/example_text`, {
        text,
        measurement: jaToEn[measurement]
      })
      .then((res: AxiosResponse<ExampleTextResult>) => {
        return res.data
      })

    const newFeedbacks = feedbacks.flatMap((e) => {
      if (e.measurement != measurement) return []
      return {
        ...e,
        exampleMessage: exampleTextResult.exampleTexts[0].substring(
          usingForexampleTextEndPosition
        )
      }
    })
    setFeedbacks(newFeedbacks)
  }

  const resetTextMeasurementScores = async () => {
    setIsScoring(true)
    const plainText = editorState.getCurrentContent().getPlainText()

    const scoringResult = await axios
      .post(`http://localhost:8080/predict/scores`, {
        text: plainText
      })
      .then((res: AxiosResponse<ScoringResult[]>) => {
        return res.data
      })

    setTextMeasurementScores(scoringResult)
    const newFeedbacks = findFeedbacks(editorState, scoringResult)
    setFeedbacks(newFeedbacks)

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
    <div className="wrapper">
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

            <div onClick={focusEditor}>
              <Editor
                ref={editor}
                editorKey="key"
                editorState={editorState}
                onChange={onChange}
                placeholder="Type something..."
                customStyleMap={customMap}
              />
            </div>
          </Box>
        }
        rightElement={
          <Box p={6}>
            <TextScores
              isScoring={isScoring}
              textMeasurementScores={textMeasurementScores}
            />
            <Spacer mb={6} />

            <Stack boxShadow="lg" borderRadius="sm" p="4">
              <Heading size="md">質問（for モニタリング）</Heading>
              <RadioGroup value={'1'} p={2}>
                <Text fontWeight={'bold'}>
                  執筆は計画通りに進んでいますか？
                </Text>
                <Stack direction="row">
                  <Radio value="1">進んでいる</Radio>
                  <Radio value="2">あまり進んでいない</Radio>
                  <Radio value="3">全く進んでいない</Radio>
                </Stack>
              </RadioGroup>
              <RadioGroup value={'1'} p={2}>
                <Text fontWeight={'bold'}>
                  執筆に必要な情報は十分に調べられましたか？
                </Text>
                <Stack direction="row">
                  <Radio value="1">調べられた</Radio>
                  <Radio value="2">あまり調べられていない</Radio>
                  <Radio value="3">全く調べられていない</Radio>
                </Stack>
              </RadioGroup>
              <Text>書いた文章を読み返してみましょう．</Text>
            </Stack>

            <Spacer mb={6} />
            <Heading size="md">フィードバック</Heading>
            {feedbacks.map((e, idx) => {
              return (
                // TODO: set correct kela
                <FeedbackCard
                  key={e.measurement}
                  editorState={editorState}
                  setEditorState={setEditorState}
                  title={e.title}
                  getExampleText={getExampleText}
                  message={e.message}
                  measurement={e.measurement}
                  exampleMessage={e.exampleMessage}
                  highlightTargetPosition={e.highlightTargetPosition}
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

export const updateEditorStyle = (
  editorState: EditorState,
  measurement: string,
  highlightTargetPosition: {
    start: number
    end: number
  }
) => {
  const selectionState = editorState.getSelection()
  const newSelection = selectionState.merge({
    anchorOffset: highlightTargetPosition.start,
    focusOffset: highlightTargetPosition.end
  })
  const editorStateWithNewSelection = EditorState.forceSelection(
    editorState,
    newSelection
  )
  const draftStyleKey = measurementToDraftStyle[measurement]
  const editorStateWithStyles = RichUtils.toggleInlineStyle(
    editorStateWithNewSelection,
    draftStyleKey
  )
  const editorStateWithStylesAndPreviousSelection = EditorState.acceptSelection(
    editorStateWithStyles,
    selectionState
  )
  return editorStateWithStylesAndPreviousSelection
}

const getHighlightTargetPosition = (
  editorState: EditorState,
  highlightIndex: number
) => {
  const splittedText = editorState
    .getCurrentContent()
    .getPlainText()
    .split('。')

  const sentenceCharacterCounts = splittedText.map((e) => e.length + 1)
  const highlightTargetPosition = getHighlighPositionNumbers(
    sentenceCharacterCounts,
    highlightIndex
  )
  return highlightTargetPosition
}

const getHighlightedEditorState = (
  editorState: EditorState,
  measurement: string,
  highlightIndex: number
) => {
  const highlightTargetPosition = getHighlightTargetPosition(
    editorState,
    highlightIndex
  )
  return updateEditorStyle(editorState, measurement, highlightTargetPosition)
}

export const removeHighlightStyle = (
  editorState: EditorState,
  measurement: string,
  highlightTargetPosition: {
    start: number
    end: number
  }
) => {
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
    ''
  )
  const editorStateWithStylesAndPreviousSelection = EditorState.acceptSelection(
    editorStateWithStyles,
    selectionState
  )
  return editorStateWithStylesAndPreviousSelection
}

const measurementToMessage: { [key: string]: string } = {
  妥当性: `意見が妥当であることを示すために，論拠を明確にするとよいでしょう．`,
  論理性: `論理性を向上させるためには，文章の構成・論理構造を再確認するとよいでしょう．`,
  理解力: `理解力を向上させるためには，課題についての情報をより調査することが有用です．`,
  文章力: `文章量を向上させるためには，文法的に正しく記述されているか再確認することが有用です．`
}

const getFeedbackMessages = (
  measurement: string,
  highlightTargetPosition: { start: number; end: number }
) => {
  return {
    title: measurement,
    measurement: measurement,
    message: `${measurement}の観点で，問題がある可能性があります．見直し・修正を行いましょう．${measurementToMessage[measurement]}`,
    exampleMessage: '',
    highlightTargetPosition
  }
}

const findFeedbacks = (
  editorState: EditorState,
  mockScoringResult: {
    measurement: string
    score: number
    highlightIndex: number
  }[]
) => {
  const feedbacks = mockScoringResult.flatMap((e) => {
    // TODO:
    if (e.score > 60) return []
    const highlightTargetPosition = getHighlightTargetPosition(
      editorState,
      e.highlightIndex
    )
    return getFeedbackMessages(e.measurement, highlightTargetPosition)
  })
  return feedbacks
}

// const scoringResult = [
//   { measurement: '論理性', score: 40.0, highlightIndex: 0 },
//   { measurement: '妥当性', score: 80.0, highlightIndex: 1 },
//   { measurement: '理解力', score: 60.0, highlightIndex: 4 },
//   { measurement: '文章力', score: 50.0, highlightIndex: 2 }
// ]

// const highlightedEditorState = getHighlightedEditorState(
//   editorState,
//   '論理性',
//   0
// )
// setEditorState(highlightedEditorState)
