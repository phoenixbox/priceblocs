import * as React from 'react'
import { Elements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import {
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
  ICustomerParams,
  IFetchConfigParams,
} from './types'
import { fetchConfig, createSession } from './request'

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
      const {
        children,
        apiKey,
        customer,
        email,
        customer_email,
        success_url,
        cancel_url,
        return_url,
        prices,
      } = contextProps
      const [metadata, setMetadata] = React.useState<IMetadata | undefined>()
      const [values, setValues] = React.useState<IValues | undefined>()
      const [loading, setLoading] = React.useState(false)
      const [ready, setReady] = React.useState(false)
      const [isSubmitting, setIsSubmitting] = React.useState(false)
      const [errors, setErrors] = React.useState<IErrors | null>(null)
      const clientKey = values && values.admin && values.admin.clientKey

      const commonCustomerParams = {
        customer,
        customer_email,
        email,
      } as ICustomerParams

      const fetchData = async () => {
        setLoading(true)
        try {
          const fetchProps = {
            ...commonCustomerParams,
            prices,
          } as IFetchConfigParams
          const { data, ...remainder } = await fetchConfig(apiKey, fetchProps)

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
            ...commonCustomerParams,
            prices,
          } as ICheckoutData
          if (metadata && metadata.id) {
            checkoutData.id = metadata.id
          }
          if (success_url) {
            checkoutData.success_url = success_url
          }
          if (cancel_url) {
            checkoutData.cancel_url = cancel_url
          } else {
            checkoutData.cancel_url = window.location.href
          }
          if (return_url) {
            checkoutData.return_url = return_url
          }

          setIsSubmitting(true)
          try {
            const response = await createSession(apiKey, checkoutData)

            stripe.redirectToCheckout({
              sessionId: response.id,
            })
          } catch (err) {
            setErrors({ config: err })
          }
          setIsSubmitting(false)
        } else {
          console.error(
            'Stripe is not initialized - ensure you have passed a valid API key'
          )
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
