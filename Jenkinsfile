pipeline {
    agent { label 'nodejs' }

    environment {
        DOCKER_IMAGE = "fredo06/live_chat_web"
        DOCKER_TAG = "latest"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                url: 'https://github.com/Fredo-Ronan/Live-Chat-Web.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                }
            }
        }

        stage('Deploy Container') {
            steps {
                script {
                    // for example is deploy to the same server, this can be deploy to another server later
                    sh '''
                    docker compose down -v || true
                    docker compose up -d
                    '''
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}