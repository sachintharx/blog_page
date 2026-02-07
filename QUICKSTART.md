# Quick Start Guide - Blog App Deployment on AWS EC2

## 🚀 Quick Deployment Steps

### 1. Launch EC2 Instance
- Go to AWS Console → EC2
- Click "Launch Instance"
- Choose **Ubuntu Server 22.04 LTS**
- Select **t2.micro** (free tier)
- Create/select key pair (download `key_pair.pem`)
- Configure Security Group:
  - SSH (22) - Your IP
  - HTTP (80) - Anywhere
  - HTTPS (443) - Anywhere
- Launch instance

### 2. Connect to Your Instance

**Windows (PowerShell):**
```powershell
# Set proper permissions for key file
icacls.exe key_pair.pem /reset
icacls.exe key_pair.pem /grant:r "$($env:USERNAME):(R)"
icacls.exe key_pair.pem /inheritance:r

# Connect
ssh -i "key_pair.pem" ubuntu@<YOUR-EC2-PUBLIC-IP>
```

**Linux/Mac:**
```bash
chmod 400 key_pair.pem
ssh -i "key_pair.pem" ubuntu@<YOUR-EC2-PUBLIC-IP>
```

### 3. Deploy Application (One Command!)

```bash
# Clone repository
git clone <YOUR-REPO-URL>
cd blog_page

# Run deployment script
chmod +x deploy.sh
./deploy.sh
```

That's it! Your blog will be live at `http://<YOUR-EC2-PUBLIC-IP>`

---

## 📋 What Gets Deployed

✅ Python Flask application  
✅ SQLite database  
✅ Gunicorn WSGI server  
✅ Nginx reverse proxy  
✅ Systemd service (auto-start on boot)  
✅ Firewall configuration  

---

## 🔧 Useful Commands

### Check if app is running
```bash
sudo systemctl status blog
```

### View application logs
```bash
sudo journalctl -u blog -f
```

### Restart application
```bash
sudo systemctl restart blog
```

### Check Nginx status
```bash
sudo systemctl status nginx
```

---

## 🌐 Access Your Blog

Open browser: `http://<YOUR-EC2-PUBLIC-IP>`

To find your IP:
```bash
curl http://checkip.amazonaws.com
```

---

## 🔐 Important Security Steps

1. **Change Secret Key**
```bash
cd /home/ubuntu/blog_page
nano .env
# Update SECRET_KEY with a random string
sudo systemctl restart blog
```

2. **Enable HTTPS (Recommended)**
```bash
# If you have a domain name
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🐛 Troubleshooting

### App won't start?
```bash
sudo journalctl -u blog -n 50
```

### Can't access website?
1. Check Security Group allows HTTP (port 80)
2. Check if services are running:
```bash
sudo systemctl status blog
sudo systemctl status nginx
```

### Database issue?
```bash
cd /home/ubuntu/blog_page
source venv/bin/activate
python3 -c "from app import init_db; init_db()"
sudo systemctl restart blog
```

---

## 📱 Test Your Blog

1. **Homepage**: `http://<YOUR-IP>/`
2. **Create Post**: Click "New Post" button
3. **View Post**: Click "Read More" on any post
4. **Edit/Delete**: Open a post and use action buttons

---

## 💰 AWS Costs

- **t2.micro**: Free tier eligible (750 hours/month for 12 months)
- After free tier: ~$8-10/month
- Data transfer: First 15 GB/month free

---

## 🎯 Next Steps

- [ ] Add your domain name
- [ ] Setup HTTPS with Let's Encrypt
- [ ] Configure CloudWatch monitoring
- [ ] Setup automated backups for database
- [ ] Add user authentication (optional)

---

## 📞 Need Help?

Check the full README.md for detailed documentation!
