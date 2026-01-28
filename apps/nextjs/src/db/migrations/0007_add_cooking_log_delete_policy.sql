-- Add missing DELETE policy for cooking_log table
-- This allows users to delete their own cooking history entries

CREATE POLICY "Users can delete their own cooking log"
ON cooking_log FOR DELETE
USING (auth.uid() = user_id);
