-- Enable uuid-ossp extension for uuid_generate_v4() function
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_usage table to track edit counts and subscription status
CREATE TABLE IF NOT EXISTS public.user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  edit_count INTEGER NOT NULL DEFAULT 0,
  monthly_edit_count INTEGER NOT NULL DEFAULT 0,
  monthly_reset_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month')::date,
  is_pro BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own usage"
  ON public.user_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON public.user_usage FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON public.user_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create user_usage record for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_usage (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user_usage record
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update user_usage when subscription changes
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

-- Create function to increment edit count with monthly limits
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