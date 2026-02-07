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
                sh 'npm ci'
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
                APP_DIR=/var/www/blog_app
                sudo mkdir -p $APP_DIR

                # copy backend + build output
                sudo rm -rf $APP_DIR/build
                sudo cp -r build $APP_DIR/
                sudo cp server.js package.json package-lock.json $APP_DIR/

                # install prod deps on server
                cd $APP_DIR
                sudo npm ci --omit=dev

                # start/reload API with pm2 (ensure pm2 is installed globally)
                if ! command -v pm2 >/dev/null 2>&1; then sudo npm install -g pm2; fi
                sudo pm2 startOrReload server.js --name blog-app -- update-env
                '''
            }
        }
    }
}
