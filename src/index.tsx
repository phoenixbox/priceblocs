import * as React from 'react'
import { Elements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import {
  IFetchConfigParams,
  ICheckoutProps,
  IMetadata,
  ICheckoutData,
  IPriceBlocsContextProps,
  IValues,
  IErrors,
  IPriceBlocsProviderValue,
  IPriceBlocsProvider,
  IStripeElementContextProps,
  IWithStripeContextProps,
  IAuthHeaders,
} from './types'
import { URLS, METHODS } from './constants'

/**
 * ================================
 * Standard context setup
 * ================================
 * - Setup standard context providers and get values hooks
 * - Init with account api keys and optional customer context
 * - Set the response in shared state to be used within any connected component
 */
export const createUseContext = (
  contextProviderWrapperCreator: (
    provider: IPriceBlocsProvider
  ) => IPriceBlocsProvider
) => {
  const Context = React.createContext<null>(null)
  const useContext = () => React.useContext(Context)
  let ContextProvider

  if (typeof contextProviderWrapperCreator === 'function') {
    ContextProvider = contextProviderWrapperCreator(Context.Provider)
  } else {
    ContextProvider = Context.Provider
  }

  return {
    Context,
    ContextProvider,
    ContextConsumer: Context.Consumer,
    useContext,
  }
}

const getAuthHeaders = (apiKey: string): IAuthHeaders => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${apiKey}`,
})

const fetchConfig = async (apiKey: string, params: IFetchConfigParams) => {
  let queryParams = []
  for (const key in params) {
    if (params[key]) {
      queryParams.push(`${key}=${params[key]}`)
    }
  }
  const queryString = queryParams.join('&')
  const url = queryString ? `${URLS.PRICING}?${queryString}` : URLS.PRICING

  const response = await fetch(url, {
    method: METHODS.GET,
    headers: getAuthHeaders(apiKey),
  })

  return response.json()
}

const createSession = async (apiKey: string, data: ICheckoutData) => {
  const response = await fetch(URLS.CHECKOUT, {
    method: METHODS.POST,
    headers: getAuthHeaders(apiKey),
    body: JSON.stringify(data),
  })

  return response.json()
}

const WithStripeContext = ({
  children,
  Provider,
  providerValue,
  setReady,
  ready,
}: IWithStripeContextProps) => {
  const stripe = useStripe()

  React.useEffect(() => {
    if (stripe && !ready) {
      setReady(true)
    }
  }, [stripe])

  const initialCheckout = providerValue.checkout

  const value = {
    ...providerValue,
    checkout: async (props: ICheckoutProps) => {
      await initialCheckout(props, stripe)
    },
  }

  // @ts-ignore
  return <Provider value={value}>{children}</Provider>
}

const StripeElementContainer = (props: IStripeElementContextProps) => {
  const promise = React.useMemo(() => loadStripe(props.clientKey), [])

  return (
    <Elements stripe={promise}>
      <WithStripeContext
        setReady={props.setReady}
        ready={props.ready}
        providerValue={props.providerValue}
        Provider={props.Provider}
      >
        {props.children}
      </WithStripeContext>
    </Elements>
  )
}

export const {
  Context: PriceBlocsContext,
  ContextProvider: PriceBlocs,
  useContext: usePriceBlocsContext,
  /* eslint-disable-next-line react/display-name, react/prop-types */
} = createUseContext(
  (Provider: IPriceBlocsProvider) =>
    (contextProps: IPriceBlocsContextProps): any => {
      const { children, apiKey, customer, email } = contextProps
      const [metadata, setMetadata] = React.useState<IMetadata | undefined>()
      const [values, setValues] = React.useState<IValues | undefined>()
      const [loading, setLoading] = React.useState(false)
      const [ready, setReady] = React.useState(false)
      const [isSubmitting, setIsSubmitting] = React.useState(false)
      const [errors, setErrors] = React.useState<IErrors | null>(null)
      const clientKey = values && values.admin && values.admin.clientKey

      const fetchData = async () => {
        setLoading(true)
        try {
          const { data, ...remainder } = await fetchConfig(apiKey, {
            customer,
            email,
          })

          setMetadata(remainder)
          setValues(data)
        } catch (err) {
          setErrors({ config: err })
        }
        setLoading(false)
      }

      React.useEffect(() => {
        fetchData()
      }, [])

      const checkout = async ({ prices }: ICheckoutProps, stripe: Stripe) => {
        if (stripe) {
          const checkoutData = {
            prices,
            cancelUrl: window.location.href,
          } as ICheckoutData
          if (metadata) {
            checkoutData.id = metadata.id
          }

          setIsSubmitting(true)
          try {
            const response = await createSession(apiKey, checkoutData)

            if (stripe) {
              stripe.redirectToCheckout({
                sessionId: response.id,
              })
            } else {
              console.error('No Stripe for price checkout')
            }
          } catch (err) {
            setErrors({ config: err })
          }
          setIsSubmitting(false)
        }
      }

      const providerValue: IPriceBlocsProviderValue = {
        ready,
        loading,
        isSubmitting,
        setValues,
        refetch: fetchData,
        checkout,
      }
      if (values) {
        providerValue.values = values
      }
      if (metadata) {
        providerValue.metadata = metadata
      }
      if (errors) {
        providerValue.errors = errors
      }

      return clientKey ? (
        <StripeElementContainer
          ready={ready}
          setReady={setReady}
          clientKey={clientKey}
          providerValue={providerValue}
          Provider={Provider}
        >
          {children}
        </StripeElementContainer>
      ) : (
        // @ts-ignore
        <Provider value={providerValue}>{children}</Provider>
      )
    }
)
