import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CartItem, PaymentMethod } from '../types';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { useRooms } from '../hooks/useRooms';
import CustomCalendar from './CustomCalendar';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
  onSuccess?: () => void;
}

interface BookingDetails {
  customerName: string;
  email: string;
  contactNumber: string;
  selectedDate: string;
  selectedEndDate?: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack, onSuccess }) => {
  const { paymentMethods } = usePaymentMethods();
  const { getBlockedDatesForRoom } = useRooms();
  
  // Check if this is a food order (not room booking)
  const isFoodOrder = cartItems.length > 0 && cartItems[0].category !== 'room-rates';
  
  // Skip calendar step for food orders, start with details
  const [step, setStep] = useState<'calendar' | 'details' | 'payment'>(isFoodOrder ? 'details' : 'calendar');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    customerName: '',
    email: '',
    contactNumber: '',
    selectedDate: isFoodOrder ? new Date().toISOString().split('T')[0] : '', // Set today's date for food orders
    selectedEndDate: '',
    paymentMethod: 'gcash',
    referenceNumber: ''
  });

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Set default payment method when payment methods are loaded
  React.useEffect(() => {
    if (paymentMethods.length > 0 && !bookingDetails.paymentMethod) {
      setBookingDetails(prev => ({
        ...prev,
        paymentMethod: paymentMethods[0].id as PaymentMethod
      }));
    }
  }, [paymentMethods, bookingDetails.paymentMethod]);

  const selectedPaymentMethod = paymentMethods.find(method => method.id === bookingDetails.paymentMethod);
  
  // Get blocked dates for the room being booked (if it's a room booking)
  const isRoomBooking = cartItems.length > 0 && cartItems[0].category === 'room-rates';
  const roomId = isRoomBooking ? cartItems[0].id : null;
  const blockedDates = roomId ? getBlockedDatesForRoom(roomId) : [];

  const handleProceedToDetails = () => {
    setStep('details');
  };

  const handleProceedToPayment = () => {
    setStep('payment');
  };

  const handlePlaceBooking = () => {
    const bookingDetailsText = `
🏕️ PINE WOODS CAMPSITE BOOKING

👤 Customer: ${bookingDetails.customerName}
📧 Email: ${bookingDetails.email}
📞 Contact: ${bookingDetails.contactNumber}
📅 Dates: ${new Date(bookingDetails.selectedDate).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}${bookingDetails.selectedEndDate ? ` to ${new Date(bookingDetails.selectedEndDate).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}` : ''}

📋 BOOKING DETAILS:
${cartItems.map(item => {
  let itemDetails = `• ${item.name}`;
  if (item.selectedVariation) {
    itemDetails += ` (${item.selectedVariation.name})`;
  }
  if (item.selectedAddOns && item.selectedAddOns.length > 0) {
    itemDetails += ` + ${item.selectedAddOns.map(addOn => 
      addOn.quantity && addOn.quantity > 1 
        ? `${addOn.name} x${addOn.quantity}`
        : addOn.name
    ).join(', ')}`;
  }
  itemDetails += ` x${item.quantity} - ₱${item.totalPrice * item.quantity}`;
  return itemDetails;
}).join('\n')}

💰 TOTAL: ₱${totalPriceWithDays}${numberOfDays > 1 ? ` (${numberOfDays} days × ₱${totalPrice})` : ''}

💳 Payment: ${selectedPaymentMethod?.name || bookingDetails.paymentMethod}
📸 Payment Screenshot: Please attach your payment receipt screenshot

Please confirm this booking to proceed. Thank you for choosing Pine Woods Campsite! 🏕️
    `.trim();

    const encodedMessage = encodeURIComponent(bookingDetailsText);
    const messengerUrl = `https://m.me/109895820635462?text=${encodedMessage}`;
    
    window.open(messengerUrl, '_blank');
    
    // Call success callback after opening messenger
    if (onSuccess) {
      setTimeout(() => {
        onSuccess();
      }, 1000);
    }
  };

  const isCalendarValid = isFoodOrder ? true : bookingDetails.selectedDate; // Skip date validation for food orders
  
  // Calculate number of days for pricing
  const calculateNumberOfDays = () => {
    if (!bookingDetails.selectedDate) return 1;
    if (!bookingDetails.selectedEndDate) return 1;
    
    const startDate = new Date(bookingDetails.selectedDate);
    const endDate = new Date(bookingDetails.selectedEndDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    
    return daysDiff;
  };
  
  const numberOfDays = calculateNumberOfDays();
  const totalPriceWithDays = totalPrice * numberOfDays;
  
  const isDetailsValid = bookingDetails.customerName && bookingDetails.email && bookingDetails.contactNumber;

  // Calendar Step
  if (step === 'calendar') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-pine-bark hover:text-pine-forest transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Menu</span>
          </button>
          <h1 className="text-3xl font-rustic font-semibold text-pine-forest ml-8">Select Date</h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-rustic font-medium text-pine-forest mb-6">Booking Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-pine-stone">
                  <div>
                    <h4 className="font-medium text-pine-forest">{item.name}</h4>
                    {item.selectedVariation && (
                      <p className="text-sm text-gray-600">Size: {item.selectedVariation.name}</p>
                    )}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Add-ons: {item.selectedAddOns.map(addOn => addOn.name).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">₱{item.totalPrice} x {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-black">₱{item.totalPrice * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-red-200 pt-4">
              {numberOfDays > 1 && (
                <div className="flex items-center justify-between text-sm text-pine-bark mb-2">
                  <span>Base Price:</span>
                  <span>₱{totalPrice}</span>
                </div>
              )}
              {numberOfDays > 1 && (
                <div className="flex items-center justify-between text-sm text-pine-bark mb-2">
                  <span>Number of Days:</span>
                  <span>{numberOfDays} day{numberOfDays !== 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-2xl font-noto font-semibold text-black">
                <span>Total:</span>
                <span>₱{totalPriceWithDays}</span>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-6">
            {/* Custom Calendar */}
            <div>
              <h2 className="text-2xl font-rustic font-medium text-pine-forest mb-4">Select Date</h2>
              <CustomCalendar
                selectedDate={bookingDetails.selectedDate}
                selectedEndDate={bookingDetails.selectedEndDate}
                onDateSelect={(startDate, endDate) => setBookingDetails(prev => ({ 
                  ...prev, 
                  selectedDate: startDate, 
                  selectedEndDate: endDate 
                }))}
                blockedDates={blockedDates}
              />
            </div>

            {/* Continue Button */}
            <button
              onClick={handleProceedToDetails}
              disabled={!isCalendarValid}
              className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 transform ${
                isCalendarValid
                  ? 'bg-pine-forest text-white hover:bg-pine-sage hover:scale-[1.02] shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue to Customer Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Customer Details Step
  if (step === 'details') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => setStep('calendar')}
            className="flex items-center space-x-2 text-pine-bark hover:text-pine-forest transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Date Selection</span>
          </button>
          <h1 className="text-3xl font-rustic font-semibold text-pine-forest ml-8">Customer Information</h1>
          <div className="ml-8 mt-2">
            <p className="text-pine-bark text-sm">👤 Please fill in your details below</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-rustic font-medium text-pine-forest mb-6">Booking Summary</h2>
            
            {/* Selected Date Range */}
            <div className="bg-pine-sand rounded-lg p-4 mb-6">
              <h4 className="font-medium text-pine-forest mb-2">Selected Dates</h4>
              {bookingDetails.selectedDate ? (
                <div className="text-sm text-pine-bark">
                  <p>
                    📅 Start: {new Date(bookingDetails.selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  {bookingDetails.selectedEndDate && (
                    <p>
                      📅 End: {new Date(bookingDetails.selectedEndDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                  {bookingDetails.selectedEndDate && (
                    <p className="text-xs text-pine-forest mt-1">
                      Duration: {Math.ceil((new Date(bookingDetails.selectedEndDate).getTime() - new Date(bookingDetails.selectedDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s)
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-pine-bark">No dates selected</p>
              )}
            </div>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-pine-stone">
                  <div>
                    <h4 className="font-medium text-pine-forest">{item.name}</h4>
                    {item.selectedVariation && (
                      <p className="text-sm text-gray-600">Size: {item.selectedVariation.name}</p>
                    )}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Add-ons: {item.selectedAddOns.map(addOn => addOn.name).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">₱{item.totalPrice} x {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-black">₱{item.totalPrice * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-red-200 pt-4">
              {numberOfDays > 1 && (
                <div className="flex items-center justify-between text-sm text-pine-bark mb-2">
                  <span>Base Price:</span>
                  <span>₱{totalPrice}</span>
                </div>
              )}
              {numberOfDays > 1 && (
                <div className="flex items-center justify-between text-sm text-pine-bark mb-2">
                  <span>Number of Days:</span>
                  <span>{numberOfDays} day{numberOfDays !== 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-2xl font-noto font-semibold text-black">
                <span>Total:</span>
                <span>₱{totalPriceWithDays}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-rustic font-medium text-pine-forest mb-6">Customer Information</h2>
            
            <form className="space-y-6">
              {/* Customer Information */}
              <div className="bg-pine-sand rounded-lg p-4 mb-4">
                <h3 className="text-lg font-rustic font-medium text-pine-forest mb-3">👤 Personal Information</h3>
                <div>
                  <label className="block text-sm font-medium text-pine-forest mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={bookingDetails.customerName}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-4 py-3 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-transparent transition-all duration-200 bg-white"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="bg-pine-sand rounded-lg p-4 mb-4">
                <h3 className="text-lg font-rustic font-medium text-pine-forest mb-3">📧 Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-pine-forest mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={bookingDetails.email}
                      onChange={(e) => setBookingDetails(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-pine-forest mb-2">Contact Number *</label>
                    <input
                      type="tel"
                      value={bookingDetails.contactNumber}
                      onChange={(e) => setBookingDetails(prev => ({ ...prev, contactNumber: e.target.value }))}
                      className="w-full px-4 py-3 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="09XX XXX XXXX"
                      required
                    />
                  </div>
                </div>
              </div>



              <button
                onClick={handleProceedToPayment}
                disabled={!isDetailsValid}
                className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 transform ${
                  isDetailsValid
                    ? 'bg-pine-forest text-white hover:bg-pine-sage hover:scale-[1.02]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Payment Step
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => setStep('details')}
          className="flex items-center space-x-2 text-pine-bark hover:text-pine-forest transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Customer Details</span>
        </button>
        <h1 className="text-3xl font-rustic font-semibold text-pine-forest ml-8">Payment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Method Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-rustic font-medium text-pine-forest mb-6">Choose Payment Method</h2>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setBookingDetails(prev => ({ ...prev, paymentMethod: method.id as PaymentMethod }))}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                  bookingDetails.paymentMethod === method.id
                    ? 'border-pine-forest bg-pine-forest text-white'
                    : 'border-pine-stone bg-white text-pine-bark hover:border-pine-forest'
                }`}
              >
                <span className="text-2xl">💳</span>
                <span className="font-medium">{method.name}</span>
              </button>
            ))}
          </div>

          {/* Payment Details with QR Code */}
          {selectedPaymentMethod && (
            <div className="bg-pine-sand rounded-lg p-6 mb-6">
              <h3 className="font-medium text-pine-forest mb-4">Payment Details</h3>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{selectedPaymentMethod.name}</p>
                  <p className="font-mono text-black font-medium">{selectedPaymentMethod.account_number}</p>
                  <p className="text-sm text-gray-600 mb-3">Account Name: {selectedPaymentMethod.account_name}</p>
                  <p className="text-xl font-semibold text-black">Amount: ₱{totalPrice}</p>
                </div>
                <div className="flex-shrink-0">
                  <img 
                    src={selectedPaymentMethod.qr_code_url} 
                    alt={`${selectedPaymentMethod.name} QR Code`}
                    className="w-32 h-32 rounded-lg border-2 border-red-300 shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
                    }}
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">Scan to pay</p>
                </div>
              </div>
            </div>
          )}

          {/* Reference Number */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-black mb-2">📸 Payment Proof Required</h4>
            <p className="text-sm text-gray-700">
              After making your payment, please take a screenshot of your payment receipt and attach it when you send your order via Messenger. This helps us verify and process your order quickly.
            </p>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-rustic font-medium text-pine-forest mb-6">Final Booking Summary</h2>
          
          <div className="space-y-4 mb-6">
            <div className="bg-pine-sand rounded-lg p-4">
              <h4 className="font-medium text-pine-forest mb-2">Customer Details</h4>
              <p className="text-sm text-pine-bark">Name: {bookingDetails.customerName}</p>
              <p className="text-sm text-pine-bark">Email: {bookingDetails.email}</p>
              <p className="text-sm text-pine-bark">Contact: {bookingDetails.contactNumber}</p>
              <p className="text-sm text-pine-bark">
                📅 Dates: {bookingDetails.selectedDate ? new Date(bookingDetails.selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Not selected'}{bookingDetails.selectedEndDate ? ` to ${new Date(bookingDetails.selectedEndDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}` : ''}
              </p>
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-red-100">
                <div>
                  <h4 className="font-medium text-black">{item.name}</h4>
                  {item.selectedVariation && (
                    <p className="text-sm text-gray-600">Size: {item.selectedVariation.name}</p>
                  )}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Add-ons: {item.selectedAddOns.map(addOn => 
                        addOn.quantity && addOn.quantity > 1 
                          ? `${addOn.name} x${addOn.quantity}`
                          : addOn.name
                      ).join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">₱{item.totalPrice} x {item.quantity}</p>
                </div>
                <span className="font-semibold text-black">₱{item.totalPrice * item.quantity}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-red-200 pt-4 mb-6">
            {numberOfDays > 1 && (
              <div className="flex items-center justify-between text-sm text-pine-bark mb-2">
                <span>Base Price:</span>
                <span>₱{totalPrice}</span>
              </div>
            )}
            {numberOfDays > 1 && (
              <div className="flex items-center justify-between text-sm text-pine-bark mb-2">
                <span>Number of Days:</span>
                <span>{numberOfDays} day{numberOfDays !== 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-2xl font-noto font-semibold text-black">
              <span>Total:</span>
              <span>₱{totalPriceWithDays}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceBooking}
            className="w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 transform bg-pine-forest text-white hover:bg-pine-sage hover:scale-[1.02]"
          >
            Confirm Booking via Messenger
          </button>
          
          <p className="text-xs text-pine-bark text-center mt-3">
            You'll be redirected to Facebook Messenger to confirm your booking. Don't forget to attach your payment screenshot!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;