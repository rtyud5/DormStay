-- =========================================================
-- Room Status Update Logic based on Bed Availability
-- When a room has beds (PHONG_CHUNG):
--   - Mark as DAY (full) only when all beds are rented (DA_THUE or DANG_GIU)
-- When a room has no beds (whole room rental):
--   - Mark as DAY when someone rents the whole room
-- =========================================================

-- Function to check and update room status based on bed availability
CREATE OR REPLACE FUNCTION public.update_room_status_by_beds(
  p_ma_phong bigint
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_record RECORD;
  v_total_beds integer;
  v_rented_beds integer;
  v_is_dorm boolean;
  v_new_status varchar;
  v_result jsonb;
BEGIN
  -- Get room info
  SELECT 
    ma_phong, 
    loai_phong,
    (loai_phong = 'PHONG_CHUNG') as is_dorm,
    trang_thai
  INTO v_room_record
  FROM public.phong
  WHERE ma_phong = p_ma_phong;

  IF v_room_record.ma_phong IS NULL THEN
    RAISE EXCEPTION 'Room % not found', p_ma_phong;
  END IF;

  v_is_dorm := v_room_record.is_dorm;

  -- Count beds in this room
  SELECT COUNT(*) INTO v_total_beds
  FROM public.giuong
  WHERE ma_phong = p_ma_phong;

  -- If room has no beds (whole room rental)
  IF v_total_beds = 0 THEN
    -- Don't change status automatically - whole room rental status
    -- will be managed by contract logic
    RETURN to_jsonb(v_room_record);
  END IF;

  -- If room is PHONG_CHUNG (has beds), check how many are rented
  IF v_is_dorm THEN
    -- Count rented/held beds (DA_THUE or DANG_GIU status)
    SELECT COUNT(*) INTO v_rented_beds
    FROM public.giuong
    WHERE ma_phong = p_ma_phong
      AND trang_thai IN ('DA_THUE', 'DANG_GIU');

    -- Determine new status
    IF v_rented_beds >= v_total_beds THEN
      -- All beds are rented/held - mark room as DAY (full)
      v_new_status := 'DAY';
    ELSIF v_rented_beds > 0 THEN
      -- Some beds are rented - mark as SAP_DAY (almost full)
      v_new_status := 'SAP_DAY';
    ELSE
      -- No beds are rented - mark as TRONG (available)
      v_new_status := 'TRONG';
    END IF;

    -- Update room status if changed
    IF v_new_status != v_room_record.trang_thai THEN
      UPDATE public.phong
      SET trang_thai = v_new_status,
          updated_at = NOW()
      WHERE ma_phong = p_ma_phong;
    END IF;
  END IF;

  -- Return updated room info
  SELECT to_jsonb(p.*) INTO v_result
  FROM public.phong p
  WHERE p.ma_phong = p_ma_phong;

  RETURN v_result;
END;
$$;

-- Trigger on giuong table to auto-update room status when bed status changes
CREATE OR REPLACE FUNCTION public.trigger_update_room_status_on_bed_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Update room status based on bed availability
  SELECT public.update_room_status_by_beds(NEW.ma_phong)
  INTO v_result;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trg_bed_status_update_room_status ON public.giuong;

-- Create trigger
CREATE TRIGGER trg_bed_status_update_room_status
AFTER UPDATE ON public.giuong
FOR EACH ROW
WHEN (OLD.trang_thai IS DISTINCT FROM NEW.trang_thai)
EXECUTE FUNCTION public.trigger_update_room_status_on_bed_change();

COMMIT;
