-- RLS policies for thesis table
CREATE POLICY "Users can view own thesis" ON public.thesis
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own thesis" ON public.thesis
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own thesis" ON public.thesis
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own thesis" ON public.thesis
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for thesis_chapters table
CREATE POLICY "Users can view own thesis chapters" ON public.thesis_chapters
  FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM public.thesis WHERE id = thesis_id));

CREATE POLICY "Users can insert own thesis chapters" ON public.thesis_chapters
  FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.thesis WHERE id = thesis_id));

CREATE POLICY "Users can update own thesis chapters" ON public.thesis_chapters
  FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM public.thesis WHERE id = thesis_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.thesis WHERE id = thesis_id));

CREATE POLICY "Users can delete own thesis chapters" ON public.thesis_chapters
  FOR DELETE
  USING (auth.uid() = (SELECT user_id FROM public.thesis WHERE id = thesis_id));

-- RLS policies for thesis_references table
CREATE POLICY "Users can view own thesis references" ON public.thesis_references
  FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM public.thesis WHERE id = thesis_id));

CREATE POLICY "Users can insert own thesis references" ON public.thesis_references
  FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.thesis WHERE id = thesis_id));

CREATE POLICY "Users can update own thesis references" ON public.thesis_references
  FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM public.thesis WHERE id = thesis_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.thesis WHERE id = thesis_id));

CREATE POLICY "Users can delete own thesis references" ON public.thesis_references
  FOR DELETE
  USING (auth.uid() = (SELECT user_id FROM public.thesis WHERE id = thesis_id));
