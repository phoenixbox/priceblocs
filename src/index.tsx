import * as React from 'react'
import { clone, set } from 'lodash'
import { Elements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import {
  ICheckoutProps,
  IMetadata,
  IPriceBlocsContextProps,
  IValues,
  IPriceBlocsError,
  IPriceBlocsProviderValue,
  IPriceBlocsProvider,
  IStripeElementContextProps,
  IWithStripeContextProps,
  IPriceBlocsContext,
  IBillingProps,
  IError,
} from './types'
import * as Hooks from './hooks'
import * as Utils from './utils'
import * as Constants from './constants'
import { checkout, billing, fetchData } from './actions'

const createUseContext = (
  contextProviderWrapperCreator: (
    provider: IPriceBlocsProvider
  ) => IPriceBlocsProvider
): IPriceBlocsContext => {
  /**
   * Test out option argument
   */
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
  const initialBilling = providerValue.billing

  const value = {
    ...providerValue,
    checkout: async (props: ICheckoutProps) => initialCheckout(props, stripe),
    billing: async (props: IBillingProps) => initialBilling(props, stripe),
  }

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
      const { children, api_key, success_url, cancel_url, return_url, prices } =
        contextProps

      const [metadata, setMetadata] = React.useState<IMetadata | undefined>()
      const [values, setValues] = React.useState<IValues | undefined>()
      const [loading, setLoading] = React.useState(false)
      const [ready, setReady] = React.useState(false)
      const [isSubmitting, setIsSubmitting] = React.useState(false)
      const [error, setError] = React.useState<
        IPriceBlocsError | IError | null
      >(null)
      const clientKey = values && values.admin && values.admin.clientKey

      const setFieldValue = (path: string, value: any) => {
        const updatedValues = clone(values)
        set(updatedValues as IValues, path, value)
        setValues(updatedValues)
      }
      const customer = values ? values.customer : null

      const refetch = fetchData({
        api_key,
        customer: contextProps.customer,
        customer_email: contextProps.customer_email,
        email: contextProps.email,
        prices,
        loading,
        setLoading,
        setValues,
        setMetadata,
        setError,
      })

      React.useEffect(() => {
        refetch()
      }, [])

      const providerValue: IPriceBlocsProviderValue = {
        ready,
        loading,
        isSubmitting,
        setValues,
        setFieldValue,
        refetch: refetch,
        checkout: checkout({
          api_key,
          customer,
          success_url,
          cancel_url,
          return_url,
          metadata,
          isSubmitting,
          setIsSubmitting,
          setError,
        }),
        billing: billing({
          api_key,
          customer,
          return_url,
          isSubmitting,
          setIsSubmitting,
          setError,
        }),
      }

      if (values) {
        providerValue.values = values
      }
      if (metadata) {
        providerValue.metadata = metadata
      }
      if (error) {
        providerValue.error = error
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
        <Provider value={providerValue}>{content}</Provider>
      )
    }
)

/**
 * Hooks
 */
export const useActiveProductPrice = Hooks.useActiveProductPrice

/**
 * Utils
 */
export const getActiveProductPrice = Utils.getActiveProductPrice
export const getProductFeatures = Utils.getProductFeatures
export const getProductsFeaturesTable = Utils.getProductsFeaturesTable

/**
 * Constants
 */
export const RECURRING_INTERVALS = Constants.RECURRING_INTERVALS
export const INTERVAL_LABELS_MAP = Constants.INTERVAL_LABELS_MAP
export const INTERVAL_SHORTHAND_MAP = Constants.INTERVAL_SHORTHAND_MAP
