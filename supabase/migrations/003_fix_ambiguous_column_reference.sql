-- Fix ambiguous column reference in increment_edit_count function
CREATE OR REPLACE FUNCTION public.increment_edit_count(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_edit_count INTEGER;
  current_monthly_count INTEGER;
  user_monthly_reset_date DATE;
  is_pro_user BOOLEAN;
  max_free_edits INTEGER := 5;
  max_monthly_edits INTEGER := 50;
BEGIN
  -- Get current usage
  SELECT edit_count, monthly_edit_count, monthly_reset_date, is_pro 
  INTO current_edit_count, current_monthly_count, user_monthly_reset_date, is_pro_user
  FROM public.user_usage
  WHERE user_id = p_user_id;
  
  -- Check if monthly reset is needed
  IF CURRENT_DATE >= user_monthly_reset_date THEN
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