import { ICheckoutProps, ICheckoutActionProps } from 'src/types'
import { Stripe } from '@stripe/stripe-js'
import { createSession, prepareCheckoutData } from 'src/request'

export default (props: ICheckoutActionProps) => {
  const {
    api_key,
    success_url,
    cancel_url,
    return_url,
    metadata,
    isSubmitting,
    customer,
    setIsSubmitting,
    setError,
  } = props

  /**
   * Should allow for optional override of checkout input props here
   */
  return async ({ prices }: ICheckoutProps, stripe: Stripe) => {
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
      customer,
      prices,
      success_url,
      cancel_url,
      return_url,
      metadata,
    })

    setIsSubmitting(true)
    try {
      const response = await createSession(api_key, checkoutData)

      stripe.redirectToCheckout({
        sessionId: response.id,
      })
    } catch (err) {
      setError({ message: err.message })
    }
    setIsSubmitting(false)
  }
}
