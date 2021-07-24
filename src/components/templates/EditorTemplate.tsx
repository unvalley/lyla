import React, { useEffect, useState } from 'react'
import { Editor, EditorState } from 'draft-js'
import { TwoColumnLayout } from '../common/TwoColumnLayout'
import { Card } from '@geist-ui/react'

type Props = {}

export const EditorTemplate: React.FC<Props> = () => {
  const [mounted, setMounted] = useState(false)
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  )

  useEffect(() => setMounted(true), [])

  const editor: any = React.useRef<Editor>()
  const focusEditor = () => {
    if (editor.current) {
      editor.current.focus()
    }
  }

  if (!mounted) return null

  return (
    <div className="wrapper" onClick={focusEditor}>
      <TwoColumnLayout
        leftElement={
          <div
            style={{
              padding: '3.5rem',
              overflow: 'hidden',
              minHeight: '80vh'
            }}
          >
            <Editor
              ref={editor}
              editorKey="key"
              editorState={editorState}
              onChange={setEditorState}
              placeholder="Type something..."
            />
          </div>
        }
        rightElement={
          <div>
            <h2>Suggestion</h2>
            <Card shadow style={{ width: '100%' }}>
              <h4>The Evil Rabbit</h4>
              <p>shadow card.</p>
            </Card>
          </div>
        }
      />
    </div>
  )
}
