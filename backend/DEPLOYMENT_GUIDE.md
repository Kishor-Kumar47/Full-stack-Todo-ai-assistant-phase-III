# Hugging Face Spaces Deployment Guide

## Step-by-Step Deployment Instructions

### Step 1: Create a Hugging Face Account
1. Go to https://huggingface.co/
2. Sign up or log in to your account

### Step 2: Create a New Space
1. Click on your profile → "New Space"
2. Fill in the details:
   - **Space name**: `todo-ai-assistant-api` (or your preferred name)
   - **License**: MIT
   - **Select SDK**: Docker
   - **Space hardware**: CPU basic (free tier)
3. Click "Create Space"

### Step 3: Files and Folders to Upload

Upload these files and folders from the `backend` directory:

#### Required Files (Root Level):
- `Dockerfile` ✅
- `README.md` ✅
- `requirements.txt` ✅
- `alembic.ini` ✅
- `.dockerignore` ✅

#### Required Folders:
- `src/` (entire folder with all subfolders)
  - `src/api/`
  - `src/models/`
  - `src/services/`
  - `src/middleware/`
  - `src/database.py`
  - `src/main.py`

- `alembic/` (entire folder)
  - `alembic/env.py`
  - `alembic/script.py.mako`
  - `alembic/versions/`

#### DO NOT Upload:
- `venv/` or `env/` folders
- `.env` file (use Hugging Face secrets instead)
- `__pycache__/` folders
- `.git/` folder
- `*.pyc` files

### Step 4: Set Environment Variables (Secrets)

In your Hugging Face Space settings:

1. Go to "Settings" tab
2. Scroll to "Repository secrets"
3. Add these secrets:

```
DATABASE_URL=postgresql://username:password@host:port/database
SECRET_KEY=your-secret-key-minimum-32-characters-long
AI_API_KEY=sk-ant-api03-your-anthropic-api-key
```

**Important Notes:**
- Use your Neon PostgreSQL connection string for `DATABASE_URL`
- Generate a strong `SECRET_KEY` (at least 32 characters)
- Get `AI_API_KEY` from https://console.anthropic.com/

### Step 5: Upload Files

**Option A: Using Git (Recommended)**
```bash
# Clone your Hugging Face Space repository
git clone https://huggingface.co/spaces/YOUR_USERNAME/todo-ai-assistant-api
cd todo-ai-assistant-api

# Copy backend files
cp -r /path/to/backend/* .

# Remove unnecessary files
rm -rf venv/ __pycache__/ .env

# Commit and push
git add .
git commit -m "Initial deployment"
git push
```

**Option B: Using Web Interface**
1. Click "Files" tab in your Space
2. Click "Add file" → "Upload files"
3. Drag and drop the required files and folders
4. Click "Commit changes to main"

### Step 6: Monitor Deployment

1. Go to "App" tab to see your Space building
2. Check "Logs" tab for any errors
3. Wait for build to complete (5-10 minutes)
4. Your API will be available at: `https://YOUR_USERNAME-todo-ai-assistant-api.hf.space`

### Step 7: Test Your Deployment

Once deployed, test these endpoints:

```bash
# Health check
curl https://YOUR_USERNAME-todo-ai-assistant-api.hf.space/

# API documentation
https://YOUR_USERNAME-todo-ai-assistant-api.hf.space/docs

# Register a user
curl -X POST https://YOUR_USERNAME-todo-ai-assistant-api.hf.space/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"test123","first_name":"Test","last_name":"User"}'
```

### Step 8: Update Frontend

Update your frontend `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://YOUR_USERNAME-todo-ai-assistant-api.hf.space
```

## Troubleshooting

### Build Fails
- Check "Logs" tab for error messages
- Verify all required files are uploaded
- Ensure Dockerfile syntax is correct

### Database Connection Error
- Verify `DATABASE_URL` is set correctly in secrets
- Check if your Neon database allows external connections
- Ensure database exists and migrations ran

### AI Queries Fail
- Verify `AI_API_KEY` is set in secrets
- Check Anthropic API key is valid
- Ensure you have API credits

### Port Issues
- Hugging Face Spaces requires port 7860
- Dockerfile already configured correctly

## File Structure Summary

```
backend/
├── Dockerfile              ← Upload ✅
├── README.md              ← Upload ✅
├── requirements.txt       ← Upload ✅
├── alembic.ini           ← Upload ✅
├── .dockerignore         ← Upload ✅
├── src/                  ← Upload entire folder ✅
│   ├── api/
│   ├── models/
│   ├── services/
│   ├── middleware/
│   ├── database.py
│   └── main.py
└── alembic/              ← Upload entire folder ✅
    ├── env.py
    ├── script.py.mako
    └── versions/
```

## Additional Notes

- Free tier has limited resources (CPU basic)
- Space will sleep after inactivity (cold start on first request)
- For production, consider upgrading to paid tier
- Enable "Always on" in Space settings for better performance

## Support

If you encounter issues:
1. Check Hugging Face Spaces documentation
2. Review deployment logs
3. Verify all environment variables are set
4. Test database connection separately
