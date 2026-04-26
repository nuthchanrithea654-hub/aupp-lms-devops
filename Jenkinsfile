pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
        sonarScanner 'Sonar-Scanner'
    }

    environment {
        SONARQUBE_SERVER = 'Jenkins-To-Sonar'
    }

    triggers {
        pollSCM('* * * * *')
    }

    stages {

        stage('Checkout Code from GitHub') {
            steps {
                git branch: 'main',
                    url: 'git@github-theadevops1:nuthchanrithea654-hub/aupp-lms-devops.git'
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('app') {
                    sh 'npm install'
                }
            }
        }

        stage('SonarQube Code Quality Scan') {
            steps {
                withSonarQubeEnv("${SONARQUBE_SERVER}") {
                    sh '''
                        sonar-scanner \
                        -Dsonar.projectKey=aupp-lms-devops \
                        -Dsonar.projectName="AUPP LMS DevOps" \
                        -Dsonar.sources=app \
                        -Dsonar.exclusions=app/node_modules/**
                    '''
                }
            }
        }

        stage('Quality Gate Check') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }

    post {
        success {
            echo 'CI pipeline completed successfully.'
        }

        failure {
            echo 'CI pipeline failed. Check SonarQube Quality Gate or build logs.'
        }
    }
}