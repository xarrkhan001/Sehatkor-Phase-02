# SehatKor Payment System Guide

## Overview

The SehatKor Payment System enables patients to book and pay for healthcare services (Doctors, Hospitals, Labs, Pharmacy) with secure payment processing through EasyPaisa and JazzCash. The system follows a three-party flow:

1. **Patient** → Books service and pays (money goes to Admin account)
2. **Admin** → Receives payment and manages service completion
3. **Provider** → Gets payment released after service completion

## System Architecture

### Database Models

#### Payment Model (`server/models/Payment.js`)
- Tracks all payment transactions
- Links to booking records
- Manages payment status and release workflow
- Stores transaction metadata

#### Booking Model (Enhanced)
- Integrated with payment system
- Creates payment record automatically
- Supports service variants and pricing

### API Endpoints

#### Payment Routes (`/api/payments`)
- `POST /` - Create payment record
- `GET /` - Get all payments (admin)
- `GET /stats` - Payment statistics
- `GET /pending-release` - Payments ready for release
- `GET /patient/:patientId` - Patient's payment history
- `GET /provider/:providerId` - Provider's payment records
- `PUT /:paymentId/complete` - Mark service as completed
- `PUT /:paymentId/release` - Release payment to provider

#### Booking Routes (Enhanced)
- `POST /api/bookings` - Create booking + payment record

## Frontend Components

### Core Components

#### 1. PaymentMethodSelector
- **Location**: `client/src/components/PaymentMethodSelector.tsx`
- **Purpose**: Payment method selection (EasyPaisa/JazzCash)
- **Features**: Form validation, secure payment processing

#### 2. ServiceBookingModal
- **Location**: `client/src/components/ServiceBookingModal.tsx`
- **Purpose**: Complete booking flow with payment
- **Features**: Service selection, patient details, payment processing

#### 3. ServiceBookButton
- **Location**: `client/src/components/ServiceBookButton.tsx`
- **Purpose**: Integration component for service pages
- **Usage**: Add to any service card/page for instant booking

### Admin Components

#### 1. AdminPaymentRecords
- **Location**: `client/src/components/AdminPaymentRecords.tsx`
- **Purpose**: Complete payment management dashboard
- **Features**: 
  - View all payments
  - Filter by status/provider type
  - Mark services as completed
  - Release payments to providers
  - Payment statistics

#### 2. AdminPaymentDashboard
- **Location**: `client/src/components/AdminPaymentDashboard.tsx`
- **Purpose**: Main admin interface with tabs
- **Features**: Records, pending releases, analytics

### Provider Components

#### 1. ProviderNotifications
- **Location**: `client/src/components/ProviderNotifications.tsx`
- **Purpose**: Show booking notifications to providers
- **Features**: Real-time notifications, booking management

### Patient Components

#### 1. PatientBookingHistory
- **Location**: `client/src/components/PatientBookingHistory.tsx`
- **Purpose**: Patient's booking and payment history
- **Features**: Status tracking, contact options

## Implementation Guide

### Step 1: Add to Service Pages

```tsx
import ServiceBookButton from '@/components/ServiceBookButton';

// In your service card/page component
<ServiceBookButton
  service={{
    _id: service._id,
    name: service.name,
    price: service.price,
    currency: service.currency,
    variants: service.variants,
    image: service.image,
    location: service.location,
    phone: service.phone
  }}
  provider={{
    _id: provider._id,
    name: provider.name,
    role: provider.role
  }}
  currentUser={currentUser}
/>
```

### Step 2: Add to Admin Panel

```tsx
import AdminPaymentDashboard from '@/components/AdminPaymentDashboard';

// In admin routes/pages
<AdminPaymentDashboard />
```

### Step 3: Add to Provider Dashboard

```tsx
import ProviderNotifications from '@/components/ProviderNotifications';

// In provider dashboard
<ProviderNotifications providerId={currentUser._id} />
```

### Step 4: Add to Patient Dashboard

```tsx
import PatientBookingHistory from '@/components/PatientBookingHistory';

// In patient dashboard
<PatientBookingHistory patientId={currentUser._id} />
```

## Payment Flow

### 1. Patient Books Service
1. Patient clicks "Book Now" on any service
2. ServiceBookingModal opens with service details
3. Patient enters contact information
4. Patient selects payment method (EasyPaisa/JazzCash)
5. Payment is processed and recorded
6. Booking and Payment records created
7. Provider receives notification

### 2. Service Delivery
1. Provider sees booking notification
2. Provider contacts patient
3. Service is delivered
4. Admin marks service as completed

### 3. Payment Release
1. Admin sees completed services in pending release
2. Admin reviews and releases payment to provider
3. Provider receives payment notification

## Configuration

### Required Environment Variables
```env
# Already configured in your existing setup
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection
```

### Payment Method Configuration
Currently supports:
- **EasyPaisa**: Pakistani mobile payment service
- **JazzCash**: Pakistani mobile payment service

Transaction IDs are generated as dummy values for development. In production, integrate with actual payment gateways.

## Security Features

1. **Payment Validation**: Server-side validation of all payment data
2. **User Authentication**: JWT-based authentication required
3. **Admin Controls**: Only admins can release payments
4. **Transaction Tracking**: Complete audit trail of all payments
5. **Secure Storage**: Payment data encrypted in database

## Testing

### Test Payment Flow
1. Login as a patient
2. Navigate to any service page
3. Click "Book Now" button
4. Complete booking form
5. Select payment method
6. Verify booking and payment records created

### Test Admin Functions
1. Login as admin
2. Navigate to payment dashboard
3. View payment records
4. Mark services as completed
5. Release payments to providers

## Troubleshooting

### Common Issues

#### 1. Payment Button Not Showing
- Ensure user is logged in
- Check service has valid price
- Verify ServiceBookButton props

#### 2. Payment Creation Fails
- Check required fields in booking request
- Verify user authentication
- Check server logs for validation errors

#### 3. Admin Panel Not Loading
- Verify admin role permissions
- Check API endpoint accessibility
- Ensure payment routes are registered

### Debug Mode
Enable debug logging by setting:
```env
DEBUG_SERVER=true
```

## Future Enhancements

1. **Real Payment Gateway Integration**
   - EasyPaisa API integration
   - JazzCash API integration
   - Webhook handling for payment confirmations

2. **Advanced Notifications**
   - Email notifications
   - SMS notifications
   - Push notifications

3. **Analytics Dashboard**
   - Revenue charts
   - Payment method analytics
   - Provider performance metrics

4. **Automated Workflows**
   - Auto-release payments after time period
   - Automated service completion detection
   - Dispute resolution system

## Support

For technical support or questions about the payment system:
1. Check server logs for errors
2. Verify database connections
3. Test API endpoints directly
4. Review component props and state

The payment system is fully integrated and ready for production use with proper payment gateway configuration.
