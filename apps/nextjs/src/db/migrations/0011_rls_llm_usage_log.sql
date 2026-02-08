-- Enable RLS on llm_usage_log
-- Users can only view and insert their own usage records
-- No UPDATE or DELETE policies — table is append-only

ALTER TABLE llm_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
ON llm_usage_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
ON llm_usage_log FOR INSERT
WITH CHECK (auth.uid() = user_id);
