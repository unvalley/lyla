import { DraftStyleMap } from 'draft-js'

export const feedbacks = [
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

export const questionAndSuggestions = [
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

export const problemInfo = {
  category: 'グローバル',
  title:
    'グローバリゼーションは、世界、または各国の所得格差をどのように変化させましたか。また、なぜ所得格差拡大、または縮小の現象が現れたと考えますか。300字以内で答えなさい。'
}

export const customMap: DraftStyleMap = {
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

export const measurementToColor: { [key: string]: string } = {
  妥当性: 'purple',
  理解力: 'green',
  文章力: 'orange',
  論理性: 'blue'
}
