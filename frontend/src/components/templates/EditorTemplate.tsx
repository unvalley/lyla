import React, { useEffect, useState } from 'react'
import {
  convertFromRaw,
  convertToRaw,
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
  Heading,
  Progress,
  SimpleGrid,
  Spacer,
  Text
} from '@chakra-ui/react'
import { stateToHTML } from 'draft-js-export-html'

type Props = {}

export const EditorTemplate: React.FC<Props> = () => {
  const [canShowEditor, setCanShowEditor] = useState(false)
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  )

  useEffect(() => setCanShowEditor(true), [])

  const editor: any = React.useRef<Editor>()
  const focusEditor = () => {
    if (editor.current) {
      editor.current.focus()
    }
  }

  const saveText = (title: string) => {
    const contentState = editorState.getCurrentContent()
    const content = convertToRaw(contentState)
    const html = stateToHTML(contentState)
    // 以下DBに保存する処理
    console.log(content, html)
  }

  const loadFromHtml = (content: any) => {
    const contentState = convertFromRaw(JSON.parse(content))
    const editorState = EditorState.createWithContent(contentState)
    setEditorState(editorState)
  }

  const onChange = (editorState: EditorState) => {
    setEditorState(editorState)
  }

  if (!canShowEditor) return <></>

  const customMap: { [key in string]: any } = {
    FEED_BACK: {
      fontWeight: 'bold',
      color: 'red',
      textDecoration: 'underline'
    }
  }

  return (
    <div className="wrapper" onClick={focusEditor}>
      <TwoColumnLayout
        leftElement={
          <Box overflow="hidden" fontSize="24px" minH={'80vh'} p={6}>
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
            <Button
              colorScheme="red"
              onMouseDown={() =>
                onChange(RichUtils.toggleInlineStyle(editorState, 'FEED_BACK'))
              }
            >
              採点
            </Button>
            <Heading size="lg">文章スコア</Heading>
            <Spacer mb={4} />
            <SimpleGrid columns={1} spacing={4}>
              <Box>
                <Flex spacing={4}>
                  <Text fontSize="md" pr={3}>
                    論理性
                  </Text>
                  <Text>3.5</Text>
                </Flex>
                <Progress value={30} colorScheme="blue" />
              </Box>
              <Box>
                <Flex spacing={4}>
                  <Text fontSize="md" pr={3}>
                    妥当性
                  </Text>
                  <Text>3.5</Text>
                </Flex>
                <Progress value={60} colorScheme="purple" />
              </Box>
              <Box>
                <Flex spacing={4}>
                  <Text fontSize="md" pr={3}>
                    理解力
                  </Text>
                  <Text>3.5</Text>
                </Flex>
                <Progress value={50} colorScheme="green" />
              </Box>
              <Box>
                <Flex spacing={4}>
                  <Text fontSize="md" pr={3}>
                    文章力
                  </Text>
                  <Text>3.5</Text>
                </Flex>
                <Progress value={80} colorScheme="orange" />
              </Box>
            </SimpleGrid>

            <Spacer mb={6} />
            <Heading size="lg">フィードバック</Heading>
          </Box>
        }
      />
    </div>
  )
}

// type SuggestCardProps = { label: string; message: string; onClick: () => void }
// const SuggestCard: React.FC<SuggestCardProps> = ({
//   label,
//   message,
//   onClick
// }) => {
//   return (
//     <Card shadow>
//       <h3 style={{ fontSize: '24px' }}>{label}</h3>
//       <p style={{ fontSize: '20px' }}>{message}</p>
//       <Button auto type="success-light" onClick={onClick}>
//         OK
//       </Button>
//     </Card>
//   )
// }
