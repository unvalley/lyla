import React, { useEffect, useState } from 'react'
import {
  convertFromRaw,
  convertToRaw,
  DraftStyleMap,
  Editor,
  EditorState,
  RichUtils
} from 'draft-js'
import { TwoColumnLayout } from '../common/TwoColumnLayout'
import 'draft-js/dist/Draft.css'
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  SimpleGrid,
  Spacer,
  Spinner,
  Stack,
  Text,
  Textarea,
  useDisclosure,
  useToast
} from '@chakra-ui/react'
import { stateToHTML } from 'draft-js-export-html'

type Props = {}

const measurementToColor: { [key: string]: string } = {
  妥当性: 'purple',
  理解力: 'green',
  文章力: 'orange',
  論理性: 'blue'
}

// https://stackoverflow.com/questions/51665544/how-retrieve-text-from-draftjs

const feedbacks = [
  {
    title: '妥当性',
    measurement: '妥当性',
    message: `妥当性の観点で，問題がある可能性があります．見直し・修正を行いましょう．
    意見が妥当であることを示すために，論拠を明確にするとよいでしょう．
    `,
    exampleMessage:
      '所得格差拡大の一因として，労働者の給与の変化が挙げられる．1960年と2016年の雇用統計を比較すると…'
  },
  {
    title: '論理性',
    measurement: '論理性',
    message: `論理性の観点で，問題がある可能性があります．見直し・修正を行いましょう．
    意見を支える論理構造に問題がないかを確かめてみるとよいでしょう．
    `,
    exampleMessage: '〇〇が起きた原因は，△△にある．△△は…'
  }
]

const questionAndSuggestions = [
  {
    title: '🤖：Botからのクエスチョン',
    message: '意見の論拠には，データや参考文献を利用していますか？',
    buttonMessage: '改善方法を見る'
  },
  {
    title: '🤖：Botからの提案',
    message:
      '執筆開始から，30分ほどが経過しました．ここまでで書いた文章を見直してみましょう．また見直しのあとに，もう一度，執筆の計画を立ててみましょう．',
    buttonMessage: '見直しをする'
  }
]

const problemInfo = {
  category: 'グローバル',
  title:
    'グローバリゼーションは、世界、または各国の所得格差をどのように変化させましたか。また、なぜ所得格差拡大、または縮小の現象が現れたと考えますか。300字以内で答えなさい。'
}
// e.score * 2 * 10

const arraySum = (nums: Array<number>) =>
  nums.reduce((partialSum, a) => partialSum + a, 0)

export const EditorTemplate: React.FC<Props> = () => {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [canShowEditor, setCanShowEditor] = useState(false)
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  )
  const [isScoring, setIsScoring] = useState(false)
  const [textMeasurementScores, setTextMeasurementScores] = useState([
    {
      measurement: '論理性',
      score: 64
    },
    {
      measurement: '妥当性',
      score: 56
    },
    {
      measurement: '理解力',
      score: 80
    },
    {
      measurement: '文章力',
      score: 100
    }
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

  const _sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

  const resetTextMeasurementScores = async () => {
    setIsScoring(true)
    await _sleep(3000)
    setTextMeasurementScores([
      {
        measurement: '論理性',
        score: Math.ceil(Math.random() * (100 - 30) + 30)
      },
      {
        measurement: '妥当性',
        score: Math.ceil(Math.random() * (100 - 30) + 30)
      },
      {
        measurement: '理解力',
        score: Math.ceil(Math.random() * (100 - 30) + 30)
      },
      {
        measurement: '文章力',
        score: Math.ceil(Math.random() * (100 - 30) + 30)
      }
    ])
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

  const customMap: DraftStyleMap = {
    VALIDNESS_FEED_BACK: {
      fontWeight: 'bold',
      color: '#805AD5',
      textDecoration: 'underline'
    },
    LOGICALITY_FEED_BACK: {
      fontWeight: 'bold',
      color: '#3182CE',
      textDecoration: 'underline'
    },
    RED_FEED_BACK: {
      fontWeight: 'bold',
      color: 'red',
      textDecoration: 'underline'
    }
  }

  return (
    <div className="wrapper" onClick={focusEditor}>
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
          display={{ base: isOpen ? 'block' : 'none', md: 'block' }}
          mt={{ base: 4, md: 0 }}
        >
          <Button
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
              onChange(
                RichUtils.toggleInlineStyle(editorState, 'RED_FEED_BACK')
              )
            }}
            ml={4}
          >
            赤でハイライト
          </Button>
          <Button
            colorScheme="green"
            onMouseDown={resetTextMeasurementScores}
            ml={4}
          >
            採点
          </Button>

          <Button colorScheme="orange" onMouseDown={onOpen} ml={4}>
            メモを確認する
          </Button>
        </Box>
      </Flex>

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

            <Spacer mb={6} />
            <Heading size="md">フィードバック</Heading>
            {feedbacks.map((e, idx) => {
              return (
                // TODO: set correct key
                <FeedBackCard
                  key={idx}
                  title={e.title}
                  message={e.message}
                  measurement={e.measurement}
                  exampleMessage={e.exampleMessage}
                />
              )
            })}

            <Spacer mb={6} />

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
                    <Text
                      fontSize={{ base: 'sm' }}
                      textAlign={'left'}
                      maxW={'4xl'}
                    >
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
          </Box>
        }
      />

      <Modal size="2xl" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader fontWeight="medium">執筆前の準備</ModalHeader>
          <ModalBody fontWeight="medium">
            この実験では，以下の小論文課題に取り組んでもらいます．
          </ModalBody>

          <ModalBody>{problemInfo.title}</ModalBody>
          <hr />

          <ModalBody>
            まずは，小論文課題に取り組む前に以下の項目を実施しましょう．
            {/* 記述したメモはあとから見ることができます． */}
          </ModalBody>

          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>1. 小論文のアイデアを考えてみましょう</FormLabel>
              <Textarea placeholder="日本とアメリカの所得格差を中心に，格差問題の過去と現在を比較して，変化について述べる．" />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>
                2. 小論文をどのような構成で書くか考えてみましょう
              </FormLabel>
              <Textarea placeholder="まず，日本とアメリカの所得格差のデータを示し，事実を述べる．その後，…" />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>
                3. 小論文を書くために，どのような情報が必要か考えてみましょう
              </FormLabel>
              <Textarea placeholder="日本とアメリカの所得に関するデータが必要．政府が発行している資料を…" />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>
                4. 小論文を効率的に書くために，時間配分を考えてみましょう
              </FormLabel>
              <Textarea placeholder="まず最初の10分で構成を書く．次に，20分で情報を調べる．情報が手に入ったら，それを元に…" />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

type FeedBackCardProps = {
  title: string
  message: string
  measurement: string
  exampleMessage: string
}
const FeedBackCard: React.FC<FeedBackCardProps> = (props) => {
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
