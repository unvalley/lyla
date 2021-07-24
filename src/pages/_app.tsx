import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { GeistProvider } from '@geist-ui/react'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GeistProvider>
      <Component {...pageProps} />
    </GeistProvider>
  )
}
export default MyApp
