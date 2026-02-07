#!/bin/bash

# Blog App Deployment Script for AWS EC2 (Ubuntu)
# Run this script on your EC2 instance after cloning the repository

echo "Starting Blog App Deployment..."

# Update system packages
echo "Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install Python and pip
echo "Installing Python and dependencies..."
sudo apt install -y python3 python3-pip python3-venv nginx

# Create application directory
APP_DIR="/home/ubuntu/blog_page"
cd $APP_DIR || exit

# Create and activate virtual environment
echo "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file from example
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    # Generate a random secret key
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    sed -i "s/change-this-to-a-random-secret-key-in-production/$SECRET_KEY/" .env
fi

# Initialize database
echo "Initializing database..."
python3 -c "from app import init_db; init_db()"

# Create systemd service file
echo "Creating systemd service..."
sudo tee /etc/systemd/system/blog.service > /dev/null <<EOF
[Unit]
Description=Flask Blog Application
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=$APP_DIR
Environment="PATH=$APP_DIR/venv/bin"
ExecStart=$APP_DIR/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 app:app

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/blog > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /home/ubuntu/blog_page/static;
    }
}
EOF

# Enable Nginx site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Start and enable services
echo "Starting services..."
sudo systemctl daemon-reload
sudo systemctl start blog
sudo systemctl enable blog
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configure firewall
echo "Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
echo "y" | sudo ufw enable

echo "================================"
echo "Deployment completed successfully!"
echo "================================"
echo "Your blog is now running!"
echo ""
echo "Check service status:"
echo "  sudo systemctl status blog"
echo ""
echo "View logs:"
echo "  sudo journalctl -u blog -f"
echo ""
echo "Access your blog at: http://$(curl -s http://checkip.amazonaws.com)"
