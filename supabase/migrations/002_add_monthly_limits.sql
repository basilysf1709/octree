-- Add monthly edit tracking columns to existing user_usage table
ALTER TABLE public.user_usage 
ADD COLUMN IF NOT EXISTS monthly_edit_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_reset_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month')::date;

-- Update existing function to handle monthly limits
CREATE OR REPLACE FUNCTION public.increment_edit_count(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_edit_count INTEGER;
  current_monthly_count INTEGER;
  monthly_reset_date DATE;
  is_pro_user BOOLEAN;
  max_free_edits INTEGER := 5;
  max_monthly_edits INTEGER := 50;
BEGIN
  -- Get current usage
  SELECT edit_count, monthly_edit_count, monthly_reset_date, is_pro 
  INTO current_edit_count, current_monthly_count, monthly_reset_date, is_pro_user
  FROM public.user_usage
  WHERE user_id = p_user_id;
  
  -- Check if monthly reset is needed
  IF CURRENT_DATE >= monthly_reset_date THEN
    UPDATE public.user_usage
    SET 
      monthly_edit_count = 0,
      monthly_reset_date = (CURRENT_DATE + INTERVAL '1 month')::date,
      updated_at = now()
    WHERE user_id = p_user_id;
    
    current_monthly_count := 0;
  END IF;
  
  -- If user is pro, check monthly limit
  IF is_pro_user THEN
    IF current_monthly_count >= max_monthly_edits THEN
      RETURN FALSE; -- Monthly limit reached
    END IF;
  ELSE
    -- Free user: check daily limit
    IF current_edit_count >= max_free_edits THEN
      RETURN FALSE; -- Daily limit reached
    END IF;
  END IF;
  
  -- Increment both counts
  UPDATE public.user_usage
  SET 
    edit_count = edit_count + 1,
    monthly_edit_count = monthly_edit_count + 1,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update subscription status function to handle monthly resets
CREATE OR REPLACE FUNCTION public.update_user_subscription_status(
  p_user_id UUID,
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT,
  p_subscription_status TEXT,
  p_current_period_start TIMESTAMP WITH TIME ZONE,
  p_current_period_end TIMESTAMP WITH TIME ZONE,
  p_cancel_at_period_end BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_usage
  SET 
    stripe_customer_id = p_stripe_customer_id,
    stripe_subscription_id = p_stripe_subscription_id,
    subscription_status = p_subscription_status,
    current_period_start = p_current_period_start,
    current_period_end = p_current_period_end,
    cancel_at_period_end = p_cancel_at_period_end,
    is_pro = CASE 
      WHEN p_subscription_status IN ('active', 'trialing') THEN TRUE
      ELSE FALSE
    END,
    -- Reset monthly count when subscription becomes active
    monthly_edit_count = CASE 
      WHEN p_subscription_status IN ('active', 'trialing') THEN 0
      ELSE monthly_edit_count
    END,
    monthly_reset_date = CASE 
      WHEN p_subscription_status IN ('active', 'trialing') THEN (CURRENT_DATE + INTERVAL '1 month')::date
      ELSE monthly_reset_date
    END,
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 