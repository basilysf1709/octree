import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // First, ensure user has a usage record
    const { data: initialUsageData, error: usageError } = await supabase
      .from('user_usage')
      .select('edit_count, monthly_edit_count, monthly_reset_date, is_pro, subscription_status')
      .eq('user_id', user.id)
      .single();

    let usageData = initialUsageData;

    // If no usage record exists, create one
    if (usageError && usageError.code === 'PGRST116') {
      console.log('Creating new user_usage record for user:', user.id);
      
      const { data: newUsageData, error: createError } = await supabase
        .from('user_usage')
        .insert({
          user_id: user.id,
          edit_count: 0,
          monthly_edit_count: 0,
          monthly_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          is_pro: false,
          subscription_status: 'inactive'
        })
        .select('edit_count, monthly_edit_count, monthly_reset_date, is_pro, subscription_status')
        .single();
      
      if (createError) {
        console.error('Error creating user_usage record:', createError);
        return NextResponse.json(
          { error: 'Failed to create usage record' },
          { status: 500 }
        );
      }
      
      usageData = newUsageData;
    } else if (usageError) {
      console.error('Error fetching usage data:', usageError);
      return NextResponse.json(
        { error: 'Failed to fetch usage data' },
        { status: 500 }
      );
    }

    // Check if monthly reset is needed
    if (usageData && usageData.monthly_reset_date) {
      const resetDate = new Date(usageData.monthly_reset_date);
      const currentDate = new Date();
      
      if (currentDate >= resetDate) {
        // Reset monthly count
        const { error: resetError } = await supabase
          .from('user_usage')
          .update({
            monthly_edit_count: 0,
            monthly_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          })
          .eq('user_id', user.id);
        
        if (!resetError) {
          usageData.monthly_edit_count = 0;
        }
      }
    }

    // Call the database function to increment edit count and check limits
    const { data, error } = await supabase.rpc('increment_edit_count', {
      p_user_id: user.id
    });

    if (error) {
      console.error('Error incrementing edit count:', error);
      return NextResponse.json(
        { error: 'Failed to track edit' },
        { status: 500 }
      );
    }

    // Get updated usage info
    const { data: updatedUsageData, error: updatedUsageError } = await supabase
      .from('user_usage')
      .select('edit_count, monthly_edit_count, monthly_reset_date, is_pro, subscription_status')
      .eq('user_id', user.id)
      .single();

    if (updatedUsageError) {
      console.error('Error fetching updated usage data:', updatedUsageError);
      return NextResponse.json(
        { error: 'Failed to fetch updated usage data' },
        { status: 500 }
      );
    }

    const canEdit = data as boolean;
    const remainingEdits = Math.max(0, 5 - updatedUsageData.edit_count);
    const remainingMonthlyEdits = Math.max(0, 50 - updatedUsageData.monthly_edit_count);

    return NextResponse.json({
      success: true,
      canEdit,
      remainingEdits,
      remainingMonthlyEdits,
      editCount: updatedUsageData.edit_count,
      monthlyEditCount: updatedUsageData.monthly_edit_count,
      isPro: updatedUsageData.is_pro,
      subscriptionStatus: updatedUsageData.subscription_status,
      limitReached: !canEdit,
      monthlyLimitReached: updatedUsageData.is_pro && updatedUsageData.monthly_edit_count >= 50,
      monthlyResetDate: updatedUsageData.monthly_reset_date
    });

  } catch (error) {
    console.error('Error tracking edit:', error);
    return NextResponse.json(
      { error: 'Failed to track edit' },
      { status: 500 }
    );
  }
} 