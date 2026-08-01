/**
 * Test script to reset tutor verification status
 * This will:
 * 1. Approve kraydlllc@gmail.com tutor
 * 2. Set all other tutors to pending
 * 
 * Run this after logging in as admin
 */

const testResetVerification = async () => {
  try {
    console.log('🔄 Resetting tutor verification status...\n');

    const response = await fetch('http://localhost:3000/api/admin/reset-tutor-verification', {
      method: 'POST',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ SUCCESS!\n');
      console.log('📊 Results:');
      console.log('─────────────────────────────────────');
      
      if (data.data.approvedTutor) {
        console.log(`✓ Approved tutor: ${data.data.approvedTutor.name}`);
        console.log(`  Email: ${data.data.approvedTutor.email}`);
        console.log(`  Verified: ${data.data.approvedTutor.isVerified}`);
      } else {
        console.log('⚠ kraydlllc@gmail.com tutor not found');
      }
      
      console.log(`\n📝 Tutors set to pending: ${data.data.tutorsSetToPending}`);
      console.log(`\n📈 Current Counts:`);
      console.log(`   Verified: ${data.data.currentCounts.verified}`);
      console.log(`   Pending: ${data.data.currentCounts.pending}`);
      console.log('─────────────────────────────────────\n');
    } else {
      console.error('❌ FAILED:', data.message || 'Unknown error');
      if (response.status === 403) {
        console.log('\n⚠ You must be logged in as an admin to run this script');
        console.log('   1. Go to http://localhost:3000/login');
        console.log('   2. Login with admin credentials');
        console.log('   3. Run this script again');
      }
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.log('\n⚠ Make sure the development server is running:');
    console.log('   npm run dev');
  }
};

// Run the test
testResetVerification();
