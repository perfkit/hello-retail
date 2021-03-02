# Profile credentials have to be placed in AWS CLI! aws configure --profile <PLACEHOLDER_YOUR_AWS_PROFILE>

export COMPANY=<PLACEHOLDER_COMPANY>
export TEAM=<PLACEHOLDER_TEAM>
export REGION=$1
export STAGE=prod
export AWS_PROFILE=<PLACEHOLDER_YOUR_AWS_PROFILE>
npm run root:deploy:all
