pipeline {
    agent { label 'nodejs' }

    environment {
        DOCKER_IMAGE = "fredo06/live_chat_web"
        DOCKER_TAG = "latest"
        IMAGE_FILE = "live_chat_web"
        CONTAINER_NAME = "live_chat_web"
        PROD_SERVER = "192.168.1.102"
        DEPLOY_DIR = "~/deploy"
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

        stage('Transfer Image') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'deploy-key-1', keyFileVariable: 'KEY', usernameVariable: 'USER')]) {
                    sh'''
                    echo "Transferring image to production server..."
                    ssh -o StrictHostKeyChecking=no -i $KEY $USER@${PROD_SERVER} "mkdir -p ${DEPLOY_DIR}"
                    scp -o StrictHostKeyChecking=no -i $KEY ${IMAGE_FILE}.tar $USER@${PROD_SERVER}:${DEPLOY_DIR}
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: 'deploy-key-1', keyFileVariable: 'KEY', usernameVariable: 'USER')]) {
                        sh '''
                        ssh -i $KEY -o StrictHostKeyChecking=no $USER@${PROD_SERVER} << 'ENDSSH'
                        echo "Connected to ${PROD_SERVER}"
                        whoami
                        docker load -i ${DEPLOY_DIR}/${IMAGE_FILE}.tar
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