import { fetchConfig } from 'src/request'
import { IFetchConfigParams, IFetchDataActionProps } from 'src/types'

export default (props: IFetchDataActionProps) => {
  const {
    loading,
    setLoading,
    setValues,
    setMetadata,
    setError,
    api_key,
    customer,
    customer_email,
    email,
    prices,
  } = props

  return async () => {
    if (!loading) {
      setLoading(true)
      try {
        const fetchData = {
          customer,
          customer_email,
          email,
          prices,
        } as IFetchConfigParams
        const { data, ...metadata } = await fetchConfig(api_key, fetchData)

        setMetadata(metadata)
        setValues(data)
      } catch (err) {
        setError({ message: err.message })
      }
      setLoading(false)
    }
  }
}
