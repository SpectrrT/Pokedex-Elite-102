import { useEffect, useState } from 'react'
import useSWR from 'swr'

export const useJson = () => {
    const [response, setResponse] = useState({})
    const [url, setUrl] = useState()

    const fetcher = (url) =>
        fetch(url)
            .then((res) => res.json())
            .catch()
    const { data } = useSWR(url, fetcher)

    useEffect(() => {
        setResponse(data)
    }, [data, setResponse])

    return {
        response,
        setUrl,
    }
}