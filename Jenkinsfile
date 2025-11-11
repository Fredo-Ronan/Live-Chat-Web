pipeline {
    agent { label 'nodejs' }

    environment {
        DOCKER_IMAGE = "fredo06/live_chat_web"
        DOCKER_TAG = "latest"
        IMAGE_FILE = "live_chat_web"
        CONTAINER_NAME = "live_chat_web"
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
                    sh '''
                    docker build --no-cache -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                    docker save ${DOCKER_IMAGE}:${DOCKER_TAG} -o ${IMAGE_FILE}.tar
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: 'deploy-key-1', keyFileVariable: 'KEY', usernameVariable: 'USER')]) {
                        sh '''
                        scp -i $KEY ${IMAGE_FILE}.tar $USER@192.168.1.102:/tmp/
                        ssh -i $KEY -o StrictHostKeyChecking=no $USER@192.168.1.102 << 'ENDSSH'
                        echo "Connected to 192.168.1.102"
                        whoami
                        docker load -i /tmp/${IMAGE_FILE}.tar
                        docker stop ${CONTAINER_NAME} || true
                        docker rm -v ${CONTAINER_NAME} || true
                        docker run -d --name ${CONTAINER_NAME} -p 5000:5000 --restart unless-stopped --network server_network ${DOCKER_IMAGE}:${DOCKER_TAG}
                        '''
                    }
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