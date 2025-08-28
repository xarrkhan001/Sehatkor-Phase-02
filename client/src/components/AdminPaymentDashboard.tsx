import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';
import AdminPaymentRecords from './AdminPaymentRecords';
import AdminProviderPayments from './AdminProviderPayments';

const AdminPaymentDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeBookings: 0,
    completedBookings: 0,
    pendingReleases: 0,
    easyPaisaPercentage: 0,
    jazzCashPercentage: 0,
    avgProcessingTime: 0
  });
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics();
    fetchPendingReleases();
  }, []);

  const fetchAnalytics = async () => {
    try {
      console.log('🔍 Fetching payment analytics...');
      const token = localStorage.getItem('sehatkor_token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/payments/stats', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      console.log('📊 Analytics response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📈 Analytics data received:', data);
        setAnalytics(data.stats || data);
      } else {
        console.error('❌ Analytics fetch failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('💥 Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingReleases = async () => {
    try {
      console.log('⏳ Fetching pending release payments...');
      const token = localStorage.getItem('sehatkor_token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/payments/pending-release', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      console.log('📋 Pending releases response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📝 Pending releases data:', data);
        setPendingPayments(Array.isArray(data.payments) ? data.payments : Array.isArray(data) ? data : []);
      } else {
        console.error('❌ Pending releases fetch failed:', response.status, response.statusText);
        setPendingPayments([]);
      }
    } catch (error) {
      console.error('💥 Pending releases fetch error:', error);
      setPendingPayments([]);
    }
  };

  const handleReleasePayment = async (paymentId: string) => {
    try {
      console.log('💰 Releasing payment:', paymentId);
      const token = localStorage.getItem('sehatkor_token') || localStorage.getItem('token');
      const adminId = localStorage.getItem('userId') || 'admin-user';
      
      const response = await fetch(`http://localhost:4000/api/payments/${paymentId}/release`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          adminId: adminId,
          releaseNotes: 'Released from admin dashboard'
        })
      });

      console.log('💸 Payment release response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Payment released successfully:', data);
        fetchPendingReleases();
        fetchAnalytics();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Payment release failed:', response.status, errorData);
      }
    } catch (error) {
      console.error('💥 Payment release error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payment Management</h1>
      </div>

      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="providers">Provider Payments</TabsTrigger>
          <TabsTrigger value="records">Payment Records</TabsTrigger>
          <TabsTrigger value="pending">Pending Release</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="providers">
          <AdminProviderPayments />
        </TabsContent>

        <TabsContent value="records">
          <AdminPaymentRecords />
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Payments Pending Release ({Array.isArray(pendingPayments) ? pendingPayments.length : 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!Array.isArray(pendingPayments) || pendingPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <div>No payments pending release</div>
                  <div className="text-sm">All completed services have been paid out to providers</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(pendingPayments) && pendingPayments.map((payment: any) => (
                    <div key={payment._id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">{payment.serviceName}</div>
                        <div className="text-sm text-muted-foreground">
                          Provider: {payment.providerName} | Patient: {payment.patientName}
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          PKR {payment.price}
                        </div>
                      </div>
                      <button
                        onClick={() => handleReleasePayment(payment._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Release Payment
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        PKR {loading ? '...' : (analytics.totalRevenue || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        PKR {loading ? '...' : (analytics.monthlyRevenue || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">This Month</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {loading ? '...' : (analytics.activeBookings || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Bookings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {loading ? '...' : (analytics.pendingReleases || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Pending Releases</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Method Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-green-600" />
                        <span>EasyPaisa</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {loading ? '...' : `${analytics.easyPaisaPercentage || 0}%`}
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${analytics.easyPaisaPercentage || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-red-600" />
                        <span>JazzCash</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {loading ? '...' : `${analytics.jazzCashPercentage || 0}%`}
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${analytics.jazzCashPercentage || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Completed Services</span>
                      <span className="font-medium text-green-600">
                        {loading ? '...' : (analytics.completedBookings || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Services</span>
                      <span className="font-medium text-blue-600">
                        {loading ? '...' : (analytics.activeBookings || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Avg. Processing Time</span>
                      <span className="font-medium">
                        {loading ? '...' : `${analytics.avgProcessingTime || 0} days`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-sm">Payment system is operational</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm">Analytics updated successfully</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Just now</span>
                  </div>

                  {(analytics.totalRevenue || 0) > 0 && (
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span className="text-sm">Revenue tracking active</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Today</span>
                    </div>
                  )}

                  {Array.isArray(pendingPayments) && pendingPayments.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                        <span className="text-sm">{pendingPayments.length} payments awaiting release</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Pending</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPaymentDashboard;
