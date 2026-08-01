import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { User, Session } from '@/models';
import Stripe from 'stripe';

// Only initialize Stripe if we have a real key
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey && !stripeKey.includes('placeholder')
  ? new Stripe(stripeKey, { apiVersion: '2025-12-15.clover' as any })
  : null;

// GET /api/admin/stats - Get comprehensive admin statistics
export async function GET() {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all users
    const allUsers = await User.find({}).select('role isVerified createdAt subscriptionStatus').lean();
    
    const totalUsers = allUsers.length;
    const studentCount = allUsers.filter(u => u.role === 'student').length;
    const parentCount = allUsers.filter(u => u.role === 'parent').length;
    const tutorCount = allUsers.filter(u => u.role === 'tutor').length;
    const verifiedTutors = allUsers.filter(u => u.role === 'tutor' && u.isVerified).length;
    const pendingTutors = allUsers.filter(u => u.role === 'tutor' && !u.isVerified).length;
    const activeSubscribers = allUsers.filter(u => u.subscriptionStatus === 'active').length;

    // Fetch all sessions
    const allSessions = await Session.find({})
      .populate('tutor', 'name hourlyRate')
      .populate('student', 'name')
      .select('status scheduledAt duration tutor student paymentStatus createdAt');
    
    const totalBookings = allSessions.length;
    const completedSessions = allSessions.filter(s => s.status === 'completed').length;
    const scheduledSessions = allSessions.filter(s => s.status === 'scheduled').length;
    const cancelledSessions = allSessions.filter(s => s.status === 'cancelled').length;

    // Calculate monthly data
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const thisMonthSessions = allSessions.filter(s => {
      const sessionDate = new Date(s.scheduledAt);
      return sessionDate >= monthStart && sessionDate <= monthEnd;
    });
    
    const thisMonthBookings = thisMonthSessions.length;
    const thisMonthCompleted = thisMonthSessions.filter(s => s.status === 'completed').length;

    // Fetch payment data from Stripe
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let totalPayments = 0;
    let monthlyPayments = 0;

    try {
      const stripeClient = stripe;
      if (!stripeClient) throw new Error('Stripe not configured');

      // Get all charges (limited to last 100 for performance)
      const charges = await stripeClient.charges.list({
        limit: 100
      });

      totalPayments = charges.data.length;
      
      charges.data.forEach(charge => {
        if (charge.status === 'succeeded') {
          const amount = charge.amount / 100; // Convert from pence to pounds
          totalRevenue += amount;
          
          // Check if payment is from this month
          const chargeDate = new Date(charge.created * 1000);
          if (chargeDate >= monthStart && chargeDate <= monthEnd) {
            monthlyRevenue += amount;
            monthlyPayments++;
          }
        }
      });

      // Add subscription revenue
      const subscriptions = await stripeClient.subscriptions.list({
        status: 'active',
        limit: 100
      });

      subscriptions.data.forEach(sub => {
        const amount = (sub.items.data[0]?.price.unit_amount || 0) / 100;
        // Check if subscription started this month
        const subStart = new Date(sub.created * 1000);
        if (subStart >= monthStart && subStart <= monthEnd) {
          monthlyRevenue += amount;
        }
      });

    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      // Continue with estimated revenue from sessions
      const completedSessions = allSessions.filter(s => s.status === 'completed');
      totalRevenue = completedSessions.reduce((sum, s) => {
        const tutorData = s.tutor as { hourlyRate?: number };
        const rate = tutorData?.hourlyRate || 35;
        const hours = (s.duration || 60) / 60;
        return sum + (rate * hours);
      }, 0);
      
      const monthCompletedSessions = thisMonthSessions.filter(s => s.status === 'completed');
      monthlyRevenue = monthCompletedSessions.reduce((sum, s) => {
        const tutorData = s.tutor as { hourlyRate?: number };
        const rate = tutorData?.hourlyRate || 35;
        const hours = (s.duration || 60) / 60;
        return sum + (rate * hours);
      }, 0);
    }

    // Get recent bookings
    const recentBookings = allSessions
      .sort((a, b) => {
        const aDoc = a as { createdAt: Date };
        const bDoc = b as { createdAt: Date };
        return new Date(bDoc.createdAt).getTime() - new Date(aDoc.createdAt).getTime();
      })
      .slice(0, 10)
      .map(s => {
        const studentData = s.student as { name?: string };
        const tutorData = s.tutor as { name?: string; hourlyRate?: number };
        return {
          id: s._id,
          student: studentData?.name || 'Unknown',
          tutor: tutorData?.name || 'Unknown',
          scheduledAt: s.scheduledAt,
          status: s.status,
          duration: s.duration,
          amount: Math.round((tutorData?.hourlyRate || 35) * ((s.duration || 60) / 60)),
          paymentStatus: s.paymentStatus || 'pending'
        };
      });

    // Get pending tutor applications
    const pendingTutorsList = await User.find({ 
      role: 'tutor', 
      isVerified: false 
    })
      .select('name email subjects hourlyRate createdAt')
      .limit(10)
      .sort({ createdAt: -1 })
      .lean();

    // Calculate growth rates (compare to last month)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastMonthUsers = allUsers.filter((u: any) => {
      const userDate = new Date(u.createdAt);
      return userDate >= lastMonthStart && userDate <= lastMonthEnd;
    }).length;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thisMonthUsers = allUsers.filter((u: any) => {
      const userDate = new Date(u.createdAt);
      return userDate >= monthStart && userDate <= monthEnd;
    }).length;
    
    const userGrowth = lastMonthUsers > 0 
      ? Math.round(((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      stats: {
        // User stats
        totalUsers,
        studentCount,
        parentCount,
        tutorCount,
        verifiedTutors,
        pendingTutors,
        activeSubscribers,
        thisMonthUsers,
        userGrowth,
        
        // Booking stats
        totalBookings,
        completedSessions,
        scheduledSessions,
        cancelledSessions,
        thisMonthBookings,
        thisMonthCompleted,
        
        // Revenue stats
        totalRevenue: Math.round(totalRevenue),
        monthlyRevenue: Math.round(monthlyRevenue),
        totalPayments,
        monthlyPayments,
        
        // Averages
        avgBookingValue: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0,
        completionRate: totalBookings > 0 ? Math.round((completedSessions / totalBookings) * 100) : 0
      },
      recentBookings,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pendingTutors: pendingTutorsList.map((t: any) => ({
        id: t._id,
        name: t.name,
        email: t.email,
        subjects: t.subjects,
        hourlyRate: t.hourlyRate,
        appliedAt: t.createdAt
      }))
    });

  } catch (error: unknown) {
    console.error('Error fetching admin stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch admin statistics';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
