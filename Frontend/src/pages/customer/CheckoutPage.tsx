import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Phone,
  CreditCard,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/hooks/useCart'
import { usePlaceOrderMutation } from '@/hooks/useOrders'
import { Button } from '@/components/ui/button'
import { useCustomerStore } from '@/stores/customerStore'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, cartSubtotal, deliveryFee, cartTotal, clearAll } = useCart()
  const placeOrderMutation = usePlaceOrderMutation()

  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'card'>(
    'telebirr',
  )

  const { selectedAddress: address, contactPhone: phone } = useCustomerStore()

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    if (!address.trim()) {
      toast.error('Please provide a delivery address')
      return
    }

    if (!phone.trim()) {
      toast.error('Please provide a contact phone number')
      return
    }

    const firstRestaurantId = items[0]?.menu_item?.restaurant_id

    if (!firstRestaurantId) {
      toast.error('Unable to determine the restaurant for this order')
      return
    }

    try {
      const order = await placeOrderMutation.mutateAsync({
        restaurant_id: firstRestaurantId,
        delivery_address: address,
        phone,
        cartItems: items,
        subtotal: cartSubtotal,
        delivery_fee: deliveryFee,
        total_amount: cartTotal,
        payment_method: paymentMethod,
      })

      toast.success('Order placed successfully!')

      await clearAll()

      navigate(`/orders/${order.id}`)
    } catch {
      toast.error(
        'Unable to place your order. Please check your information and try again.',
      )
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] pb-28">
      {/* Top Header */}
      <header className="px-6 pt-6 pb-4 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>

          <div>
            <h1 className="text-lg font-bold text-gray-800">Checkout</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Confirm order details
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="px-6 py-6 space-y-6 flex-1 overflow-y-auto">
        {/* Delivery Destination */}
        <div className="bg-white rounded-2xl p-5 border border-gray-50 space-y-3">
          <h3 className="font-extrabold text-gray-800 text-sm border-b border-gray-50 pb-2">
            Delivery Destination
          </h3>

          <div className="flex gap-3">
            <MapPin className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />

            <div>
              <p className="text-xs text-gray-800 font-bold leading-normal">
                {address}
              </p>

              <p className="text-[10px] text-gray-400 mt-0.5">
                Primary delivery address
              </p>
            </div>
          </div>
        </div>

        {/* Contact Phone */}
        <div className="bg-white rounded-2xl p-5 border border-gray-50 space-y-3">
          <h3 className="font-extrabold text-gray-800 text-sm border-b border-gray-50 pb-2">
            Contact Number
          </h3>

          <div className="flex gap-3">
            <Phone className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />

            <div>
              <p className="text-xs text-gray-800 font-bold leading-normal">
                {phone}
              </p>

              <p className="text-[10px] text-gray-400 mt-0.5">
                Used for delivery updates
              </p>
            </div>
          </div>
        </div>

        {/* Payment Method Option */}
        <div className="bg-white rounded-2xl p-5 border border-gray-50 space-y-3">
          <h3 className="font-extrabold text-gray-800 text-sm border-b border-gray-50 pb-2">
            Payment Method
          </h3>

          <div className="space-y-2.5">
            <button
              onClick={() => setPaymentMethod('telebirr')}
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                paymentMethod === 'telebirr'
                  ? 'border-orange-500 bg-orange-50/20'
                  : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">📱</span>

                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Telebirr Mobile Money
                  </p>

                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Pay instantly using Telebirr app
                  </p>
                </div>
              </div>

              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'telebirr'
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300'
                }`}
              >
                {paymentMethod === 'telebirr' && (
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                paymentMethod === 'card'
                  ? 'border-orange-500 bg-orange-50/20'
                  : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-blue-500" />

                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Credit / Debit Card
                  </p>

                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Visa, Mastercard or local cards
                  </p>
                </div>
              </div>

              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'card'
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300'
                }`}
              >
                {paymentMethod === 'card' && (
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Secure message badge */}
        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium px-2 justify-center">
          <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />

          <span>Transactions are secure and encrypted</span>
        </div>

        {/* Cost breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-gray-50 space-y-3">
          <h3 className="font-extrabold text-gray-800 text-sm border-b border-gray-50 pb-2">
            Cost Summary
          </h3>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Items Subtotal</span>
            <span className="font-semibold text-gray-800">
              ETB {cartSubtotal}
            </span>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Delivery Fee</span>
            <span className="font-semibold text-gray-800">
              ETB {deliveryFee}
            </span>
          </div>

          <div className="flex justify-between text-sm font-black text-gray-800 border-t border-gray-50 pt-3">
            <span>Total to Pay</span>

            <span className="text-orange-600 text-base">
              ETB {cartTotal}
            </span>
          </div>
        </div>
      </div>

      {/* Footer sticky place order trigger */}
      <div className="fixed bottom-16 left-0 right-0 p-6 bg-white border-t border-gray-100 z-40 max-w-md mx-auto shadow-md">
        <Button
          onClick={handlePlaceOrder}
          disabled={placeOrderMutation.isPending}
          className="w-full py-6 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm"
        >
          {placeOrderMutation.isPending
            ? 'Placing Order...'
            : `Pay & Place Order • ETB ${cartTotal}`}
        </Button>
      </div>
    </div>
  )
}