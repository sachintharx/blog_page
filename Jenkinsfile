pipeline {
    agent any

    environment {
        APP_DIR = "${env.WORKSPACE}/deploy"
    }

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
                                mkdir -p "$APP_DIR"

                                # copy build + server files
                                rm -rf "$APP_DIR/build"
                                cp -r build "$APP_DIR/"
                                cp server.js package.json package-lock.json "$APP_DIR/"

                                cd "$APP_DIR"
                                npm ci --omit=dev

                                # write .env if MONGO_URI is provided from Jenkins environment/credential
                                if [ -n "$MONGO_URI" ]; then
                                    echo "MONGO_URI=$MONGO_URI" > .env
                                    echo "PORT=3000" >> .env
                                else
                                    echo "Warning: MONGO_URI not set in Jenkins environment; API will not connect." >&2
                                fi

                                # start/reload API with pm2 (non-sudo, per-user)
                                if ! command -v pm2 >/dev/null 2>&1; then npm install -g pm2; fi
                                pm2 startOrReload server.js --name blog-app --update-env
                                pm2 save
                                '''
            }
        }
    }
}
