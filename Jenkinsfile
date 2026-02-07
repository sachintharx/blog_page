pipeline {
    agent any
    
    environment {
        PROJECT_NAME = 'blog_page'
        EC2_HOST = credentials('EC2_HOST')
        EC2_USER = credentials('EC2_USER')
        SSH_KEY = credentials('EC2_SSH_KEY')
        PYTHON_VERSION = '3.10'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }
        
        stage('Setup Python') {
            steps {
                echo "Setting up Python ${PYTHON_VERSION}..."
                sh '''
                    python3 --version
                    pip3 --version
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing Python dependencies...'
                sh '''
                    pip3 install --user -r requirements.txt
                    pip3 install --user pytest pytest-cov flake8
                '''
            }
        }
        
        stage('Linting') {
            steps {
                echo 'Running code linting...'
                sh '''
                    python3 -m flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics --exclude=venv,env || true
                    python3 -m flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics --exclude=venv,env
                '''
            }
        }
        
        stage('Run Tests') {
            steps {
                echo 'Running unit tests...'
                sh '''
                    python3 -m pytest tests/ -v --cov=. --cov-report=xml --cov-report=term-missing || true
                '''
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'test-results/*.xml'
                    cobertura coberturaReportFile: 'coverage.xml'
                }
            }
        }
        
        stage('Deploy to EC2') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to AWS EC2...'
                script {
                    // Setup SSH
                    sh '''
                        mkdir -p ~/.ssh
                        echo "${SSH_KEY}" > ~/.ssh/deploy_key.pem
                        chmod 600 ~/.ssh/deploy_key.pem
                        ssh-keyscan -H ${EC2_HOST} >> ~/.ssh/known_hosts || true
                    '''
                    
                    // Deploy to EC2
                    sh '''
                        ssh -i ~/.ssh/deploy_key.pem -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
                            set -e
                            echo "Deploying to EC2..."
                            
                            cd /home/ubuntu/blog_page
                            
                            # Pull latest code
                            echo "Pulling latest code..."
                            git pull origin main
                            
                            # Activate virtual environment
                            echo "Activating virtual environment..."
                            source venv/bin/activate
                            
                            # Install/update dependencies
                            echo "Installing dependencies..."
                            pip install -r requirements.txt
                            
                            # Run database initialization
                            echo "Initializing database..."
                            python3 init_db.py || true
                            
                            # Restart services
                            echo "Restarting services..."
                            sudo systemctl restart blog
                            sudo systemctl restart nginx
                            
                            # Check service status
                            echo "Checking service status..."
                            sudo systemctl status blog --no-pager
                            
                            echo "Deployment completed successfully!"
ENDSSH
                    '''
                }
            }
        }
        
        stage('Verify Deployment') {
            when {
                branch 'main'
            }
            steps {
                echo 'Verifying deployment...'
                sh '''
                    sleep 5
                    ssh -i ~/.ssh/deploy_key.pem -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
                        curl -f http://localhost:5000 || exit 1
                        echo "Application is running successfully!"
ENDSSH
                '''
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
            // Add Slack/Email notification here if needed
        }
        failure {
            echo 'Pipeline failed!'
            // Add Slack/Email notification here if needed
        }
        always {
            cleanWs()
        }
    }
}
