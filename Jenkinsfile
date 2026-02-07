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
                sh '''
                rm -rf /var/www/html/*
                cp -r build/* /var/www/html/
                '''
            }
        }
    }
}
