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
    }

    post {
        success {
            echo 'CI SECURITY PIPELINE SUCCESS: SonarQube and Trivy passed.'
        }

        failure {
            echo 'CI SECURITY PIPELINE FAILED: Quality Gate or Critical vulnerability detected.'
        }
    }
    stage('Deploy to EC2') {
        steps {
            sh '''
                docker save aupp-lms-api:latest | gzip > aupp-lms-api.tar.gz

                scp -i /var/lib/jenkins/auppfinal.pem -o StrictHostKeyChecking=no aupp-lms-api.tar.gz ubuntu@50.17.33.164:/home/ubuntu/

                ssh -i /var/lib/jenkins/auppfinal.pem -o StrictHostKeyChecking=no ubuntu@50.17.33.164 "
                    docker load < /home/ubuntu/aupp-lms-api.tar.gz &&
                    docker rm -f aupp-lms-api || true &&
                    docker run -d -p 3000:3000 --name aupp-lms-api aupp-lms-api:latest
                "
            '''
        }
    }
}