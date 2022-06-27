import { useEffect, useState } from 'react'
import useSWR from 'swr'

export const useJson = (url) => {
    const [response, setResponse] = useState({})

    const fetcher = (url) =>
        fetch(url)
            .then((res) => res.json())
            .catch()
    const { data, error } = useSWR(url, fetcher)

    useEffect(() => {
        setResponse(data)
    }, [data, setResponse])

    return {
        response,
        error,
    }
}