pipeline {
    agent any

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                url: 'https://github.com/sachintharx/blog_page.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build SPA') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy to Server') {
            steps {
                withCredentials([string(credentialsId: 'MONGO_URI', variable: 'MONGO_URI')]) {
                sh '''
                    ssh ubuntu@your-ec2 'bash -s' <<'ENDSSH'
                    cd /var/www/blog_page
                    echo "MONGO_URI='$MONGO_URI'" > .env
                    npm install --production
                    npm run build
                    pm2 restart blog || pm2 start server.js --name blog --env production
                    ENDSSH
                '''
                sh '''
                rm -rf /var/www/html/*
                cp -r build/* /var/www/html/
                '''
            }
        }
    }
}
