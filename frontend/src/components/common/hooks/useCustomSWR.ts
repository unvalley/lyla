import useSWR, { SWRConfiguration } from 'swr'
import { useAxios } from './useAxios'

const useFetcher = <T>() => {
  const axios = useAxios()
  const fetcher = (url: string) => axios.get<T>(url).then((res) => res.data)
  return fetcher
}

export const useCustomSWR = <Data = unknown, Error = unknown>(
  key: string | undefined,
  config?: SWRConfiguration<Data, Error>
) => {
  const fetcher = useFetcher<Data>()
  const response = useSWR<Data, Error>(key, fetcher, config)
  return { ...response, isInitialLoading: !response.data && !response.error }
}
