# PIN Authentication Setup

Your expense tracker now uses PIN-based authentication to control access.

## How It Works

- **One PIN unlocks one or more user profiles**
- PIN for Lasya & Bharath: Opens dual-user view (can switch between them)
- PIN for Bhagavan: Opens single-user view (only his profile)

## Setting Up PINs

### Step 1: Start the Backend
```bash
cd backend
npm run dev
```

### Step 2: Run PIN Setup Script (in a new terminal)
```bash
cd backend
npm run setup-pins
```

You'll be prompted to enter:
1. **4-digit PIN for Lasya & Bharath group**
2. **4-digit PIN for Bhagavan**

The script will:
- Hash your PINs securely (never stored in plain text)
- Save them to the database
- Configure access permissions

### Step 3: Test Login
1. Open the app in your browser
2. Enter one of your PINs
3. Verify you see the correct user(s)

## Security Notes

- PINs are hashed using bcrypt (cannot be reversed)
- Tokens expire after 7 days
- All API requests require a valid token
- Users cannot access data outside their access group

## For Your Friend Bhagavan

Share this with him:
1. Open: [your-app-url]
2. Enter the PIN you gave him
3. He'll only see his own expense tracker
4. No access to Lasya & Bharath's data

## Changing PINs

Simply run `npm run setup-pins` again to reset all PINs.
