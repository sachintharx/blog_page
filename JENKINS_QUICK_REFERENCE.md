# Jenkins CI/CD - Quick Reference

## 🚀 Quick Setup Steps

### 1. Install Jenkins

**Windows:**
```powershell
# Download from https://www.jenkins.io/download/
# Run installer, use port 8080
# Access: http://localhost:8080

# Get initial password:
Get-Content "C:\Program Files\Jenkins\secrets\initialAdminPassword"
```

**EC2 (Ubuntu):**
```bash
sudo apt install -y openjdk-11-jdk
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update && sudo apt install -y jenkins
sudo systemctl start jenkins

# Password:
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 2. Add Credentials

**Manage Jenkins → Credentials → Global → Add Credentials**

```
1. EC2_HOST
   Type: Secret text
   Secret: YOUR_EC2_IP
   ID: EC2_HOST

2. EC2_USER
   Type: Secret text
   Secret: ubuntu
   ID: EC2_USER

3. EC2_SSH_KEY
   Type: Secret text
   Secret: (paste entire key_pair.pem)
   ID: EC2_SSH_KEY
```

### 3. Create Pipeline Job

1. **New Item** → Name: `blog-deployment-pipeline` → **Pipeline**
2. **Build Triggers:** ✅ Poll SCM → Schedule: `H/5 * * * *`
3. **Pipeline:** 
   - Definition: Pipeline script from SCM
   - SCM: Git
   - Repository URL: Your GitHub repo
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
4. **Save**

### 4. Test Build

Click **Build Now** → Watch stages execute

---

## 🔄 Daily Usage

### Trigger Deployment

```bash
# Auto-deploys on push to main
git add .
git commit -m "Your changes"
git push origin main
```

### Manual Build

1. Jenkins Dashboard
2. Click pipeline name
3. **Build Now**

### View Logs

1. Click build number (e.g., #5)
2. **Console Output**

---

## 🐛 Troubleshooting

### Jenkins can't SSH to EC2

```bash
# Test manually from Jenkins server
ssh -i ~/.ssh/deploy_key.pem ubuntu@YOUR_EC2_IP

# Check credentials are set in Jenkins
```

### Build fails at tests

```powershell
# Run locally
pytest tests/ -v
flake8 . --exclude=venv
```

### Permission denied

```bash
# On EC2
cd /home/ubuntu/blog_page
sudo chown -R ubuntu:ubuntu .
chmod 755 deploy.sh
```

### GitHub not triggering builds

**Option 1:** Use Poll SCM (already configured)

**Option 2:** Add webhook
- GitHub → Settings → Webhooks
- URL: `http://JENKINS_IP:8080/github-webhook/`

---

## 📊 Pipeline Status

✅ **Green** = Success  
🔴 **Red** = Failed  
⚪ **Gray** = Not run yet  
🔵 **Blue** = Running  

---

## ⚡ Quick Commands

```powershell
# Check Jenkins (Windows)
Get-Service Jenkins

# Restart Jenkins (Windows)
Restart-Service Jenkins

# Access Jenkins
http://localhost:8080

# SSH to EC2
ssh -i "key_pair.pem" ubuntu@YOUR_EC2_IP
```

```bash
# Jenkins on Ubuntu
sudo systemctl status jenkins
sudo systemctl restart jenkins
sudo journalctl -u jenkins -f
```

---

## 📝 Files Created

- `Jenkinsfile` - Pipeline definition
- `JENKINS_SETUP.md` - Full setup guide
- `JENKINS_QUICK_REFERENCE.md` - This file

---

**Full Guide:** See [JENKINS_SETUP.md](JENKINS_SETUP.md)
