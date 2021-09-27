import * as React from 'react'
import { Stripe } from '@stripe/stripe-js'

export interface ICustomerParams {
  [key: string]: string
  customer?: string
  customer_email?: string
  email?: string
}

export interface IFetchConfigParams
  extends Pick<ICustomerParams, 'customer' | 'customer_email' | 'email'> {
  [key: string]: string | string[]
  prices?: string[]
  id?: string
  session?: string
}

export interface IFetchDataActionProps
  extends Pick<ICustomerParams, 'customer' | 'customer_email' | 'email'> {
  api_key: string
  loading: boolean
  setLoading: (loading: boolean) => void
  setValues: (values: IValues) => void
  setMetadata: (values: IMetadata) => void
  setError: (error: IPriceBlocsError | IError) => void
  prices: string[]
}

export interface ICheckoutActionProps {
  api_key: string
  success_url?: string
  cancel_url?: string
  return_url?: string
  customer?: ICustomer
  metadata: IMetadata
  isSubmitting: boolean
  setIsSubmitting: (isSubmiting: boolean) => void
  setError: (error: IPriceBlocsError | IError) => void
}

export interface IBillingActionProps {
  api_key: string
  customer?: ICustomer
  return_url?: string
  isSubmitting: boolean
  setIsSubmitting: (isSubmiting: boolean) => void
  setError: (error: IPriceBlocsError | IError) => void
}

export interface IBillingProps extends Pick<ICustomerParams, 'customer'> {
  return_url?: string
}

export type IBillingData = {
  customer: string
  return_url: string
}

export interface IMetadata {
  id: string
}

export interface ICheckoutData
  extends Pick<ICustomerParams, 'customer' | 'customer_email'> {
  [key: string]: string | string[]
  prices: string[]
  cancel_url: string
  success_url?: string
  return_url?: string
  id?: string
  session?: string
}

export interface ICheckoutProps {
  prices: string[]
  cancel_url: string
  success_url?: string
  return_url?: string
  id?: string
  customer?: ICustomer
  session?: string
  metadata: IMetadata
}

export interface IPriceBlocsContextProps
  extends Pick<ICustomerParams, 'customer' | 'customer_email' | 'email'> {
  api_key: string
  children: React.ReactNode | ((props: IPriceBlocsProviderValue) => any)
  prices?: string[]
  success_url?: string
  cancel_url?: string
  return_url?: string
}

export interface IAdmin {
  clientKey: string
}

export interface IRecurring {
  interval: string
}

export interface IPrice {
  id: string
  currency: string
  recurring: IRecurring | null
}

export interface IProduct {
  id: string
  name: string
  description?: string
  prices?: IPrice[]
}

export interface IHighlight {
  price?: string
  product?: string
  label?: string
  style?: string
}

export interface IPresentation {
  interval?: string
  license?: string
}

export interface IColors {
  primary?: string
}

export interface ITheme {
  colors?: IColors
  license?: string
}

export interface IFormData {
  currencies: string[]
  currency: string
  intervals: string[]
  interval: string
  highlight: IHighlight
  theme: ITheme
  presentation: IPresentation
}

export interface ICustomer {
  id?: string
  email?: string
}

export interface IValues {
  admin: IAdmin
  customer: ICustomer
  form: IFormData
  products: IProduct[]
}

export interface IPriceBlocsError {
  statusCode: number
  error: string
  message: string
  type: string
  headers: {
    [key: string]: string
  }
  payload: {
    [key: string]: any
  }
  url: string
  method: string
  param: string
  docs: string
  chat: string
}

export interface IError {
  statusCode?: number
  message: string
}

export interface IPriceBlocsProviderValue {
  ready: boolean
  loading: boolean
  isSubmitting: boolean
  values?: IValues
  metadata?: IMetadata | null
  error?: IPriceBlocsError | IError
  setValues: (values: IValues) => void
  setFieldValue: (path: string, value: any) => any
  refetch: () => void
  checkout: ({ prices }: ICheckoutProps, stripe: Stripe | null) => void
  billing: (
    { customer, return_url }: IBillingProps,
    stripe: Stripe | null
  ) => void
}

export interface IPriceBlocsContext {
  Context: React.Context<null>
  ContextProvider: IPriceBlocsProvider | React.Provider<null>
  ContextConsumer: React.Consumer<null>
  useContext: () => IPriceBlocsProviderValue
}

export interface IPriceBlocsProvider extends React.FC<any> {
  value?: IPriceBlocsProviderValue
  children?: React.ReactNode
}

export interface IStripeElementContextProps {
  setReady: (ready: boolean) => void
  ready: boolean
  clientKey: string
  children: React.ReactNode
  providerValue: IPriceBlocsProviderValue
  Provider: IPriceBlocsProvider
}

export interface IWithStripeContextProps {
  setReady: (ready: boolean) => void
  ready: boolean
  children: React.ReactNode
  providerValue: IPriceBlocsProviderValue
  Provider: IPriceBlocsProvider
}

export interface IAuthHeaders {
  [key: string]: string
}

export interface IProductConfig {
  [key: string]: {
    enabled: boolean
  } | null
}

export interface IFeature {
  title: string
  tooltip: string | null
  product_config: IProductConfig
}

export interface IFeatureGroup {
  title: string
  features: IFeature[]
}

export interface IFeatureTableHeader {
  id: string
  title: string
}

export interface IFeatureTableGroupColumn {
  header: string
  accessor?: string
}

export interface IFeatureTableGroupRowTitle {
  value: string
  tooltip: string
}

export interface IFeatureTableGroupRow {
  [key: string]: IProductConfig | null | IFeatureTableGroupRowTitle | boolean
}

export interface IFeatureTableGroup {
  columns: IFeatureTableGroupColumn[]
  rows: IFeatureTableGroupRow[]
}

export interface IProductsFeatureTable {
  header: IFeatureTableHeader[]
  groups: IFeatureTableGroup[]
}
