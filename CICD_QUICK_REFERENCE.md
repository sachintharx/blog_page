# CI/CD Quick Reference Guide

## 📋 Quick Setup (5 Minutes)

### 1. Configure GitHub Secrets (One-time setup)

Go to: **GitHub Repo → Settings → Secrets → Actions → New secret**

Add these 3 secrets:

```yaml
Name: EC2_HOST
Value: 54.123.45.67  # Your EC2 public IP

Name: EC2_USER  
Value: ubuntu

Name: EC2_SSH_KEY
Value: -----BEGIN RSA PRIVATE KEY-----
       [paste entire content of key_pair.pem]
       -----END RSA PRIVATE KEY-----
```

**Get SSH key:**
```powershell
# Windows
Get-Content key_pair.pem | Set-Clipboard

# Linux/Mac  
cat key_pair.pem
```

### 2. Push CI/CD Files

```bash
git add .github/ tests/ pytest.ini .flake8 CICD.md
git commit -m "Add CI/CD pipeline"
git push origin main
```

### 3. Watch It Deploy! 🚀

Go to: **GitHub Repo → Actions tab**

---

## 🔄 Daily Workflow

### Making Changes (Recommended Way)

```bash
# 1. Create feature branch
git checkout -b feature/add-comments

# 2. Make your changes
# ... edit files ...

# 3. Commit and push
git add .
git commit -m "Add comment feature"
git push origin feature/add-comments

# 4. Create Pull Request on GitHub
# ✅ Tests run automatically

# 5. Merge PR on GitHub
# ✅ Auto-deploys to EC2!
```

### Quick Fix (Direct to Main)

```bash
git add .
git commit -m "Fix typo"
git push origin main
# ✅ Tests + Deploy runs automatically
```

---

## 🧪 Testing Locally Before Push

```powershell
# Install test dependencies (one-time)
pip install pytest pytest-cov flake8

# Run all checks (what CI runs)
flake8 . --exclude=venv
pytest tests/ -v

# With coverage report
pytest tests/ -v --cov=. --cov-report=term-missing
```

**Fix common issues:**
```bash
# Linting errors
flake8 . --exclude=venv

# Test specific file
pytest tests/test_app.py -v

# Run single test
pytest tests/test_app.py::test_index_page -v
```

---

## 📊 Monitoring Deployments

### Check GitHub Actions

1. Go to **GitHub Repo → Actions**
2. See all workflows and status
3. Click any workflow to see detailed logs

### Check EC2 Application

```bash
# SSH to EC2
ssh -i "key_pair.pem" ubuntu@<your-ec2-ip>

# App logs (real-time)
sudo journalctl -u blog -f

# Last 50 log lines
sudo journalctl -u blog -n 50

# Check status
sudo systemctl status blog
sudo systemctl status nginx

# Restart if needed
sudo systemctl restart blog
```

---

## 🐛 Common Issues & Fixes

### ❌ "SSH Connection Failed"

**Check:**
```bash
# 1. EC2 is running (AWS Console)
# 2. Security Group allows port 22
# 3. GitHub Secret EC2_HOST is correct
# 4. GitHub Secret EC2_SSH_KEY is complete
```

**Test SSH manually:**
```bash
ssh -i "key_pair.pem" ubuntu@<your-ec2-ip>
```

### ❌ "Tests Failed"

**Run locally:**
```bash
pytest tests/ -v
# Fix errors shown
```

**Common test issues:**
```python
# Missing dependency
pip install pytest pytest-cov

# Database error
python3 init_db.py
```

### ❌ "Deployment Failed - Service Won't Start"

```bash
# SSH to EC2
ssh -i "key_pair.pem" ubuntu@<your-ec2-ip>

# Check what's wrong
sudo journalctl -u blog -n 50

# Common fixes:

# 1. Syntax error in code
cd /home/ubuntu/blog_page
source venv/bin/activate
python3 app.py  # Shows error

# 2. Missing dependencies
pip install -r requirements.txt

# 3. Database issue
python3 init_db.py

# 4. Restart
sudo systemctl restart blog
```

### ❌ "Can't Pull from GitHub"

```bash
# SSH to EC2
cd /home/ubuntu/blog_page

# Check status
git status

# Reset and pull
git reset --hard origin/main
git pull origin main

# If authentication error
git config --global credential.helper store
git pull  # Enter credentials once
```

---

## ⚡ Manual Controls

### Force Deploy Without Code Change

**Option 1 - GitHub UI:**
1. Go to **Actions → Deploy to AWS EC2**
2. Click **Run workflow**
3. Select **main** branch
4. Click **Run workflow**

**Option 2 - Trigger commit:**
```bash
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

### Rollback to Previous Version

```bash
# SSH to EC2
ssh -i "key_pair.pem" ubuntu@<your-ec2-ip>
cd /home/ubuntu/blog_page

# See recent commits
git log --oneline -10

# Rollback to specific commit
git reset --hard <commit-hash>

# Restart
sudo systemctl restart blog
```

### Skip CI/CD (Emergency)

```bash
# Deploy manually on EC2
ssh -i "key_pair.pem" ubuntu@<your-ec2-ip>
cd /home/ubuntu/blog_page
git pull
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart blog
```

---

## 📈 Advanced Tips

### View Deployment History

```bash
# On EC2
cd /home/ubuntu/blog_page
git log --oneline -10
```

### Add Environment Variables

```bash
# SSH to EC2
cd /home/ubuntu/blog_page
nano .env
# Add variables
sudo systemctl restart blog
```

### Database Backup Before Deploy

Add to `.github/workflows/deploy.yml` before restart:

```yaml
# Backup database
sudo cp /home/ubuntu/blog_page/blog.db /home/ubuntu/blog_page/blog.db.backup
```

### Slack Notifications

Add GitHub Secret: `SLACK_WEBHOOK`

Update workflow:
```yaml
- name: Slack notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 📝 Workflow Files

| File | Purpose | Trigger |
|------|---------|---------|
| `.github/workflows/deploy.yml` | Deploy to EC2 | Push to main |
| `.github/workflows/test.yml` | Run tests | PRs, feature branches |
| `tests/test_app.py` | Unit tests | Both workflows |
| `pytest.ini` | Test configuration | Test execution |
| `.flake8` | Linting rules | Both workflows |

---

## ✅ Pre-Deployment Checklist

Before pushing to main:

- [ ] Tests pass locally: `pytest tests/ -v`
- [ ] No linting errors: `flake8 . --exclude=venv`
- [ ] Code committed with clear message
- [ ] GitHub secrets configured
- [ ] EC2 instance running
- [ ] Services working on EC2

---

## 🆘 Emergency Contacts

- **View Logs:** `sudo journalctl -u blog -f`
- **Restart App:** `sudo systemctl restart blog`
- **Check Status:** `sudo systemctl status blog`
- **Manual Deploy:** See "Skip CI/CD" section above

---

**Full Documentation:** See [CICD.md](CICD.md) for detailed guide.
