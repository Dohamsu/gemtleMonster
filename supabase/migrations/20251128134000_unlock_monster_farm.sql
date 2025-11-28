-- Unlock monster_farm for all existing players
INSERT INTO player_facility (user_id, facility_id, current_level)
SELECT user_id, 'monster_farm', 1
FROM player_profile
WHERE NOT EXISTS (
    SELECT 1 FROM player_facility 
    WHERE user_id = player_profile.user_id AND facility_id = 'monster_farm'
);
