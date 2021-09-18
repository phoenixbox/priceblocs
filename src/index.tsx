import * as React from 'react'
import { clone, set } from 'lodash'
import { Elements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import {
  ICheckoutProps,
  IMetadata,
  IPriceBlocsContextProps,
  IValues,
  IErrors,
  IPriceBlocsProviderValue,
  IPriceBlocsProvider,
  IStripeElementContextProps,
  IWithStripeContextProps,
  ICustomerParams,
  IFetchConfigParams,
  IPriceBlocsContext,
} from './types'
import { fetchConfig, createSession, prepareCheckoutData } from './request'
import * as Hooks from './hooks'

const createUseContext = (
  contextProviderWrapperCreator: (
    provider: IPriceBlocsProvider
  ) => IPriceBlocsProvider
): IPriceBlocsContext => {
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
        if (!loading) {
          setLoading(true)
          try {
            const fetchData = {
              ...commonCustomerParams,
              prices,
            } as IFetchConfigParams
            const { data, ...remainder } = await fetchConfig(apiKey, fetchData)

            setMetadata(remainder)
            setValues(data)
          } catch (err) {
            setErrors({ config: err })
          }
          setLoading(false)
        }
      }

      const setFieldValue = (path: string, value: any) => {
        const updatedValues = clone(values)
        set(updatedValues as IValues, path, value)
        setValues(updatedValues)
      }

      React.useEffect(() => {
        fetchData()
      }, [])

      const checkout = async ({ prices }: ICheckoutProps, stripe: Stripe) => {
        if (!stripe) {
          console.error(
            'Stripe is not initialized - ensure you have passed a valid API key'
          )
          return
        }
        if (isSubmitting) {
          console.warn('Checkout in progress')
          return
        }
        const checkoutData = prepareCheckoutData({
          ...commonCustomerParams,
          prices,
          success_url,
          cancel_url,
          return_url,
          metadata,
        })

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
      }

      const providerValue: IPriceBlocsProviderValue = {
        ready,
        loading,
        isSubmitting,
        setValues,
        setFieldValue,
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

      const content =
        typeof children === 'function' ? children(providerValue) : children

      return clientKey ? (
        <StripeElementContainer
          ready={ready}
          setReady={setReady}
          clientKey={clientKey}
          providerValue={providerValue}
          Provider={Provider}
        >
          {content}
        </StripeElementContainer>
      ) : (
        // @ts-ignore
        <Provider value={providerValue}>{content}</Provider>
      )
    }
)

export const useActiveProductPrice = Hooks.useActiveProductPrice
