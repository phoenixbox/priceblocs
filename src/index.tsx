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
  ICustomerParams,
  IFetchConfigParams,
  IPriceBlocsContext,
  IBillingProps,
  IError,
} from './types'
import { fetchConfig } from './request'
import * as Hooks from './hooks'
import * as Utils from './utils'
import * as Constants from './constants'
import { checkout, billing } from './actions'

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
        api_key,
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
      const [error, setError] = React.useState<
        IPriceBlocsError | IError | null
      >(null)
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
            const { data, ...remainder } = await fetchConfig(api_key, fetchData)

            setMetadata(remainder)
            setValues(data)
          } catch (err) {
            setError({ message: err.message })
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

      const providerValue: IPriceBlocsProviderValue = {
        ready,
        loading,
        isSubmitting,
        setValues,
        setFieldValue,
        refetch: fetchData,
        checkout: checkout({
          api_key,
          success_url,
          cancel_url,
          return_url,
          metadata,
          isSubmitting,
          customer,
          customer_email,
          email,
          setIsSubmitting,
          setError,
        }),
        billing: billing({
          api_key,
          return_url,
          isSubmitting,
          customer,
          customer_email,
          email,
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
        // @ts-ignore
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
