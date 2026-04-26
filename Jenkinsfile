pipeline {
    agent any

    environment {
        SONARQUBE_SERVER = 'Sonar-Jenkins'
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
                    sh '''
                        npm install
                    '''
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
    }

    post {
        success {
            echo 'CI SUCCESS'
        }
        failure {
            echo 'CI FAILED'
        }
    }
}