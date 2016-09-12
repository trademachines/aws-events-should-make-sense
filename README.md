# AWS Events should make sense [![Build Status](https://travis-ci.org/trademachines/aws-events-should-make-sense.svg?branch=master)](https://travis-ci.org/trademachines/aws-events-should-make-sense) [![Coverage Status](https://coveralls.io/repos/github/trademachines/aws-events-should-make-sense/badge.svg?branch=master)](https://coveralls.io/github/trademachines/aws-events-should-make-sense?branch=master)

# Motivation

Its sometimes hard to create situational awareness for things happening on AWS, so we try to increase visibility
for things that don't go according to plan. We do this by utilising CloudWatch Events that filter on API Calls
recorded via CloudTrail. Unfortunately it's not very helpful just piping the JSON to an email or other SNS
subscriptions. That's why we have this little helper that mediates between two different SNS topics extracting
information from the first one and putting it in a more readable way to the second one. After that we can leverage
the capabilities of SNS and fan out to a multitude of endpoints. 

# Examples

We are using this small application to inform ourselves of containers that where killed by ECS because of
the memory usage.

# Configuration

Is done via retrieving the configuration file from S3 by utilising [the aws-lambda-config package](https://www.npmjs.com/package/aws-lambda-config).

## Example configuration

````
{
  "some-sns-topic": {
    "to": "arn:aws:sns:eu-west-1:xxxxxxxxxxxx:some-other-sns-topic",
    "subject": "Task killed due to memory usage",
    "message": "Task <%= msg.requestParameters.containerName %> on cluster <%= msg.requestParameters.cluster %> was killed due to high memory usage."
  }
}

````
