-- Add this function to handle resource deduction atomically
CREATE OR REPLACE FUNCTION deduct_resource(
    p_user_id UUID,
    p_resource_id TEXT,
    p_amount BIGINT
) RETURNS void AS $$
BEGIN
    UPDATE player_resource
    SET amount = amount - p_amount
    WHERE user_id = p_user_id AND resource_id = p_resource_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Resource not found';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
