import axios, { AxiosRequestConfig } from 'axios'
import { request } from 'http'
import { getSession } from 'next-auth/react'

export const useAxios = () => {
  const axiosConfig = {
    baseUrl: 'http://localhost:3000',
    withCredentials: true,
    timeout: 50000
  }

  const axiosClient = axios.create(axiosConfig)

  axiosClient.interceptors.request.use(async (config: AxiosRequestConfig) => {
    const session = await getSession()
    if (session && config.headers) {
      config.headers.Authorization = `Bearer ${session.jwt}`
      config.headers.Accept = 'application/json'
    }
    return request
  })

  return axiosClient
}
