# Simple Blog Web Application

A lightweight blog web application built with Flask, SQLite, and Bootstrap 5, designed for easy deployment on AWS EC2.

## Features

- ✨ Create, read, update, and delete blog posts
- 👤 Author attribution for each post
- 📅 Automatic timestamps for post creation and updates
- 📱 Responsive design with Bootstrap 5
- 🎨 Clean and modern UI with icons
- 🚀 Production-ready with Gunicorn and Nginx

## Tech Stack

- **Backend**: Python Flask
- **Database**: SQLite
- **Frontend**: HTML, Bootstrap 5, Bootstrap Icons
- **Web Server**: Nginx (reverse proxy)
- **WSGI Server**: Gunicorn
- **Deployment**: AWS EC2 (Ubuntu)

## Local Development

### Prerequisites

- Python 3.8 or higher
- pip

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd blog_page
```

2. Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

5. Run the application:
```bash
python app.py
```

6. Open your browser and navigate to `http://localhost:5000`

## AWS EC2 Deployment

### Step 1: Launch EC2 Instance

1. Log in to AWS Console
2. Launch a new EC2 instance:
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance Type**: t2.micro (free tier eligible)
   - **Security Group**: Allow HTTP (80), HTTPS (443), and SSH (22)
3. Download and save your key pair file (e.g., `key_pair.pem`)

### Step 2: Connect to EC2 Instance

```bash
# Windows (PowerShell)
ssh -i "key_pair.pem" ubuntu@<your-ec2-public-ip>

# Make sure key_pair.pem has proper permissions
icacls.exe key_pair.pem /reset
icacls.exe key_pair.pem /grant:r "$($env:USERNAME):(R)"
icacls.exe key_pair.pem /inheritance:r

# Linux/Mac
chmod 400 key_pair.pem
ssh -i "key_pair.pem" ubuntu@<your-ec2-public-ip>
```

### Step 3: Deploy the Application

Once connected to your EC2 instance:

```bash
# Clone the repository
git clone <repository-url>
cd blog_page

# Run the deployment script
chmod +x deploy.sh
./deploy.sh
```

The script will automatically:
- Update system packages
- Install Python, Nginx, and dependencies
- Set up a virtual environment
- Install Python packages
- Initialize the database
- Configure systemd service
- Set up Nginx as reverse proxy
- Configure firewall rules
- Start all services

### Step 4: Access Your Blog

After deployment completes, access your blog at:
```
http://<your-ec2-public-ip>
```

## Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3 python3-pip python3-venv nginx

# Clone and setup
cd /home/ubuntu
git clone <repository-url>
cd blog_page

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Initialize database
python3 -c "from app import init_db; init_db()"

# Setup systemd service
sudo cp blog.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start blog
sudo systemctl enable blog

# Setup Nginx
sudo cp nginx.conf /etc/nginx/sites-available/blog
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Managing the Application

### Check Service Status
```bash
sudo systemctl status blog
sudo systemctl status nginx
```

### View Logs
```bash
# Application logs
sudo journalctl -u blog -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
sudo systemctl restart blog
sudo systemctl restart nginx
```

### Update Application
```bash
cd /home/ubuntu/blog_page
git pull
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart blog
```

## Application Structure

```
blog_page/
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore file
├── deploy.sh              # Automated deployment script
├── blog.service           # Systemd service file
├── nginx.conf             # Nginx configuration
├── templates/             # HTML templates
│   ├── base.html         # Base template
│   ├── index.html        # Homepage
│   ├── post.html         # Single post view
│   ├── create.html       # Create post form
│   ├── edit.html         # Edit post form
│   └── about.html        # About page
└── README.md             # This file
```

## Security Considerations

1. **Change Secret Key**: Update `SECRET_KEY` in `.env` file with a random string
2. **Use HTTPS**: Consider setting up SSL/TLS with Let's Encrypt
3. **Database Backups**: Regularly backup your `blog.db` file
4. **Firewall**: Ensure only necessary ports are open
5. **Updates**: Keep system and packages updated

## Optional: Setup HTTPS with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace your-domain.com)
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

## Troubleshooting

### Application won't start
```bash
sudo journalctl -u blog -n 50
```

### Database issues
```bash
cd /home/ubuntu/blog_page
source venv/bin/activate
python3 -c "from app import init_db; init_db()"
sudo systemctl restart blog
```

### Nginx errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Port 80 already in use
```bash
sudo lsof -i :80
sudo systemctl stop apache2  # if Apache is running
```

## Contributing

Feel free to fork this repository and submit pull requests for any improvements.

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.
