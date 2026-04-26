pipeline {
    agent any

    environment {
        SONARQUBE_SERVER = 'Sonar-Jenkins'
        IMAGE_NAME = 'aupp-lms-api'
    }

    triggers {
        pollSCM('* * * * *')
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/nuthchanrithea654-hub/aupp-lms-devops.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('app') {
                    sh 'npm install'
                }
            }
        }

        stage('SonarQube Scan') {
            steps {
                withSonarQubeEnv("${SONARQUBE_SERVER}") {
                    sh '''
                        /opt/sonar-scanner/bin/sonar-scanner \
                        -Dsonar.projectKey=aupp-lms-devops \
                        -Dsonar.sources=app
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Trivy Dependency Scan') {
            steps {
                sh '''
                    trivy fs --severity CRITICAL --exit-code 1 --no-progress app
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build -t $IMAGE_NAME:latest ./app
                '''
            }
        }

        stage('Trivy Docker Image Scan') {
            steps {
                sh '''
                    trivy image --severity CRITICAL --exit-code 1 --no-progress $IMAGE_NAME:latest
                '''
            }
        }

        stage('Deploy to EC2') {
            steps {
                sh '''
                    docker save $IMAGE_NAME:latest | gzip > $IMAGE_NAME.tar.gz

                    scp -i /var/lib/jenkins/auppfinal.pem -o StrictHostKeyChecking=no $IMAGE_NAME.tar.gz ubuntu@50.17.33.164:/home/ubuntu/

                    ssh -i /var/lib/jenkins/auppfinal.pem -o StrictHostKeyChecking=no ubuntu@50.17.33.164 "
                        docker load < /home/ubuntu/$IMAGE_NAME.tar.gz &&
                        docker rm -f $IMAGE_NAME || true &&
                        docker run -d -p 3000:3000 --name $IMAGE_NAME $IMAGE_NAME:latest
                    "
                '''
            }
        }
    }

    post {
        success {
            echo 'FULL CI/CD PIPELINE SUCCESS: SonarQube, Trivy, Docker build, and EC2 deployment passed.'
        }

        failure {
            echo 'PIPELINE FAILED: Quality Gate, Trivy, Docker build, or deployment failed.'
        }
    }
}