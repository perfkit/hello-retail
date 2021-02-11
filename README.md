# Hello, Retail!

Hello, Retail! is a Nordstrom Technology open-source project. Hello, Retail! is a 100% serverless, event-driven framework and functional proof-of-concept showcasing a central unified log approach as applied to the retail problem space. All code and patterns are intended to be re-usable for scalable applications large and small.


# Deploy
Create a `private.yml` file in the repository root:

```yaml
region: <AWS_REGION>	# us-east-1

company: <COMPANY_NAME>
team: <TEAM_NAME>
stage: <STAGE>			# prod

domainName: hello-retail.biz	# should be left like this

profile: <PROFILE_NAME>
accountId: <ACCOUNT_ID>			# the AWS account id of your PROFILE_NAME

teamRole: <IAM_ROLE> 			# IAM Role, maybe the same as PROFILE_NAME
teamPolicy: arn:aws:iam::aws:policy/AWSLambdaFullAccess  # Your Team's Managed Policy for your IAM Role

# Core Stream
coreStream:
  accountId: <ACCOUNT_ID>
  awslabsRoleArn: arn:aws:iam::${self:custom.private.coreStream.accountId}:role/fanoutRole
```

To deploy the system, set the following environment variables and call `npm`:

```shell
# First: Profile credentials have to be placed in AWS CLI! aws configure --profile <PROFILE_NAME>
export COMPANY=<COMPANY_NAME>
export TEAM=<TEAM_NAME>
export REGION=<AWS_REGION> 	# e.g., us-east-1
export STAGE=<STAGE>		# e.g., prod
export AWS_PROFILE=<PROFILE_NAME>

# Install dependencies
npm run root:install:all

# Deploy the whole system
npm run root:deploy:all

# Destroy the whole system
npm run root:remove:all
```


## Post-Deploy Action & Configuration

1. Note the `ServiceEndpoint` output from the execution of `npm run photos:deploy:5`.  Alternatively, inspect or describe the stack `hello-retail-product-photos-receive-<stage>` and note the `ServiceEndpoint` output.  This value will look like `https://<apiId>.execute-api.us-west-2.amazonaws.com/<stage>`.  Open the phone number configuration page for the Twilio number that you purchased and set the Messaging Webhook (use defaults "Webhooks/TwiML", "Webhook", and "HTTP POST") value to that value with a `/sms` appended to it (e.g. `https://<apiId>.execute-api.us-west-2.amazonaws.com/<stage>/sms`).  It may be helpful to note the stage name in the "Friendly Name" field as well.  Then save those configuration changes.

2. Enable TTL on the table `<stage>-hello-retail-product-photos-data-PhotoRegistrations-1` using the attribute `timeToLive`
