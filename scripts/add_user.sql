-- Check if user exists, if not, insert them
DO $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    SELECT EXISTS (SELECT 1 FROM users WHERE netid = :'netid') INTO user_exists;
    
    IF NOT user_exists THEN
        INSERT INTO users (netid) VALUES (:'netid');
        RAISE NOTICE 'User created: %', :'netid';
    ELSE
        RAISE NOTICE 'User already exists: %', :'netid';
    END IF;
    
    -- Show the user's info either way
    RAISE NOTICE 'User info:';
    RAISE NOTICE '%', (SELECT row_to_json(u) FROM users u WHERE netid = :'netid');
END $$; 