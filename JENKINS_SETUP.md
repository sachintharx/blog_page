# Jenkins CI/CD Pipeline Setup Guide

Complete guide to set up Jenkins CI/CD pipeline for automated deployment to AWS EC2.

## 📋 Overview

Jenkins will automatically:
- Pull code from GitHub on push
- Run linting and tests
- Deploy to EC2 if tests pass
- Verify deployment

## 🚀 Part 1: Install Jenkins

### Option A: Install on Your Local Machine (Windows)

1. **Download Jenkins:**
   - Go to: https://www.jenkins.io/download/
   - Download **Windows installer (.msi)**
   - Run the installer

2. **Installation Steps:**
   ```
   - Choose installation directory (default: C:\Program Files\Jenkins)
   - Select "Run as Windows service"
   - Port: 8080 (default)
   - Install Java if prompted
   ```

3. **Access Jenkins:**
   ```
   Open browser: http://localhost:8080
   ```

4. **Initial Setup:**
   ```powershell
   # Get initial admin password
   Get-Content "C:\Program Files\Jenkins\secrets\initialAdminPassword"
   ```
   - Paste password in Jenkins web UI
   - Install **suggested plugins**
   - Create admin user
   - Set Jenkins URL: http://localhost:8080

### Option B: Install Jenkins on EC2 Instance

```bash
# SSH to your EC2
ssh -i "key_pair.pem" ubuntu@<your-ec2-ip>

# Update system
sudo apt update

# Install Java
sudo apt install -y openjdk-11-jdk

# Add Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
sudo apt update
sudo apt install -y jenkins

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Get initial password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

**Access Jenkins:**
- Local installation: `http://localhost:8080`
- EC2 installation: `http://<ec2-ip>:8080`
- (Make sure Security Group allows port 8080)

## 🔧 Part 2: Configure Jenkins

### 1. Install Required Plugins

Go to: **Dashboard → Manage Jenkins → Plugins → Available plugins**

Search and install:
- ✅ **Git plugin** (usually pre-installed)
- ✅ **GitHub plugin**
- ✅ **SSH Agent plugin**
- ✅ **Pipeline plugin** (pre-installed)
- ✅ **Credentials Binding plugin**
- ✅ **JUnit plugin**
- ✅ **Cobertura plugin** (for code coverage)

Click **Install** and **Restart Jenkins when installation is complete**

### 2. Add Credentials

Go to: **Dashboard → Manage Jenkins → Credentials → System → Global credentials → Add Credentials**

**Add these 3 credentials:**

#### Credential 1: EC2_HOST
```
Kind: Secret text
Scope: Global
Secret: 54.123.45.67 (your EC2 IP)
ID: EC2_HOST
Description: EC2 Host IP
```

#### Credential 2: EC2_USER
```
Kind: Secret text
Scope: Global
Secret: ubuntu
ID: EC2_USER
Description: EC2 SSH Username
```

#### Credential 3: EC2_SSH_KEY
```
Kind: Secret text
Scope: Global
Secret: (paste entire key_pair.pem content including BEGIN/END lines)
ID: EC2_SSH_KEY
Description: EC2 SSH Private Key
```

**Quick way to get key content:**
```powershell
Get-Content key_pair.pem
# Copy all output including BEGIN and END lines
```

### 3. Configure System Tools

Go to: **Dashboard → Manage Jenkins → Global Tool Configuration**

**Configure Python (if needed):**
- Scroll to **Python**
- Add Python installation
- Name: `Python3`
- Install automatically: Check this
- Version: Python 3.10 or later

**Configure Git:**
- Usually auto-detected
- If not: Add Git → Path: `/usr/bin/git` (Linux) or `C:\Program Files\Git\bin\git.exe` (Windows)

## 📦 Part 3: Create Jenkins Pipeline Job

### 1. Create New Pipeline

1. Dashboard → **New Item**
2. Enter name: `blog-deployment-pipeline`
3. Select: **Pipeline**
4. Click **OK**

### 2. Configure Pipeline

**General Section:**
- ✅ Check: **GitHub project**
- Project url: `https://github.com/YOUR_USERNAME/blog_page`

**Build Triggers:**
- ✅ Check: **GitHub hook trigger for GITScm polling**
  OR
- ✅ Check: **Poll SCM**
  - Schedule: `H/5 * * * *` (checks every 5 minutes)

**Pipeline Section:**
- Definition: **Pipeline script from SCM**
- SCM: **Git**
- Repository URL: `https://github.com/YOUR_USERNAME/blog_page.git`
- Credentials: Add → Username with password (your GitHub username and personal access token)
- Branch: `*/main`
- Script Path: `Jenkinsfile`

**Save** the pipeline

### 3. Create GitHub Personal Access Token (PAT)

**For Jenkins to access your GitHub repo:**

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)**
3. Select scopes:
   - ✅ `repo` (all)
   - ✅ `admin:repo_hook`
4. Generate token
5. **Copy the token** (you won't see it again!)

**Add to Jenkins:**
- Go to pipeline configuration → Repository URL section
- Credentials → Add → Jenkins
- Kind: **Username with password**
- Username: Your GitHub username
- Password: Paste the PAT token
- ID: `github-credentials`
- Description: GitHub Access Token

## 🔗 Part 4: Configure GitHub Webhook (Automatic Triggers)

### 1. Setup Webhook in GitHub

Go to: **Your GitHub repo → Settings → Webhooks → Add webhook**

```
Payload URL: http://YOUR_JENKINS_URL:8080/github-webhook/
Content type: application/json
SSL verification: Enable (if using HTTPS)
Events: Just the push event
Active: ✅ Checked
```

**Examples:**
- Local Jenkins: `http://YOUR_PUBLIC_IP:8080/github-webhook/`
- EC2 Jenkins: `http://EC2_IP:8080/github-webhook/`

**Note:** If Jenkins is on localhost, you'll need to expose it using:
- **ngrok**: `ngrok http 8080`
- Or use **Poll SCM** instead of webhooks

### 2. Test Webhook

1. Make a small change to your code
2. Push to GitHub: `git push origin main`
3. Check Jenkins → Your pipeline should start automatically!

## 🧪 Part 5: Test the Pipeline

### Manual Test First

1. Go to Jenkins Dashboard
2. Click on **blog-deployment-pipeline**
3. Click **Build Now**
4. Watch the stages execute:
   - ✅ Checkout
   - ✅ Setup Python
   - ✅ Install Dependencies
   - ✅ Linting
   - ✅ Run Tests
   - ✅ Deploy to EC2
   - ✅ Verify Deployment

### Check Logs

- Click on the build number (e.g., #1)
- Click **Console Output** to see detailed logs
- Blue = Success, Red = Failed

### Automatic Test

```bash
# Make a change
git add .
git commit -m "Test Jenkins pipeline"
git push origin main

# Jenkins should automatically detect and deploy!
```

## 📊 Pipeline Stages Explained

| Stage | What It Does | When It Runs |
|-------|--------------|--------------|
| **Checkout** | Clones code from GitHub | Every build |
| **Setup Python** | Checks Python installation | Every build |
| **Install Dependencies** | Installs requirements.txt | Every build |
| **Linting** | Runs flake8 code quality checks | Every build |
| **Run Tests** | Runs pytest unit tests | Every build |
| **Deploy to EC2** | Deploys to EC2 server | Only on main branch |
| **Verify Deployment** | Checks if app is running | Only on main branch |

## 🔧 Troubleshooting

### Issue: Jenkins can't connect to EC2

**Check SSH manually:**
```bash
# From Jenkins server
ssh -i /path/to/key ubuntu@EC2_IP
```

**Verify credentials:**
- Manage Jenkins → Credentials → Check all 3 are set

### Issue: Tests fail

**Run tests locally first:**
```powershell
pytest tests/ -v
```

### Issue: Permission denied on EC2

```bash
# SSH to EC2
ssh -i "key_pair.pem" ubuntu@<ec2-ip>

# Fix permissions
cd /home/ubuntu/blog_page
sudo chown -R ubuntu:ubuntu .
```

### Issue: GitHub webhook not triggering

**Option 1: Check webhook status**
- GitHub → Settings → Webhooks → Recent Deliveries
- Should show green checkmarks

**Option 2: Use Poll SCM instead**
- Edit pipeline → Build Triggers
- ✅ Poll SCM
- Schedule: `H/5 * * * *`

### Issue: Python not found

**Install Python on Jenkins server:**
```bash
# Ubuntu/Debian
sudo apt install python3 python3-pip

# Or add Python in Jenkins Global Tool Configuration
```

## 📈 Advanced Configuration

### Add Email Notifications

**Configure Email:**
1. Manage Jenkins → System
2. Scroll to **Extended E-mail Notification**
3. SMTP server: `smtp.gmail.com`
4. Use SSL: ✅
5. Port: 465

**Add to Pipel:**
```groovy
post {
    failure {
        emailext (
            subject: "Build Failed: ${env.JOB_NAME}",
            body: "Check console output at ${env.BUILD_URL}",
            to: "your@email.com"
        )
    }
}
```

### Add Slack Notifications

1. Install **Slack Notification plugin**
2. Configure Slack webhook in Manage Jenkins
3. Add to Jenkinsfile:
```groovy
post {
    success {
        slackSend color: 'good', message: "Deployed successfully!"
    }
}
```

### Multi-Branch Pipeline

For handling multiple branches (dev, staging, prod):
1. Create **Multibranch Pipeline** instead
2. Configure branch sources
3. Each branch deploys to different environment

## ✅ Final Checklist

- [ ] Jenkins installed and running
- [ ] Required plugins installed
- [ ] Credentials added (EC2_HOST, EC2_USER, EC2_SSH_KEY)
- [ ] Pipeline job created
- [ ] Jenkinsfile in repository
- [ ] GitHub webhook configured (or Poll SCM enabled)
- [ ] Test build runs successfully
- [ ] Can SSH from Jenkins to EC2
- [ ] EC2 Security Group allows Jenkins IP

## 🎯 Quick Commands

```powershell
# Test Jenkins locally
Invoke-WebRequest http://localhost:8080

# Check Jenkins service (Windows)
Get-Service Jenkins

# Restart Jenkins (Windows)
Restart-Service Jenkins

# SSH test to EC2
ssh -i "key_pair.pem" ubuntu@YOUR_EC2_IP
```

## 📚 Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Jenkins Plugins](https://plugins.jenkins.io/)

---

**Need help?** Check Jenkins console logs for detailed error messages!
