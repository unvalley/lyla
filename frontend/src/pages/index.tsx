import React from 'react'
import Head from 'next/head'
import { EditorTemplate } from '../components/features/Editor'

const Header: React.FC = () => (
  <Head>
    <title>Title</title>
    <meta name="description" content="Generated by create next app" />
    <link rel="icon" href="/favicon.ico" />
  </Head>
)

export default function Home() {
  return (
    <div>
      <Header />
      <main>
        <EditorTemplate />
      </main>
    </div>
  )
}
