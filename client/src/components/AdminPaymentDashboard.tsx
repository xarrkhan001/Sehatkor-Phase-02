import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';
import AdminPaymentRecords from './AdminPaymentRecords';

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
      const token = localStorage.getItem('sehatkor_token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/payments/statistics', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingReleases = async () => {
    try {
      const token = localStorage.getItem('sehatkor_token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/payments/pending-release', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingPayments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch pending releases:', error);
      setPendingPayments([]);
    }
  };

  const handleReleasePayment = async (paymentId: string) => {
    try {
      const token = localStorage.getItem('sehatkor_token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/payments/${paymentId}/release`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (response.ok) {
        fetchPendingReleases();
        fetchAnalytics();
      }
    } catch (error) {
      console.error('Failed to release payment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payment Management</h1>
      </div>

      <Tabs defaultValue="records" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="records">Payment Records</TabsTrigger>
          <TabsTrigger value="pending">Pending Release</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

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
                        PKR {loading ? '...' : analytics.totalRevenue.toLocaleString()}
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
                        PKR {loading ? '...' : analytics.monthlyRevenue.toLocaleString()}
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
                        {loading ? '...' : analytics.activeBookings}
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
                        {loading ? '...' : analytics.pendingReleases}
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
                          {loading ? '...' : `${analytics.easyPaisaPercentage}%`}
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${analytics.easyPaisaPercentage}%` }}
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
                          {loading ? '...' : `${analytics.jazzCashPercentage}%`}
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${analytics.jazzCashPercentage}%` }}
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
                        {loading ? '...' : analytics.completedBookings}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Services</span>
                      <span className="font-medium text-blue-600">
                        {loading ? '...' : analytics.activeBookings}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Avg. Processing Time</span>
                      <span className="font-medium">
                        {loading ? '...' : `${analytics.avgProcessingTime} days`}
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

                  {analytics.totalRevenue > 0 && (
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
