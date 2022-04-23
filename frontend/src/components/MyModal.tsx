import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  ModalFooter,
  Button
} from '@chakra-ui/react'
import React from 'react'
import { problemInfo } from './seed'

type Props = { isOpen: boolean; onClose: () => void }
export const MyModal: React.VFC<Props> = ({ isOpen, onClose }) => {
  return (
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
  )
}
