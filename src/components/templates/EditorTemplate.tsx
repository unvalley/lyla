import React, { useEffect, useState } from 'react'
import { Editor, EditorState } from 'draft-js'
import { TwoColumnLayout } from '../common/TwoColumnLayout'
import { Button, Card } from '@geist-ui/react'
import 'draft-js/dist/Draft.css'

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
        }
        rightElement={
          <div>
            <h2 style={{ fontSize: '28px' }}>サジェスト</h2>
            {shouldShowSuggest && (
              <SuggestCard
                label={'バイアス'}
                message={
                  '意見が偏っている可能性があります．この意見に対する反対の意見を考えてみると，新しい見方ができるかもしれません'
                }
                onClick={() => alert('書かれた文章の状態を考慮する必要がある')}
              />
            )}
          </div>
        }
      />
    </div>
  )
}

type SuggestCardProps = { label: string; message: string; onClick: () => void }
const SuggestCard: React.FC<SuggestCardProps> = ({
  label,
  message,
  onClick
}) => {
  return (
    <Card shadow>
      <h3 style={{ fontSize: '24px' }}>{label}</h3>
      <p style={{ fontSize: '20px' }}>{message}</p>
      <Button auto type="success-light" onClick={onClick}>
        OK
      </Button>
    </Card>
  )
}
