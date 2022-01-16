import React, { useEffect, useState } from 'react'
import { Editor, EditorState } from 'draft-js'
import { TwoColumnLayout } from '../common/TwoColumnLayout'
import 'draft-js/dist/Draft.css'
import {
  Box,
  Flex,
  Heading,
  Progress,
  SimpleGrid,
  Spacer,
  Text
} from '@chakra-ui/react'

type Props = {}

export const EditorTemplate: React.FC<Props> = () => {
  const [canShowEditor, setCanShowEditor] = useState(false)
  const [shouldShowSuggest, setShouldShowSuggest] = useState(false)
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

  const onChange = (editorState: EditorState) => {
    const existBiasWord = editorState
      .getCurrentContent()
      .getPlainText()
      .includes('バイアス')

    existBiasWord ? setShouldShowSuggest(true) : setShouldShowSuggest(false)

    setEditorState(editorState)
  }

  if (!canShowEditor) return <></>

  return (
    <div className="wrapper" onClick={focusEditor}>
      <TwoColumnLayout
        leftElement={
          <>
            <div
              style={{
                padding: '3.5rem',
                overflow: 'hidden',
                minHeight: '80vh',
                fontSize: '24px'
              }}
            >
              <Editor
                ref={editor}
                editorKey="key"
                editorState={editorState}
                onChange={onChange}
                placeholder="Type something..."
              />
            </div>
          </>
        }
        rightElement={
          <div>
            <Heading size="lg">文章スコア</Heading>
            <Spacer />
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

            {shouldShowSuggest && (
              <></>
              // <SuggestCard
              //   label={'バイアス'}
              //   message={
              //     '意見が偏っている可能性があります．この意見に対する反対の意見を考えてみると，新しい見方ができるかもしれません'
              //   }
              //   onClick={() => alert('書かれた文章の状態を考慮する必要がある')}
              // />
            )}
          </div>
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
