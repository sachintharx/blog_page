# CI/CD Pipeline Setup Guide

This guide will help you set up a complete CI/CD pipeline for automatic deployment to AWS EC2.

## 🏗️ Pipeline Architecture

```
GitHub Push → GitHub Actions → Run Tests → Deploy to EC2 → Verify
```

## 📋 Prerequisites

1. **GitHub Repository** - Your code must be in a GitHub repository
2. **AWS EC2 Instance** - Running and configured (see README.md)
3. **SSH Access** - Key pair for EC2 access
4. **Application Deployed** - Initial manual deployment completed

## 🚀 Setup Steps

### Step 1: Prepare Your EC2 Instance

Make sure your EC2 instance has the application deployed and Git configured:

```bash
# SSH into your EC2 instance
ssh -i "key_pair.pem" ubuntu@<your-ec2-ip>

# Clone your repository (first time only)
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/blog_page.git
cd blog_page

# Run initial deployment
chmod +x deploy.sh
./deploy.sh

# Configure Git to remember credentials (for automated pulls)
git config --global credential.helper store
```

### Step 2: Configure GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

| Secret Name | Description | Value |
|------------|-------------|-------|
| `EC2_HOST` | EC2 public IP or domain | `54.123.45.67` or `yourdomain.com` |
| `EC2_USER` | SSH username | `ubuntu` |
| `EC2_SSH_KEY` | Private key content | Contents of your `key_pair.pem` file |

**To get your SSH key content:**

```powershell
# Windows PowerShell
Get-Content key_pair.pem | Set-Clipboard
# Now paste into GitHub Secret
```

```bash
# Linux/Mac
cat key_pair.pem
# Copy the entire output (including BEGIN/END lines)
```

### Step 3: Push GitHub Actions Workflows

The workflows are already created in `.github/workflows/`:

```
.github/workflows/
├── deploy.yml  # Deploys to EC2 on push to main
└── test.yml    # Runs tests on PRs and feature branches
```

Commit and push these files:

```bash
git add .github/
git commit -m "Add CI/CD pipeline"
git push origin main
```

### Step 4: Update Security Group

Ensure your EC2 Security Group allows GitHub Actions IPs (or make it public temporarily):

1. AWS Console → EC2 → Security Groups
2. Edit inbound rules for your instance
3. Allow SSH (22) from anywhere (or GitHub Actions IP ranges)

## 📝 How It Works

### Automated Deployment Workflow (`deploy.yml`)

Triggers on:
- Push to `main` branch
- Manual trigger from GitHub UI

Steps:
1. **Test Stage**
   - Checkout code
   - Install dependencies
   - Run linting (flake8)
   - Run unit tests
   - Generate test coverage

2. **Deploy Stage** (only if tests pass)
   - SSH into EC2 instance
   - Pull latest code from GitHub
   - Install/update dependencies
   - Run database migrations
   - Restart services (blog, nginx)
   - Verify deployment

3. **Verification**
   - Check if application responds
   - Notify on failure

### Test Workflow (`test.yml`)

Triggers on:
- Pull requests to `main`
- Push to feature branches

Runs tests on multiple Python versions (3.9, 3.10, 3.11) to ensure compatibility.

## 💻 Local Testing

Before pushing, test locally:

```powershell
# Install test dependencies
pip install pytest pytest-cov flake8

# Run linter
flake8 . --exclude=venv

# Run tests
pytest tests/ -v

# Run tests with coverage
pytest tests/ -v --cov=. --cov-report=term-missing
```

## 🔄 Making Changes and Deploying

### Using Feature Branches (Recommended)

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... edit files ...

# Commit changes
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# Tests will run automatically

# After PR is approved and merged to main:
# Deployment happens automatically!
```

### Direct Push to Main

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Deployment starts automatically
```

## 📊 Monitoring Deployments

### View GitHub Actions

1. Go to your repository on GitHub
2. Click **Actions** tab
3. See all workflow runs and their status

### View Deployment Logs

```bash
# SSH into EC2
ssh -i "key_pair.pem" ubuntu@<your-ec2-ip>

# View application logs
sudo journalctl -u blog -f

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check service status
sudo systemctl status blog
sudo systemctl status nginx
```

## 🔧 Manual Deployment Trigger

You can manually trigger deployment from GitHub:

1. Go to **Actions** tab
2. Select **Deploy to AWS EC2** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

## 🐛 Troubleshooting

### Deployment Fails: SSH Connection Error

**Problem:** Can't connect to EC2

**Solutions:**
1. Check EC2 instance is running
2. Verify Security Group allows SSH (port 22)
3. Verify `EC2_HOST` secret is correct
4. Check `EC2_SSH_KEY` secret contains complete key

### Deployment Fails: Git Pull Error

**Problem:** Can't pull latest code

**Solutions:**
```bash
# SSH into EC2
ssh -i "key_pair.pem" ubuntu@<your-ec2-ip>

# Check Git status
cd /home/ubuntu/blog_page
git status

# Reset if needed
git reset --hard origin/main
git pull origin main
```

### Tests Fail

**Problem:** Unit tests failing

**Solutions:**
1. Run tests locally first: `pytest tests/ -v`
2. Check test logs in GitHub Actions
3. Fix failing tests before deploying

### Application Won't Start After Deployment

**Problem:** Service fails to restart

**Solutions:**
```bash
# SSH into EC2
ssh -i "key_pair.pem" ubuntu@<your-ec2-ip>

# Check service status
sudo systemctl status blog

# View detailed logs
sudo journalctl -u blog -n 50

# Manually restart
sudo systemctl restart blog

# Check for syntax errors
cd /home/ubuntu/blog_page
source venv/bin/activate
python3 app.py
```

## 📈 Advanced Configuration

### Add Slack Notifications

Add to `.github/workflows/deploy.yml`:

```yaml
- name: Send Slack notification
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Add Email Notifications

Add GitHub secret `EMAIL` and update workflow:

```yaml
- name: Send email notification
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: Deployment Failed
    to: ${{ secrets.EMAIL }}
    from: GitHub Actions
```

### Blue-Green Deployment

For zero-downtime deployments, set up two application instances and switch between them.

### Database Migrations

For schema changes, add before restart:

```bash
# In deploy workflow SSH section
python3 manage_migrations.py
```

## 🔐 Security Best Practices

1. ✅ Never commit secrets to Git
2. ✅ Use GitHub Secrets for sensitive data
3. ✅ Rotate SSH keys regularly
4. ✅ Use minimal IAM permissions
5. ✅ Enable branch protection rules
6. ✅ Require PR reviews before merging
7. ✅ Use HTTPS with SSL certificates
8. ✅ Keep dependencies updated

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [Flask Deployment Guide](https://flask.palletsprojects.com/en/latest/deploying/)

## ✅ Deployment Checklist

Before going live:

- [ ] All tests passing locally
- [ ] GitHub secrets configured
- [ ] EC2 security group allows SSH
- [ ] Initial deployment completed manually
- [ ] Git configured on EC2
- [ ] Services running (blog, nginx)
- [ ] Firewall configured
- [ ] Database initialized
- [ ] HTTPS/SSL configured (optional but recommended)
- [ ] Monitoring set up
- [ ] Backup strategy in place

---

**Need help?** Check the logs or open an issue on GitHub!
