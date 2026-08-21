-- Supabase Migration: 20260821000000_voting_rpc.sql
-- Atomic Concurrency-Safe Feedback Voting RPC Function with Security Definer, search_path, and service_role restriction

CREATE OR REPLACE FUNCTION public.vote_feedback(
  p_feedback_id UUID,
  p_voter_key TEXT,
  p_action TEXT DEFAULT 'toggle'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_has_voted BOOLEAN;
  v_new_count INTEGER;
  v_result_voted BOOLEAN;
  v_feedback RECORD;
BEGIN
  -- 1. Lock the feedback row for update to serialize concurrent votes on the same feedback item
  SELECT * INTO v_feedback
  FROM public.feedback
  WHERE id = p_feedback_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Feedback item not found'
    );
  END IF;

  -- 2. Check if vote already exists for this voter_key
  SELECT EXISTS (
    SELECT 1 FROM public.feedback_votes
    WHERE feedback_id = p_feedback_id AND voter_key = p_voter_key
  ) INTO v_has_voted;

  -- 3. Apply action atomically
  IF p_action = 'downvote' OR (p_action = 'toggle' AND v_has_voted) THEN
    IF v_has_voted THEN
      DELETE FROM public.feedback_votes
      WHERE feedback_id = p_feedback_id AND voter_key = p_voter_key;
    END IF;
    v_result_voted := FALSE;
  ELSE
    -- Upvote requested
    IF NOT v_has_voted THEN
      BEGIN
        INSERT INTO public.feedback_votes (feedback_id, voter_key, vote_type, created_at)
        VALUES (p_feedback_id, p_voter_key, 'upvote', NOW());
      EXCEPTION WHEN unique_violation THEN
        -- Handle concurrent insert safely via UNIQUE constraint
        NULL;
      END;
    END IF;
    v_result_voted := TRUE;
  END IF;

  -- 4. Calculate exact total vote count from feedback_votes table
  SELECT COUNT(*)::INTEGER INTO v_new_count
  FROM public.feedback_votes
  WHERE feedback_id = p_feedback_id;

  -- 5. Update feedback table upvotes count
  UPDATE public.feedback
  SET upvotes = v_new_count, updated_at = NOW()
  WHERE id = p_feedback_id;

  -- 6. Return response matching expected shape
  RETURN jsonb_build_object(
    'success', true,
    'upvotes', v_new_count,
    'voted', v_result_voted,
    'message', 'Vote processed successfully'
  );
END;
$$;

-- Restrict RPC execution: revoke from public/anon/authenticated and grant only to service_role
REVOKE EXECUTE ON FUNCTION public.vote_feedback(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.vote_feedback(UUID, TEXT, TEXT) TO service_role;
