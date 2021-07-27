type Props = { leftElement: React.ReactNode; rightElement: React.ReactNode }
import { Col, Grid, Row } from '@geist-ui/react'
import React from 'react'

export const TwoColumnLayout: React.FC<Props> = ({
  leftElement,
  rightElement
}) => {
  return (
    <Row gap={0.8} justify="center">
      <Col span={14}>{leftElement}</Col>
      <Col span={10}>{rightElement}</Col>
    </Row>
  )
}
