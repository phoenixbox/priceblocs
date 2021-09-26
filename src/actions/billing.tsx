import { IBillingActionProps, IBillingProps } from 'src/types'
import { Stripe } from '@stripe/stripe-js'
import { createBilling, prepareBillingData } from 'src/request'

export default (props: IBillingActionProps) => {
  const { api_key, isSubmitting, setIsSubmitting, setError } = props

  /**
   * Should allow for optional override of checkout input props here
   */
  return async (billingProps: IBillingProps, stripe: Stripe) => {
    if (!stripe) {
      console.error(
        'Stripe is not initialized - ensure you have passed a valid API key'
      )
      return
    }
    if (isSubmitting) {
      console.warn('Billing in progress')
      return
    }

    const billingData = prepareBillingData({
      customer:
        billingProps && billingProps.customer
          ? billingProps.customer
          : props.customer && props.customer.id
          ? props.customer.id
          : null,
      return_url:
        billingProps && billingProps.return_url
          ? billingProps.return_url
          : props.return_url,
    })

    if (!billingData.customer) {
      console.error(
        'A valid customer id is required to start a billing portal session'
      )
      return
    }

    setIsSubmitting(true)
    try {
      const billingSession = await createBilling(api_key, billingData)
      if (billingSession) {
        if (billingSession.statusCode === 400) {
          setError(billingSession)
        } else if (billingSession.url) {
          window.location.href = billingSession.url
        }
      }
    } catch (err) {
      setError({ message: err.message })
    }

    setIsSubmitting(false)
  }
}
